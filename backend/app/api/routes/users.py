from fastapi import APIRouter, Depends
from app.api.deps import get_current_user
from app.schemas.user import UserPublic

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me", response_model=UserPublic)
def me(current_user = Depends(get_current_user)):
    return UserPublic(id=current_user.id, email=current_user.email)