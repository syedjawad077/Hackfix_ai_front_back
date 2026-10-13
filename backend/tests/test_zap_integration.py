import pytest
from app.scanners.zap_scanner import parse_zap_alerts, run_zap_baseline
from app.schemas import Severity, FindingStatus
from app.config import settings

@pytest.mark.asyncio
async def test_zap_disabled_fallback():
    # When ZAP_ENABLED is false, native scanner returns empty findings and reports disabled
    settings.ZAP_ENABLED = False
    findings, did_run, message = await run_zap_baseline("https://example.com")
    assert did_run is False
    assert len(findings) == 0
    assert "disabled" in message.lower()

def test_zap_alert_normalization_fixture():
    # Fixture representing standard ZAP passive scan alert outputs
    sample_zap_alerts = [
        {
            "pluginId": "10038",
            "name": "Content Security Policy (CSP) Header Not Set",
            "risk": "Medium",
            "riskcode": "2",
            "confidence": "2",
            "url": "https://example.com/",
            "description": "Content Security Policy (CSP) is an added layer of security that helps to detect and mitigate certain types of attacks.",
            "solution": "Ensure that your web server, application server, load balancer, etc. is configured to set the Content-Security-Policy header.",
            "evidence": "",
            "reference": "https://owasp.org/www-project-secure-headers/#content-security-policy"
        },
        {
            "pluginId": "40012",
            "name": "Cross Site Scripting (Reflected)",
            "risk": "High",
            "riskcode": "3",
            "confidence": "3",
            "url": "https://example.com/search?q=test",
            "description": "Reflected Cross-site Scripting (XSS) occurs when an application receives data in an HTTP request and includes that data within the immediate response.",
            "solution": "Context-aware encoding and sanitization of user input.",
            "param": "q",
            "evidence": "<script>alert(1)</script>",
            "reference": "https://owasp.org/Top10/A03_2021-Injection/"
        },
        {
            "pluginId": "10020",
            "name": "Missing Anti-clickjacking Header",
            "risk": "Medium",
            "riskcode": "2",
            "confidence": "2",
            "url": "https://example.com/",
            "description": "The response does not include either Content-Security-Policy with 'frame-ancestors' directive or X-Frame-Options.",
            "solution": "Modern Web browsers support the Content-Security-Policy and X-Frame-Options HTTP headers.",
            "evidence": "",
            "reference": ""
        }
    ]

    findings = parse_zap_alerts(sample_zap_alerts)
    assert len(findings) == 3

    # Check finding 0: CSP
    assert findings[0].owasp_category == "A02:2025 — Security Misconfiguration"
    assert findings[0].severity == Severity.MEDIUM
    assert findings[0].source == "owasp_zap"
    assert findings[0].status == FindingStatus.OPEN
    assert findings[0].score == 6.0

    # Check finding 1: Reflected XSS
    assert findings[1].owasp_category == "A05:2025 — Injection"
    assert findings[1].severity == Severity.HIGH
    assert "Parameter: q" in findings[1].evidence
    assert findings[1].score == 8.0

    # Check finding 2: Frame-Options
    assert findings[2].owasp_category == "A02:2025 — Security Misconfiguration"
    assert findings[2].severity == Severity.MEDIUM

