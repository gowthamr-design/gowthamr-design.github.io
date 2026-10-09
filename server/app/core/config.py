import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv

# Resolve .env file location robustly
_env_file = None
for candidate in [
    Path(".env"),
    Path("server/.env"),
    Path(__file__).resolve().parent.parent.parent / ".env",
]:
    if candidate.is_file():
        _env_file = str(candidate)
        break

if _env_file:
    load_dotenv(_env_file)

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=_env_file or ".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )
    PROJECT_NAME: str = "Banana Brothers Events API"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "banana_brothers_secret_jwt_key_2026_secure")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # MySQL Database Connection String
    DB_USER: str = os.getenv("DB_USER", "second_user")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "gowtham2003")
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_PORT: str = os.getenv("DB_PORT", "3306")
    DB_NAME: str = os.getenv("DB_NAME", "banana_brothers_db")

    # SMTP Configuration
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", 587))
    SMTP_USER: str = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    SMTP_FROM_EMAIL: str = os.getenv("SMTP_FROM_EMAIL", "")
    SMTP_FROM_NAME: str = os.getenv("SMTP_FROM_NAME", "Banana Brothers Events")
    ADMIN_NOTIFICATION_EMAIL: str = os.getenv("ADMIN_NOTIFICATION_EMAIL", "")

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        return f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}?charset=utf8mb4"

settings = Settings()
