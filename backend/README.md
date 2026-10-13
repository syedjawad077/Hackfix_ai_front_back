# HackFix AI — Backend API & Security Testing Engine

HackFix AI is an AI-assisted application security assistant. It provides automated, safe, non-destructive website security audits, grounded vulnerability remediation advice, and an interactive security testing chat assistant.

---

## 1. Key Capabilities

- **Safe, Non-Destructive URL Security Auditing**:
  - **Security Headers & Cookie Hardening**: Passive evaluation of CSP, HSTS, X-Content-Type-Options, frame-ancestors/clickjacking protection, Referrer-Policy, and cookie security flags (`Secure`, `HttpOnly`, `SameSite`).
  - **TLS/HTTPS Enforcement**: Certificate validity, expiration date checks, cleartext downgrade detection, and HTTP-to-HTTPS redirect validation.
  - **Safe Exposure Probes**: Non-destructive signature-verified checks for exposed dotfiles and sensitive admin endpoints (`/.git/HEAD`, `/.env`, `/actuator/env`) with automatic secret redaction.
  - **Bounded Same-Origin Crawler**: Safe GET crawler limited by depth (default 2) and page count (default 20) with verbose error stack trace detection.
  - **Optional OWASP ZAP Baseline**: Native connector for containerized or local OWASP ZAP baseline scans when configured.
- **OWASP Top 10:2025 Honest Assessment**:
  - Maps detected issues and scanner capabilities to OWASP Top 10:2025 categories.
  - Clearly reports blind spots and assessment limitations (e.g., cannot assess deep internal role boundaries without multi-user credentials).
- **Grounded AI Explanations & Remediation Diffs (Google Gemini)**:
  - Uses the official `google-genai` SDK (`gemini-2.5-flash`).
  - Converts technical findings into friendly 2-sentence developer explanations.
  - Provides advisory before/after configuration code patches.
  - Context-grounded chat assistant with prompt injection protection.
  - Full deterministic fallback when running offline or without an API key.
- **Genuine Retesting Engine**:
  - Re-executes the exact verification probe against the target URL.
  - Marks findings as `verified_fixed` only when the security weakness is genuinely no longer reproducible.
- **Audit Reports**:
  - Generates downloadable reports (PDF and structured Markdown) with ReportLab.

---

## 2. Security Architecture & SSRF Guardrails

- **DNS Pre-Resolution & IP Blocking**:
  - All targets are resolved via DNS prior to making HTTP requests.
  - Prohibits all RFC 1918 private subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`).
  - Prohibits loopback (`127.0.0.0/8`, `::1`).
  - Prohibits Link-Local and Cloud Metadata endpoints (`169.254.169.254`).
  - Prohibits multicast, broadcast, and reserved address spaces.
  - Validates HTTP redirects to prevent open redirect SSRF bypasses.
- **Sensitive Data Redaction**:
  - Automatically strips Authorization tokens, Bearer headers, Session IDs, and API keys from evidence logs before saving to database or returning to the UI.
- **Explicit Ownership Confirmation**:
  - Requires explicit verification of ownership or authorized written testing permission before scan execution.
- **Non-Destructive Testing**:
  - Never performs active SQL injection attacks, brute force, or intrusive exploitation that could cause denial of service or data corruption.

---

## 3. Technology Stack

- **Python**: 3.11+
- **Framework**: FastAPI (Asynchronous REST API)
- **Server**: Uvicorn
- **HTTP Client**: `httpx` (Async HTTP with timeout and redirect safety)
- **AI SDK**: `google-genai` (Official Google Gemini Python SDK)
- **Database**: SQLite with `aiosqlite`
- **PDF Generation**: ReportLab
- **Testing**: Pytest & `pytest-asyncio`

---

## 4. Environment Variables (`.env`)

Create a `.env` file in the `backend/` directory:

```env
# Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
GEMINI_ENABLED=true

# Storage & CORS
DATABASE_URL=sqlite:///./hackfix.db
FRONTEND_ORIGIN=http://localhost:3000

# Testing allowlist (for local dev targets like localhost)
SCAN_ALLOWED_HOSTS=localhost,127.0.0.1,demo-app.hackfix-labs.dev

# Crawler & Scanner Limits
MAX_CRAWL_PAGES=20
MAX_CRAWL_DEPTH=2
REQUEST_TIMEOUT_SECONDS=10.0
SCAN_TIMEOUT_SECONDS=120.0
MAX_CONCURRENT_SCANS=3

# Optional OWASP ZAP Baseline
ZAP_ENABLED=false
ZAP_BASE_URL=http://localhost:8080
ZAP_API_KEY=
```

---

## 5. Quickstart & Local Setup

### 1. Activate the Virtual Environment

**Windows (PowerShell):**
```powershell
cd backend
.\venv\Scripts\Activate.ps1
```

**Linux / macOS:**
```bash
cd backend
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Run the Backend API Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The interactive OpenAPI / Swagger documentation will be available at:
`http://localhost:8000/docs`

Health check endpoint:
`http://localhost:8000/api/health`

---

## 6. Running the Test Suite

Run the full automated test suite with verbose output:

```bash
pytest -v
```

Test coverage includes:
- **`tests/test_url_validation.py`**: URL schemes, embedded credentials, SSRF protection against private/loopback/cloud metadata IPs, and sensitive evidence redaction.
- **`tests/test_scanners.py`**: Header analysis, cookie security, exposure probing with signature checks, finding deduplication, risk scoring, and OWASP Top 10:2025 assessment.
- **`tests/test_gemini_fallback.py`**: Grounded chat responses, explanation generation, remediation diffs, and deterministic offline fallbacks.
- **`tests/test_api.py`**: Full FastAPI endpoint lifecycle tests (`POST /api/scan`, `GET /api/scan/{id}`, `POST /api/scan/{id}/retest`, `POST /api/chat`, `GET /api/health`).

---

## 7. Connecting to the Next.js Frontend

In the root frontend directory (`hackfix-ai-frontend/`), set:

```env
# .env.local
NEXT_PUBLIC_FASTAPI_URL=http://localhost:8000
```

Start the frontend development server:

```bash
npm run dev
```

The Next.js client will automatically forward scans and chat queries to the FastAPI backend, poll for scan execution progress across the FIND → PROVE → FIX → VERIFY stepper, and allow real-time interactive remediation chat with HackFix AI.

