from fastapi import APIRouter, Depends, HTTPException, status
from app.api.deps import get_current_user
from app.schemas.profile import ModeSwitchRequest, CurrentModeResponse
from app.services.user_store import save_user

router = APIRouter(prefix="/mode", tags=["mode"])


@router.get("/current", response_model=CurrentModeResponse)
def get_current_mode(current_user=Depends(get_current_user)):
    return CurrentModeResponse(current_mode=current_user.current_mode)


@router.post("/switch", response_model=CurrentModeResponse)
def switch_mode(body: ModeSwitchRequest, current_user=Depends(get_current_user)):
    if body.mode == "poster" and current_user.poster_profile is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Poster profile does not exist",
        )

    if body.mode == "worker" and current_user.worker_profile is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Worker profile does not exist",
        )
        

    current_user.current_mode = body.mode
    save_user(current_user)

    return CurrentModeResponse(current_mode=current_user.current_mode)