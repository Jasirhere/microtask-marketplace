from app.schemas.completion import CompletionStatusPublic

_completion_map: dict[str, CompletionStatusPublic] = {}


def get_completion_status(job_id: str) -> CompletionStatusPublic:
    if job_id not in _completion_map:
        _completion_map[job_id] = CompletionStatusPublic(
            job_id=job_id,
            poster_confirmed=False,
            worker_confirmed=False,
            job_completed=False,
        )

    return _completion_map[job_id]


def mark_completed_by_poster(job_id: str) -> CompletionStatusPublic:
    status = get_completion_status(job_id)
    status.poster_confirmed = True

    if status.poster_confirmed and status.worker_confirmed:
        status.job_completed = True

    return status


def mark_completed_by_worker(job_id: str) -> CompletionStatusPublic:
    status = get_completion_status(job_id)
    status.worker_confirmed = True

    if status.poster_confirmed and status.worker_confirmed:
        status.job_completed = True

    return status