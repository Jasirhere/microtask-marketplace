from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel

NotificationType = Literal[
    "NEW_APPLICATION",
    "APPLICATION_ACCEPTED",
    "APPLICATION_REJECTED",
    "NEW_REVIEW",
    "JOB_COMPLETION_UPDATE",
    "PAYMENT_RECEIVED",
    "PAYMENT_SENT",
]

NotificationTargetMode = Literal["poster", "worker"]


class NotificationPublic(BaseModel):
    id: str
    user_id: str
    type: NotificationType
    target_mode: NotificationTargetMode
    title: str
    message: str
    actor_name: Optional[str] = None
    actor_photo_data_url: Optional[str] = None
    job_title: Optional[str] = None
    is_read: bool = False
    created_at: datetime