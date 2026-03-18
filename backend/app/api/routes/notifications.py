from typing import List, Literal
from fastapi import APIRouter, Depends, Query

from app.api.deps import get_current_user
from app.schemas.notification import NotificationPublic
from app.services.notification_store import (
    get_notifications_for_user,
    get_unread_count_for_user,
    mark_all_read_for_user,
)

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=List[NotificationPublic])
def get_my_notifications(
    current_user=Depends(get_current_user),
    target_mode: Literal["poster", "worker"] = Query(...),
):
    return get_notifications_for_user(current_user.id, target_mode)


@router.get("/unread-count")
def get_my_unread_count(
    current_user=Depends(get_current_user),
    target_mode: Literal["poster", "worker"] = Query(...),
):
    return {"count": get_unread_count_for_user(current_user.id, target_mode)}


@router.post("/mark-all-read")
def mark_all_notifications_read(
    current_user=Depends(get_current_user),
    target_mode: Literal["poster", "worker"] = Query(...),
):
    mark_all_read_for_user(current_user.id, target_mode)
    return {"message": "All notifications marked as read"}