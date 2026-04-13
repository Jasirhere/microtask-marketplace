import uuid
from datetime import datetime, timezone
from typing import List, Optional

from app.schemas.review import ReviewCreate, ReviewPublic
from app.services.job_store import _jobs
# Temporary storage
_reviews: List[ReviewPublic] = []


def create_review(
    body: ReviewCreate,
    reviewer_user_id: str,
    reviewer_role: str,
    reviewer_name: str | None = None,
    reviewer_photo_data_url: str | None = None,
) -> ReviewPublic:
    review = ReviewPublic(
        id=str(uuid.uuid4()),
        job_id=body.job_id,
        reviewer_user_id=reviewer_user_id,
        reviewer_role=reviewer_role,
        reviewer_name=reviewer_name,
        reviewer_photo_data_url=reviewer_photo_data_url,
        reviewee_user_id=body.reviewee_user_id,
        reviewee_role=body.reviewee_role,
        rating=body.rating,
        comment=body.comment,
        created_at=datetime.now(timezone.utc),
    )
    _reviews.append(review)
    return review


def get_review_by_job_and_reviewer(
    job_id: str,
    reviewer_user_id: str,
) -> Optional[ReviewPublic]:
    for review in _reviews:
        if review.job_id == job_id and review.reviewer_user_id == reviewer_user_id:
            return review
    return None


def get_reviews_for_job(job_id: str) -> List[ReviewPublic]:
    return [review for review in _reviews if review.job_id == job_id]


def get_reviews_for_user(user_id: str, reviewee_role: str):
    return [
        review
        for review in _reviews
        if review.reviewee_user_id == user_id and review.reviewee_role == reviewee_role
    ]

def calculate_user_stats(user_id: str, role: str):
    reviews = [
        r for r in _reviews
        if r.reviewee_user_id == user_id and r.reviewee_role == role
    ]

    jobs = [
        j for j in _jobs
        if (role == "worker" and j.selected_worker_user_id == user_id)
        or (role == "poster" and j.poster_user_id == user_id)
    ]

    completed_jobs = [j for j in jobs if j.status == "COMPLETED"]

    rating = 0
    if reviews:
        rating = sum(r.rating for r in reviews) / len(reviews)

    success_rate = 0
    if jobs:
        success_rate = (len(completed_jobs) / len(jobs)) * 100

    return {
        "rating": round(rating, 1),
        "total_reviews": len(reviews),
        "jobs": len(completed_jobs),
        "success_rate": int(success_rate),
    }    

def get_user_review_summary(user_id: str, role: str):
    reviews = [
        r for r in _reviews
        if r.reviewee_user_id == user_id and r.reviewee_role == role
    ]

    if not reviews:
        return {
            "average_rating": 0,
            "reviews_count": 0,
        }

    average_rating = sum(r.rating for r in reviews) / len(reviews)

    return {
        "average_rating": round(average_rating, 1),
        "reviews_count": len(reviews),
    }    