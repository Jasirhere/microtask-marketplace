from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy.orm import Session

from app.db.models import JobCompletion
from app.schemas.completion import CompletionStatusPublic


def _parse_uuid(value: str) -> UUID | None:
    try:
        return UUID(value)
    except ValueError:
        return None


def _to_completion_public(completion: JobCompletion) -> CompletionStatusPublic:
    return CompletionStatusPublic(
        job_id=str(completion.job_id),
        poster_confirmed=completion.poster_confirmed,
        worker_confirmed=completion.worker_confirmed,
        job_completed=completion.job_completed,
    )


def get_completion_status(db: Session, job_id: str) -> CompletionStatusPublic:
    job_uuid = _parse_uuid(job_id)

    if job_uuid is None:
        return CompletionStatusPublic(
            job_id=job_id,
            poster_confirmed=False,
            worker_confirmed=False,
            job_completed=False,
        )

    completion = (
        db.query(JobCompletion)
        .filter(JobCompletion.job_id == job_uuid)
        .first()
    )

    if completion is None:
        completion = JobCompletion(
            job_id=job_uuid,
            poster_confirmed=False,
            worker_confirmed=False,
            job_completed=False,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        db.add(completion)
        db.commit()
        db.refresh(completion)

    return _to_completion_public(completion)


def mark_completed_by_poster(db: Session, job_id: str) -> CompletionStatusPublic:
    job_uuid = _parse_uuid(job_id)

    if job_uuid is None:
        raise ValueError("Invalid job_id")

    completion = (
        db.query(JobCompletion)
        .filter(JobCompletion.job_id == job_uuid)
        .first()
    )

    if completion is None:
        completion = JobCompletion(job_id=job_uuid)
        db.add(completion)

    completion.poster_confirmed = True
    completion.job_completed = completion.poster_confirmed and completion.worker_confirmed
    completion.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(completion)

    return _to_completion_public(completion)


def mark_completed_by_worker(db: Session, job_id: str) -> CompletionStatusPublic:
    job_uuid = _parse_uuid(job_id)

    if job_uuid is None:
        raise ValueError("Invalid job_id")

    completion = (
        db.query(JobCompletion)
        .filter(JobCompletion.job_id == job_uuid)
        .first()
    )

    if completion is None:
        completion = JobCompletion(job_id=job_uuid)
        db.add(completion)

    completion.worker_confirmed = True
    completion.job_completed = completion.poster_confirmed and completion.worker_confirmed
    completion.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(completion)

    return _to_completion_public(completion)