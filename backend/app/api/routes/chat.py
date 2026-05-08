from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect

from app.api.deps import get_current_user
from app.schemas.chat import ChatConversationItem, ChatMessagePublic
from app.services.application_store import (
    get_selected_application_for_worker_and_job,
    get_selected_application_for_job,
    get_selected_applications_for_worker,
    get_selected_applications_for_poster_jobs,
)
from app.services.chat_store import (
    create_message,
    get_messages_for_job,
    get_last_message_for_job,
    mark_messages_seen,
    get_unread_count_for_job_and_user,
)
from app.services.job_store import get_job_by_id, get_jobs_by_poster
from app.services.user_store import get_by_id

router = APIRouter(prefix="/chat", tags=["chat"])


class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, list[WebSocket]] = {}
        self.user_presence: dict[str, bool] = {}
        self.user_last_seen: dict[str, datetime] = {}

    async def connect(self, job_id: str, user_id: str, websocket: WebSocket):
        await websocket.accept()

        if job_id not in self.active_connections:
            self.active_connections[job_id] = []

        self.active_connections[job_id].append(websocket)
        self.user_presence[user_id] = True

    def disconnect(self, job_id: str, user_id: str, websocket: WebSocket):
        if job_id in self.active_connections:
            self.active_connections[job_id] = [
                ws for ws in self.active_connections[job_id] if ws != websocket
            ]

        self.user_presence[user_id] = False
        self.user_last_seen[user_id] = datetime.now(timezone.utc)

    async def broadcast(self, job_id: str, payload: dict):
        if job_id in self.active_connections:
            stale_connections = []

            for connection in self.active_connections[job_id]:
                try:
                    await connection.send_json(payload)
                except Exception:
                    stale_connections.append(connection)

            for stale in stale_connections:
                self.active_connections[job_id] = [
                    ws for ws in self.active_connections[job_id] if ws != stale
                ]

    def is_online(self, user_id: str) -> bool:
        return self.user_presence.get(user_id, False)

    def get_last_seen(self, user_id: str):
        return self.user_last_seen.get(user_id)


manager = ConnectionManager()


