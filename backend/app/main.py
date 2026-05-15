from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.session import Base, engine
from app.db import models

from app.api.routes.auth import router as auth_router
from app.api.routes.users import router as users_router
from app.api.routes.profiles import router as profile_router
from app.api.routes.jobs import router as jobs_router
from app.api.routes.applications import router as applications_router
from app.api.routes.notifications import router as notifications_router
from app.api.routes.chat import router as chat_router
from app.api.routes.completion import router as completion_router
from app.api.routes.reviews import router as reviews_router
from app.api.routes import payments

app = FastAPI()

Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(profile_router)
app.include_router(jobs_router)
app.include_router(applications_router)
app.include_router(chat_router)
app.include_router(completion_router)
app.include_router(reviews_router)
app.include_router(notifications_router)
app.include_router(payments.router)


@app.get("/")
def root():
    return {"message": "API is running"}