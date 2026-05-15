from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.db.models import User, PosterProfile, WorkerProfile
from app.schemas.user import (
    UserInDB,
    PosterProfile as PosterProfileSchema,
    WorkerProfile as WorkerProfileSchema,
)


def _to_user_schema(user: User) -> UserInDB:
    poster_profile = None
    if user.poster_profile:
        poster_profile = PosterProfileSchema(
            name=user.poster_profile.name,
            phone=user.poster_profile.phone,
            photo_data_url=user.poster_profile.photo_data_url,
            bio=user.poster_profile.bio,
            location=user.poster_profile.location,
            created_at=user.poster_profile.created_at,
        )

    worker_profile = None
    if user.worker_profile:
        worker_profile = WorkerProfileSchema(
            name=user.worker_profile.name,
            phone=user.worker_profile.phone,
            photo_data_url=user.worker_profile.photo_data_url,
            skills=user.worker_profile.skills or [],
            bio=user.worker_profile.bio,
            location=user.worker_profile.location,
            created_at=user.worker_profile.created_at,
        )

    return UserInDB(
        id=str(user.id),
        email=user.email,
        password_hash=user.password_hash,
        is_active=user.is_active,
        current_mode=user.current_mode,
        poster_profile=poster_profile,
        worker_profile=worker_profile,
    )


def get_by_email(db: Session, email: str) -> Optional[UserInDB]:
    user = db.query(User).filter(User.email == email.lower()).first()

    if not user:
        return None

    return _to_user_schema(user)


def get_by_id(db: Session, user_id: str) -> Optional[UserInDB]:
    try:
        parsed_user_id = UUID(user_id)
    except ValueError:
        return None

    user = db.query(User).filter(User.id == parsed_user_id).first()

    if not user:
        return None

    return _to_user_schema(user)


def create_user(db: Session, email: str, password_hash: str) -> UserInDB:
    user = User(
        email=email.lower(),
        password_hash=password_hash,
        is_active=True,
        current_mode=None,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return _to_user_schema(user)


def save_user(db: Session, user_data: UserInDB) -> UserInDB:
    user = db.query(User).filter(User.id == UUID(user_data.id)).first()

    if not user:
        raise ValueError("User not found")

    user.email = user_data.email.lower()
    user.password_hash = user_data.password_hash
    user.is_active = user_data.is_active
    user.current_mode = user_data.current_mode

    if user_data.poster_profile:
        if user.poster_profile is None:
            user.poster_profile = PosterProfile(user_id=user.id)

        user.poster_profile.name = user_data.poster_profile.name
        user.poster_profile.phone = user_data.poster_profile.phone
        user.poster_profile.photo_data_url = user_data.poster_profile.photo_data_url
        user.poster_profile.bio = user_data.poster_profile.bio
        user.poster_profile.location = user_data.poster_profile.location

    if user_data.worker_profile:
        if user.worker_profile is None:
            user.worker_profile = WorkerProfile(user_id=user.id)

        user.worker_profile.name = user_data.worker_profile.name
        user.worker_profile.phone = user_data.worker_profile.phone
        user.worker_profile.photo_data_url = user_data.worker_profile.photo_data_url
        user.worker_profile.skills = user_data.worker_profile.skills or []
        user.worker_profile.bio = user_data.worker_profile.bio
        user.worker_profile.location = user_data.worker_profile.location

    db.commit()
    db.refresh(user)

    return _to_user_schema(user)


def delete_user(db: Session, email: str) -> None:
    user = db.query(User).filter(User.email == email.lower()).first()

    if user:
        db.delete(user)
        db.commit()