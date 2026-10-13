import json
from datetime import datetime
from typing import List, Optional
import aiosqlite
from app.schemas import ScanReport
from app.storage.database import DATABASE_PATH

class ScanRepository:
    @staticmethod
    async def create_scan(report: ScanReport) -> ScanReport:
        now_iso = datetime.utcnow().isoformat()
        report_json = report.model_dump_json()

        async with aiosqlite.connect(DATABASE_PATH) as db:
            await db.execute(
                """
                INSERT OR REPLACE INTO scans (id, target_url, status, risk_score, verdict, created_at, updated_at, data_json)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    report.id,
                    report.targetUrl,
                    report.status,
                    report.riskScore,
                    report.verdict,
                    now_iso,
                    now_iso,
                    report_json
                )
            )
            await db.commit()
        return report

    @staticmethod
    async def update_scan(report: ScanReport) -> ScanReport:
        now_iso = datetime.utcnow().isoformat()
        report_json = report.model_dump_json()

        async with aiosqlite.connect(DATABASE_PATH) as db:
            await db.execute(
                """
                UPDATE scans
                SET status = ?, risk_score = ?, verdict = ?, updated_at = ?, data_json = ?
                WHERE id = ?
                """,
                (
                    report.status,
                    report.riskScore,
                    report.verdict,
                    now_iso,
                    report_json,
                    report.id
                )
            )
            await db.commit()
        return report

    @staticmethod
    async def get_scan(scan_id: str) -> Optional[ScanReport]:
        async with aiosqlite.connect(DATABASE_PATH) as db:
            cursor = await db.execute(
                "SELECT data_json FROM scans WHERE id = ?",
                (scan_id,)
            )
            row = await cursor.fetchone()
            if not row:
                return None
            try:
                data = json.loads(row[0])
                return ScanReport.model_validate(data)
            except Exception:
                return None

    @staticmethod
    async def list_recent_scans(limit: int = 10) -> List[ScanReport]:
        scans: List[ScanReport] = []
        async with aiosqlite.connect(DATABASE_PATH) as db:
            cursor = await db.execute(
                "SELECT data_json FROM scans ORDER BY created_at DESC LIMIT ?",
                (limit,)
            )
            rows = await cursor.fetchall()
            for row in rows:
                try:
                    data = json.loads(row[0])
                    scans.append(ScanReport.model_validate(data))
                except Exception:
                    continue
        return scans

