import ipaddress
import pytest
from app.security.url_validation import validate_target_url, validate_redirect_target
from app.security.network_safety import is_ip_prohibited, redact_sensitive_evidence
from app.config import settings

def test_valid_public_urls():
    valid_urls = [
        "https://example.com",
        "https://example.com/api/v1/test",
        "http://example.com:8080/path?query=val#section",
    ]
    for url in valid_urls:
        is_safe, error_msg, normalized = validate_target_url(url)
        assert is_safe is True, f"Expected {url} to be valid, got error: {error_msg}"
        assert normalized is not None
        assert normalized.startswith("http")

def test_invalid_schemes_rejected():
    invalid_schemes = [
        "ftp://example.com/file.txt",
        "file:///etc/passwd",
        "javascript:alert(1)",
        "gopher://example.com",
        "data:text/html,<html></html>",
    ]
    for url in invalid_schemes:
        is_safe, error_msg, normalized = validate_target_url(url)
        assert is_safe is False
        assert "Unsupported scheme" in error_msg

def test_embedded_credentials_rejected():
    urls_with_creds = [
        "https://user:pass@example.com/login",
        "http://admin:secret123@example.com",
    ]
    for url in urls_with_creds:
        is_safe, error_msg, normalized = validate_target_url(url)
        assert is_safe is False
        assert "embedded credentials" in error_msg.lower()

def test_private_and_loopback_ips_blocked(monkeypatch):
    monkeypatch.setattr(settings, "SCAN_ALLOWED_HOSTS", [])
    blocked_urls = [
        "http://127.0.0.1",
        "http://127.0.0.1:8000",
        "http://10.0.0.1/admin",
        "http://192.168.1.100/router",
        "http://172.16.5.10",
        "http://169.254.169.254/latest/meta-data/",
        "http://0.0.0.0",
    ]
    for url in blocked_urls:
        is_safe, error_msg, normalized = validate_target_url(url)
        assert is_safe is False
        assert ("restricted" in error_msg.lower() or "private" in error_msg.lower() or "prohibited" in error_msg.lower())

def test_ip_prohibited_logic():
    assert is_ip_prohibited(ipaddress.ip_address("127.0.0.1")) is True
    assert is_ip_prohibited(ipaddress.ip_address("10.10.10.10")) is True
    assert is_ip_prohibited(ipaddress.ip_address("192.168.0.1")) is True
    assert is_ip_prohibited(ipaddress.ip_address("169.254.169.254")) is True
    assert is_ip_prohibited(ipaddress.ip_address("8.8.8.8")) is False
    assert is_ip_prohibited(ipaddress.ip_address("1.1.1.1")) is False

def test_malformed_and_empty_urls():
    assert validate_target_url("")[0] is False
    assert validate_target_url("   ")[0] is False
    assert validate_target_url("not a url with spaces")[0] is False

def test_redirect_validation_blocks_ssrf():
    # Redirecting to 169.254.169.254 must be blocked
    is_safe, error_msg, normalized = validate_redirect_target(
        "https://example.com/login",
        "http://169.254.169.254/latest/meta-data/"
    )
    assert is_safe is False
    assert "Disallowed redirect target" in error_msg

def test_sensitive_evidence_redaction():
    raw_evidence = (
        "HTTP/1.1 200 OK\r\n"
        "Authorization: Bearer super_secret_jwt_token_12345\r\n"
        "Cookie: session_id=abcdef123456; other=val\r\n"
        "Set-Cookie: auth_token=secret_token_val; Path=/; HttpOnly\r\n"
        "api_key=AIzaSyA_abcdef123456\r\n"
        "password=supersecretpassword\r\n"
    )
    redacted = redact_sensitive_evidence(raw_evidence)
    assert "super_secret_jwt_token_12345" not in redacted
    assert "abcdef123456" not in redacted
    assert "secret_token_val" not in redacted
    assert "AIzaSyA_abcdef123456" not in redacted
    assert "supersecretpassword" not in redacted
    assert "[REDACTED]" in redacted
