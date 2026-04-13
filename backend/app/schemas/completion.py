from pydantic import BaseModel


class CompletionStatusPublic(BaseModel):
    job_id: str
    poster_confirmed: bool
    worker_confirmed: bool
    job_completed: bool