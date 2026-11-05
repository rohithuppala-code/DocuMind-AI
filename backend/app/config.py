import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    PROJECT_NAME: str = "DocuMind AI"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "Autonomous Multi-Agent Academic Research & Learning Intelligence Hub with LangChain & LangGraph"
    
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    DEBUG: bool = True
    
    # Storage directories
    CHROMA_PERSIST_DIRECTORY: str = str(BASE_DIR / "chroma_db")
    SQLITE_DATABASE_URL: str = f"sqlite:///{BASE_DIR}/documind.db"
    UPLOAD_DIRECTORY: str = str(BASE_DIR / "uploads")
    
    # Optional LLM API Keys (Falls back automatically to heuristic neural engine if keys are not set)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "*"
    ]

settings = Settings()
