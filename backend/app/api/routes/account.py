from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_current_user
from app.core.security import verify_password, hash_password
from app.schemas.account import ChangePasswordRequest, DeleteAccountRequest
from app.services.user_store import save_user, delete_user
from app.services.job_store import delete_jobs_by_poster

router = APIRouter(prefix="/account", tags=["account"])


@router.post("/change-password")
def change_password(
    body: ChangePasswordRequest,
    current_user=Depends(get_current_user),
):
    if not verify_password(body.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )

    current_user.password_hash = hash_password(body.new_password)
    save_user(current_user)

    return {"message": "Password changed successfully"}


@router.post("/delete")
def delete_account(
    body: DeleteAccountRequest,
    current_user=Depends(get_current_user),
):
    if not verify_password(body.password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password is incorrect",
        )

    delete_jobs_by_poster(current_user.id)

    # future worker application cleanup will go here

    delete_user(current_user.email)

    return {"message": "Account deleted permanently"}