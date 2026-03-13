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


def get_applications_by_worker(worker_user_id: str) -> List[JobApplicationPublic]:
    return [app for app in _applications if app.worker_user_id == worker_user_id]


def get_applied_job_ids_for_worker(worker_user_id: str) -> List[str]:
    return [app.job_id for app in _applications if app.worker_user_id == worker_user_id]