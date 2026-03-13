import uuid
from typing import Optional, Dict
from app.schemas.user import UserInDB

_users_by_email: Dict[str, UserInDB] = {}


def get_by_email(email: str) -> Optional[UserInDB]:
    return _users_by_email.get(email.lower())


def create_user(email: str, password_hash: str) -> UserInDB:
    user = UserInDB(
        id=str(uuid.uuid4()),
        email=email.lower(),
        password_hash=password_hash,
        is_active=True,
        current_mode=None,
        poster_profile=None,
        worker_profile=None,
    )
    _users_by_email[user.email] = user
    return user


def save_user(user: UserInDB) -> UserInDB:
    _users_by_email[user.email] = user
    return user

def delete_user(email: str) -> None:
    _users_by_email.pop(email.lower(), None)

def get_by_id(user_id: str):
    for user in _users_by_email.values():
        if user.id == user_id:
            return user
    return None    