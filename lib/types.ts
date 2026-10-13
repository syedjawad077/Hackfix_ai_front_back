export type Severity = 'critical' | 'high' | 'medium' | 'low';

export type FindingStatus = 'open' | 'retesting' | 'verified_fixed';

export interface CodeDiff {
  fileName: string;
  beforeCode: string;
  afterCode: string;
  explanation: string;
}

export interface Finding {
  id: string;
  title: string; // Plain title, e.g. "Anyone can read other users' private documents"
  technicalName?: string; // Optional technical term, e.g. "Broken Object-Level Authorization (BOLA/IDOR)"
  severity: Severity;
  score: number; // CVSS 0.0 - 10.0
  endpoint?: string;
  file?: string;
  explanation: string; // "What this means" (1 to 2 simple sentences)
  proof: string; // "How we proved it" (short, safe description)
  recommendedFix: CodeDiff; // "How to fix it" (simple steps + code block with before/after and copy button)
  fixSteps?: string[];
  status: FindingStatus;
  verifiedAt?: string;
  termHelp?: {
    term: string;
    explanation: string;
  };
}

export type ScanStep = 'find' | 'prove' | 'fix' | 'verify';
export type StepState = 'pending' | 'running' | 'done';

export interface ScanStepperState {
  find: StepState;
  prove: StepState;
  fix: StepState;
  verify: StepState;
}

export interface ScanLogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'success' | 'detail';
  message: string;
}

export interface ScanReport {
  id: string;
  targetUrl: string;
  hasSourceZip: boolean;
  zipFileName?: string;
  zipFileSize?: number;
  ownershipVerified: boolean;
  stepper: ScanStepperState;
  logs: ScanLogEntry[];
  riskScore: number; // 0-100 (where 100 is healthy or risk score)
  verdict: string; // "Your app has 3 serious problems to fix"
  findings: Finding[];
  status: 'idle' | 'running' | 'completed' | 'failed';
  summaryMarkdown: string;
  createdAt: string;
}

export interface PastScanSummary {
  id: string;
  name: string;
  targetUrl: string;
  date: string;
  riskScore: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  report: ScanReport;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  scanReport?: ScanReport;
  quickReplies?: string[];
  codeBlocks?: { language: string; code: string; title?: string }[];
  contextFindingId?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  targetUrl?: string;
  updatedAt: string;
  group: 'today' | 'yesterday' | 'previous_7_days';
  messages: ChatMessage[];
  activeScanId?: string;
  ownershipVerified?: boolean;
}

export interface ToastMessage {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string;
}
