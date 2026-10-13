import ssl
import socket
import datetime
import urllib.parse
from typing import List, Tuple, Optional
import httpx
from app.schemas import (
    Finding,
    Severity,
    Confidence,
    EvidenceStatus,
    FindingStatus,
    CodeDiff,
)

def check_tls_and_transport(url: str, initial_response: httpx.Response) -> Tuple[List[Finding], List[str]]:
    """
    Assesses TLS certificate validity, expiration, and HTTP-to-HTTPS redirection.
    Returns (findings, limitations).
    """
    findings: List[Finding] = []
    limitations: List[str] = []

    parsed = urllib.parse.urlparse(url)
    hostname = parsed.hostname
    port = parsed.port or (443 if parsed.scheme == "https" else 80)
    scheme = parsed.scheme.lower()

    # 1. Plain HTTP Check (Lack of Encryption & Redirect Verification)
    if scheme == "http":
        # Check if HTTP redirects to HTTPS
        redirected_to_https = (
            initial_response.is_redirect
            and "https://" in initial_response.headers.get("location", "").lower()
        ) or str(initial_response.url).startswith("https://")

        if not redirected_to_https:
            findings.append(Finding(
                id="tls-unencrypted-http",
                title="Unencrypted HTTP Without HTTPS Redirection",
                technicalName="Cleartext Transmission of Sensitive Information",
                owasp_category="A04:2025 — Cryptographic Failures",
                severity=Severity.HIGH,
                confidence=Confidence.HIGH,
                evidence_status=EvidenceStatus.CONFIRMED_OBSERVATION,
                score=7.2,
                endpoint=url,
                description="The target website serves traffic over plain unencrypted HTTP and does not automatically redirect to HTTPS.",
                explanation="All data transmitted over plain HTTP (including session cookies, logins, and API payloads) is sent in cleartext across the network.",
                impact="Eavesdropping, credential interception, and content injection by network adversaries.",
                evidence=f"Request to {url} returned HTTP {initial_response.status_code} without redirecting to HTTPS.",
                proof="Target URL responded directly over port 80 without returning an HTTP 301/308 redirect to an https:// address.",
                recommendedFix=CodeDiff(
                    fileName="Web Server VirtualHost / Reverse Proxy",
                    explanation="Configure an unconditional HTTP 301 redirect to HTTPS on port 80.",
                    beforeCode="# Vulnerable: Serving plain HTTP\nserver { listen 80; ... }",
                    afterCode="server {\n    listen 80;\n    server_name example.com;\n    return 301 https://$host$request_uri;\n}"
                ),
                fixSteps=[
                    "Obtain a trusted TLS certificate (e.g. via Let's Encrypt / Certbot or cloud provider).",
                    "Configure port 80 to issue an unconditional HTTP 301 redirect to HTTPS.",
                    "Verify all internal assets are referenced via HTTPS."
                ],
                limitations="Tested initial landing endpoint.",
                verification_status="unverified",
                status=FindingStatus.OPEN,
                source="native_scanner",
                references=["https://owasp.org/Top10/A02_2021-Cryptographic_Failures/"]
            ))
        return findings, limitations

    # 2. HTTPS TLS Certificate Inspection
    if not hostname:
        limitations.append("TLS check skipped: invalid hostname.")
        return findings, limitations

    try:
        # Standard strict TLS verification (never disabled)
        context = ssl.create_default_context()
        with socket.create_connection((hostname, port), timeout=5.0) as sock:
            with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                cert = ssock.getpeercert()
                tls_version = ssock.version()

                # Check Expiration
                if cert and "notAfter" in cert:
                    expire_str = cert["notAfter"]
                    # Format: 'May  5 12:00:00 2026 GMT'
                    try:
                        expire_date = datetime.datetime.strptime(expire_str, "%b %d %H:%M:%S %Y %Z")
                        now = datetime.datetime.utcnow()
                        days_left = (expire_date - now).days

                        if days_left < 0:
                            findings.append(Finding(
                                id="tls-cert-expired",
                                title="TLS Certificate Has Expired",
                                technicalName="Expired X.509 Server Certificate",
                                owasp_category="A04:2025 — Cryptographic Failures",
                                severity=Severity.HIGH,
                                confidence=Confidence.HIGH,
                                evidence_status=EvidenceStatus.CONFIRMED_OBSERVATION,
                                score=7.5,
                                endpoint=f"https://{hostname}:{port}",
                                description=f"The TLS certificate for {hostname} expired on {expire_str}.",
                                explanation="Web browsers display security warning banners to visitors when a certificate is expired, breaking user trust and encryption assurance.",
                                impact="Users cannot access the website without accepting dangerous security warning exceptions.",
                                evidence=f"Certificate notAfter date: {expire_str} (expired {abs(days_left)} days ago)",
                                proof=f"TLS handshake completed with expired certificate expiring on {expire_str}.",
                                recommendedFix=CodeDiff(
                                    fileName="TLS Certificate Renewal",
                                    explanation="Renew the domain TLS certificate immediately.",
                                    beforeCode=f"# Expired certificate valid until: {expire_str}",
                                    afterCode="# Renew certificate via ACME / Certbot\nsudo certbot renew"
                                ),
                                fixSteps=[
                                    "Renew the certificate via your certificate authority or Let's Encrypt.",
                                    "Verify automatic renewal cron/timer is active."
                                ],
                                limitations="Checked server certificate via default CA store.",
                                verification_status="unverified",
                                status=FindingStatus.OPEN,
                                source="native_scanner",
                                references=["https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Protection_Cheat_Sheet.html"]
                            ))
                        elif days_left < 14:
                            findings.append(Finding(
                                id="tls-cert-expiring-soon",
                                title="TLS Certificate Expiring Soon",
                                technicalName="Impending Certificate Expiration",
                                owasp_category="A04:2025 — Cryptographic Failures",
                                severity=Severity.LOW,
                                confidence=Confidence.HIGH,
                                evidence_status=EvidenceStatus.CONFIRMED_OBSERVATION,
                                score=3.0,
                                endpoint=f"https://{hostname}:{port}",
                                description=f"The TLS certificate for {hostname} expires in {days_left} days ({expire_str}).",
                                explanation="Certificates nearing expiration should be renewed to prevent accidental downtime.",
                                impact="Site will trigger security blockages if allowed to expire.",
                                evidence=f"Certificate expires in {days_left} days ({expire_str})",
                                proof=f"Certificate notAfter date is {expire_str}.",
                                recommendedFix=CodeDiff(
                                    fileName="TLS Renewal Automation",
                                    explanation="Trigger certificate renewal prior to expiration.",
                                    beforeCode=f"# Certificate expires soon: {expire_str}",
                                    afterCode="sudo certbot renew --force-renewal"
                                ),
                                fixSteps=["Renew the certificate to ensure continuity."],
                                limitations="Informational operational check.",
                                verification_status="unverified",
                                status=FindingStatus.OPEN,
                                source="native_scanner",
                                references=["https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Protection_Cheat_Sheet.html"]
                            ))
                    except Exception:
                        pass

    except ssl.SSLCertVerificationError as e:
        findings.append(Finding(
            id="tls-cert-verification-failure",
            title="TLS Certificate Verification Failed",
            technicalName="Untrusted or Invalid SSL/TLS Certificate",
            owasp_category="A04:2025 — Cryptographic Failures",
            severity=Severity.HIGH,
            confidence=Confidence.HIGH,
            evidence_status=EvidenceStatus.CONFIRMED_OBSERVATION,
            score=7.8,
            endpoint=f"https://{hostname}:{port}",
            description=f"TLS certificate verification failed: {e.verify_message or str(e)}.",
            explanation="The server's certificate is self-signed, untrusted, or issued for a mismatched domain name.",
            impact="Browsers will block access with SSL warnings, leaving users vulnerable to impersonation.",
            evidence=f"SSL Verification Error: {str(e)}",
            proof=f"Handshake failed with verify message: {e.verify_message or str(e)}",
            recommendedFix=CodeDiff(
                fileName="Server TLS Certificate",
                explanation="Deploy a valid, publicly trusted certificate matching the exact domain.",
                beforeCode="# Untrusted or self-signed certificate",
                afterCode="# Install certificate from Let's Encrypt or trusted public CA"
            ),
            fixSteps=[
                "Deploy a certificate with a Subject Alternative Name (SAN) matching this domain.",
                "Ensure intermediate CA chain certificates are bundled."
            ],
            limitations="Assessed using Python standard system trust store.",
            verification_status="unverified",
            status=FindingStatus.OPEN,
            source="native_scanner",
            references=["https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Protection_Cheat_Sheet.html"]
        ))
    except Exception as e:
        limitations.append(f"TLS inspection could not complete: {str(e)}")

    return findings, limitations

