from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
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
    select_application,
    reject_application_by_id,
)
from app.services.job_store import get_job_by_id, assign_job
from app.services.notification_store import create_notification
from app.services.review_store import get_user_review_summary
from app.services.user_store import get_by_id


router = APIRouter(prefix="/applications", tags=["applications"])


@router.post("", response_model=JobApplicationPublic, status_code=status.HTTP_201_CREATED)
async def apply_to_job(
    body: JobApplicationCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.worker_profile is None:
        raise HTTPException(status_code=400, detail="Worker profile does not exist")

    job = get_job_by_id(db, body.job_id)

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if job.status != "OPEN":
        raise HTTPException(status_code=400, detail="Job is not open for applications")

    if body.proposed_rate <= 0:
        raise HTTPException(status_code=400, detail="Proposed rate must be greater than 0")

    if body.proposed_rate < job.budget_min or body.proposed_rate > job.budget_max:
        raise HTTPException(
            status_code=400,
            detail=f"Proposed rate must be between {job.budget_min} and {job.budget_max}",
        )

    existing = get_application_by_job_and_worker(db, body.job_id, current_user.id)

    if existing:
        raise HTTPException(status_code=400, detail="You have already applied to this job")

    application = create_application(db, body, current_user.id)

    worker_name = (
        current_user.worker_profile.name
        if current_user.worker_profile and current_user.worker_profile.name
        else current_user.email
    )

    worker_photo = (
        current_user.worker_profile.photo_data_url
        if current_user.worker_profile
        else None
    )

    create_notification(
        db=db,
        user_id=job.poster_user_id,
        type="NEW_APPLICATION",
        target_mode="poster",
        title="New Application",
        message=f'{worker_name} applied for "{job.title}"',
        actor_name=worker_name,
        actor_photo_data_url=worker_photo,
        job_title=job.title,
    )

    try:
        from app.api.routes.chat import user_manager
        await user_manager.send_to_user(job.poster_user_id, {"type": "notification_update"})
    except Exception:
        pass

    return application


@router.get("/mine", response_model=List[JobApplicationPublic])
def get_my_applications(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.worker_profile is None:
        raise HTTPException(status_code=400, detail="Worker profile does not exist")

    return get_applications_by_worker(db, current_user.id)


@router.get("/my-jobs", response_model=List[WorkerJobItem])
def get_my_jobs(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.worker_profile is None:
        raise HTTPException(status_code=400, detail="Worker profile does not exist")

    applications = get_applications_by_worker(db, current_user.id)
    items: List[WorkerJobItem] = []

    for app in applications:
        job = get_job_by_id(db, app.job_id)
        if not job:
            continue

        poster = get_by_id(db, job.poster_user_id)
        poster_profile = poster.poster_profile if poster else None

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
                payment_status=getattr(job, "payment_status", "UNPAID"),
                paid_at=getattr(job, "paid_at", None),
                final_price=getattr(job, "final_price", None),
                created_at=job.created_at,
                poster_user_id=job.poster_user_id,
                poster_name=poster_profile.name if poster_profile else "Client",
                poster_photo_data_url=poster_profile.photo_data_url if poster_profile else None,
            )
        )

    return items


@router.get("/job/{job_id}", response_model=List[PosterApplicantItem])
def get_applications_for_job_route(
    job_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.poster_profile is None:
        raise HTTPException(status_code=400, detail="Poster profile does not exist")

    job = get_job_by_id(db, job_id)

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if job.poster_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You are not allowed to view applicants for this job")

    applicants: List[PosterApplicantItem] = []

    for app in get_applications_for_job(db, job_id):
        worker = get_by_id(db, app.worker_user_id)
        review_summary = get_user_review_summary(db, app.worker_user_id, "worker")

        applicants.append(
            PosterApplicantItem(
                application_id=app.id,
                job_id=app.job_id,
                worker_user_id=app.worker_user_id,
                worker_name=worker.worker_profile.name if worker and worker.worker_profile else "Worker",
                worker_photo_data_url=worker.worker_profile.photo_data_url if worker and worker.worker_profile else None,
                worker_average_rating=review_summary["average_rating"],
                worker_reviews_count=review_summary["reviews_count"],
                proposed_rate=app.proposed_rate,
                cover_letter=app.cover_letter,
                status=app.status,
                applied_at=app.created_at,
            )
        )

    applicants.sort(key=lambda x: x.applied_at, reverse=True)
    return applicants


@router.post("/{application_id}/accept")
async def accept_application(
    application_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.poster_profile is None:
        raise HTTPException(status_code=400, detail="Poster profile does not exist")

    application = get_application_by_id(db, application_id)

    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    job = get_job_by_id(db, application.job_id)

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if job.poster_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You are not allowed to manage applicants for this job")

    if job.status != "OPEN":
        raise HTTPException(status_code=400, detail="Job is no longer open")

    selected_application = select_application(db, application.id)

    if not selected_application:
        raise HTTPException(status_code=404, detail="Application not found")

    reject_other_applications(db, job.id, application.id)

    updated_job = assign_job(db, job.id, application.proposed_rate)

    if not updated_job:
        raise HTTPException(status_code=404, detail="Job not found")

    poster_name = (
        current_user.poster_profile.name
        if current_user.poster_profile and current_user.poster_profile.name
        else current_user.email
    )

    poster_photo = (
        current_user.poster_profile.photo_data_url
        if current_user.poster_profile
        else None
    )

    create_notification(
        db=db,
        user_id=application.worker_user_id,
        type="APPLICATION_ACCEPTED",
        target_mode="worker",
        title="Application Accepted",
        message=f'You have been selected for "{job.title}"',
        actor_name=poster_name,
        actor_photo_data_url=poster_photo,
        job_title=job.title,
    )

    try:
        from app.api.routes.chat import user_manager

        await user_manager.send_to_user(application.worker_user_id, {"type": "notification_update"})
        await user_manager.send_to_user(current_user.id, {"type": "notification_update"})
        await user_manager.send_to_user(application.worker_user_id, {"type": "chat_list_update"})
        await user_manager.send_to_user(current_user.id, {"type": "chat_list_update"})
    except Exception:
        pass

    return {"message": "Applicant accepted successfully"}


@router.post("/{application_id}/reject")
async def reject_application(
    application_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.poster_profile is None:
        raise HTTPException(status_code=400, detail="Poster profile does not exist")

    application = get_application_by_id(db, application_id)

    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    job = get_job_by_id(db, application.job_id)

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if job.poster_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You are not allowed to manage applicants for this job")

    if application.status != "APPLIED":
        raise HTTPException(status_code=400, detail="Only pending applications can be rejected")

    rejected_application = reject_application_by_id(db, application.id)

    if not rejected_application:
        raise HTTPException(status_code=404, detail="Application not found")

    poster_name = (
        current_user.poster_profile.name
        if current_user.poster_profile and current_user.poster_profile.name
        else current_user.email
    )

    poster_photo = (
        current_user.poster_profile.photo_data_url
        if current_user.poster_profile
        else None
    )

    create_notification(
        db=db,
        user_id=application.worker_user_id,
        type="APPLICATION_REJECTED",
        target_mode="worker",
        title="Application Update",
        message=f'Your application for "{job.title}" was not selected',
        actor_name=poster_name,
        actor_photo_data_url=poster_photo,
        job_title=job.title,
    )

    try:
        from app.api.routes.chat import user_manager

        await user_manager.send_to_user(application.worker_user_id, {"type": "notification_update"})
        await user_manager.send_to_user(current_user.id, {"type": "notification_update"})
    except Exception:
        pass

    return {"message": "Applicant rejected successfully"}