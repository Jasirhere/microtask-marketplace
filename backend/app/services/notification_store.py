import uuid
from datetime import datetime, timezone
from typing import List
from app.schemas.notification import NotificationPublic

_notifications: List[NotificationPublic] = []


def create_notification(
    user_id: str,
    type: str,
    target_mode: str,
    title: str,
    message: str,
) -> NotificationPublic:
    notification = NotificationPublic(
        id=str(uuid.uuid4()),
        user_id=user_id,
        type=type,
        target_mode=target_mode,
        title=title,
        message=message,
        is_read=False,
        created_at=datetime.now(timezone.utc),
    )
    _notifications.append(notification)
    return notification


def get_notifications_for_user(user_id: str, target_mode: str) -> List[NotificationPublic]:
    items = [
        n for n in _notifications
        if n.user_id == user_id and n.target_mode == target_mode
    ]
    items.sort(key=lambda x: x.created_at, reverse=True)
    return items


def get_unread_count_for_user(user_id: str, target_mode: str) -> int:
    return len(
        [
            n for n in _notifications
            if n.user_id == user_id
            and n.target_mode == target_mode
            and not n.is_read
        ]
    )


def mark_all_read_for_user(user_id: str, target_mode: str) -> None:
    for n in _notifications:
        if n.user_id == user_id and n.target_mode == target_mode:
            n.is_read = True