from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from app.api.deps import get_current_user
from app.schemas.job import JobCreate, JobPublic, CATEGORY_OPTIONS
from app.services.job_store import create_job, get_jobs_by_poster, get_job_by_id, get_open_jobs


router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.get("/categories", response_model=List[str])
def get_job_categories():
    return CATEGORY_OPTIONS


@router.post("", response_model=JobPublic, status_code=status.HTTP_201_CREATED)
def create_new_job(
    body: JobCreate,
    current_user=Depends(get_current_user),
):
    if current_user.poster_profile is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Poster profile does not exist",
        )

    if body.budget_max < body.budget_min:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="budget_max must be greater than or equal to budget_min",
        )

    if body.category not in CATEGORY_OPTIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid category selected",
        )

    job = create_job(body, current_user.id)
    return job


@router.get("/mine", response_model=List[JobPublic])
def get_my_posted_jobs(current_user=Depends(get_current_user)):
    if current_user.poster_profile is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Poster profile does not exist",
        )

    return get_jobs_by_poster(current_user.id)

@router.get("/open", response_model=List[JobPublic])
def get_open_jobs_feed(
    search: str | None = None,
    category: str | None = None,
    city: str | None = None,
    current_user=Depends(get_current_user),
):
    if current_user.worker_profile is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Worker profile does not exist",
        )

    return get_open_jobs(search=search, category=category, city=city)


@router.get("/public/{job_id}", response_model=JobPublic)
def get_public_job(job_id: str, current_user=Depends(get_current_user)):
    job = get_job_by_id(job_id)

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )

    if job.status != "OPEN":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not available",
        )

    return job

@router.get("/{job_id}", response_model=JobPublic)
def get_job_detail(job_id: str, current_user=Depends(get_current_user)):
    if current_user.poster_profile is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Poster profile does not exist",
        )

    job = get_job_by_id(job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )

    if job.poster_user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not allowed to view this job",
        )

    return job