from datetime import datetime
from typing import Literal
from pydantic import BaseModel

NotificationType = Literal[
    "NEW_APPLICATION",
    "APPLICATION_ACCEPTED",
    "APPLICATION_REJECTED",
]

NotificationTargetMode = Literal["poster", "worker"]


class NotificationPublic(BaseModel):
    id: str
    user_id: str
    type: NotificationType
    target_mode: NotificationTargetMode
    title: str
    message: str
    is_read: bool = False
    created_at: datetime