import os
from pathlib import Path
from typing import List
from dotenv import load_dotenv

# Load .env file from backend directory
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

class Settings:
    # Project & Info
    PROJECT_NAME: str = "HackFix AI Backend"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"

    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "").strip()
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-3.8-flash").strip()
    GEMINI_ENABLED: bool = os.getenv("GEMINI_ENABLED", "true").lower() in ("true", "1", "yes")

    # Storage
    DATABASE_PATH: Path = Path(__file__).resolve().parent.parent / "hackfix.db"

    # Frontend CORS
    FRONTEND_ORIGIN: str = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000").strip()

    # Scanner safety & limits
    SCAN_ALLOWED_HOSTS: List[str] = [
        h.strip().lower()
        for h in os.getenv("SCAN_ALLOWED_HOSTS", "").split(",")
        if h.strip()
    ]
    MAX_CRAWL_PAGES: int = int(os.getenv("MAX_CRAWL_PAGES", "20"))
    MAX_CRAWL_DEPTH: int = int(os.getenv("MAX_CRAWL_DEPTH", "2"))
    REQUEST_TIMEOUT_SECONDS: float = float(os.getenv("REQUEST_TIMEOUT_SECONDS", "10.0"))
    SCAN_TIMEOUT_SECONDS: float = float(os.getenv("SCAN_TIMEOUT_SECONDS", "120.0"))
    MAX_CONCURRENT_SCANS: int = int(os.getenv("MAX_CONCURRENT_SCANS", "3"))

    # OWASP ZAP Baseline
    ZAP_ENABLED: bool = os.getenv("ZAP_ENABLED", "false").lower() in ("true", "1", "yes")
    ZAP_BASE_URL: str = os.getenv("ZAP_BASE_URL", "http://localhost:8080").strip()
    ZAP_API_KEY: str = os.getenv("ZAP_API_KEY", "").strip()

settings = Settings()

