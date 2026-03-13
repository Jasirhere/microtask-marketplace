from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from app.api.deps import get_current_user
from app.schemas.job import JobCreate, JobPublic, CATEGORY_OPTIONS
from app.services.job_store import create_job, get_jobs_by_poster, get_job_by_id, delete_job , get_open_jobs
from app.services.application_store import get_applied_job_ids_for_worker
from app.services.user_store import get_by_email
from app.services.user_store import get_by_id

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

    poster = get_by_id(job.poster_user_id)

    job_data = job.dict()

    if poster and poster.poster_profile:
        job_data["poster_name"] = poster.poster_profile.name
        job_data["poster_photo_data_url"] = poster.poster_profile.photo_data_url
    else:
        job_data["poster_name"] = "Client"
        job_data["poster_photo_data_url"] = None

    return JobPublic(**job_data)

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

    applied_job_ids = get_applied_job_ids_for_worker(current_user.id)

    return get_open_jobs(
        search=search,
        category=category,
        city=city,
        exclude_job_ids=applied_job_ids,
    )

@router.put("/{job_id}", response_model=JobPublic)
def update_job(
    job_id: str,
    body: JobCreate,
    current_user=Depends(get_current_user),
):
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
            detail="You are not allowed to edit this job",
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

    job.title = body.title
    job.description = body.description
    job.category = body.category
    job.country = body.country
    job.city = body.city
    job.area = body.area
    job.address_details = body.address_details
    job.latitude = body.latitude
    job.longitude = body.longitude
    job.budget_min = body.budget_min
    job.budget_max = body.budget_max
    job.deadline_value = body.deadline_value
    job.deadline_unit = body.deadline_unit
    job.estimated_duration_value = body.estimated_duration_value
    job.estimated_duration_unit = body.estimated_duration_unit
    job.skills_required = body.skills_required
    job.notes = body.notes

    return job

@router.delete("/{job_id}")
def delete_job_route(job_id: str, current_user=Depends(get_current_user)):
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
            detail="You are not allowed to delete this job",
        )

    delete_job(job_id)

    return {"message": "Job deleted successfully"}

@router.delete("/{job_id}")
def delete_job_route(job_id: str, current_user=Depends(get_current_user)):
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
            detail="You are not allowed to delete this job",
        )

    delete_job(job_id)

    return {"message": "Job deleted successfully"}    

