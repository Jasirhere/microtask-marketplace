from datetime import datetime, timezone
from typing import List, Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.db.models import Review
from app.schemas.review import ReviewCreate, ReviewPublic


def _parse_uuid(value: str) -> UUID | None:
    try:
        return UUID(value)
    except ValueError:
        return None


def _to_review_public(review: Review) -> ReviewPublic:
    return ReviewPublic(
        id=str(review.id),
        job_id=str(review.job_id),
        reviewer_user_id=str(review.reviewer_user_id),
        reviewer_role=review.reviewer_role,
        reviewer_name=review.reviewer_name,
        reviewer_photo_data_url=review.reviewer_photo_data_url,
        reviewee_user_id=str(review.reviewee_user_id),
        reviewee_role=review.reviewee_role,
        rating=review.rating,
        comment=review.comment,
        created_at=review.created_at,
    )


def create_review(
    db: Session,
    body: ReviewCreate,
    reviewer_user_id: str,
    reviewer_role: str,
    reviewer_name: str | None = None,
    reviewer_photo_data_url: str | None = None,
) -> ReviewPublic:
    job_uuid = _parse_uuid(body.job_id)
    reviewer_uuid = _parse_uuid(reviewer_user_id)
    reviewee_uuid = _parse_uuid(body.reviewee_user_id)

    if job_uuid is None or reviewer_uuid is None or reviewee_uuid is None:
        raise ValueError("Invalid review IDs")

    review = Review(
        job_id=job_uuid,
        reviewer_user_id=reviewer_uuid,
        reviewer_role=reviewer_role,
        reviewer_name=reviewer_name,
        reviewer_photo_data_url=reviewer_photo_data_url,
        reviewee_user_id=reviewee_uuid,
        reviewee_role=body.reviewee_role,
        rating=body.rating,
        comment=body.comment,
        created_at=datetime.now(timezone.utc),
    )

    db.add(review)
    db.commit()
    db.refresh(review)

    return _to_review_public(review)


def get_review_by_job_and_reviewer(
    db: Session,
    job_id: str,
    reviewer_user_id: str,
) -> Optional[ReviewPublic]:
    job_uuid = _parse_uuid(job_id)
    reviewer_uuid = _parse_uuid(reviewer_user_id)

    if job_uuid is None or reviewer_uuid is None:
        return None

    review = (
        db.query(Review)
        .filter(
            Review.job_id == job_uuid,
            Review.reviewer_user_id == reviewer_uuid,
        )
        .first()
    )

    return _to_review_public(review) if review else None


def get_reviews_for_job(db: Session, job_id: str) -> List[ReviewPublic]:
    job_uuid = _parse_uuid(job_id)

    if job_uuid is None:
        return []

    reviews = (
        db.query(Review)
        .filter(Review.job_id == job_uuid)
        .order_by(Review.created_at.desc())
        .all()
    )

    return [_to_review_public(review) for review in reviews]


def get_reviews_for_user(
    db: Session,
    user_id: str,
    reviewee_role: str,
) -> List[ReviewPublic]:
    user_uuid = _parse_uuid(user_id)

    if user_uuid is None:
        return []

    reviews = (
        db.query(Review)
        .filter(
            Review.reviewee_user_id == user_uuid,
            Review.reviewee_role == reviewee_role,
        )
        .order_by(Review.created_at.desc())
        .all()
    )

    return [_to_review_public(review) for review in reviews]


def calculate_user_stats(db: Session, user_id: str, role: str):
    reviews = get_reviews_for_user(db, user_id, role)

    rating = 0
    if reviews:
        rating = sum(review.rating for review in reviews) / len(reviews)

    return {
        "rating": round(rating, 1),
        "total_reviews": len(reviews),
        "jobs": 0,
        "success_rate": 0,
        "avg_response_minutes": None,
    }


def get_user_review_summary(db: Session, user_id: str, role: str):
    reviews = get_reviews_for_user(db, user_id, role)

    if not reviews:
        return {
            "average_rating": 0,
            "reviews_count": 0,
        }

    average_rating = sum(review.rating for review in reviews) / len(reviews)

    return {
        "average_rating": round(average_rating, 1),
        "reviews_count": len(reviews),
    }