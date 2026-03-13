from typing import List
from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_current_user
from app.schemas.application import JobApplicationCreate, JobApplicationPublic
from app.services.application_store import (
    create_application,
    get_application_by_job_and_worker,
    get_applications_by_worker,
)
from app.services.job_store import get_job_by_id
from app.schemas.worker_jobs import WorkerJobItem
from app.services.job_store import get_job_by_id

router = APIRouter(prefix="/applications", tags=["applications"])


@router.post("", response_model=JobApplicationPublic, status_code=status.HTTP_201_CREATED)
def apply_to_job(
    body: JobApplicationCreate,
    current_user=Depends(get_current_user),
):
    if current_user.worker_profile is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Worker profile does not exist",
        )

    job = get_job_by_id(body.job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )

    if job.status != "OPEN":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job is not open for applications",
        )

    if body.proposed_rate <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Proposed rate must be greater than 0",
        )

    if body.proposed_rate < job.budget_min or body.proposed_rate > job.budget_max:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Proposed rate must be between {job.budget_min} and {job.budget_max}",
        )

    existing = get_application_by_job_and_worker(body.job_id, current_user.id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already applied to this job",
        )

    return create_application(body, current_user.id)


@router.get("/mine", response_model=List[JobApplicationPublic])
def get_my_applications(current_user=Depends(get_current_user)):
    if current_user.worker_profile is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Worker profile does not exist",
        )

    return get_applications_by_worker(current_user.id)

@router.get("/my-jobs", response_model=List[WorkerJobItem])
def get_my_jobs(current_user=Depends(get_current_user)):
    if current_user.worker_profile is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Worker profile does not exist",
        )

    applications = get_applications_by_worker(current_user.id)
    items: List[WorkerJobItem] = []

    for app in applications:
        job = get_job_by_id(app.job_id)
        if not job:
            continue

        items.append(
            WorkerJobItem(
                application_id=app.id,
                application_status=app.status,
                applied_at=app.created_at,
                proposed_rate=app.proposed_rate,
                cover_letter=app.cover_letter,

                job_id=job.id,
                job_title=job.title,
                job_description=job.description,
                job_category=job.category,

                country=job.country,
                city=job.city,
                area=job.area,
                address_details=job.address_details,

                budget_min=job.budget_min,
                budget_max=job.budget_max,

                deadline_value=job.deadline_value,
                deadline_unit=job.deadline_unit,

                estimated_duration_value=job.estimated_duration_value,
                estimated_duration_unit=job.estimated_duration_unit,

                job_status=job.status,
                created_at=job.created_at,
            )
        )

    return items