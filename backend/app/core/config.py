import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    JWT_SECRET: str = os.getenv("JWT_SECRET", "")
    JWT_ALG: str = os.getenv("JWT_ALG", "HS256")
    JWT_EXPIRES_MINUTES: int = int(os.getenv("JWT_EXPIRES_MINUTES", "60"))

    STRIPE_SECRET_KEY: str = os.getenv("STRIPE_SECRET_KEY", "")

    DATABASE_URL: str = os.getenv("DATABASE_URL", "")


settings = Settings()


if not settings.JWT_SECRET:
    raise RuntimeError("JWT_SECRET is missing. Add it to backend/.env")

if not settings.DATABASE_URL:
    raise RuntimeError("DATABASE_URL is missing. Add it to backend/.env")