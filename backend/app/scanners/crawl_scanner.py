import re
import urllib.parse
from typing import List, Set, Tuple
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
from app.security.network_safety import redact_sensitive_evidence
from app.security.url_validation import validate_target_url

# Regex to discover links in HTML
HREF_PATTERN = re.compile(r"""href=["']([^"']+)["']""", re.IGNORECASE)

# Signatures for verbose error and stack trace disclosures
STACK_TRACE_PATTERNS = [
    (re.compile(r"Traceback \(most recent call last\):", re.IGNORECASE), "Python Traceback"),
    (re.compile(r"(?:Fatal error|Parse error):\s+.*in\s+.*\.php\s+on\s+line\s+\d+", re.IGNORECASE), "PHP Fatal Error"),
    (re.compile(r"TypeError:\s+.*\n\s+at\s+.*:\d+:\d+", re.IGNORECASE), "Node.js Stack Trace"),
    (re.compile(r"org\.springframework\..*Exception", re.IGNORECASE), "Java Spring Exception"),
    (re.compile(r"Microsoft OLE DB Provider for SQL Server|SQLSTATE\[[0-9A-Z]{5}\]", re.IGNORECASE), "Database SQL Error"),
    (re.compile(r"Django Version:.*Python Version:.*Traceback:", re.DOTALL | re.IGNORECASE), "Django Debug Page"),
]

async def crawl_and_inspect(
    start_url: str,
    client: httpx.AsyncClient,
    max_pages: int = settings.MAX_CRAWL_PAGES,
    max_depth: int = settings.MAX_CRAWL_DEPTH
) -> Tuple[List[str], List[Finding], List[str]]:
    """
    Crawls same-origin pages up to max_pages and max_depth using safe GET requests.
    Inspects response content for error disclosures and sensitive information.
    """
    findings: List[Finding] = []
    limitations: List[str] = []
    visited: Set[str] = set()
    to_visit: List[Tuple[str, int]] = [(start_url, 0)]

    parsed_start = urllib.parse.urlparse(start_url)
    origin_host = parsed_start.hostname.lower() if parsed_start.hostname else ""

    while to_visit and len(visited) < max_pages:
        current_url, depth = to_visit.pop(0)

        # Normalize & deduplicate
        is_safe, _, normalized = validate_target_url(current_url)
        if not is_safe or not normalized or normalized in visited:
            continue

        parsed_curr = urllib.parse.urlparse(normalized)
        if not parsed_curr.hostname or parsed_curr.hostname.lower() != origin_host:
            # Stay within strict same-origin
            continue

        visited.add(normalized)

        try:
            response = await client.get(normalized, timeout=settings.REQUEST_TIMEOUT_SECONDS)
        except Exception:
            continue

        # Check for Stack Trace / Debug Information Disclosure (A10:2025 — Mishandling of Exceptional Conditions)
        body_text = response.text[:8192]
        for pattern, tech_label in STACK_TRACE_PATTERNS:
            match = pattern.search(body_text)
            if match:
                snippet = match.group(0)
                findings.append(Finding(
                    id=f"err-disclosure-{len(findings)+1}",
                    title=f"Detailed Error and Stack Trace Disclosure ({tech_label})",
                    technicalName="Verbose Error Message / Exception Disclosure",
                    owasp_category="A10:2025 — Mishandling of Exceptional Conditions",
                    severity=Severity.MEDIUM,
                    confidence=Confidence.HIGH,
                    evidence_status=EvidenceStatus.CONFIRMED_OBSERVATION,
                    score=5.8,
                    endpoint=normalized,
                    description=f"The application returned an unhandled exception or debug trace containing {tech_label}.",
                    explanation="Detailed error messages expose internal server file paths, framework versions, and code structure.",
                    impact="Reveals implementation details that help attackers formulate precise exploits.",
                    evidence=redact_sensitive_evidence(snippet[:300]),
                    proof=f"Response at {normalized} contained pattern matching '{tech_label}'.",
                    recommendedFix=CodeDiff(
                        fileName="Framework Error Handler Config",
                        explanation="Disable debug mode and configure a generic custom error page.",
                        beforeCode="# Debug mode enabled\nDEBUG = True",
                        afterCode="# Debug mode disabled; custom error handler enabled\nDEBUG = False"
                    ),
                    fixSteps=[
                        "Disable debug mode (e.g. DEBUG = False) in production.",
                        "Configure generic 500 error pages so internal exceptions are logged privately, not sent to users."
                    ],
                    limitations="Evaluated observable response bodies during crawl.",
                    verification_status="unverified",
                    status=FindingStatus.OPEN,
                    source="native_scanner",
                    references=["https://owasp.org/Top10/A10_2025-Mishandling_of_Exceptional_Conditions/"]
                ))
                break  # Record one disclosure per page

        # If below max depth, extract links from HTML
        if depth < max_depth and "html" in response.headers.get("content-type", "").lower():
            links = HREF_PATTERN.findall(body_text)
            for link in links:
                if link.startswith(("#", "javascript:", "mailto:", "tel:")):
                    continue
                full_link = urllib.parse.urljoin(normalized, link)
                # Keep strictly on same origin
                parsed_link = urllib.parse.urlparse(full_link)
                if parsed_link.hostname and parsed_link.hostname.lower() == origin_host:
                    clean_link = urllib.parse.urlunparse((
                        parsed_link.scheme,
                        parsed_link.netloc.lower(),
                        parsed_link.path,
                        "",
                        parsed_link.query,
                        ""
                    ))
                    if clean_link not in visited and clean_link not in [item[0] for item in to_visit]:
                        to_visit.append((clean_link, depth + 1))

    if len(visited) >= max_pages:
        limitations.append(f"Crawl bounded at {max_pages} pages to prevent server load.")

    return list(visited), findings, limitations

