from datetime import datetime, timezone
from typing import List, Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.db.models import Notification
from app.schemas.notification import NotificationPublic


def _parse_uuid(value: str) -> UUID | None:
    try:
        return UUID(value)
    except ValueError:
        return None


def _to_notification_public(notification: Notification) -> NotificationPublic:
    return NotificationPublic(
        id=str(notification.id),
        user_id=str(notification.user_id),
        type=notification.type,
        target_mode=notification.target_mode,
        title=notification.title,
        message=notification.message,
        actor_name=notification.actor_name,
        actor_photo_data_url=notification.actor_photo_data_url,
        job_title=notification.job_title,
        is_read=notification.is_read,
        created_at=notification.created_at,
    )


def create_notification(
    db: Session,
    user_id: str,
    type: str,
    target_mode: str,
    title: str,
    message: str,
    actor_name: Optional[str] = None,
    actor_photo_data_url: Optional[str] = None,
    job_title: Optional[str] = None,
) -> NotificationPublic:
    user_uuid = _parse_uuid(user_id)

    if user_uuid is None:
        raise ValueError("Invalid user_id")

    notification = Notification(
        user_id=user_uuid,
        type=type,
        target_mode=target_mode,
        title=title,
        message=message,
        actor_name=actor_name,
        actor_photo_data_url=actor_photo_data_url,
        job_title=job_title,
        is_read=False,
        created_at=datetime.now(timezone.utc),
    )

    db.add(notification)
    db.commit()
    db.refresh(notification)

    return _to_notification_public(notification)


def get_notifications_for_user(
    db: Session,
    user_id: str,
    target_mode: str,
) -> List[NotificationPublic]:
    user_uuid = _parse_uuid(user_id)

    if user_uuid is None:
        return []

    notifications = (
        db.query(Notification)
        .filter(
            Notification.user_id == user_uuid,
            Notification.target_mode == target_mode,
        )
        .order_by(Notification.created_at.desc())
        .all()
    )

    return [_to_notification_public(notification) for notification in notifications]


def get_unread_count_for_user(
    db: Session,
    user_id: str,
    target_mode: str,
) -> int:
    user_uuid = _parse_uuid(user_id)

    if user_uuid is None:
        return 0

    return (
        db.query(Notification)
        .filter(
            Notification.user_id == user_uuid,
            Notification.target_mode == target_mode,
            Notification.is_read.is_(False),
        )
        .count()
    )


def mark_all_read_for_user(
    db: Session,
    user_id: str,
    target_mode: str,
) -> None:
    user_uuid = _parse_uuid(user_id)

    if user_uuid is None:
        return

    (
        db.query(Notification)
        .filter(
            Notification.user_id == user_uuid,
            Notification.target_mode == target_mode,
            Notification.is_read.is_(False),
        )
        .update({Notification.is_read: True}, synchronize_session=False)
    )

    db.commit()