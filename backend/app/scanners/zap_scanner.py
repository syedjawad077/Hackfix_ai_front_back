import shutil
import subprocess
import json
from typing import List, Dict, Any, Tuple
import httpx
from app.config import settings
from app.schemas import (
    Finding,
    Severity,
    Confidence,
    EvidenceStatus,
    FindingStatus,
    CodeDiff,
)

# OWASP Top 10:2025 category mapping for common ZAP alert plugin IDs
ZAP_PLUGIN_TO_OWASP: Dict[str, str] = {
    "10020": "A02:2025 — Security Misconfiguration",  # X-Frame-Options
    "10021": "A02:2025 — Security Misconfiguration",  # X-Content-Type-Options
    "10035": "A02:2025 — Security Misconfiguration",  # Strict-Transport-Security
    "10038": "A02:2025 — Security Misconfiguration",  # Content-Security-Policy
    "10049": "A02:2025 — Security Misconfiguration",  # Content Cacheability
    "10054": "A07:2025 — Authentication Failures",    # Cookie Without SameSite
    "10055": "A02:2025 — Security Misconfiguration",  # CSP: wildcard directive
    "10096": "A02:2025 — Security Misconfiguration",  # Timestamp Disclosure
    "10098": "A02:2025 — Security Misconfiguration",  # Cross-Domain Misconfiguration
    "40012": "A05:2025 — Injection",                  # Cross-Site Scripting (Reflected)
    "40014": "A05:2025 — Injection",                  # SQL Injection
    "40018": "A05:2025 — Injection",                  # SQL Injection - Hypersonic
    "90022": "A01:2025 — Broken Access Control",      # Application Error Disclosure
}

def map_zap_risk_to_severity(risk_code: str) -> Severity:
    risk = str(risk_code).lower()
    if risk in ("3", "high"):
        return Severity.HIGH
    elif risk in ("2", "medium"):
        return Severity.MEDIUM
    elif risk in ("1", "low"):
        return Severity.LOW
    elif risk in ("0", "informational"):
        return Severity.INFORMATIONAL
    return Severity.LOW

def parse_zap_alerts(zap_alerts: List[Dict[str, Any]]) -> List[Finding]:
    """
    Normalizes raw OWASP ZAP alerts into the standard HackFix AI Finding schema.
    """
    findings: List[Finding] = []
    for alert in zap_alerts:
        plugin_id = str(alert.get("pluginId", ""))
        category = ZAP_PLUGIN_TO_OWASP.get(plugin_id, "A02:2025 — Security Misconfiguration")
        severity = map_zap_risk_to_severity(alert.get("riskcode", alert.get("risk", "Low")))

        evidence = alert.get("evidence", "") or alert.get("otherinfo", "")
        param = alert.get("param", "")
        if param:
            evidence = f"Parameter: {param}\n{evidence}"

        findings.append(Finding(
            id=f"zap-{plugin_id}-{alert.get('id', len(findings))}",
            title=alert.get("name", alert.get("alert", "OWASP ZAP Finding")),
            technicalName=alert.get("name", alert.get("alert")),
            owasp_category=category,
            severity=severity,
            confidence=Confidence.MEDIUM,
            evidence_status=EvidenceStatus.CONFIRMED_OBSERVATION,
            score=6.0 if severity == Severity.MEDIUM else (8.0 if severity == Severity.HIGH else 4.0),
            endpoint=alert.get("url", ""),
            description=alert.get("description", ""),
            explanation=alert.get("description", "")[:250],
            impact="Identified by OWASP ZAP passive baseline analyzer.",
            evidence=evidence[:500],
            proof=f"ZAP Plugin ID {plugin_id}: {alert.get('name', '')}",
            recommendedFix=CodeDiff(
                fileName="Application / Server Config",
                explanation=alert.get("solution", "Apply security best practices recommended by OWASP."),
                beforeCode="# Issue flagged by OWASP ZAP",
                afterCode=alert.get("solution", "")
            ),
            fixSteps=[alert.get("solution", "Review OWASP documentation for remediation steps.")[:200]],
            limitations="Passive spider analysis without active exploit payload verification.",
            verification_status="unverified",
            status=FindingStatus.OPEN,
            source="owasp_zap",
            references=alert.get("reference", "").split("\n") if alert.get("reference") else []
        ))
    return findings

async def run_zap_baseline(target_url: str) -> Tuple[List[Finding], bool, str]:
    """
    Executes or connects to OWASP ZAP Baseline scanner if enabled.
    Returns (findings, did_run, message).
    """
    if not settings.ZAP_ENABLED:
        return [], False, "OWASP ZAP baseline scanner disabled via configuration (ZAP_ENABLED=false)."

    # Check if ZAP API is reachable via HTTP
    if settings.ZAP_BASE_URL:
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                res = await client.get(f"{settings.ZAP_BASE_URL}/JSON/core/view/version/")
                if res.status_code == 200:
                    # ZAP daemon reachable
                    return [], True, "OWASP ZAP API daemon connected."
        except Exception:
            pass

    # Check if Docker is available to launch zap-baseline.py
    docker_bin = shutil.which("docker")
    if not docker_bin:
        return [], False, "OWASP ZAP not available (Docker executable not found in PATH)."

    return [], False, "OWASP ZAP baseline container available but not configured for automated trigger."

