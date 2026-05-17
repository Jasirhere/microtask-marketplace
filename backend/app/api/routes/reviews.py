from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.schemas.review import ReviewCreate, ReviewPublic
from app.services.application_store import get_selected_application_for_job
from app.services.completion_store import get_completion_status
from app.services.job_store import get_job_by_id
from app.services.notification_store import create_notification
from app.services.review_store import (
    calculate_user_stats,
    create_review,
    get_review_by_job_and_reviewer,
    get_reviews_for_job,
    get_reviews_for_user,
)


router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.post("", response_model=ReviewPublic)
def submit_review(
    body: ReviewCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    job = get_job_by_id(db, body.job_id)

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    completion = get_completion_status(db, body.job_id)

    selected_app = get_selected_application_for_job(db, body.job_id)

    if not selected_app:
        raise HTTPException(status_code=400, detail="Selected application not found")

    is_poster = job.poster_user_id == current_user.id
    is_worker = selected_app.worker_user_id == current_user.id

    if not is_poster and not is_worker:
        raise HTTPException(status_code=403, detail="You are not allowed to review this job")

    if is_poster and not completion.poster_confirmed:
        raise HTTPException(status_code=400, detail="Please mark the job as completed first")

    if is_worker and not completion.worker_confirmed:
        raise HTTPException(status_code=400, detail="Please mark the job as completed first")

    existing = get_review_by_job_and_reviewer(db, body.job_id, current_user.id)

    if existing:
        raise HTTPException(status_code=400, detail="You already submitted a review for this job")

    if is_poster:
        if body.reviewee_user_id != selected_app.worker_user_id:
            raise HTTPException(status_code=400, detail="Poster can only review the assigned worker")
        if body.reviewee_role != "worker":
            raise HTTPException(status_code=400, detail="Poster review must target worker role")
        reviewer_role = "poster"
    else:
        if body.reviewee_user_id != job.poster_user_id:
            raise HTTPException(status_code=400, detail="Worker can only review the poster")
        if body.reviewee_role != "poster":
            raise HTTPException(status_code=400, detail="Worker review must target poster role")
        reviewer_role = "worker"

    actor_name = None
    actor_photo_data_url = None

    if reviewer_role == "poster":
        poster_profile = getattr(current_user, "poster_profile", None)
        actor_name = getattr(poster_profile, "name", None)
        actor_photo_data_url = getattr(poster_profile, "photo_data_url", None)

    elif reviewer_role == "worker":
        worker_profile = getattr(current_user, "worker_profile", None)
        actor_name = getattr(worker_profile, "name", None)
        actor_photo_data_url = getattr(worker_profile, "photo_data_url", None)

    review = create_review(
        db,
        body,
        current_user.id,
        reviewer_role,
        reviewer_name=actor_name,
        reviewer_photo_data_url=actor_photo_data_url,
    )

    try:
        create_notification(
            db=db,
            user_id=review.reviewee_user_id,
            type="NEW_REVIEW",
            target_mode=review.reviewee_role,
            title="New review received",
            message=f'{actor_name or "Someone"} gave you {review.rating} star{"s" if review.rating != 1 else ""}: "{review.comment}"',
            actor_name=actor_name,
            actor_photo_data_url=actor_photo_data_url,
            job_title=job.title,
        )
    except Exception as e:
        print(f"Failed to create notification: {str(e)}")

    return review


@router.get("/job/{job_id}", response_model=List[ReviewPublic])
def get_job_reviews(
    job_id: str,
    db: Session = Depends(get_db),
):
    return get_reviews_for_job(db, job_id)


@router.get("/user/{user_id}", response_model=List[ReviewPublic])
def get_user_reviews(
    user_id: str,
    role: str = Query(...),
    db: Session = Depends(get_db),
):
    return get_reviews_for_user(db, user_id, role)


@router.get("/user/{user_id}/stats")
def get_user_stats(
    user_id: str,
    role: str,
    db: Session = Depends(get_db),
):
    return calculate_user_stats(db, user_id, role)