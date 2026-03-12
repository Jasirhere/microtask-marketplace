from typing import Optional, List, Literal
from pydantic import BaseModel

ModeType = Literal["poster", "worker"]


class PosterProfileCreate(BaseModel):
    name: str
    phone: str
    photo_data_url: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None


class WorkerProfileCreate(BaseModel):
    name: str
    phone: str
    photo_data_url: Optional[str] = None
    skills: List[str] = []
    bio: Optional[str] = None
    location: Optional[str] = None


class ModeSwitchRequest(BaseModel):
    mode: ModeType


class CurrentModeResponse(BaseModel):
    current_mode: Optional[ModeType] = None