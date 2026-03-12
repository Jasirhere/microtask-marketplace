from typing import Optional, Literal, List
from pydantic import BaseModel, EmailStr

ModeType = Literal["poster", "worker"]


class PosterProfile(BaseModel):
    name: str
    phone: str
    photo_data_url: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None


class WorkerProfile(BaseModel):
    name: str
    phone: str
    photo_data_url: Optional[str] = None
    skills: List[str] = []
    bio: Optional[str] = None
    location: Optional[str] = None


class UserPublic(BaseModel):
    id: str
    email: EmailStr
    is_active: bool = True
    current_mode: Optional[ModeType] = None
    poster_profile: Optional[PosterProfile] = None
    worker_profile: Optional[WorkerProfile] = None


class UserInDB(UserPublic):
    password_hash: str