from typing import List, Dict
from app.schemas import (
    Finding,
    Severity,
    OWASPCategoryAssessment,
    CategoryAssessmentStatus,
)

OWASP_2025_CATEGORIES = [
    ("A01:2025 — Broken Access Control", "Checks performed on public endpoints, dotfiles (.git, .env), and sensitive exposed resources.", "Cannot assess server-side role boundaries or business-logic authorization without multi-user credentials."),
    ("A02:2025 — Security Misconfiguration", "Evaluated HTTP security headers (CSP, HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy), server version disclosure, and debug error pages.", "Internal web server configuration files and private reverse proxy rules are not directly readable."),
    ("A03:2025 — Software Supply Chain Failures", "Limited to observable client-side third-party library signatures.", "Website-only scans cannot inspect lockfiles, package dependencies, or build CI/CD pipelines."),
    ("A04:2025 — Cryptographic Failures", "Evaluated HTTPS enforcement, TLS certificate validity, expiration, cleartext transmission, and cookie transmission encryption.", "Cannot inspect database-at-rest encryption or internal microservice transport security."),
    ("A05:2025 — Injection", "Passive analysis of observed inputs, forms, and parameter reflections without aggressive attack payloads.", "Active SQL, Command, and LDAP injection attacks are intentionally not performed to protect target stability."),
    ("A06:2025 — Insecure Design", "Limited architectural assessment based on observable response headers and transport flows.", "Comprehensive design flaw evaluation requires threat modeling and architecture documentation."),
    ("A07:2025 — Authentication Failures", "Checked cookie security attributes (HttpOnly, Secure, SameSite) and login page transport.", "Credential brute forcing, credential stuffing, and session fixation tests are not performed."),
    ("A08:2025 — Software or Data Integrity Failures", "Checked for Subresource Integrity (SRI) on observable third-party scripts.", "Cannot verify application code signing, deserialization safety, or server pipeline integrity from an external URL."),
    ("A09:2025 — Security Logging & Alerting Failures", "Not assessed from an external URL scan.", "External URL scanners cannot verify internal SIEM, audit log retention, or SOC alerting effectiveness."),
    ("A10:2025 — Mishandling of Exceptional Conditions", "Checked observable response codes, stack traces, and verbose error messages during crawling.", "Cannot force internal edge-case exceptions that require deep authenticated state."),
]

def deduplicate_findings(findings: List[Finding]) -> List[Finding]:
    """
    Deduplicates overlapping findings (e.g. if both native and ZAP flag missing CSP).
    """
    seen_titles = set()
    deduped = []
    for f in findings:
        key = f.title.lower().strip()
        if key in seen_titles:
            continue
        seen_titles.add(key)
        deduped.append(f)
    return deduped

def calculate_risk_score(findings: List[Finding]) -> int:
    """
    Calculates an estimated risk score between 0 and 100 based on weighted finding counts.
    Documented weighted methodology:
    - Critical: 25 pts each
    - High:     15 pts each
    - Medium:    8 pts each
    - Low:       3 pts each
    - Info:      0 pts
    """
    score = 0
    for f in findings:
        if f.status == "verified_fixed":
            continue
        if f.severity == Severity.CRITICAL:
            score += 25
        elif f.severity == Severity.HIGH:
            score += 15
        elif f.severity == Severity.MEDIUM:
            score += 8
        elif f.severity == Severity.LOW:
            score += 3

    return min(100, max(0, score))

def get_risk_verdict(score: int, findings: List[Finding]) -> str:
    active_count = len([f for f in findings if f.status != "verified_fixed"])
    if score >= 70:
        return f"High exposure risk: {active_count} security issues identified that require prompt attention."
    elif score >= 40:
        return f"Moderate exposure risk: {active_count} security weaknesses identified."
    elif score > 0:
        return f"Low exposure risk: {active_count} minor configuration improvements recommended."
    return "Clean baseline: No security weaknesses detected during current URL assessment."

def compute_owasp_coverage(findings: List[Finding]) -> Dict[str, OWASPCategoryAssessment]:
    """
    Computes an honest assessment status for each of the OWASP Top 10:2025 categories.
    """
    active_categories = {f.owasp_category.split("—")[0].strip(): f for f in findings if f.status != "verified_fixed"}
    coverage: Dict[str, OWASPCategoryAssessment] = {}

    for cat_name, checks, blind_spots in OWASP_2025_CATEGORIES:
        prefix = cat_name.split("—")[0].strip()

        if prefix in active_categories:
            status = CategoryAssessmentStatus.FINDINGS_PRESENT
        elif prefix in ("A02:2025", "A04:2025", "A10:2025"):
            status = CategoryAssessmentStatus.NO_FINDINGS_DETECTED
        elif prefix in ("A01:2025", "A05:2025", "A07:2025"):
            status = CategoryAssessmentStatus.ASSESSMENT_LIMITED
        else:
            status = CategoryAssessmentStatus.NOT_ASSESSED

        coverage[cat_name] = OWASPCategoryAssessment(
            category=cat_name,
            status=status,
            checks_performed=checks,
            blind_spots=blind_spots
        )

    return coverage