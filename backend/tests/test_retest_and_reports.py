import pytest
import httpx
from app.schemas import ScanReport, Finding, Severity, FindingStatus, CodeDiff, ScanStepperState
from app.services.report_service import generate_pdf_report, generate_markdown_report
from app.scanners.crawl_scanner import crawl_and_inspect, STACK_TRACE_PATTERNS
from app.security.network_safety import redact_sensitive_evidence
from app.storage.repository import ScanRepository
from app.services.scan_service import scan_service
from app.storage.database import init_db

@pytest.fixture
def sample_report():
    return ScanReport(
        id="scan-reports-test",
        targetUrl="https://example.com",
        hasSourceZip=False,
        ownershipVerified=True,
        stepper=ScanStepperState(),
        logs=[],
        riskScore=60,
        verdict="Moderate exposure risk: 2 security weaknesses identified.",
        findings=[
            Finding(
                id="hdr-csp-200",
                title="Missing Content Security Policy (CSP)",
                owasp_category="A02:2025 — Security Misconfiguration",
                severity=Severity.MEDIUM,
                score=5.5,
                endpoint="https://example.com",
                evidence="Content-Security-Policy: [Not Present]",
                recommendedFix=CodeDiff(
                    fileName="Nginx Config",
                    explanation="Configure CSP headers.",
                    beforeCode="# Missing CSP",
                    afterCode="add_header Content-Security-Policy \"default-src 'self'\";"
                )
            ),
            Finding(
                id="hdr-xcto-200",
                title="Missing X-Content-Type-Options Header",
                owasp_category="A02:2025 — Security Misconfiguration",
                severity=Severity.LOW,
                score=3.5,
                endpoint="https://example.com",
                evidence="X-Content-Type-Options: [Not Present]",
                recommendedFix=CodeDiff(
                    fileName="Nginx Config",
                    explanation="Configure MIME-sniffing prevention.",
                    beforeCode="# Missing header",
                    afterCode="add_header X-Content-Type-Options \"nosniff\";"
                )
            )
        ],
        status="completed",
        summaryMarkdown="Audit report",
        createdAt="2026-10-13 12:00:00 UTC"
    )

def test_pdf_report_generation(sample_report):
    pdf_bytes = generate_pdf_report(sample_report)
    assert pdf_bytes is not None
    assert len(pdf_bytes) > 500
    # PDF starts with %PDF magic header
    assert pdf_bytes.startswith(b"%PDF")

def test_markdown_report_generation(sample_report):
    md_text = generate_markdown_report(sample_report)
    assert "# HackFix AI — Website Security Audit Report" in md_text
    assert "https://example.com" in md_text
    assert "Missing Content Security Policy (CSP)" in md_text
    assert "Missing X-Content-Type-Options Header" in md_text
    assert "OWASP Top 10:2025" in md_text
    assert "Scan Limitations & Advisory Disclaimer" in md_text

@pytest.mark.asyncio
async def test_verbose_error_disclosure_detection():
    # Simulate an unhandled Python traceback debug page
    debug_body = (
        "<html><body>"
        "<h1>Server Error</h1>"
        "<pre>Traceback (most recent call last):\n"
        "  File '/var/www/app/server.py', line 45, in handle_request\n"
        "    db.execute('SELECT * FROM users WHERE id=' + user_id)\n"
        "ValueError: invalid literal for int()</pre>"
        "</body></html>"
    )

    def handler(request):
        return httpx.Response(500, text=debug_body)

    transport = httpx.MockTransport(handler)
    async with httpx.AsyncClient(transport=transport) as client:
        visited, findings, limits = await crawl_and_inspect("https://example.com", client, max_pages=1, max_depth=1)

    assert len(findings) == 1
    assert "Detailed Error and Stack Trace Disclosure" in findings[0].title
    assert findings[0].owasp_category == "A10:2025 — Mishandling of Exceptional Conditions"
    assert "Traceback (most recent call last)" in findings[0].evidence

@pytest.mark.asyncio
async def test_retest_genuine_verification_logic(monkeypatch, sample_report):
    await init_db()
    # Save report to DB
    await ScanRepository.create_scan(sample_report)

    orig_client = httpx.AsyncClient

    # 1. Retest without fix applied: response still lacks X-Content-Type-Options
    def handler_unfixed(request):
        return httpx.Response(200, headers={}, request=request)

    monkeypatch.setattr(httpx, "AsyncClient", lambda **kw: orig_client(transport=httpx.MockTransport(handler_unfixed)))

    result_unfixed = await scan_service.retest_finding(sample_report.id, "hdr-xcto-200")
    assert result_unfixed.status == "not_verified"
    assert "still missing" in result_unfixed.note

    # 2. Retest after fix applied: response now returns X-Content-Type-Options: nosniff
    def handler_fixed(request):
        return httpx.Response(200, headers={"x-content-type-options": "nosniff"}, request=request)

    monkeypatch.setattr(httpx, "AsyncClient", lambda **kw: orig_client(transport=httpx.MockTransport(handler_fixed)))

    result_fixed = await scan_service.retest_finding(sample_report.id, "hdr-xcto-200")
    assert result_fixed.status == "verified_fixed"
    assert "nosniff is now present" in result_fixed.note

    # Verify report state was updated in DB
    updated = await ScanRepository.get_scan(sample_report.id)
    finding = next(f for f in updated.findings if f.id == "hdr-xcto-200")
    assert finding.status == FindingStatus.VERIFIED_FIXED
    assert finding.verification_status == "verified_fixed"
    assert finding.verifiedAt is not None
