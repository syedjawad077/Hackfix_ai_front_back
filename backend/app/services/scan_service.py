import asyncio
from datetime import datetime
from typing import List, Optional
import httpx
from app.config import settings
from app.schemas import (
    ScanReport,
    Finding,
    ScanLogEntry,
    ScanStepperState,
    StepState,
    FindingStatus,
    RetestResponse,
)
from app.security.url_validation import validate_target_url
from app.storage.repository import ScanRepository
from app.scanners.headers_scanner import scan_security_headers
from app.scanners.tls_scanner import check_tls_and_transport
from app.scanners.exposure_scanner import scan_public_exposures
from app.scanners.crawl_scanner import crawl_and_inspect
from app.scanners.zap_scanner import run_zap_baseline
from app.services.findings_service import (
    deduplicate_findings,
    calculate_risk_score,
    get_risk_verdict,
    compute_owasp_coverage,
)
from app.services.gemini_service import gemini_service

class ScanService:
    @staticmethod
    def _now_str() -> str:
        return datetime.utcnow().strftime("%H:%M:%S")

    @classmethod
    async def run_scan_pipeline(cls, scan_id: str, target_url: str):
        """
        Executes the autonomous 4-step security pipeline:
        FIND -> PROVE -> FIX -> VERIFY
        """
        report = await ScanRepository.get_scan(scan_id)
        if not report:
            return

        report.status = "running"
        report.stepper.find = StepState.RUNNING
        report.logs.append(ScanLogEntry(
            id=f"log-{len(report.logs)+1}",
            timestamp=cls._now_str(),
            level="info",
            message=f"Autonomous pipeline initiated for {target_url}"
        ))
        await ScanRepository.update_scan(report)

        # 1. URL Safety and DNS Validation
        is_safe, error_msg, normalized_url = validate_target_url(target_url)
        if not is_safe or not normalized_url:
            report.status = "failed"
            report.stepper.find = StepState.DONE
            report.logs.append(ScanLogEntry(
                id=f"log-{len(report.logs)+1}",
                timestamp=cls._now_str(),
                level="warn",
                message=f"Scan aborted: {error_msg}"
            ))
            report.summaryMarkdown = f"Scan failed: {error_msg}"
            await ScanRepository.update_scan(report)
            return

        all_findings: List[Finding] = []
        all_limitations: List[str] = []

        # 2. Stage: FIND
        report.logs.append(ScanLogEntry(
            id=f"log-{len(report.logs)+1}",
            timestamp=cls._now_str(),
            level="info",
            message="FIND: Starting passive HTTP, TLS, and configuration analysis..."
        ))
        await ScanRepository.update_scan(report)

        try:
            async with httpx.AsyncClient(
                verify=True,
                follow_redirects=True,
                timeout=settings.REQUEST_TIMEOUT_SECONDS,
                headers={"User-Agent": "HackFix-AI-Security-Auditor/1.0"}
            ) as client:
                # Fetch root page
                try:
                    root_response = await client.get(normalized_url)
                except httpx.HTTPError as e:
                    report.status = "failed"
                    report.logs.append(ScanLogEntry(
                        id=f"log-{len(report.logs)+1}",
                        timestamp=cls._now_str(),
                        level="warn",
                        message=f"Target connection failed: {str(e)}"
                    ))
                    report.summaryMarkdown = f"Target could not be reached: {str(e)}"
                    await ScanRepository.update_scan(report)
                    return

                # A. Inspect HTTP Security Headers
                report.logs.append(ScanLogEntry(
                    id=f"log-{len(report.logs)+1}",
                    timestamp=cls._now_str(),
                    level="detail",
                    message="FIND: Evaluating HTTP security headers and cookie policies"
                ))
                header_findings = scan_security_headers(normalized_url, root_response)
                all_findings.extend(header_findings)

                # B. Inspect TLS & Transport
                report.logs.append(ScanLogEntry(
                    id=f"log-{len(report.logs)+1}",
                    timestamp=cls._now_str(),
                    level="detail",
                    message="FIND: Inspecting TLS certificate and HTTPS enforcement"
                ))
                tls_findings, tls_limits = check_tls_and_transport(normalized_url, root_response)
                all_findings.extend(tls_findings)
                all_limitations.extend(tls_limits)

                # C. Public Sensitive Resources Exposure Checks
                report.logs.append(ScanLogEntry(
                    id=f"log-{len(report.logs)+1}",
                    timestamp=cls._now_str(),
                    level="detail",
                    message="FIND: Probing for publicly exposed configuration endpoints"
                ))
                exposure_findings = await scan_public_exposures(normalized_url, client)
                all_findings.extend(exposure_findings)

                # D. Same-Origin Crawler & Error Disclosure
                report.logs.append(ScanLogEntry(
                    id=f"log-{len(report.logs)+1}",
                    timestamp=cls._now_str(),
                    level="detail",
                    message=f"FIND: Running limited same-origin crawler (max {settings.MAX_CRAWL_PAGES} pages)"
                ))
                discovered_urls, crawl_findings, crawl_limits = await crawl_and_inspect(
                    normalized_url, client, max_pages=settings.MAX_CRAWL_PAGES, max_depth=settings.MAX_CRAWL_DEPTH
                )
                all_findings.extend(crawl_findings)
                all_limitations.extend(crawl_limits)

                # E. OWASP ZAP Baseline (if enabled)
                zap_findings, did_run, zap_msg = await run_zap_baseline(normalized_url)
                if did_run:
                    all_findings.extend(zap_findings)
                report.logs.append(ScanLogEntry(
                    id=f"log-{len(report.logs)+1}",
                    timestamp=cls._now_str(),
                    level="detail",
                    message=f"FIND (ZAP): {zap_msg}"
                ))

        except Exception as e:
            all_limitations.append(f"Network error during scanning: {str(e)}")

        report.stepper.find = StepState.DONE

        # 3. Stage: PROVE
        report.stepper.prove = StepState.RUNNING
        report.logs.append(ScanLogEntry(
            id=f"log-{len(report.logs)+1}",
            timestamp=cls._now_str(),
            level="info",
            message="PROVE: Normalizing findings and validating evidence proofs..."
        ))
        await ScanRepository.update_scan(report)

        deduped = deduplicate_findings(all_findings)
        risk_score = calculate_risk_score(deduped)
        verdict = get_risk_verdict(risk_score, deduped)
        owasp_coverage = compute_owasp_coverage(deduped)

        report.findings = deduped
        report.riskScore = risk_score
        report.verdict = verdict
        report.owasp_coverage = owasp_coverage
        report.stepper.prove = StepState.DONE

        # 4. Stage: FIX
        report.stepper.fix = StepState.RUNNING
        report.logs.append(ScanLogEntry(
            id=f"log-{len(report.logs)+1}",
            timestamp=cls._now_str(),
            level="info",
            message="FIX: Synthesizing advisory remediation diffs and AI explanations..."
        ))
        await ScanRepository.update_scan(report)

        # Enhance with Gemini if available
        report.findings = await gemini_service.enhance_finding_explanations(report.findings)
        report.stepper.fix = StepState.DONE

        # 5. Stage: VERIFY
        report.stepper.verify = StepState.DONE
        report.status = "completed"
        report.limitations = all_limitations
        report.summaryMarkdown = (
            f"Security assessment complete for **{normalized_url}**.\n\n"
            f"Identified **{len(report.findings)} issues** with an overall estimated risk score of **{report.riskScore}/100**.\n\n"
            f"{verdict}\n\n"
            "*(This is an external URL-based security assessment and does not constitute full verification of all application logic.)*"
        )
        report.logs.append(ScanLogEntry(
            id=f"log-{len(report.logs)+1}",
            timestamp=cls._now_str(),
            level="success",
            message=f"VERIFY: Assessment completed. {len(report.findings)} findings documented."
        ))

        await ScanRepository.update_scan(report)

    @classmethod
    async def retest_finding(cls, scan_id: str, finding_id: str) -> RetestResponse:
        """
        Retests a specific finding by re-running its observation check against the target.
        """
        report = await ScanRepository.get_scan(scan_id)
        now_time = datetime.utcnow().strftime("%H:%M:%S")

        if not report:
            return RetestResponse(
                finding_id=finding_id,
                status="not_verified",
                verifiedAt=now_time,
                note="Scan report not found in storage."
            )

        target_finding = next((f for f in report.findings if f.id == finding_id), None)
        if not target_finding:
            return RetestResponse(
                finding_id=finding_id,
                status="not_verified",
                verifiedAt=now_time,
                note=f"Finding ID '{finding_id}' not found in scan."
            )

        # Execute genuine verification check
        is_fixed = False
        retest_note = ""

        try:
            async with httpx.AsyncClient(
                verify=True,
                follow_redirects=True,
                timeout=settings.REQUEST_TIMEOUT_SECONDS
            ) as client:
                res = await client.get(report.targetUrl)

                if "hdr-csp" in finding_id:
                    if res.headers.get("content-security-policy"):
                        is_fixed = True
                        retest_note = "Content-Security-Policy header is now present."
                    else:
                        retest_note = "Content-Security-Policy header is still missing."

                elif "hdr-hsts" in finding_id:
                    if res.headers.get("strict-transport-security"):
                        is_fixed = True
                        retest_note = "Strict-Transport-Security header is now present."
                    else:
                        retest_note = "Strict-Transport-Security header is still missing."

                elif "hdr-xcto" in finding_id:
                    if "nosniff" in res.headers.get("x-content-type-options", "").lower():
                        is_fixed = True
                        retest_note = "X-Content-Type-Options: nosniff is now present."
                    else:
                        retest_note = "X-Content-Type-Options header is still missing or weak."

                elif "hdr-xfo" in finding_id:
                    if res.headers.get("x-frame-options") or "frame-ancestors" in res.headers.get("content-security-policy", "").lower():
                        is_fixed = True
                        retest_note = "Clickjacking framing protection is now configured."
                    else:
                        retest_note = "X-Frame-Options or frame-ancestors is still missing."

                elif "exp-" in finding_id:
                    # Check if exposed resource was secured
                    probe_url = target_finding.endpoint
                    probe_res = await client.get(probe_url, timeout=5.0)
                    if probe_res.status_code in (403, 404):
                        is_fixed = True
                        retest_note = f"Exposed resource at {probe_url} now returns HTTP {probe_res.status_code}."
                    else:
                        retest_note = f"Resource still accessible with HTTP {probe_res.status_code}."

                else:
                    # Generic header / policy check
                    is_fixed = False
                    retest_note = "Retest check did not detect confirmation of patch."

        except Exception as e:
            return RetestResponse(
                finding_id=finding_id,
                status="not_verified",
                verifiedAt=now_time,
                note=f"Retest probe connection failed: {str(e)}"
            )

        if is_fixed:
            target_finding.status = FindingStatus.VERIFIED_FIXED
            target_finding.verification_status = "verified_fixed"
            target_finding.verifiedAt = now_time
            # Recalculate score
            report.riskScore = calculate_risk_score(report.findings)
            report.verdict = get_risk_verdict(report.riskScore, report.findings)
            report.logs.append(ScanLogEntry(
                id=f"log-{len(report.logs)+1}",
                timestamp=now_time,
                level="success",
                message=f"VERIFY: Finding '{target_finding.title}' verified fixed ({retest_note})"
            ))
            await ScanRepository.update_scan(report)
            return RetestResponse(
                finding_id=finding_id,
                status="verified_fixed",
                verifiedAt=now_time,
                note=retest_note
            )
        else:
            return RetestResponse(
                finding_id=finding_id,
                status="not_verified",
                verifiedAt=now_time,
                note=retest_note
            )

scan_service = ScanService()

