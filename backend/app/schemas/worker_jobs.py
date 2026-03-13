from datetime import datetime
from typing import Optional, Literal, List
from pydantic import BaseModel

ApplicationStatus = Literal["APPLIED", "SELECTED", "REJECTED", "WITHDRAWN"]

class WorkerJobItem(BaseModel):
    application_id: str
    application_status: ApplicationStatus
    applied_at: datetime

    proposed_rate: float
    cover_letter: Optional[str] = None

    job_id: str
    job_title: str
    job_description: str
    job_category: str

    country: str
    city: str
    area: str
    address_details: Optional[str] = None

    budget_min: float
    budget_max: float

    deadline_value: int
    deadline_unit: str

    estimated_duration_value: int
    estimated_duration_unit: str

    job_status: str
    created_at: datetime