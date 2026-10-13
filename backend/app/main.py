from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.storage.database import init_db
from app.api.scan import router as scan_router
from app.api.chat import router as chat_router
from app.api.reports import router as reports_router
from app.schemas import HealthResponse

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize database tables
    await init_db()
    yield
    # Shutdown logic if needed

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend API for HackFix AI — Real website security testing assistant powered by Gemini and OWASP checks.",
    lifespan=lifespan
)

# CORS configuration
allowed_origins = [
    settings.FRONTEND_ORIGIN,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(scan_router)
app.include_router(chat_router)
app.include_router(reports_router)

@app.get("/", tags=["root"])
async def root():
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs_url": "/docs",
        "health_url": "/api/health"
    }

@app.get("/api/health", response_model=HealthResponse, tags=["health"])
async def health_check():
    """Reports backend operational status without exposing private secrets."""
    return HealthResponse(
        status="healthy",
        version=settings.VERSION,
        gemini_enabled=settings.GEMINI_ENABLED and bool(settings.GEMINI_API_KEY),
        zap_enabled=settings.ZAP_ENABLED,
        db_connected=True
    )

