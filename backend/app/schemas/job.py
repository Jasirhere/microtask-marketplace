from typing import List, Optional, Literal
from pydantic import BaseModel, Field
from datetime import datetime

JobStatus = Literal["OPEN", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "CLOSED"]
DeadlineUnit = Literal["hours", "days", "weeks"]
DurationUnit = Literal["hours", "days"]

CATEGORY_OPTIONS = [
    "Cleaning",
    "Moving Help",
    "Delivery",
    "Handyman",
    "Plumbing",
    "Electrical",
    "Painting",
    "Gardening",
    "Furniture Assembly",
    "Home Cleaning",
    "Deep Cleaning",
    "Personal Assistant",
    "Event Help",
    "Tutoring",
    "Graphic Design",
    "Web Design",
    "Logo Design",
    "Content Writing",
    "Social Media Help",
    "Other",
]


class JobCreate(BaseModel):
    title: str = Field(min_length=3, max_length=120)
    description: str = Field(min_length=10, max_length=1000)
    category: str

    country: str
    city: str
    area: str
    address_details: Optional[str] = None

    latitude: Optional[float] = None
    longitude: Optional[float] = None

    budget_min: float = Field(ge=0)
    budget_max: float = Field(ge=0)

    deadline_value: int = Field(gt=0)
    deadline_unit: DeadlineUnit

    estimated_duration_value: int = Field(gt=0)
    estimated_duration_unit: DurationUnit

    skills_required: List[str] = []
    notes: Optional[str] = Field(default=None, max_length=500)

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

    status: JobStatus
    created_at: datetime
    
    poster_name: Optional[str] = None
    poster_photo_data_url: Optional[str] = None