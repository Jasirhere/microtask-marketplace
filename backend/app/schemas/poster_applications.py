from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel

ApplicationStatus = Literal["APPLIED", "SELECTED", "REJECTED", "WITHDRAWN"]


class PosterApplicantItem(BaseModel):
    application_id: str
    job_id: str
    worker_user_id: str

    worker_name: str
    worker_photo_data_url: Optional[str] = None

    proposed_rate: float
    cover_letter: Optional[str] = None
    status: ApplicationStatus
    applied_at: datetime