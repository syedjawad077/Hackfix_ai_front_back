import pytest
from app.services.gemini_service import GeminiService
from app.schemas import ScanReport, Finding, Severity, CodeDiff, ScanStepperState

@pytest.fixture
def sample_report():
    return ScanReport(
        id="scan-test-123",
        targetUrl="https://example.com",
        hasSourceZip=False,
        ownershipVerified=True,
        stepper=ScanStepperState(),
        logs=[],
        riskScore=48,
        verdict="Moderate exposure risk: 2 security weaknesses identified.",
        findings=[
            Finding(
                id="finding-1",
                title="Missing Strict-Transport-Security (HSTS)",
                owasp_category="A04:2025 — Cryptographic Failures",
                severity=Severity.HIGH,
                score=7.5,
                endpoint="https://example.com",
                explanation="Browsers may load this website over unencrypted HTTP, allowing network eavesdropping.",
                impact="Network eavesdropping or man-in-the-middle attacks.",
                evidence="Strict-Transport-Security: [Not Present]",
                recommendedFix=CodeDiff(
                    fileName="Nginx Configuration",
                    explanation="Add the Strict-Transport-Security header to force HTTPS.",
                    beforeCode="# Missing HSTS",
                    afterCode="add_header Strict-Transport-Security \"max-age=31536000; includeSubDomains\" always;"
                )
            ),
            Finding(
                id="finding-2",
                title="Missing Content Security Policy (CSP)",
                owasp_category="A02:2025 — Security Misconfiguration",
                severity=Severity.MEDIUM,
                score=5.5,
                endpoint="https://example.com",
                explanation="Browser cannot restrict script sources, increasing XSS blast radius.",
                impact="Cross-Site Scripting impact amplification.",
                evidence="Content-Security-Policy: [Not Present]",
                recommendedFix=CodeDiff(
                    fileName="Security Middleware",
                    explanation="Configure CSP headers.",
                    beforeCode="# Missing CSP",
                    afterCode="Content-Security-Policy: default-src 'self';"
                )
            )
        ],
        status="completed",
        summaryMarkdown="Summary report",
        createdAt="2026-10-13 12:00:00 UTC"
    )

@pytest.mark.asyncio
async def test_deterministic_fallback_explain(sample_report):
    service = GeminiService()
    # Force client to None to test deterministic fallback
    service.client = None

    reply, quick_replies = await service.chat_response(
        sample_report,
        "Explain simply what is wrong"
    )
    assert "Simple Explanation of Missing Strict-Transport-Security (HSTS)" in reply
    assert len(quick_replies) > 0
    assert "Show me the fix" in quick_replies

@pytest.mark.asyncio
async def test_deterministic_fallback_show_fix(sample_report):
    service = GeminiService()
    service.client = None

    reply, quick_replies = await service.chat_response(
        sample_report,
        "Show me the fix"
    )
    assert "Recommended Advisory Fix" in reply
    assert "add_header Strict-Transport-Security" in reply
    assert "advisory" in reply.lower()

@pytest.mark.asyncio
async def test_deterministic_fallback_prioritize(sample_report):
    service = GeminiService()
    service.client = None

    reply, quick_replies = await service.chat_response(
        sample_report,
        "What should I fix first?"
    )
    # Finding 1 has score 7.5 (High), Finding 2 has 5.5 (Medium)
    assert "Missing Strict-Transport-Security (HSTS)" in reply
    assert "HIGH" in reply

@pytest.mark.asyncio
async def test_deterministic_fallback_retest(sample_report):
    service = GeminiService()
    service.client = None

    reply, quick_replies = await service.chat_response(
        sample_report,
        "How do I re-test this?"
    )
    assert "Re-test" in reply

@pytest.mark.asyncio
async def test_deterministic_fallback_no_scan():
    service = GeminiService()
    service.client = None

    reply, quick_replies = await service.chat_response(
        None,
        "Hello assistant"
    )
    assert "HackFix AI" in reply
    assert "Enter your website URL" in reply
