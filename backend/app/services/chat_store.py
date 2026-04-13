import uuid
from datetime import datetime, timezone
from typing import List, Optional
from app.schemas.chat import ChatMessagePublic

_messages: List[ChatMessagePublic] = []


def create_message(
    job_id: str,
    sender_user_id: str,
    receiver_user_id: str,
    text: str,
) -> ChatMessagePublic:
    message = ChatMessagePublic(
        id=str(uuid.uuid4()),
        job_id=job_id,
        sender_user_id=sender_user_id,
        receiver_user_id=receiver_user_id,
        text=text,
        created_at=datetime.now(timezone.utc),
        is_seen=False,
    )
    _messages.append(message)
    return message


def get_messages_for_job(job_id: str) -> List[ChatMessagePublic]:
    items = [m for m in _messages if m.job_id == job_id]
    items.sort(key=lambda x: x.created_at)
    return items


def get_last_message_for_job(job_id: str) -> Optional[ChatMessagePublic]:
    items = [m for m in _messages if m.job_id == job_id]
    if not items:
        return None
    items.sort(key=lambda x: x.created_at, reverse=True)
    return items[0]


def mark_messages_seen(job_id: str, viewer_user_id: str) -> None:
    for message in _messages:
        if (
            message.job_id == job_id
            and message.receiver_user_id == viewer_user_id
            and not message.is_seen
        ):
            message.is_seen = True


def get_unread_count_for_job_and_user(job_id: str, user_id: str) -> int:
    return len(
        [
            m for m in _messages
            if m.job_id == job_id and m.receiver_user_id == user_id and not m.is_seen
        ]
    )