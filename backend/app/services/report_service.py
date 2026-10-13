import io
from app.schemas import ScanReport

def generate_pdf_report(report: ScanReport) -> bytes:
    """
    Generates a genuine downloadable PDF report using ReportLab.
    """
    from reportlab.lib.pagesizes import letter
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib import colors

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0F2A5C')
    )
    subtitle_style = ParagraphStyle(
        'DocSub',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#51627A')
    )
    heading_style = ParagraphStyle(
        'SecHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=colors.HexColor('#0B1F3A')
    )
    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#0B1F3A')
    )
    code_style = ParagraphStyle(
        'Code',
        parent=styles['Code'],
        fontName='Courier',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#0F2A5C')
    )

    story = []

    # Title & Header
    story.append(Paragraph("HackFix AI — Website Security Assessment Report", title_style))
    story.append(Spacer(1, 4))
    story.append(Paragraph(f"Target URL: {report.targetUrl} | Scan ID: {report.id} | Generated: {report.createdAt}", subtitle_style))
    story.append(Spacer(1, 12))

    # Executive Summary Box
    summary_data = [
        [
            Paragraph("<b>Overall Estimated Risk Score:</b>", body_style),
            Paragraph(f"<b>{report.riskScore} / 100</b>", body_style)
        ],
        [
            Paragraph("<b>Total Issues Detected:</b>", body_style),
            Paragraph(f"{len(report.findings)} issues", body_style)
        ],
        [
            Paragraph("<b>Assessment Verdict:</b>", body_style),
            Paragraph(report.verdict, body_style)
        ]
    ]
    t = Table(summary_data, colWidths=[200, 340])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F4F7FB')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#D9E2F0')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#D9E2F0')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('TOPPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t)
    story.append(Spacer(1, 16))

    # Findings Section
    story.append(Paragraph("Detailed Security Findings", heading_style))
    story.append(Spacer(1, 8))

    if not report.findings:
        story.append(Paragraph("No vulnerabilities detected for the evaluated baseline checks.", body_style))
    else:
        for idx, f in enumerate(report.findings, start=1):
            sev_color = "#991B1B" if f.severity.value == "critical" else ("#C2410C" if f.severity.value == "high" else "#2563EB")
            status_text = "[VERIFIED FIXED]" if f.status.value == "verified_fixed" else "[OPEN]"

            story.append(Paragraph(
                f"<b>{idx}. {f.title}</b> &nbsp;&nbsp;<font color='{sev_color}'><b>[{f.severity.value.upper()}]</b></font> &nbsp;&nbsp;<b>{status_text}</b>",
                body_style
            ))
            story.append(Spacer(1, 3))
            story.append(Paragraph(f"<b>OWASP Category:</b> {f.owasp_category} | <b>Endpoint:</b> {f.endpoint}", subtitle_style))
            story.append(Spacer(1, 3))
            story.append(Paragraph(f"<b>Explanation:</b> {f.explanation}", body_style))
            story.append(Spacer(1, 2))
            story.append(Paragraph(f"<b>Proof:</b> {f.proof}", subtitle_style))
            story.append(Spacer(1, 2))
            if f.recommendedFix.afterCode:
                story.append(Paragraph(f"<b>Advisory Fix:</b><br/>{f.recommendedFix.afterCode[:350]}", code_style))
            story.append(Spacer(1, 10))

    # Limitations & Disclaimer
    story.append(Spacer(1, 10))
    story.append(Paragraph("Assessment Limitations & Responsible Disclosure", heading_style))
    story.append(Spacer(1, 4))
    disclaimer_text = (
        "This security assessment was conducted using non-destructive, external URL inspection and passive baseline checks. "
        "It does not assess internal source code logic, authenticated business workflows, database encryption, or supply chain dependencies. "
        "Remediations provided are strictly advisory suggestions requiring manual developer review."
    )
    story.append(Paragraph(disclaimer_text, subtitle_style))

    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes

def generate_markdown_report(report: ScanReport) -> str:
    """
    Generates a structured Markdown security report for export or copying.
    """
    findings_md = ""
    for idx, f in enumerate(report.findings, start=1):
        status_tag = " [VERIFIED FIXED]" if f.status.value == "verified_fixed" else ""
        findings_md += f"""### {idx}. {f.title} ({f.severity.value.upper()}){status_tag}
- **OWASP Category:** {f.owasp_category}
- **Affected Endpoint:** `{f.endpoint}`
- **Estimated Score:** {f.score}/10
- **Explanation:** {f.explanation}
- **Proof:** {f.proof}

**Advisory Remediation:**
{f.recommendedFix.explanation}
```
{f.recommendedFix.afterCode}
```

---
"""

    owasp_rows = "\n".join([
        f"| {cat} | `{ass.status.value}` | {ass.checks_performed[:80]}... |"
        for cat, ass in report.owasp_coverage.items()
    ])

    return f"""# HackFix AI — Website Security Audit Report

- **Target URL:** {report.targetUrl}
- **Scan ID:** `{report.id}`
- **Execution Date:** {report.createdAt}
- **Overall Exposure Score:** **{report.riskScore}/100**
- **Assessment Verdict:** {report.verdict}
- **Findings Count:** {len(report.findings)}

---

## OWASP Top 10:2025 Coverage Assessment

| Category | Assessment Status | Checks Performed |
|---|---|---|
{owasp_rows}

---

## Detailed Findings & Evidence

{findings_md if findings_md else "No baseline security weaknesses detected."}

## Scan Limitations & Advisory Disclaimer

This security assessment was conducted using non-destructive, external URL inspection and passive baseline checks. It does not assess internal source code logic, authenticated business workflows, database encryption, or supply chain dependencies. Remediations provided are strictly advisory suggestions requiring manual developer review.
"""

