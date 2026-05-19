from datetime import datetime, timezone
from typing import List, Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.db.models import ChatMessage
from app.schemas.chat import ChatMessagePublic


def _parse_uuid(value: str) -> UUID | None:
    try:
        return UUID(value)
    except ValueError:
        return None


def _to_chat_message_public(message: ChatMessage) -> ChatMessagePublic:
    return ChatMessagePublic(
        id=str(message.id),
        job_id=str(message.job_id),
        sender_user_id=str(message.sender_user_id),
        receiver_user_id=str(message.receiver_user_id),
        text=message.text,
        created_at=message.created_at,
        is_seen=message.is_seen,
    )


def create_message(
    db: Session,
    job_id: str,
    sender_user_id: str,
    receiver_user_id: str,
    text: str,
) -> ChatMessagePublic:
    job_uuid = _parse_uuid(job_id)
    sender_uuid = _parse_uuid(sender_user_id)
    receiver_uuid = _parse_uuid(receiver_user_id)

    if job_uuid is None or sender_uuid is None or receiver_uuid is None:
        raise ValueError("Invalid chat message IDs")

    message = ChatMessage(
        job_id=job_uuid,
        sender_user_id=sender_uuid,
        receiver_user_id=receiver_uuid,
        text=text,
        created_at=datetime.now(timezone.utc),
        is_seen=False,
    )

    db.add(message)
    db.commit()
    db.refresh(message)

    return _to_chat_message_public(message)


def get_messages_for_job(db: Session, job_id: str) -> List[ChatMessagePublic]:
    job_uuid = _parse_uuid(job_id)

    if job_uuid is None:
        return []

    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.job_id == job_uuid)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )

    return [_to_chat_message_public(message) for message in messages]


def get_last_message_for_job(
    db: Session,
    job_id: str,
) -> Optional[ChatMessagePublic]:
    job_uuid = _parse_uuid(job_id)

    if job_uuid is None:
        return None

    message = (
        db.query(ChatMessage)
        .filter(ChatMessage.job_id == job_uuid)
        .order_by(ChatMessage.created_at.desc())
        .first()
    )

    return _to_chat_message_public(message) if message else None


def mark_messages_seen(
    db: Session,
    job_id: str,
    viewer_user_id: str,
) -> None:
    job_uuid = _parse_uuid(job_id)
    viewer_uuid = _parse_uuid(viewer_user_id)

    if job_uuid is None or viewer_uuid is None:
        return

    (
        db.query(ChatMessage)
        .filter(
            ChatMessage.job_id == job_uuid,
            ChatMessage.receiver_user_id == viewer_uuid,
            ChatMessage.is_seen.is_(False),
        )
        .update({ChatMessage.is_seen: True}, synchronize_session=False)
    )

    db.commit()


def get_unread_count_for_job_and_user(
    db: Session,
    job_id: str,
    user_id: str,
) -> int:
    job_uuid = _parse_uuid(job_id)
    user_uuid = _parse_uuid(user_id)

    if job_uuid is None or user_uuid is None:
        return 0

    return (
        db.query(ChatMessage)
        .filter(
            ChatMessage.job_id == job_uuid,
            ChatMessage.receiver_user_id == user_uuid,
            ChatMessage.is_seen.is_(False),
        )
        .count()
    )