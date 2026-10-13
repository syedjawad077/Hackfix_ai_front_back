import asyncio
import uuid
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, HTTPException, BackgroundTasks, Request, status
from app.schemas import ScanReport, ScanStepperState, StepState, RetestRequest, RetestResponse
from app.security.url_validation import validate_target_url
from app.storage.repository import ScanRepository
from app.services.scan_service import scan_service

router = APIRouter(prefix="/api", tags=["scan"])

@router.post("/scan", response_model=ScanReport, status_code=status.HTTP_201_CREATED)
async def create_scan(request: Request, background_tasks: BackgroundTasks):
    """
    Accepts target URL and ownership verification, initiates a background scan,
    and returns initial scan record immediately.
    """
    target_url = ""
    ownership_verified = False
    prompt_text: Optional[str] = None

    # Handle both multipart/form-data and application/json
    content_type = request.headers.get("content-type", "")
    if "multipart/form-data" in content_type:
        form = await request.form()
        target_url = str(form.get("target_url") or "").strip()
        ownership_verified = str(form.get("ownership_verified", "")).lower() in ("true", "1")
        prompt_text = form.get("prompt")
        if prompt_text:
            prompt_text = str(prompt_text)
    else:
        try:
            body = await request.json()
            target_url = str(body.get("target_url") or body.get("targetUrl") or "").strip()
            ownership_verified = bool(body.get("ownership_verified") or body.get("ownershipVerified"))
            prompt_text = body.get("prompt")
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid request body.")

    if not target_url:
        raise HTTPException(status_code=400, detail="Target website URL is required.")

    if not ownership_verified:
        raise HTTPException(status_code=403, detail="Ownership or authorized written testing permission must be confirmed.")

    # Validate target URL
    is_safe, error_msg, normalized = validate_target_url(target_url)
    if not is_safe or not normalized:
        raise HTTPException(status_code=400, detail=f"Target URL validation failed: {error_msg}")

    scan_id = f"scan-{uuid.uuid4().hex[:10]}"
    now_time = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

    initial_report = ScanReport(
        id=scan_id,
        targetUrl=normalized,
        hasSourceZip=False,
        ownershipVerified=True,
        stepper=ScanStepperState(
            find=StepState.PENDING,
            prove=StepState.PENDING,
            fix=StepState.PENDING,
            verify=StepState.PENDING
        ),
        logs=[],
        riskScore=0,
        verdict="Scan queued and awaiting execution...",
        findings=[],
        owasp_coverage={},
        status="queued",
        summaryMarkdown="Scan initiated...",
        createdAt=now_time
    )

    await ScanRepository.create_scan(initial_report)

    # Launch scan as background task
    background_tasks.add_task(scan_service.run_scan_pipeline, scan_id, normalized)

    return initial_report

@router.get("/scan/{scan_id}", response_model=ScanReport)
async def get_scan(scan_id: str):
    """
    Returns latest scan status, findings, and logs for polling.
    """
    report = await ScanRepository.get_scan(scan_id)
    if not report:
        raise HTTPException(status_code=404, detail=f"Scan report with ID '{scan_id}' not found.")
    return report

@router.post("/scan/{scan_id}/retest", response_model=RetestResponse)
async def retest_finding(scan_id: str, payload: RetestRequest):
    """
    Re-tests a specific finding by performing a live verification check.
    """
    report = await ScanRepository.get_scan(scan_id)
    if not report:
        raise HTTPException(status_code=404, detail=f"Scan report '{scan_id}' not found.")

    result = await scan_service.retest_finding(scan_id, payload.finding_id)
    return result

