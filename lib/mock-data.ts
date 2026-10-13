import { ChatSession, Finding, PastScanSummary, ScanLogEntry, ScanReport } from "./types";

export const initialFindings: Finding[] = [
  {
    id: "vuln-01",
    title: "Attackers can bypass your login without a password",
    technicalName: "SQL Injection in User Authentication Endpoint",
    severity: "critical",
    score: 9.8,
    endpoint: "POST /api/v1/auth/login",
    file: "backend/app/auth/routes.py:42",
    explanation:
      "Your login screen doesn't check typed input safely before passing it to the database. An attacker can type a trick phrase into the username box and log right into the administrator account without knowing the password.",
    proof:
      "We sent a harmless test query (admin' OR '1'='1' --) to the login form. The server accepted it and returned an administrative session token.",
    fixSteps: [
      "Open backend/app/auth/routes.py at line 42.",
      "Replace raw string formatting with parameterized query bindings (:username and :hash).",
      "Verify that login attempts with special characters are safely treated as plain text.",
    ],
    recommendedFix: {
      fileName: "backend/app/auth/routes.py",
      explanation:
        "Replace raw formatted SQL strings with query parameters. The database will treat user input strictly as text, making injection impossible.",
      beforeCode: `# VULNERABLE: Direct string formatting into raw SQL
query = f"SELECT id, username, role FROM users WHERE username = '{username}' AND password_hash = '{hashed_password}'"
result = db.execute(text(query)).fetchone()`,
      afterCode: `# SECURE: Parameterized query using query bindings
query = text("SELECT id, username, role FROM users WHERE username = :username AND password_hash = :hash")
result = db.execute(query, {"username": username, "hash": hashed_password}).fetchone()`,
    },
    termHelp: {
      term: "SQL Injection",
      explanation:
        "When an app directly glues user text into database commands, allowing hackers to manipulate what the database does.",
    },
    status: "open",
  },
  {
    id: "vuln-02",
    title: "Anyone can read other users' private documents",
    technicalName: "Broken Object-Level Authorization (IDOR / BOLA)",
    severity: "high",
    score: 8.5,
    endpoint: "GET /api/v1/documents/{document_id}",
    file: "backend/app/documents/service.py:78",
    explanation:
      "When a user requests a document, your server checks the document ID but fails to verify if that document belongs to them. A logged-in user can change the number in the web address to view another company's private files.",
    proof:
      "Using a test account (User ID 104), we requested document ID 892 belonging to an unrelated organization. The server responded with the confidential document instead of blocking access.",
    fixSteps: [
      "Open backend/app/documents/service.py at line 78.",
      "Add an ownership filter so queries only return documents matching the logged-in user's account ID.",
      "Return a 403 Forbidden or 404 Not Found error if the document belongs to someone else.",
    ],
    recommendedFix: {
      fileName: "backend/app/documents/service.py",
      explanation:
        "Scope every document lookup by the authenticated user's organization ID so no user can access another company's records.",
      beforeCode: `# VULNERABLE: Direct lookup by ID without ownership check
def get_document(db: Session, doc_id: int):
    return db.query(Document).filter(Document.id == doc_id).first()`,
      afterCode: `# SECURE: Query scoped to the user's authorized account
def get_document(db: Session, doc_id: int, current_user: User):
    return db.query(Document).filter(
        Document.id == doc_id,
        Document.tenant_id == current_user.tenant_id
    ).first()`,
    },
    termHelp: {
      term: "BOLA / IDOR",
      explanation:
        "When an app forgets to check if the person asking for a file or record actually has permission to see it.",
    },
    status: "open",
  },
  {
    id: "vuln-03",
    title: "Your server can be tricked into exposing internal cloud files",
    technicalName: "Server-Side Request Forgery (SSRF)",
    severity: "medium",
    score: 6.5,
    endpoint: "POST /api/v1/integrations/webhook-test",
    file: "backend/app/integrations/dispatcher.py:31",
    explanation:
      "Your webhook tester lets users enter any URL for your server to contact. Without safety restrictions, someone could enter private internal cloud addresses (like 169.254.169.254) to access secret keys and internal server configurations.",
    proof:
      "We requested the webhook tester to contact internal cloud metadata. The server made the request instead of rejecting it as an internal address.",
    fixSteps: [
      "Open backend/app/integrations/dispatcher.py at line 31.",
      "Validate the web address to block private local networks (like 127.0.0.1 and 169.254.169.254).",
      "Only permit outbound requests to public https:// web addresses.",
    ],
    recommendedFix: {
      fileName: "backend/app/integrations/dispatcher.py",
      explanation:
        "Enforce HTTPS and block private or link-local IP addresses before making any outbound web request.",
      beforeCode: `# VULNERABLE: Direct outbound request to any unverified URL
def dispatch_test_hook(url: str, payload: dict):
    return requests.post(url, json=payload, timeout=5)`,
      afterCode: `# SECURE: Enforce HTTPS and block private/link-local IP addresses
def dispatch_test_hook(url: str, payload: dict):
    validate_public_url(url) # Blocks private IPs & requires HTTPS
    return requests.post(url, json=payload, timeout=5, allow_redirects=False)`,
    },
    termHelp: {
      term: "SSRF",
      explanation:
        "When an attacker tricks a web server into making network requests to private internal systems behind the firewall.",
    },
    status: "open",
  },
  {
    id: "vuln-04",
    title: "Missing basic browser security shields",
    technicalName: "Missing Security Headers (HSTS & Content-Security-Policy)",
    severity: "low",
    score: 3.8,
    endpoint: "GET /",
    file: "backend/app/main.py:15",
    explanation:
      "Your website is missing standard security instructions that tell visitors' browsers to prevent tampering. Without them, users on public Wi-Fi could be redirected to insecure connections, or malicious scripts could load.",
    proof:
      "We inspected your website's response headers. Strict-Transport-Security and Content-Security-Policy were both missing.",
    fixSteps: [
      "Open backend/app/main.py.",
      "Add security header middleware to automatically attach HSTS and CSP headers to every response.",
    ],
    recommendedFix: {
      fileName: "backend/app/main.py",
      explanation:
        "Add a lightweight middleware to enforce HTTPS transport rules and protect visitor browsers.",
      beforeCode: `# VULNERABLE: Application without standard security headers
app = FastAPI(title="My Web App")`,
      afterCode: `# SECURE: Middleware injecting modern security headers
app = FastAPI(title="My Web App")

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self'"
    response.headers["X-Content-Type-Options"] = "nosniff"
    return response`,
    },
    termHelp: {
      term: "Security Headers",
      explanation:
        "Rules sent by your server telling web browsers how to handle sensitive data and block malicious scripts.",
    },
    status: "open",
  },
];

