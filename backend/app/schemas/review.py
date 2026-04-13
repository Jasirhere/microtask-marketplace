from pydantic import BaseModel, Field
from datetime import datetime


class ReviewCreate(BaseModel):
    job_id: str
    reviewee_user_id: str
    reviewee_role: str
    rating: int = Field(ge=1, le=5)
    comment: str


class ReviewPublic(BaseModel):
    id: str
    job_id: str
    reviewer_user_id: str
    reviewer_role: str
    reviewee_user_id: str
    reviewee_role: str
    rating: int
    comment: str
    created_at: datetime
    reviewer_name: str | None = None
    reviewer_photo_data_url: str | None = None