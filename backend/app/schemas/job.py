from datetime import datetime
from typing import List, Optional, Literal
from pydantic import BaseModel

DeadlineUnit = Literal["hours", "days", "weeks"]
DurationUnit = Literal["hours", "days"]
JobStatus = Literal["OPEN", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "CLOSED"]

CATEGORY_OPTIONS = [
    "Cleaning",
    "Moving & Delivery",
    "Home Services",
    "Web Development",
    "Mobile Development",
    "Design",
    "Writing & Content",
    "Marketing",
    "Other",
]


class JobCreate(BaseModel):
    title: str
    description: str
    category: str

    country: str
    city: str
    area: str
    address_details: Optional[str] = None

    latitude: Optional[float] = None
    longitude: Optional[float] = None

    budget_min: float
    budget_max: float

    deadline_value: int
    deadline_unit: DeadlineUnit

    estimated_duration_value: int
    estimated_duration_unit: DurationUnit

    skills_required: List[str]
    notes: Optional[str] = None


class JobPublic(BaseModel):
    id: str
    poster_user_id: str

    title: str
    description: str
    category: str

    country: str
    city: str
    area: str
    address_details: Optional[str] = None

    latitude: Optional[float] = None
    longitude: Optional[float] = None

    budget_min: float
    budget_max: float

    deadline_value: int
    deadline_unit: DeadlineUnit

    estimated_duration_value: int
    estimated_duration_unit: DurationUnit

    skills_required: List[str]
    notes: Optional[str] = None

    poster_name: Optional[str] = None
    poster_photo_data_url: Optional[str] = None

    selected_worker_user_id: Optional[str] = None
    selected_worker_name: Optional[str] = None
    selected_worker_photo_data_url: Optional[str] = None
    selected_worker_bio: Optional[str] = None
    selected_worker_joined_text: Optional[str] = None
    selected_worker_completed_jobs_count: Optional[int] = None
    selected_worker_rating: Optional[float] = None
    selected_worker_reviews_count: Optional[int] = None

    status: JobStatus
    created_at: datetime