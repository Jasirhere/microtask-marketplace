from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, Field

ApplicationStatus = Literal["APPLIED", "SELECTED", "REJECTED", "WITHDRAWN"]


class JobApplicationCreate(BaseModel):
    job_id: str
    proposed_rate: float = Field(ge=0)
    cover_letter: Optional[str] = Field(default=None, max_length=1000)


class JobApplicationPublic(BaseModel):
    id: str
    job_id: str
    worker_user_id: str
    proposed_rate: float
    cover_letter: Optional[str] = None
    status: ApplicationStatus
    created_at: datetime