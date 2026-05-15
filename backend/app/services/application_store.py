from datetime import datetime, timezone
from typing import List, Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.db.models import JobApplication
from app.schemas.application import JobApplicationCreate, JobApplicationPublic


def _parse_uuid(value: str) -> UUID | None:
    try:
        return UUID(value)
    except ValueError:
        return None


def _to_application_public(application: JobApplication) -> JobApplicationPublic:
    return JobApplicationPublic(
        id=str(application.id),
        job_id=str(application.job_id),
        worker_user_id=str(application.worker_user_id),
        proposed_rate=application.proposed_rate,
        cover_letter=application.cover_letter,
        status=application.status,
        created_at=application.created_at,
        selected_at=application.selected_at,
    )


def create_application(
    db: Session,
    body: JobApplicationCreate,
    worker_user_id: str,
) -> JobApplicationPublic:
    job_uuid = _parse_uuid(body.job_id)
    worker_uuid = _parse_uuid(worker_user_id)

    if job_uuid is None or worker_uuid is None:
        raise ValueError("Invalid job_id or worker_user_id")

    application = JobApplication(
        job_id=job_uuid,
        worker_user_id=worker_uuid,
        proposed_rate=body.proposed_rate,
        cover_letter=body.cover_letter,
        status="APPLIED",
        created_at=datetime.now(timezone.utc),
        selected_at=None,
    )

    db.add(application)
    db.commit()
    db.refresh(application)

    return _to_application_public(application)


def get_application_by_job_and_worker(
    db: Session,
    job_id: str,
    worker_user_id: str,
) -> Optional[JobApplicationPublic]:
    job_uuid = _parse_uuid(job_id)
    worker_uuid = _parse_uuid(worker_user_id)

    if job_uuid is None or worker_uuid is None:
        return None

    application = (
        db.query(JobApplication)
        .filter(
            JobApplication.job_id == job_uuid,
            JobApplication.worker_user_id == worker_uuid,
        )
        .first()
    )

    return _to_application_public(application) if application else None


def get_application_by_id(
    db: Session,
    application_id: str,
) -> Optional[JobApplicationPublic]:
    application_uuid = _parse_uuid(application_id)

    if application_uuid is None:
        return None

    application = (
        db.query(JobApplication)
        .filter(JobApplication.id == application_uuid)
        .first()
    )

    return _to_application_public(application) if application else None


def get_applications_by_worker(
    db: Session,
    worker_user_id: str,
) -> List[JobApplicationPublic]:
    worker_uuid = _parse_uuid(worker_user_id)

    if worker_uuid is None:
        return []

    applications = (
        db.query(JobApplication)
        .filter(JobApplication.worker_user_id == worker_uuid)
        .order_by(JobApplication.created_at.desc())
        .all()
    )

    return [_to_application_public(application) for application in applications]


def get_applied_job_ids_for_worker(
    db: Session,
    worker_user_id: str,
) -> List[str]:
    worker_uuid = _parse_uuid(worker_user_id)

    if worker_uuid is None:
        return []

    applications = (
        db.query(JobApplication)
        .filter(JobApplication.worker_user_id == worker_uuid)
        .all()
    )

    return [str(application.job_id) for application in applications]


def get_applications_for_job(
    db: Session,
    job_id: str,
) -> List[JobApplicationPublic]:
    job_uuid = _parse_uuid(job_id)

    if job_uuid is None:
        return []

    applications = (
        db.query(JobApplication)
        .filter(JobApplication.job_id == job_uuid)
        .order_by(JobApplication.created_at.desc())
        .all()
    )

    return [_to_application_public(application) for application in applications]


def reject_other_applications(
    db: Session,
    job_id: str,
    selected_application_id: str,
) -> None:
    job_uuid = _parse_uuid(job_id)
    selected_uuid = _parse_uuid(selected_application_id)

    if job_uuid is None or selected_uuid is None:
        return

    applications = (
        db.query(JobApplication)
        .filter(
            JobApplication.job_id == job_uuid,
            JobApplication.id != selected_uuid,
            JobApplication.status == "APPLIED",
        )
        .all()
    )

    for application in applications:
        application.status = "REJECTED"

    db.commit()


def select_application(
    db: Session,
    application_id: str,
) -> Optional[JobApplicationPublic]:
    application_uuid = _parse_uuid(application_id)

    if application_uuid is None:
        return None

    application = (
        db.query(JobApplication)
        .filter(JobApplication.id == application_uuid)
        .first()
    )

    if not application:
        return None

    application.status = "SELECTED"
    application.selected_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(application)

    return _to_application_public(application)


def reject_application_by_id(
    db: Session,
    application_id: str,
) -> Optional[JobApplicationPublic]:
    application_uuid = _parse_uuid(application_id)

    if application_uuid is None:
        return None

    application = (
        db.query(JobApplication)
        .filter(JobApplication.id == application_uuid)
        .first()
    )

    if not application:
        return None

    application.status = "REJECTED"

    db.commit()
    db.refresh(application)

    return _to_application_public(application)


def get_selected_application_for_worker_and_job(
    db: Session,
    worker_user_id: str,
    job_id: str,
) -> Optional[JobApplicationPublic]:
    worker_uuid = _parse_uuid(worker_user_id)
    job_uuid = _parse_uuid(job_id)

    if worker_uuid is None or job_uuid is None:
        return None

    application = (
        db.query(JobApplication)
        .filter(
            JobApplication.worker_user_id == worker_uuid,
            JobApplication.job_id == job_uuid,
            JobApplication.status == "SELECTED",
        )
        .first()
    )

    return _to_application_public(application) if application else None


def get_selected_application_for_job(
    db: Session,
    job_id: str,
) -> Optional[JobApplicationPublic]:
    job_uuid = _parse_uuid(job_id)

    if job_uuid is None:
        return None

    application = (
        db.query(JobApplication)
        .filter(
            JobApplication.job_id == job_uuid,
            JobApplication.status == "SELECTED",
        )
        .first()
    )

    return _to_application_public(application) if application else None


def get_selected_applications_for_worker(
    db: Session,
    worker_user_id: str,
) -> List[JobApplicationPublic]:
    worker_uuid = _parse_uuid(worker_user_id)

    if worker_uuid is None:
        return []

    applications = (
        db.query(JobApplication)
        .filter(
            JobApplication.worker_user_id == worker_uuid,
            JobApplication.status == "SELECTED",
        )
        .order_by(JobApplication.selected_at.desc())
        .all()
    )

    return [_to_application_public(application) for application in applications]


def get_selected_applications_for_poster_jobs(
    db: Session,
    poster_user_id: str,
    jobs: list,
) -> List[JobApplicationPublic]:
    job_ids = []

    for job in jobs:
        parsed_id = _parse_uuid(job.id)
        if parsed_id is not None:
            job_ids.append(parsed_id)

    if not job_ids:
        return []

    applications = (
        db.query(JobApplication)
        .filter(
            JobApplication.job_id.in_(job_ids),
            JobApplication.status == "SELECTED",
        )
        .all()
    )

    return [_to_application_public(application) for application in applications]