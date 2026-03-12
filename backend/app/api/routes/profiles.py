from fastapi import APIRouter, Depends, HTTPException, status
from app.api.deps import get_current_user
from app.schemas.profile import PosterProfileCreate, WorkerProfileCreate
from app.schemas.user import UserPublic, PosterProfile, WorkerProfile
from app.services.user_store import save_user

router = APIRouter(prefix="/profiles", tags=["profiles"])


@router.get("/me", response_model=UserPublic)
def get_my_profiles(current_user=Depends(get_current_user)):
    return current_user


@router.post("/poster", response_model=UserPublic)
def create_or_update_poster_profile(
    body: PosterProfileCreate,
    current_user=Depends(get_current_user),
):
    current_user.poster_profile = PosterProfile(**body.model_dump())
    if current_user.current_mode is None:
        current_user.current_mode = "poster"
    save_user(current_user)
    return current_user


@router.post("/worker", response_model=UserPublic)
def create_or_update_worker_profile(
    body: WorkerProfileCreate,
    current_user=Depends(get_current_user),
):
    current_user.worker_profile = WorkerProfile(**body.model_dump())
    if current_user.current_mode is None:
        current_user.current_mode = "worker"
    save_user(current_user)
    return current_user