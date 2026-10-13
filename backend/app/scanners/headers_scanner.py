from typing import List, Dict, Any
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

def scan_security_headers(url: str, response: httpx.Response) -> List[Finding]:
    """
    Evaluates response headers for missing or weak security configurations
    and observable cookie flags.
    """
    findings: List[Finding] = []
    headers = response.headers

    # 1. Content-Security-Policy (CSP)
    csp = headers.get("content-security-policy")
    if not csp:
        findings.append(Finding(
            id=f"hdr-csp-{response.status_code}",
            title="Missing Content Security Policy (CSP)",
            technicalName="Missing Content-Security-Policy Header",
            owasp_category="A02:2025 — Security Misconfiguration",
            severity=Severity.MEDIUM,
            confidence=Confidence.HIGH,
            evidence_status=EvidenceStatus.CONFIRMED_OBSERVATION,
            score=5.5,
            endpoint=str(response.url),
            description="The web application does not set a Content-Security-Policy header. A strong CSP instructs modern browsers on approved sources for scripts, stylesheets, and embedded frames.",
            explanation="Without a Content Security Policy, the browser cannot distinguish legitimate scripts from injected malicious content, increasing risk if Cross-Site Scripting (XSS) occurs.",
            impact="Increases the blast radius of injection flaws by allowing unauthorized scripts or frames to execute in client sessions.",
            evidence=f"HTTP/{response.http_version} {response.status_code}\nContent-Security-Policy: [Not Present]",
            proof="Inspected HTTP response headers on target root. Content-Security-Policy was absent.",
            recommendedFix=CodeDiff(
                fileName="Server or Framework Configuration",
                explanation="Configure a restrictive Content-Security-Policy header enforcing default script and object boundaries.",
                beforeCode="# Vulnerable: Missing CSP response header\n# Server emits no Content-Security-Policy",
                afterCode="Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'none';"
            ),
            fixSteps=[
                "Define trusted domains for scripts, styles, and frames.",
                "Add the Content-Security-Policy response header to your reverse proxy (Nginx, Caddy) or web framework middleware.",
                "Test in Report-Only mode ('Content-Security-Policy-Report-Only') before strict enforcement."
            ],
            limitations="Assessed from observable HTTP headers. Single-page applications may load secondary policies or frame rules via meta tags.",
            verification_status="unverified",
            status=FindingStatus.OPEN,
            source="native_scanner",
            references=["https://owasp.org/www-project-secure-headers/#content-security-policy", "https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP"]
        ))

    # 2. Strict-Transport-Security (HSTS)
    hsts = headers.get("strict-transport-security")
    is_https = str(response.url).lower().startswith("https://")
    if is_https and not hsts:
        findings.append(Finding(
            id=f"hdr-hsts-{response.status_code}",
            title="Missing HTTP Strict Transport Security (HSTS)",
            technicalName="Missing Strict-Transport-Security Header",
            owasp_category="A04:2025 — Cryptographic Failures",
            severity=Severity.MEDIUM,
            confidence=Confidence.HIGH,
            evidence_status=EvidenceStatus.CONFIRMED_OBSERVATION,
            score=5.0,
            endpoint=str(response.url),
            description="The HTTPS web server does not return a Strict-Transport-Security header. HSTS ensures browsers always connect via HTTPS and blocks SSL stripping downgrade attacks.",
            explanation="If a user navigates to your site via http:// or on an untrusted network, an attacker could intercept the connection before it redirects to HTTPS.",
            impact="Users could be subjected to man-in-the-middle SSL stripping on public Wi-Fi networks.",
            evidence=f"HTTP/{response.http_version} {response.status_code}\nStrict-Transport-Security: [Not Present]",
            proof="Inspected response headers over HTTPS. Strict-Transport-Security header was not received.",
            recommendedFix=CodeDiff(
                fileName="Server HTTPS Config / Middleware",
                explanation="Instruct browsers to enforce HTTPS for at least one year including subdomains.",
                beforeCode="# Vulnerable: No HSTS header on HTTPS responses",
                afterCode="Strict-Transport-Security: max-age=31536000; includeSubDomains; preload"
            ),
            fixSteps=[
                "Ensure all subdomains support HTTPS.",
                "Attach 'Strict-Transport-Security: max-age=31536000; includeSubDomains' to HTTPS responses.",
                "Optionally submit your domain to the Chrome HSTS preload list."
            ],
            limitations="HSTS is only applicable over HTTPS. Cannot protect the very first unencrypted visit if not preloaded.",
            verification_status="unverified",
            status=FindingStatus.OPEN,
            source="native_scanner",
            references=["https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Strict_Transport_Security_Cheat_Sheet.html"]
        ))

    # 3. X-Content-Type-Options
    xcto = headers.get("x-content-type-options")
    if not xcto or "nosniff" not in xcto.lower():
        findings.append(Finding(
            id=f"hdr-xcto-{response.status_code}",
            title="Missing X-Content-Type-Options Header",
            technicalName="MIME-Sniffing Prevention Not Enforced",
            owasp_category="A02:2025 — Security Misconfiguration",
            severity=Severity.LOW,
            confidence=Confidence.HIGH,
            evidence_status=EvidenceStatus.CONFIRMED_OBSERVATION,
            score=3.5,
            endpoint=str(response.url),
            description="The server does not include 'X-Content-Type-Options: nosniff'. Without this header, older or compliant browsers may try to sniff the MIME type of a file.",
            explanation="MIME sniffing can trick the browser into executing uploaded user files (like images or text) as JavaScript.",
            impact="Potential client-side script execution if user uploads are served from the main application domain.",
            evidence=f"X-Content-Type-Options: {xcto if xcto else '[Not Present]'}",
            proof="Checked response headers. 'X-Content-Type-Options: nosniff' was missing.",
            recommendedFix=CodeDiff(
                fileName="Web Server Header Config",
                explanation="Emit 'X-Content-Type-Options: nosniff' on all server responses.",
                beforeCode="# Vulnerable: No MIME sniffing header",
                afterCode="X-Content-Type-Options: nosniff"
            ),
            fixSteps=[
                "Configure your web server or reverse proxy to emit 'X-Content-Type-Options: nosniff' globally."
            ],
            limitations="Modern browsers are increasingly resilient to MIME sniffing, making this a defense-in-depth mitigation.",
            verification_status="unverified",
            status=FindingStatus.OPEN,
            source="native_scanner",
            references=["https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options"]
        ))

    # 4. Clickjacking Protection (X-Frame-Options or CSP frame-ancestors)
    xfo = headers.get("x-frame-options")
    has_frame_ancestors = "frame-ancestors" in (csp or "").lower()
    if not xfo and not has_frame_ancestors:
        findings.append(Finding(
            id=f"hdr-xfo-{response.status_code}",
            title="Missing Clickjacking Framing Protection",
            technicalName="Missing X-Frame-Options or CSP frame-ancestors",
            owasp_category="A02:2025 — Security Misconfiguration",
            severity=Severity.MEDIUM,
            confidence=Confidence.HIGH,
            evidence_status=EvidenceStatus.CONFIRMED_OBSERVATION,
            score=4.8,
            endpoint=str(response.url),
            description="Neither 'X-Frame-Options' nor a CSP 'frame-ancestors' directive was detected. This allows external websites to embed this web application in an iframe.",
            explanation="An attacker can overlay an invisible frame of your site over a deceptive page to trick logged-in users into clicking sensitive buttons (clickjacking).",
            impact="Unauthorized user actions executed through invisible overlays.",
            evidence="X-Frame-Options: [Not Present]\nCSP frame-ancestors: [Not Present]",
            proof="Response headers contain neither X-Frame-Options (DENY/SAMEORIGIN) nor CSP frame-ancestors.",
            recommendedFix=CodeDiff(
                fileName="Server Framing Headers",
                explanation="Restrict embedding by setting X-Frame-Options or CSP frame-ancestors.",
                beforeCode="# Vulnerable: App can be embedded in any third-party iframe",
                afterCode="X-Frame-Options: SAMEORIGIN\n# Or via Content-Security-Policy: frame-ancestors 'self';"
            ),
            fixSteps=[
                "If the app does not need to be embedded in iframes, set 'X-Frame-Options: DENY'.",
                "If it needs to be framed by your own pages, set 'X-Frame-Options: SAMEORIGIN' and 'frame-ancestors 'self''."
            ],
            limitations="Assessed on landing page. Authenticated inner dashboards may enforce frame protection separately.",
            verification_status="unverified",
            status=FindingStatus.OPEN,
            source="native_scanner",
            references=["https://cheatsheetseries.owasp.org/cheatsheets/Clickjacking_Defense_Cheat_Sheet.html"]
        ))

    # 5. Referrer-Policy
    ref_policy = headers.get("referrer-policy")
    if not ref_policy:
        findings.append(Finding(
            id=f"hdr-refpol-{response.status_code}",
            title="Missing Referrer-Policy Header",
            technicalName="Uncontrolled Referrer Leakage",
            owasp_category="A02:2025 — Security Misconfiguration",
            severity=Severity.LOW,
            confidence=Confidence.HIGH,
            evidence_status=EvidenceStatus.CONFIRMED_OBSERVATION,
            score=3.0,
            endpoint=str(response.url),
            description="No Referrer-Policy header was specified. Browsers may send full URL paths (which might contain IDs or tokens) when users click external links.",
            explanation="Setting a strict policy ensures only the domain name or no referrer is sent when users leave your site.",
            impact="Potential disclosure of URL parameters or internal navigation structures to third parties.",
            evidence="Referrer-Policy: [Not Present]",
            proof="Referrer-Policy was absent in response headers.",
            recommendedFix=CodeDiff(
                fileName="Server Headers Config",
                explanation="Set Referrer-Policy to strict-origin-when-cross-origin.",
                beforeCode="# Vulnerable: Default browser referrer behavior",
                afterCode="Referrer-Policy: strict-origin-when-cross-origin"
            ),
            fixSteps=[
                "Add 'Referrer-Policy: strict-origin-when-cross-origin' to all outbound HTTP responses."
            ],
            limitations="Informational privacy control.",
            verification_status="unverified",
            status=FindingStatus.OPEN,
            source="native_scanner",
            references=["https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy"]
        ))

    # 6. Detailed Server/Technology Banner Disclosure
    server_header = headers.get("server")
    x_powered_by = headers.get("x-powered-by")
    verbose_banners = []
    if server_header and any(c.isdigit() for c in server_header):
        verbose_banners.append(f"Server: {server_header}")
    if x_powered_by:
        verbose_banners.append(f"X-Powered-By: {x_powered_by}")

    if verbose_banners:
        findings.append(Finding(
            id="hdr-server-banner",
            title="Verbose Server Version Disclosure",
            technicalName="Detailed Technology Banner Exposure",
            owasp_category="A02:2025 — Security Misconfiguration",
            severity=Severity.LOW,
            confidence=Confidence.HIGH,
            evidence_status=EvidenceStatus.CONFIRMED_OBSERVATION,
            score=3.2,
            endpoint=str(response.url),
            description="The web server reveals specific software versions in HTTP response headers (e.g. Apache/2.4.52 or PHP/8.1).",
            explanation="Disclosing exact software versions helps automated vulnerability scanners pinpoint unpatched CVEs for that release.",
            impact="Assists attackers in targeting software-specific known vulnerabilities.",
            evidence=redact_sensitive_evidence("\n".join(verbose_banners)),
            proof=f"Response headers contained detailed version banner: {', '.join(verbose_banners)}",
            recommendedFix=CodeDiff(
                fileName="Server Config (e.g. nginx.conf or httpd.conf)",
                explanation="Disable server signature tokens and remove X-Powered-By.",
                beforeCode="Server: Apache/2.4.52 (Ubuntu)\nX-Powered-By: Express",
                afterCode="# Nginx: server_tokens off;\n# Apache: ServerTokens Prod\n# Express: app.disable('x-powered-by')"
            ),
            fixSteps=[
                "In Nginx, set 'server_tokens off;'.",
                "In Apache, set 'ServerTokens Prod' and 'ServerSignature Off'.",
                "In Node/Express, call 'app.disable(\"x-powered-by\")'."
            ],
            limitations="Removing banners is defense-in-depth and does not replace regular software patching.",
            verification_status="unverified",
            status=FindingStatus.OPEN,
            source="native_scanner",
            references=["https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/01-Information_Gathering/02-Fingerprint_Web_Server"]
        ))

    # 7. Cookie Security Attributes (Secure, HttpOnly, SameSite)
    for cookie_header in response.headers.get_list("set-cookie"):
        cookie_lower = cookie_header.lower()
        cookie_name = cookie_header.split("=")[0].strip()
        missing_flags = []

        if "secure" not in cookie_lower:
            missing_flags.append("Secure")
        if "httponly" not in cookie_lower:
            missing_flags.append("HttpOnly")
        if "samesite" not in cookie_lower:
            missing_flags.append("SameSite")

        if missing_flags:
            findings.append(Finding(
                id=f"cookie-insecure-{cookie_name}",
                title=f"Cookie '{cookie_name}' Missing Security Flags",
                technicalName="Insecure Cookie Attributes",
                owasp_category="A07:2025 — Authentication Failures",
                severity=Severity.LOW if "session" not in cookie_name.lower() else Severity.MEDIUM,
                confidence=Confidence.HIGH,
                evidence_status=EvidenceStatus.CONFIRMED_OBSERVATION,
                score=4.0,
                endpoint=str(response.url),
                description=f"Cookie '{cookie_name}' was set without the following security attributes: {', '.join(missing_flags)}.",
                explanation="The 'HttpOnly' flag prevents JavaScript from stealing cookies via XSS. The 'Secure' flag ensures transmission only over HTTPS. The 'SameSite' flag mitigates CSRF.",
                impact="Cookie values may be accessed by client scripts or transmitted across unencrypted connections.",
                evidence=redact_sensitive_evidence(cookie_header),
                proof=f"Set-Cookie header observed for '{cookie_name}' lacking: {', '.join(missing_flags)}",
                recommendedFix=CodeDiff(
                    fileName="Cookie / Session Config",
                    explanation="Set Secure, HttpOnly, and SameSite=Lax/Strict on cookies.",
                    beforeCode=f"Set-Cookie: {cookie_name}=value; Path=/",
                    afterCode=f"Set-Cookie: {cookie_name}=value; Path=/; Secure; HttpOnly; SameSite=Lax"
                ),
                fixSteps=[
                    f"Update session cookie settings for '{cookie_name}' in framework configuration.",
                    "Ensure 'HttpOnly=True', 'Secure=True', and 'SameSite=\"Lax\"' or '\"Strict\"'."
                ],
                limitations="Non-sensitive preference cookies may not strictly require HttpOnly.",
                verification_status="unverified",
                status=FindingStatus.OPEN,
                source="native_scanner",
                references=["https://owasp.org/www-community/controls/SecureCookieAttribute"]
            ))

    return findings

