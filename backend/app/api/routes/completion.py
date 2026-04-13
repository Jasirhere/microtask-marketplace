from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_current_user
from app.schemas.completion import CompletionStatusPublic
from app.services.application_store import (
    get_selected_application_for_job,
    get_selected_application_for_worker_and_job,
)
from app.services.completion_store import (
    get_completion_status,
    mark_completed_by_poster,
    mark_completed_by_worker,
)
from app.services.job_store import get_job_by_id, set_job_status
from app.services.notification_store import create_notification

router = APIRouter(prefix="/completion", tags=["completion"])


@router.get("/{job_id}", response_model=CompletionStatusPublic)
def get_job_completion_status(job_id: str, current_user=Depends(get_current_user)):
    job = get_job_by_id(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    selected_app = get_selected_application_for_job(job_id)
    if not selected_app:
        raise HTTPException(status_code=400, detail="No selected worker for this job")

    allowed = (
        job.poster_user_id == current_user.id
        or selected_app.worker_user_id == current_user.id
    )

    if not allowed:
        raise HTTPException(status_code=403, detail="You are not allowed to access this job")

    return get_completion_status(job_id)


@router.post("/{job_id}/mark", response_model=CompletionStatusPublic)
async def mark_job_completed(job_id: str, current_user=Depends(get_current_user)):
    job = get_job_by_id(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if job.status != "ASSIGNED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only assigned jobs can be marked completed",
        )

    selected_app = get_selected_application_for_job(job_id)
    if not selected_app:
        raise HTTPException(status_code=400, detail="No selected worker found")

    if job.poster_user_id == current_user.id:
        completion = mark_completed_by_poster(job_id)

        create_notification(
            user_id=selected_app.worker_user_id,
            type="APPLICATION_ACCEPTED",
            target_mode="worker",
            title="Job completion update",
            message=f'The poster marked "{job.title}" as completed',
        )

        try:
            from app.api.routes.chat import user_manager
            await user_manager.send_to_user(
                selected_app.worker_user_id,
                {"type": "notification_update"},
            )
        except Exception:
            pass

    elif selected_app.worker_user_id == current_user.id:
        completion = mark_completed_by_worker(job_id)

        create_notification(
            user_id=job.poster_user_id,
            type="NEW_APPLICATION",
            target_mode="poster",
            title="Job completion update",
            message=f'The worker marked "{job.title}" as completed',
        )

        try:
            from app.api.routes.chat import user_manager
            await user_manager.send_to_user(
                job.poster_user_id,
                {"type": "notification_update"},
            )
        except Exception:
            pass

    else:
        raise HTTPException(status_code=403, detail="You are not allowed to complete this job")

    if completion.job_completed:
        set_job_status(job_id, "COMPLETED")

        try:
            from app.api.routes.chat import user_manager
            await user_manager.send_to_user(
                job.poster_user_id,
                {"type": "chat_list_update"},
            )
            await user_manager.send_to_user(
                selected_app.worker_user_id,
                {"type": "chat_list_update"},
            )
        except Exception:
            pass

    return completion