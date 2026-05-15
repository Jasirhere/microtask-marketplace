from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.security import create_access_token, hash_password, verify_password
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.services.user_store import create_user, get_by_email


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    existing = get_by_email(db, body.email)

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    user = create_user(db, body.email, hash_password(body.password))
    token = create_access_token(subject=user.email)

    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = get_by_email(db, body.email)

    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deleted or inactive",
        )

    token = create_access_token(subject=user.email)

    return TokenResponse(access_token=token)