export const sampleScanLogs: ScanLogEntry[] = [
  {
    id: "log-1",
    timestamp: "14:20:01",
    level: "info",
    message: "Target verified: https://demo-app.hackfix-labs.dev",
  },
  {
    id: "log-2",
    timestamp: "14:20:03",
    level: "detail",
    message: "Passive probe: SSL/TLS parameters inspected (TLS 1.3 negotiated)",
  },
  {
    id: "log-3",
    timestamp: "14:20:05",
    level: "info",
    message: "Source project ZIP attached (source-bundle.zip, 4.2 MB). AST parsing 38 files...",
  },
  {
    id: "log-4",
    timestamp: "14:20:08",
    level: "warn",
    message: "FIND step: Discovered 4 potential vulnerabilities across endpoints and code",
  },
  {
    id: "log-5",
    timestamp: "14:20:10",
    level: "detail",
    message: "PROVE step: Running safe non-destructive active probes in isolated sandbox",
  },
  {
    id: "log-6",
    timestamp: "14:20:13",
    level: "warn",
    message: "PROVE confirmed: Authentication bypass confirmed on POST /api/v1/auth/login",
  },
  {
    id: "log-7",
    timestamp: "14:20:15",
    level: "detail",
    message: "FIX step: Synthesizing verified patch diffs with parameterized bindings",
  },
  {
    id: "log-8",
    timestamp: "14:20:18",
    level: "success",
    message: "VERIFY step: Verification harnesses generated. Security report ready.",
  },
];

export const sampleScanReport: ScanReport = {
  id: "scan-sample-01",
  targetUrl: "https://demo-app.hackfix-labs.dev",
  hasSourceZip: true,
  zipFileName: "source-bundle.zip",
  zipFileSize: 4404019, // ~4.2 MB
  ownershipVerified: true,
  stepper: {
    find: "done",
    prove: "done",
    fix: "done",
    verify: "done",
  },
  logs: sampleScanLogs,
  riskScore: 78,
  verdict: "Your app has 3 serious problems to fix",
  findings: initialFindings,
  status: "completed",
  summaryMarkdown:
    "Security check complete for **https://demo-app.hackfix-labs.dev**. We identified **4 problems** (1 Critical, 1 High, 1 Medium, 1 Low). Overall security score is **78/100**.\n\nWe safely checked every finding and generated copy-paste code fixes below.",
  createdAt: "Today at 2:20 PM",
};

export const defaultScanReport = sampleScanReport;

export const initialSessions: ChatSession[] = [
  {
    id: "session-today-01",
    title: "demo-app.hackfix-labs.dev",
    targetUrl: "https://demo-app.hackfix-labs.dev",
    updatedAt: "Today, 2:20 PM",
    group: "today" as const,
    ownershipVerified: true,
    activeScanId: "scan-sample-01",
    messages: [
      {
        id: "msg-user-1",
        sender: "user" as const,
        text: "Please scan my application at https://demo-app.hackfix-labs.dev and check my attached source code.",
        timestamp: "2:19 PM",
      },
      {
        id: "msg-assistant-1",
        sender: "assistant" as const,
        text: "I completed the security assessment for **https://demo-app.hackfix-labs.dev**. Because you uploaded a project `.zip` file, I also reviewed the underlying source code alongside the active endpoint probes.\n\nHere is the breakdown of what was discovered, safely proved, and prepared for remediation.",
        timestamp: "2:20 PM",
        scanReport: sampleScanReport,
        quickReplies: [
          "Explain this finding simply",
          "Show me the fix",
          "Re-test it",
          "What should I fix first?",
        ],
      },
    ],
  },
];

export const samplePastScans: PastScanSummary[] = [
  {
    id: "scan-sample-01",
    name: "demo-app.hackfix-labs.dev",
    targetUrl: "https://demo-app.hackfix-labs.dev",
    date: "Today, 2:20 PM",
    riskScore: 78,
    criticalCount: 1,
    highCount: 1,
    mediumCount: 1,
    lowCount: 1,
    report: sampleScanReport,
  },
];
