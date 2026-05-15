from typing import List, Optional
from uuid import UUID

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.db.models import Job
from app.schemas.job import JobCreate, JobPublic


def _parse_uuid(value: str) -> UUID | None:
    try:
        return UUID(value)
    except ValueError:
        return None


def _to_job_public(job: Job) -> JobPublic:
    return JobPublic(
        id=str(job.id),
        poster_user_id=str(job.poster_user_id),

        title=job.title,
        description=job.description,
        category=job.category,

        country=job.country,
        state=job.state,
        city=job.city,
        area=job.area,
        address_details=job.address_details,

        latitude=job.latitude,
        longitude=job.longitude,

        budget_min=job.budget_min,
        budget_max=job.budget_max,

        deadline_value=job.deadline_value,
        deadline_unit=job.deadline_unit,

        estimated_duration_value=job.estimated_duration_value,
        estimated_duration_unit=job.estimated_duration_unit,

        skills_required=job.skills_required or [],
        notes=job.notes,

        status=job.status,

        payment_status=job.payment_status,
        paid_at=job.paid_at,
        stripe_payment_intent_id=job.stripe_payment_intent_id,

        created_at=job.created_at,
        final_price=job.final_price,
    )


def create_job(db: Session, job_data: JobCreate, poster_user_id: str) -> JobPublic:
    poster_uuid = _parse_uuid(poster_user_id)
    if poster_uuid is None:
        raise ValueError("Invalid poster_user_id")

    job = Job(
        poster_user_id=poster_uuid,

        title=job_data.title,
        description=job_data.description,
        category=job_data.category,

        country=job_data.country,
        state=job_data.state,
        city=job_data.city,
        area=job_data.area,
        address_details=job_data.address_details,

        latitude=job_data.latitude,
        longitude=job_data.longitude,

        budget_min=job_data.budget_min,
        budget_max=job_data.budget_max,

        deadline_value=job_data.deadline_value,
        deadline_unit=job_data.deadline_unit,

        estimated_duration_value=job_data.estimated_duration_value,
        estimated_duration_unit=job_data.estimated_duration_unit,

        skills_required=job_data.skills_required,
        notes=job_data.notes,

        status="OPEN",

        payment_status="UNPAID",
        paid_at=None,
        stripe_payment_intent_id=None,
        final_price=None,
    )

    db.add(job)
    db.commit()
    db.refresh(job)

    return _to_job_public(job)


def get_jobs_by_poster(db: Session, poster_user_id: str) -> List[JobPublic]:
    poster_uuid = _parse_uuid(poster_user_id)
    if poster_uuid is None:
        return []

    jobs = (
        db.query(Job)
        .filter(Job.poster_user_id == poster_uuid)
        .order_by(Job.created_at.desc())
        .all()
    )

    return [_to_job_public(job) for job in jobs]


def get_job_by_id(db: Session, job_id: str) -> Optional[JobPublic]:
    job_uuid = _parse_uuid(job_id)
    if job_uuid is None:
        return None

    job = db.query(Job).filter(Job.id == job_uuid).first()

    if not job:
        return None

    return _to_job_public(job)


def get_open_jobs(
    db: Session,
    search: str | None = None,
    category: str | None = None,
    city: str | None = None,
    exclude_job_ids: list[str] | None = None,
) -> List[JobPublic]:
    query = db.query(Job).filter(Job.status == "OPEN")

    if exclude_job_ids:
        parsed_ids = [
            parsed_id
            for parsed_id in (_parse_uuid(job_id) for job_id in exclude_job_ids)
            if parsed_id is not None
        ]

        if parsed_ids:
            query = query.filter(~Job.id.in_(parsed_ids))

    if search:
        q = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Job.title.ilike(q),
                Job.description.ilike(q),
            )
        )

    if category:
        query = query.filter(Job.category == category)

    if city:
        query = query.filter(Job.city.ilike(city.strip()))

    jobs = query.order_by(Job.created_at.desc()).all()

    return [_to_job_public(job) for job in jobs]


def delete_jobs_by_poster(db: Session, poster_user_id: str) -> None:
    poster_uuid = _parse_uuid(poster_user_id)
    if poster_uuid is None:
        return

    db.query(Job).filter(Job.poster_user_id == poster_uuid).delete()
    db.commit()


def delete_job(db: Session, job_id: str) -> bool:
    job_uuid = _parse_uuid(job_id)
    if job_uuid is None:
        return False

    job = db.query(Job).filter(Job.id == job_uuid).first()

    if not job:
        return False

    db.delete(job)
    db.commit()

    return True


def set_job_status(db: Session, job_id: str, new_status: str) -> Optional[JobPublic]:
    job_uuid = _parse_uuid(job_id)
    if job_uuid is None:
        return None

    job = db.query(Job).filter(Job.id == job_uuid).first()

    if not job:
        return None

    job.status = new_status

    db.commit()
    db.refresh(job)

    return _to_job_public(job)


def update_job(db: Session, job_id: str, job_data: JobCreate) -> Optional[JobPublic]:
    job_uuid = _parse_uuid(job_id)
    if job_uuid is None:
        return None

    job = db.query(Job).filter(Job.id == job_uuid).first()

    if not job:
        return None

    job.title = job_data.title
    job.description = job_data.description
    job.category = job_data.category
    job.country = job_data.country
    job.state = job_data.state
    job.city = job_data.city
    job.area = job_data.area
    job.address_details = job_data.address_details
    job.latitude = job_data.latitude
    job.longitude = job_data.longitude
    job.budget_min = job_data.budget_min
    job.budget_max = job_data.budget_max
    job.deadline_value = job_data.deadline_value
    job.deadline_unit = job_data.deadline_unit
    job.estimated_duration_value = job_data.estimated_duration_value
    job.estimated_duration_unit = job_data.estimated_duration_unit
    job.skills_required = job_data.skills_required
    job.notes = job_data.notes

    db.commit()
    db.refresh(job)

    return _to_job_public(job)


def assign_job(
    db: Session,
    job_id: str,
    final_price: float,
) -> Optional[JobPublic]:
    job_uuid = _parse_uuid(job_id)

    if job_uuid is None:
        return None

    job = db.query(Job).filter(Job.id == job_uuid).first()

    if not job:
        return None

    job.status = "ASSIGNED"
    job.final_price = final_price

    db.commit()
    db.refresh(job)

    return _to_job_public(job)