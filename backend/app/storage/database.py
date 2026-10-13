import aiosqlite
from pathlib import Path
from app.config import settings

DATABASE_PATH = settings.DATABASE_PATH

async def init_db():
    """Initializes the SQLite database tables."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS scans (
                id TEXT PRIMARY KEY,
                target_url TEXT NOT NULL,
                status TEXT NOT NULL,
                risk_score INTEGER DEFAULT 0,
                verdict TEXT DEFAULT '',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                data_json TEXT NOT NULL
            )
        """)
        await db.execute("CREATE INDEX IF NOT EXISTS idx_scans_created ON scans (created_at DESC)")
        await db.commit()

async def get_db_connection():
    """Returns an aiosqlite connection."""
    return await aiosqlite.connect(DATABASE_PATH)