class UserConnectionManager:
    def __init__(self):
        self.user_connections: dict[str, list[WebSocket]] = {}

    async def connect(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        if user_id not in self.user_connections:
            self.user_connections[user_id] = []
        self.user_connections[user_id].append(websocket)

    def disconnect(self, user_id: str, websocket: WebSocket):
        if user_id in self.user_connections:
            self.user_connections[user_id] = [
                ws for ws in self.user_connections[user_id] if ws != websocket
            ]

    async def send_to_user(self, user_id: str, message: dict):
        if user_id in self.user_connections:
            for ws in self.user_connections[user_id]:
                try:
                    await ws.send_json(message)
                except Exception:
                    pass


user_manager = UserConnectionManager()


def user_can_access_job_chat(user_id: str, job_id: str) -> bool:
    job = get_job_by_id(job_id)
    if not job:
        return False

    if job.poster_user_id == user_id:
        selected_app = get_selected_application_for_job(job_id)
        return selected_app is not None

    selected_worker_app = get_selected_application_for_worker_and_job(user_id, job_id)
    return selected_worker_app is not None


@router.get("/my-chats", response_model=List[ChatConversationItem])
def get_my_chats(current_user=Depends(get_current_user)):
    items: List[ChatConversationItem] = []

    if current_user.current_mode == "poster" and current_user.poster_profile is not None:
        jobs = get_jobs_by_poster(current_user.id)
        selected_apps = get_selected_applications_for_poster_jobs(current_user.id, jobs)

        for app in selected_apps:
            job = get_job_by_id(app.job_id)
            worker = get_by_id(app.worker_user_id)
            last_message = get_last_message_for_job(app.job_id)

            if not job or not worker or not worker.worker_profile:
                continue

            if worker.id == current_user.id:
                continue

            items.append(
                ChatConversationItem(
                    job_id=job.id,
                    other_user_id=worker.id,
                    other_user_name=worker.worker_profile.name,
                    other_user_photo_data_url=worker.worker_profile.photo_data_url,
                    job_title=job.title,
                    last_message_text=last_message.text if last_message else None,
                    last_message_at=last_message.created_at if last_message else None,
                    unread_count=get_unread_count_for_job_and_user(job.id, current_user.id),
                    other_user_online=manager.is_online(worker.id),
                    other_user_last_seen_at=manager.get_last_seen(worker.id),
                )
            )

    elif current_user.current_mode == "worker" and current_user.worker_profile is not None:
        selected_apps = get_selected_applications_for_worker(current_user.id)

        for app in selected_apps:
            job = get_job_by_id(app.job_id)
            if not job:
                continue

            poster = get_by_id(job.poster_user_id)
            if not poster or not poster.poster_profile:
                continue

            if poster.id == current_user.id:
                continue

            last_message = get_last_message_for_job(app.job_id)

            items.append(
                ChatConversationItem(
                    job_id=job.id,
                    other_user_id=poster.id,
                    other_user_name=poster.poster_profile.name,
                    other_user_photo_data_url=poster.poster_profile.photo_data_url,
                    job_title=job.title,
                    last_message_text=last_message.text if last_message else None,
                    last_message_at=last_message.created_at if last_message else None,
                    unread_count=get_unread_count_for_job_and_user(job.id, current_user.id),
                    other_user_online=manager.is_online(poster.id),
                    other_user_last_seen_at=manager.get_last_seen(poster.id),
                )
            )

    items.sort(key=lambda x: x.last_message_at or x.job_id, reverse=True)
    return items


@router.get("/{job_id}", response_model=List[ChatMessagePublic])
def get_chat_messages(job_id: str, current_user=Depends(get_current_user)):
    if not user_can_access_job_chat(current_user.id, job_id):
        raise HTTPException(status_code=403, detail="You are not allowed to access this chat")

    mark_messages_seen(job_id, current_user.id)
    return get_messages_for_job(job_id)


@router.websocket("/ws/{job_id}/{user_id}")
async def chat_websocket(websocket: WebSocket, job_id: str, user_id: str):
    if not user_can_access_job_chat(user_id, job_id):
        await websocket.close(code=1008)
        return

    await manager.connect(job_id, user_id, websocket)

    await manager.broadcast(
        job_id,
        {
            "type": "presence",
            "user_id": user_id,
            "online": True,
            "last_seen_at": None,
        },
    )

    try:
        while True:
            data = await websocket.receive_json()
            event_type = data.get("type", "message")

            if event_type == "typing":
                await manager.broadcast(
                    job_id,
                    {
                        "type": "typing",
                        "user_id": data.get("user_id"),
                        "is_typing": data.get("is_typing", False),
                    },
                )
                continue

            if event_type == "seen":
                viewer_user_id = data.get("user_id")
                mark_messages_seen(job_id, viewer_user_id)

                await manager.broadcast(
                    job_id,
                    {
                        "type": "seen",
                        "job_id": job_id,
                        "user_id": viewer_user_id,
                    },
                )
                continue

            sender_user_id = data.get("sender_user_id")
            receiver_user_id = data.get("receiver_user_id")
            text = (data.get("text") or "").strip()

            if not text:
                continue

            message = create_message(
                job_id=job_id,
                sender_user_id=sender_user_id,
                receiver_user_id=receiver_user_id,
                text=text,
            )

            payload = {
                "type": "message",
                "id": message.id,
                "job_id": message.job_id,
                "sender_user_id": message.sender_user_id,
                "receiver_user_id": message.receiver_user_id,
                "text": message.text,
                "created_at": message.created_at.isoformat(),
                "is_seen": message.is_seen,
            }

            await manager.broadcast(job_id, payload)

    except WebSocketDisconnect:
        manager.disconnect(job_id, user_id, websocket)

        await manager.broadcast(
            job_id,
            {
                "type": "presence",
                "user_id": user_id,
                "online": False,
                "last_seen_at": manager.get_last_seen(user_id).isoformat()
                if manager.get_last_seen(user_id)
                else None,
            },
        )
    except Exception:
        manager.disconnect(job_id, user_id, websocket)


@router.websocket("/ws-global/{user_id}")
async def global_ws(websocket: WebSocket, user_id: str):
    await user_manager.connect(user_id, websocket)

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        user_manager.disconnect(user_id, websocket)