from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class ChatMessagePublic(BaseModel):
    id: str
    job_id: str
    sender_user_id: str
    receiver_user_id: str
    text: str
    created_at: datetime
    is_seen: bool = False


class ChatConversationItem(BaseModel):
    job_id: str
    other_user_id: str
    other_user_name: str
    other_user_photo_data_url: Optional[str] = None
    job_title: str
    last_message_text: Optional[str] = None
    last_message_at: Optional[datetime] = None
    unread_count: int = 0
    other_user_online: bool = False
    other_user_last_seen_at: Optional[datetime] = None