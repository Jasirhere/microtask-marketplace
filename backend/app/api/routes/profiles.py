from typing import Literal
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.schemas.profile import PosterProfileCreate, WorkerProfileCreate
from app.schemas.user import UserPublic, PosterProfile, WorkerProfile
from app.services.user_store import save_user, get_by_id


router = APIRouter(prefix="/profiles", tags=["profiles"])


class SwitchModeRequest(BaseModel):
    mode: Literal["poster", "worker"]


@router.get("/me", response_model=UserPublic)
def get_my_profiles(current_user=Depends(get_current_user)):
    return current_user


@router.get("/worker/{user_id}", response_model=UserPublic)
def get_worker_profile(user_id: str, db: Session = Depends(get_db)):
    user = get_by_id(db, user_id)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not user.worker_profile:
        raise HTTPException(status_code=404, detail="Worker profile not found")

    return user


@router.get("/poster/{user_id}", response_model=UserPublic)
def get_poster_profile(user_id: str, db: Session = Depends(get_db)):
    user = get_by_id(db, user_id)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not user.poster_profile:
        raise HTTPException(status_code=404, detail="Poster profile not found")

    return user


@router.post("/poster", response_model=UserPublic)
def create_or_update_poster_profile(
    body: PosterProfileCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile_data = body.model_dump()

    if current_user.poster_profile is None:
        profile_data["created_at"] = datetime.now(timezone.utc)
    else:
        profile_data["created_at"] = current_user.poster_profile.created_at

    current_user.poster_profile = PosterProfile(**profile_data)

    if current_user.current_mode is None:
        current_user.current_mode = "poster"

    return save_user(db, current_user)


@router.post("/worker", response_model=UserPublic)
def create_or_update_worker_profile(
    body: WorkerProfileCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile_data = body.model_dump()

    if current_user.worker_profile is None:
        profile_data["created_at"] = datetime.now(timezone.utc)
    else:
        profile_data["created_at"] = current_user.worker_profile.created_at

    current_user.worker_profile = WorkerProfile(**profile_data)

    if current_user.current_mode is None:
        current_user.current_mode = "worker"

    return save_user(db, current_user)


@router.get("/mode/current")
def get_current_mode(current_user=Depends(get_current_user)):
    return {"current_mode": current_user.current_mode}


@router.post("/mode/switch")
def switch_mode(
    body: SwitchModeRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if body.mode == "poster":
        if current_user.poster_profile is None:
            raise HTTPException(
                status_code=400,
                detail="Poster profile does not exist",
            )

        current_user.current_mode = "poster"

    elif body.mode == "worker":
        if current_user.worker_profile is None:
            raise HTTPException(
                status_code=400,
                detail="Worker profile does not exist",
            )

        current_user.current_mode = "worker"

    updated_user = save_user(db, current_user)

    return {
        "message": f"Switched to {body.mode}",
        "current_mode": updated_user.current_mode,
    }