import pytest
import httpx
from app.schemas import Finding, Severity, FindingStatus, CodeDiff
from app.scanners.headers_scanner import scan_security_headers
from app.scanners.exposure_scanner import scan_public_exposures, EXPOSURE_PROBES
from app.services.findings_service import (
    deduplicate_findings,
    calculate_risk_score,
    get_risk_verdict,
    compute_owasp_coverage,
    OWASP_2025_CATEGORIES
)

def test_security_headers_missing_all():
    # Simulated minimal response without security headers
    req = httpx.Request("GET", "https://example.com")
    resp = httpx.Response(200, headers={}, request=req)
    
    findings = scan_security_headers("https://example.com", resp)
    titles = [f.title for f in findings]
    
    assert "Missing Content Security Policy (CSP)" in titles
    assert "Missing HTTP Strict Transport Security (HSTS)" in titles
    assert "Missing X-Content-Type-Options Header" in titles
    assert "Missing Clickjacking Framing Protection" in titles
    assert "Missing Referrer-Policy Header" in titles

def test_security_headers_fully_hardened():
    headers = {
        "content-security-policy": "default-src 'self'",
        "strict-transport-security": "max-age=31536000; includeSubDomains",
        "x-content-type-options": "nosniff",
        "x-frame-options": "DENY",
        "referrer-policy": "strict-origin-when-cross-origin",
    }
    req = httpx.Request("GET", "https://example.com")
    resp = httpx.Response(200, headers=headers, request=req)
    
    findings = scan_security_headers("https://example.com", resp)
    # Should not flag any missing headers
    assert len(findings) == 0

def test_server_banner_disclosure():
    headers = {
        "content-security-policy": "default-src 'self'",
        "strict-transport-security": "max-age=31536000",
        "x-content-type-options": "nosniff",
        "x-frame-options": "DENY",
        "referrer-policy": "strict-origin-when-cross-origin",
        "server": "Apache/2.4.41 (Ubuntu)",
        "x-powered-by": "PHP/7.4.3",
    }
    req = httpx.Request("GET", "https://example.com")
    resp = httpx.Response(200, headers=headers, request=req)
    
    findings = scan_security_headers("https://example.com", resp)
    titles = [f.title for f in findings]
    assert any("Verbose Server Version Disclosure" in t for t in titles)

def test_insecure_cookie_attributes():
    headers = {
        "content-security-policy": "default-src 'self'",
        "strict-transport-security": "max-age=31536000",
        "x-content-type-options": "nosniff",
        "x-frame-options": "DENY",
        "referrer-policy": "strict-origin-when-cross-origin",
        "set-cookie": "sessionid=xyz123; Path=/",  # Missing Secure, HttpOnly, SameSite
    }
    req = httpx.Request("GET", "https://example.com")
    resp = httpx.Response(200, headers=headers, request=req)
    
    findings = scan_security_headers("https://example.com", resp)
    titles = [f.title for f in findings]
    assert any("Missing Security Flags" in t for t in titles)

@pytest.mark.asyncio
async def test_exposure_scanner_git_detected():
    # Mock transport returning valid .git/HEAD signature
    def handler(request):
        if request.url.path == "/.git/HEAD":
            return httpx.Response(200, text="ref: refs/heads/main\n")
        return httpx.Response(404, text="Not Found")

    transport = httpx.MockTransport(handler)
    async with httpx.AsyncClient(transport=transport) as client:
        findings = await scan_public_exposures("https://example.com", client)

    assert len(findings) == 1
    assert findings[0].title == "Exposed Git Repository Metadata"
    assert findings[0].severity == Severity.HIGH

@pytest.mark.asyncio
async def test_exposure_scanner_env_detected_with_redaction():
    def handler(request):
        if request.url.path == "/.env":
            return httpx.Response(200, text="APP_KEY=base64:random\nDB_PASSWORD=supersecret_db_pass\n")
        return httpx.Response(404, text="Not Found")

    transport = httpx.MockTransport(handler)
    async with httpx.AsyncClient(transport=transport) as client:
        findings = await scan_public_exposures("https://example.com", client)

    assert len(findings) == 1
    assert findings[0].title == "Exposed Environment Configuration File"
    assert findings[0].severity == Severity.CRITICAL
    # Verify that secret was not leaked in evidence
    assert "supersecret_db_pass" not in findings[0].evidence
    assert "supersecret_db_pass" not in findings[0].proof
    assert "DB_PASSWORD=" in findings[0].evidence

@pytest.mark.asyncio
async def test_exposure_scanner_soft_404_ignored():
    # Many websites return 200 with generic HTML error for any route
    def handler(request):
        return httpx.Response(200, text="<html><body>404 Custom Not Found Page</body></html>")

    transport = httpx.MockTransport(handler)
    async with httpx.AsyncClient(transport=transport) as client:
        findings = await scan_public_exposures("https://example.com", client)

    # Should not produce false positives because signature is not present
    assert len(findings) == 0

def test_deduplicate_findings():
    f1 = Finding(
        id="1",
        title="Missing Content Security Policy (CSP)",
        owasp_category="A02:2025 — Security Misconfiguration",
        severity=Severity.MEDIUM,
        score=5.0
    )
    f2 = Finding(
        id="2",
        title="Missing Content Security Policy (CSP)",
        owasp_category="A02:2025 — Security Misconfiguration",
        severity=Severity.MEDIUM,
        score=5.0
    )
    f3 = Finding(
        id="3",
        title="Different Issue",
        owasp_category="A01:2025 — Broken Access Control",
        severity=Severity.HIGH,
        score=8.0
    )
    deduped = deduplicate_findings([f1, f2, f3])
    assert len(deduped) == 2

def test_risk_scoring_and_verdict():
    findings = [
        Finding(id="1", title="Issue 1", owasp_category="A01", severity=Severity.CRITICAL, score=9.5), # 25
        Finding(id="2", title="Issue 2", owasp_category="A02", severity=Severity.HIGH, score=8.0),     # 15
        Finding(id="3", title="Issue 3", owasp_category="A02", severity=Severity.MEDIUM, score=5.0),   # 8
        Finding(id="4", title="Issue 4", owasp_category="A02", severity=Severity.LOW, score=3.0),      # 3
    ]
    # Total = 25 + 15 + 8 + 3 = 51
    score = calculate_risk_score(findings)
    assert score == 51
    verdict = get_risk_verdict(score, findings)
    assert "Moderate exposure risk" in verdict

    # Test verified_fixed exclusion
    findings[0].status = FindingStatus.VERIFIED_FIXED
    # Total now = 51 - 25 = 26
    new_score = calculate_risk_score(findings)
    assert new_score == 26

def test_owasp_coverage_assessment():
    findings = [
        Finding(id="1", title="Missing CSP", owasp_category="A02:2025 — Security Misconfiguration", severity=Severity.MEDIUM, score=5.0),
    ]
    coverage = compute_owasp_coverage(findings)
    assert len(coverage) == 10
    assert "A02:2025 — Security Misconfiguration" in coverage
    assert coverage["A02:2025 — Security Misconfiguration"].status.value == "findings_present"
    assert coverage["A01:2025 — Broken Access Control"].status.value == "assessment_limited"
