from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.auth import router as auth_router
from app.api.routes.users import router as users_router
from app.api.routes.profiles import router as profiles_router
from app.api.routes.mode import router as mode_router
from app.api.routes.jobs import router as jobs_router
from app.api.routes.account import router as account_router
from app.api.routes.applications import router as applications_router
app = FastAPI(title="MicroTask Marketplace API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(profiles_router)
app.include_router(mode_router)
app.include_router(jobs_router)
app.include_router(account_router)
app.include_router(applications_router)
@app.get("/health")
def health():
    return {"status": "ok"}