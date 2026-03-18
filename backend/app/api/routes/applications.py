from typing import List
from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_current_user
from app.schemas.application import JobApplicationCreate, JobApplicationPublic
from app.schemas.poster_applications import PosterApplicantItem
from app.schemas.worker_jobs import WorkerJobItem
from app.services.application_store import (
    create_application,
    get_application_by_job_and_worker,
    get_applications_by_worker,
    get_applications_for_job,
    get_application_by_id,
    reject_other_applications,
)
from app.services.job_store import get_job_by_id , set_job_status
from app.services.user_store import get_by_id
from app.services.notification_store import create_notification



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

    application = create_application(body, current_user.id)

    worker_name = (
        current_user.worker_profile.name
        if current_user.worker_profile
        else current_user.email
    )

    create_notification(
        user_id=job.poster_user_id,
        type="NEW_APPLICATION",
        target_mode="poster",
        title="New Application",
        message=f'{worker_name} applied for "{job.title}"',
    )

    return application


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


@router.get("/job/{job_id}", response_model=List[PosterApplicantItem])
def get_applications_for_job_route(job_id: str, current_user=Depends(get_current_user)):
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
            detail="You are not allowed to view applicants for this job",
        )

    applicants: List[PosterApplicantItem] = []

    for app in get_applications_for_job(job_id):
        worker = get_by_id(app.worker_user_id)

        applicants.append(
            PosterApplicantItem(
                application_id=app.id,
                job_id=app.job_id,
                worker_user_id=app.worker_user_id,
                worker_name=worker.worker_profile.name if worker and worker.worker_profile else "Worker",
                worker_photo_data_url=worker.worker_profile.photo_data_url if worker and worker.worker_profile else None,
                proposed_rate=app.proposed_rate,
                cover_letter=app.cover_letter,
                status=app.status,
                applied_at=app.created_at,
            )
        )

    applicants.sort(key=lambda x: x.applied_at, reverse=True)
    return applicants

@router.post("/{application_id}/accept")
def accept_application(application_id: str, current_user=Depends(get_current_user)):
    if current_user.poster_profile is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Poster profile does not exist",
        )

    application = get_application_by_id(application_id)
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )

    job = get_job_by_id(application.job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )

    if job.poster_user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not allowed to manage applicants for this job",
        )

    if job.status != "OPEN":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job is no longer open",
        )

    application.status = "SELECTED"
    reject_other_applications(job.id, application.id)
    set_job_status(job.id, "ASSIGNED")

    create_notification(
        user_id=application.worker_user_id,
        type="APPLICATION_ACCEPTED",
        target_mode="worker",
        title="Application Accepted",
        message=f'You have been selected for "{job.title}"',
    )


@router.post("/{application_id}/reject")
def reject_application(application_id: str, current_user=Depends(get_current_user)):
    if current_user.poster_profile is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Poster profile does not exist",
        )

    application = get_application_by_id(application_id)
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )

    job = get_job_by_id(application.job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )

    if job.poster_user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not allowed to manage applicants for this job",
        )

    if application.status != "APPLIED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only pending applications can be rejected",
        )

    application.status = "REJECTED"

    create_notification(
        user_id=application.worker_user_id,
        type="APPLICATION_REJECTED",
        target_mode="worker",
        title="Application Update",
        message=f'Your application for "{job.title}" was not selected',
    )
    return {"message": "Applicant rejected successfully"}