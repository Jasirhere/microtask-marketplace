import uuid
from datetime import datetime, timezone
from typing import List, Optional
from app.schemas.application import JobApplicationCreate, JobApplicationPublic

_applications: List[JobApplicationPublic] = []


def create_application(body: JobApplicationCreate, worker_user_id: str) -> JobApplicationPublic:
    application = JobApplicationPublic(
        id=str(uuid.uuid4()),
        job_id=body.job_id,
        worker_user_id=worker_user_id,
        proposed_rate=body.proposed_rate,
        cover_letter=body.cover_letter,
        status="APPLIED",
        created_at=datetime.now(timezone.utc),
    )
    _applications.append(application)
    return application


def get_application_by_job_and_worker(job_id: str, worker_user_id: str) -> Optional[JobApplicationPublic]:
    for application in _applications:
        if application.job_id == job_id and application.worker_user_id == worker_user_id:
            return application
    return None


def get_application_by_id(application_id: str) -> Optional[JobApplicationPublic]:
    for application in _applications:
        if application.id == application_id:
            return application
    return None


def get_applications_by_worker(worker_user_id: str) -> List[JobApplicationPublic]:
    return [app for app in _applications if app.worker_user_id == worker_user_id]


def get_applied_job_ids_for_worker(worker_user_id: str) -> List[str]:
    return [app.job_id for app in _applications if app.worker_user_id == worker_user_id]


def get_applications_for_job(job_id: str) -> List[JobApplicationPublic]:
    return [app for app in _applications if app.job_id == job_id]


def reject_other_applications(job_id: str, selected_application_id: str) -> None:
    for app in _applications:
        if app.job_id == job_id and app.id != selected_application_id and app.status == "APPLIED":
            app.status = "REJECTED"

def get_selected_application_for_worker_and_job(worker_user_id: str, job_id: str):
    for app in _applications:
        if (
            app.worker_user_id == worker_user_id
            and app.job_id == job_id
            and app.status == "SELECTED"
        ):
            return app
    return None            

def get_selected_application_for_job(job_id: str):
    for app in _applications:
        if app.job_id == job_id and app.status == "SELECTED":
            return app
    return None