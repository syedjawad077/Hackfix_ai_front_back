import uuid
from fastapi import APIRouter, HTTPException
from app.schemas import AttackSimulationRequest, AttackSimulationResponse, ScanReport
from app.storage.repository import ScanRepository
from app.services.gemini_service import gemini_service


router = APIRouter(prefix="/api", tags=["simulation"])

@router.post("/simulation", response_model=AttackSimulationResponse)
async def run_attack_simulation(payload: AttackSimulationRequest):
    """
    Generates a safe, non-destructive breach & threat simulation for boardroom executives and judges.
    Maps detected vulnerabilities into an adversary kill chain and executive business risk assessment.
    Grounds strictly in the requested target website and combination of detected vulnerabilities.
    """
    report = None
    if payload.scanId:
        report = await ScanRepository.get_scan(payload.scanId)
    
    # If not found in database, but targetUrl or findings were supplied in request,
    # construct a targeted ScanReport so simulation is accurately grounded
    if not report and (payload.targetUrl or payload.findings is not None):
        target_url = payload.targetUrl or "https://target-application.com"
        findings_list = payload.findings or []
        risk_score = 0
        if findings_list:
            risk_score = min(100, max(int(f.score * 10) for f in findings_list))

        report = ScanReport(
            id=payload.scanId or f"scan-{uuid.uuid4().hex[:10]}",
            targetUrl=target_url,
            githubRepo=payload.githubRepo,
            findings=findings_list,
            riskScore=risk_score
        )

    if not report:
        raise HTTPException(
            status_code=400,
            detail="A website link must be provided and scanned before running an attack path simulation."
        )

    return await gemini_service.simulate_attack_path(report, applied_defenses=payload.appliedDefenses or [])


