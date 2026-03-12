import uuid
from datetime import datetime, timezone
from typing import List, Optional
from app.schemas.job import JobCreate, JobPublic

# in-memory job storage
_jobs: List[JobPublic] = []


def create_job(job_data: JobCreate, poster_user_id: str) -> JobPublic:
    job = JobPublic(
        id=str(uuid.uuid4()),
        poster_user_id=poster_user_id,

        title=job_data.title,
        description=job_data.description,
        category=job_data.category,

        country=job_data.country,
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
        created_at=datetime.now(timezone.utc),
    )

    _jobs.append(job)
    return job


def get_jobs_by_poster(poster_user_id: str) -> List[JobPublic]:
    """Return all jobs created by the given poster user ID."""
    return [j for j in _jobs if j.poster_user_id == poster_user_id]


def get_job_by_id(job_id: str) -> Optional[JobPublic]:
    """Lookup a job by its ID, or return ``None`` if not found."""
    for j in _jobs:
        if j.id == job_id:
            return j
    return None

def get_open_jobs(search: str | None = None, category: str | None = None, city: str | None = None) -> List[JobPublic]:
    jobs = [job for job in _jobs if job.status == "OPEN"]

    if search:
        q = search.strip().lower()
        jobs = [
            job for job in jobs
            if q in job.title.lower() or q in job.description.lower()
        ]

    if category:
        jobs = [job for job in jobs if job.category == category]

    if city:
        jobs = [job for job in jobs if job.city.lower() == city.lower()]

    jobs.sort(key=lambda job: job.created_at, reverse=True)
    return jobs

def delete_jobs_by_poster(poster_user_id: str) -> None:
    global _jobs
    _jobs = [job for job in _jobs if job.poster_user_id != poster_user_id]
