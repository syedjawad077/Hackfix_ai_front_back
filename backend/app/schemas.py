from enum import Enum
from typing import Dict, List, Optional
from pydantic import BaseModel, Field

class Severity(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFORMATIONAL = "informational"

class Confidence(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class EvidenceStatus(str, Enum):
    CONFIRMED_OBSERVATION = "confirmed_observation"
    SUSPECTED = "suspected"
    MANUAL_REVIEW_REQUIRED = "manual_review_required"

class FindingStatus(str, Enum):
    OPEN = "open"
    RETESTING = "retesting"
    VERIFIED_FIXED = "verified_fixed"

class StepState(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    DONE = "done"

class CategoryAssessmentStatus(str, Enum):
    FINDINGS_PRESENT = "findings_present"
    NO_FINDINGS_DETECTED = "no_findings_detected"
    ASSESSMENT_LIMITED = "assessment_limited"
    NOT_ASSESSED = "not_assessed"

class CodeDiff(BaseModel):
    fileName: str = ""
    beforeCode: str = ""
    afterCode: str = ""
    explanation: str = ""

class Finding(BaseModel):
    id: str
    title: str
    technicalName: Optional[str] = None
    owasp_category: str = "A05:2021-Security Misconfiguration"
    category: Optional[str] = None
    severity: Severity = Severity.MEDIUM

    confidence: Confidence = Confidence.HIGH
    evidence_status: EvidenceStatus = EvidenceStatus.CONFIRMED_OBSERVATION
    score: float = Field(default=5.0, description="Estimated severity score 0.0-10.0 (internal estimate, not official CVSS)")
    endpoint: str = ""
    file: Optional[str] = None
    description: str = ""
    explanation: str = ""
    impact: str = ""
    evidence: str = ""
    proof: str = ""
    recommendedFix: CodeDiff = Field(default_factory=CodeDiff)
    fixSteps: List[str] = Field(default_factory=list)
    limitations: Optional[str] = None
    verification_status: str = "unverified"
    status: FindingStatus = FindingStatus.OPEN
    source: str = "native_scanner"
    references: List[str] = Field(default_factory=list)
    verifiedAt: Optional[str] = None

class OWASPCategoryAssessment(BaseModel):
    category: str
    status: CategoryAssessmentStatus
    checks_performed: str
    blind_spots: str

class ScanStepperState(BaseModel):
    find: StepState = StepState.PENDING
    prove: StepState = StepState.PENDING
    fix: StepState = StepState.PENDING
    verify: StepState = StepState.PENDING

class ScanLogEntry(BaseModel):
    id: str
    timestamp: str
    level: str = "info"  # info, warn, success, detail
    message: str

class ScanReport(BaseModel):
    id: str
    targetUrl: str
    hasSourceZip: bool = False
    zipFileName: Optional[str] = None
    zipFileSize: Optional[int] = None
    githubRepo: Optional[str] = None
    ownershipVerified: bool = True
    stepper: ScanStepperState = Field(default_factory=ScanStepperState)
    logs: List[ScanLogEntry] = Field(default_factory=list)
    riskScore: int = 0  # 0-100 where higher indicates greater vulnerability exposure
    verdict: str = ""
    findings: List[Finding] = Field(default_factory=list)
    owasp_coverage: Dict[str, OWASPCategoryAssessment] = Field(default_factory=dict)
    status: str = "queued"  # queued, running, completed, failed
    summaryMarkdown: str = ""
    createdAt: str = ""
    limitations: List[str] = Field(default_factory=list)

class ScanCreateRequest(BaseModel):
    target_url: str
    ownership_verified: bool
    prompt: Optional[str] = None
    github_repo: Optional[str] = None

class ChatRequest(BaseModel):
    sessionId: Optional[str] = None
    scanId: Optional[str] = None
    message: str
    findingId: Optional[str] = None

class ChatResponse(BaseModel):
    reply: str
    quickReplies: List[str] = Field(default_factory=list)

class RetestRequest(BaseModel):
    finding_id: str

class RetestResponse(BaseModel):
    finding_id: str
    status: str  # verified_fixed or not_verified
    verifiedAt: str
    note: str

class HealthResponse(BaseModel):
    status: str
    version: str
    gemini_enabled: bool
    zap_enabled: bool
    db_connected: bool

class AttackSimulationStage(BaseModel):
    stepNumber: int
    phase: str  # "1. External Reconnaissance", "2. Vector Exploitation", "3. Executive Business Impact", "4. Defensive Shield"
    title: str
    narrative: str
    affectedAsset: str
    businessImpact: str
    mitigation: str
    status: str = "simulated_risk"  # "simulated_risk" or "blocked_by_patch"
    
    # Feature 2: MITRE ATT&CK Mapping
    mitreTechniqueId: Optional[str] = None  # e.g. "T1189", "T1557.002", "T1552.001"
    mitreTechniqueName: Optional[str] = None  # e.g. "Drive-by Compromise", "Adversary-in-the-Middle"
    mitreTactic: Optional[str] = None  # e.g. "Initial Access", "Credential Access", "Impact"
    
    # Feature 4: Dual Perspective (Red Team Probe vs Blue Team Detection Log Signature)
    adversaryPayload: Optional[str] = None  # Educational non-destructive request or curl probe
    detectionLogSignature: Optional[str] = None  # SIEM / WAF / Server access log pattern

    # Feature 5: What-If defense mapping
    blockedByDefense: Optional[str] = None  # Name of defensive control that severs this stage

class AttackSimulationRequest(BaseModel):
    scanId: Optional[str] = None
    targetUrl: Optional[str] = None
    githubRepo: Optional[str] = None
    findings: Optional[List[Finding]] = None
    appliedDefenses: Optional[List[str]] = Field(default_factory=list)

class AttackSimulationResponse(BaseModel):
    scanId: str
    targetUrl: str
    riskLevel: str  # "Critical", "High", "Moderate", "Low"
    executiveSummary: str
    stages: List[AttackSimulationStage]
    boardroomTakeaway: str

    # Feature 1: Sector & Industry Context
    industrySector: Optional[str] = "Web Application & Cloud Services"
    complianceImpact: Optional[List[str]] = Field(default_factory=list)

    # Feature 3: Vulnerability Chaining Catalyst
    chainabilityScore: int = 70
    chainabilityVerdict: Optional[str] = ""
    chainCatalysts: Optional[List[str]] = Field(default_factory=list)

    # Feature 5: Interactive What-If Defense Severance state
    severedAtStage: Optional[int] = None
    severancePercentage: Optional[int] = 0
    availableDefenses: Optional[List[str]] = Field(default_factory=list)

