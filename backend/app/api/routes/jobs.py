from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.schemas.job import JobCreate, JobPublic
from app.services.job_store import (
    create_job,
    get_jobs_by_poster,
    get_job_by_id,
    delete_job,
    get_open_jobs,
    update_job as update_job_in_db,
)
from app.services.application_store import (
    get_applied_job_ids_for_worker,
    get_selected_application_for_job,
    get_selected_application_for_worker_and_job,
)
from app.services.user_store import get_by_id


router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.post("", response_model=JobPublic, status_code=status.HTTP_201_CREATED)
def create_new_job(
    body: JobCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
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

    return create_job(db, body, current_user.id)


@router.get("/mine", response_model=list[JobPublic])
def get_my_posted_jobs(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.poster_profile is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Poster profile does not exist",
        )

    return get_jobs_by_poster(db, current_user.id)


@router.get("/open", response_model=list[JobPublic])
def get_open_jobs_feed(
    search: str | None = None,
    category: str | None = None,
    city: str | None = None,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.worker_profile is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Worker profile does not exist",
        )

    applied_job_ids = get_applied_job_ids_for_worker(db, current_user.id)

    return get_open_jobs(
        db,
        search=search,
        category=category,
        city=city,
        exclude_job_ids=applied_job_ids,
    )


@router.get("/public/{job_id}", response_model=JobPublic)
def get_public_job(
    job_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    job = get_job_by_id(db, job_id)

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

    poster = get_by_id(db, job.poster_user_id)

    job_data = job.model_dump()

    if poster and poster.poster_profile:
        job_data["poster_name"] = poster.poster_profile.name
        job_data["poster_photo_data_url"] = poster.poster_profile.photo_data_url
    else:
        job_data["poster_name"] = "Client"
        job_data["poster_photo_data_url"] = None

    return JobPublic(**job_data)


@router.get("/worker/{job_id}", response_model=JobPublic)
def get_worker_assigned_job(
    job_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.worker_profile is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Worker profile does not exist",
        )

    job = get_job_by_id(db, job_id)

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )

    selected_application = get_selected_application_for_worker_and_job(
        db,
        current_user.id,
        job_id,
    )

    if not selected_application:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not allowed to view this assigned job",
        )

    poster = get_by_id(db, job.poster_user_id)

    job_data = job.model_dump()

    if poster and poster.poster_profile:
        job_data["poster_name"] = poster.poster_profile.name
        job_data["poster_photo_data_url"] = poster.poster_profile.photo_data_url
    else:
        job_data["poster_name"] = "Client"
        job_data["poster_photo_data_url"] = None

    return JobPublic(**job_data)


@router.get("/{job_id}", response_model=JobPublic)
def get_job_detail(
    job_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.poster_profile is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Poster profile does not exist",
        )

    job = get_job_by_id(db, job_id)

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

    job_data = job.model_dump()

    selected_application = get_selected_application_for_job(db, job.id)

    if selected_application:
        selected_worker = get_by_id(db, selected_application.worker_user_id)

        job_data["selected_worker_user_id"] = selected_application.worker_user_id
        job_data["selected_worker_name"] = (
            selected_worker.worker_profile.name
            if selected_worker and selected_worker.worker_profile
            else "Assigned Worker"
        )
        job_data["selected_worker_photo_data_url"] = (
            selected_worker.worker_profile.photo_data_url
            if selected_worker and selected_worker.worker_profile
            else None
        )
        job_data["selected_worker_bio"] = (
            selected_worker.worker_profile.bio
            if selected_worker and selected_worker.worker_profile
            else "Worker selected for this job."
        )

        job_data["selected_worker_joined_text"] = None
        job_data["selected_worker_completed_jobs_count"] = None
        job_data["selected_worker_rating"] = None
        job_data["selected_worker_reviews_count"] = None
    else:
        job_data["selected_worker_user_id"] = None
        job_data["selected_worker_name"] = None
        job_data["selected_worker_photo_data_url"] = None
        job_data["selected_worker_bio"] = None
        job_data["selected_worker_joined_text"] = None
        job_data["selected_worker_completed_jobs_count"] = None
        job_data["selected_worker_rating"] = None
        job_data["selected_worker_reviews_count"] = None

    return JobPublic(**job_data)


@router.put("/{job_id}", response_model=JobPublic)
def update_job(
    job_id: str,
    body: JobCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.poster_profile is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Poster profile does not exist",
        )

    job = get_job_by_id(db, job_id)

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

    updated_job = update_job_in_db(db, job_id, body)

    if not updated_job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )

    return updated_job


@router.delete("/{job_id}")
def delete_job_route(
    job_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.poster_profile is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Poster profile does not exist",
        )

    job = get_job_by_id(db, job_id)

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

    delete_job(db, job_id)

    return {"message": "Job deleted successfully"}