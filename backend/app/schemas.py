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
    owasp_category: str
    severity: Severity
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

