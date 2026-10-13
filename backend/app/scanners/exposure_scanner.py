import urllib.parse
from typing import List, Dict, Any, Tuple
import httpx
from app.schemas import (
    Finding,
    Severity,
    Confidence,
    EvidenceStatus,
    FindingStatus,
    CodeDiff,
)
from app.security.network_safety import redact_sensitive_evidence
from app.security.url_validation import validate_target_url

# Conservative probe definitions with expected signature criteria
EXPOSURE_PROBES = [
    {
        "path": "/.git/HEAD",
        "name": "Exposed Git Repository Metadata",
        "owasp": "A01:2025 — Broken Access Control",
        "severity": Severity.HIGH,
        "score": 8.0,
        "signature": "ref: refs/",
        "description": "The target website serves the /.git/HEAD file publicly, indicating the .git repository is exposed on the web root.",
        "explanation": "Anyone can download the full version control history, including previous commits, source code, and potentially committed secret keys.",
        "impact": "Full source code and version control exposure.",
        "remediation": "Block access to hidden files and directories starting with a dot (.) in your web server configuration."
    },
    {
        "path": "/.env",
        "name": "Exposed Environment Configuration File",
        "owasp": "A01:2025 — Broken Access Control",
        "severity": Severity.CRITICAL,
        "score": 9.5,
        "signature_keywords": ["APP_KEY=", "DB_PASSWORD=", "DATABASE_URL=", "SECRET_KEY=", "AWS_ACCESS_KEY_ID="],
        "description": "An environment configuration file (.env) was found publicly accessible on the web root.",
        "explanation": "Environment files typically contain database credentials, cryptographic keys, and third-party API tokens.",
        "impact": "Direct credential leakage leading to complete database or infrastructure compromise.",
        "remediation": "Immediately revoke and rotate all exposed secrets. Restrict web server rules to deny access to .env files."
    },
    {
        "path": "/actuator/env",
        "name": "Exposed Spring Boot Actuator Environment",
        "owasp": "A02:2025 — Security Misconfiguration",
        "severity": Severity.HIGH,
        "score": 8.2,
        "signature_keywords": ["activeProfiles", "propertySources"],
        "description": "The Spring Boot Actuator /env endpoint is publicly accessible without authentication.",
        "explanation": "The Actuator environment endpoint reveals runtime configuration properties, JVM parameters, and system environment variables.",
        "impact": "Exposure of sensitive runtime configuration parameters.",
        "remediation": "Configure Spring Security to require authentication on all Actuator endpoints or disable sensitive endpoints."
    },
]

async def scan_public_exposures(base_url: str, client: httpx.AsyncClient) -> List[Finding]:
    """
    Safely probes a fixed, conservative list of common exposed resources.
    Requires matching content signatures beyond an HTTP 200 status code.
    """
    findings: List[Finding] = []
    parsed_base = urllib.parse.urlparse(base_url)
    root_url = f"{parsed_base.scheme}://{parsed_base.netloc}"

    for probe in EXPOSURE_PROBES:
        target = f"{root_url}{probe['path']}"
        # Validate safety of target probe URL
        is_safe, _, normalized = validate_target_url(target)
        if not is_safe or not normalized:
            continue

        try:
            # Safe GET request with bounded response size (read max 4KB) and short timeout
            response = await client.get(normalized, timeout=5.0)
            if response.status_code == 200:
                body_sample = response.text[:4096]
                content_type = response.headers.get("content-type", "").lower()

                # Rule out HTML custom error pages (e.g. 200 OK returning generic HTML 404)
                if "html" in content_type and not probe["path"].endswith(".html"):
                    continue

                is_matched = False
                matched_snippet = ""

                # Check fixed signature
                if "signature" in probe:
                    if probe["signature"] in body_sample:
                        is_matched = True
                        matched_snippet = probe["signature"]

                # Check keywords signature
                if "signature_keywords" in probe:
                    found_keywords = [kw for kw in probe["signature_keywords"] if kw in body_sample]
                    if found_keywords:
                        is_matched = True
                        matched_snippet = f"Matched configuration variables: {', '.join(found_keywords)}"

                if is_matched:
                    findings.append(Finding(
                        id=f"exp-{probe['path'].replace('/', '-').strip('-')}",
                        title=probe["name"],
                        technicalName=probe["name"],
                        owasp_category=probe["owasp"],
                        severity=probe["severity"],
                        confidence=Confidence.HIGH,
                        evidence_status=EvidenceStatus.CONFIRMED_OBSERVATION,
                        score=probe["score"],
                        endpoint=normalized,
                        description=probe["description"],
                        explanation=probe["explanation"],
                        impact=probe["impact"],
                        evidence=redact_sensitive_evidence(f"GET {normalized} returned HTTP 200 with signature:\n{matched_snippet}"),
                        proof=f"HTTP 200 received at {probe['path']} matching expected signature.",
                        recommendedFix=CodeDiff(
                            fileName="Web Server (Nginx / Apache / Caddy)",
                            explanation=probe["remediation"],
                            beforeCode="# Vulnerable: Hidden files accessible\nlocation / { try_files $uri $uri/ =404; }",
                            afterCode="# Secure: Deny access to hidden dotfiles\nlocation ~ /\\.(?!well-known) {\n    deny all;\n    return 404;\n}"
                        ),
                        fixSteps=[
                            "Block requests to hidden files (starting with dot) in your reverse proxy.",
                            probe["remediation"]
                        ],
                        limitations="Probed fixed common configuration paths only. Does not brute-force filenames.",
                        verification_status="unverified",
                        status=FindingStatus.OPEN,
                        source="native_scanner",
                        references=["https://owasp.org/Top10/A01_2021-Broken_Access_Control/"]
                    ))
        except Exception:
            continue

    return findings

