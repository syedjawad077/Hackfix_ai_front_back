# HackFix AI — Frontend

An AI-powered security testing assistant that finds, proves, fixes, and verifies vulnerabilities in AI-built web applications.

Built with a ChatGPT-style conversational interface: provide a website link, optionally upload a source project `.zip`, and interactively explore findings, safe exploit proofs, code diffs, and instant automated re-tests with HackFix AI.

---

## Tech Stack & Architecture

- **Framework**: Next.js 14 (App Router) + React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React (`lucide-react`)
- **Animations**: **Strictly none**. All transitions, keyframe animations, spinners, and typewriter effects are eliminated. State changes and responses render instantly.
- **Backend**: Python FastAPI ready. A built-in Mock API layer (`lib/api-client.ts` and Next.js route handlers) provides fully functional standalone operation and simulated pipeline states.

---

## Theme: White + Dark Blue

- **Background**: `#FFFFFF`
- **Sidebar & Cards**: Very light blue-gray (`#F4F7FB`)
- **Primary Text & Headings**: Dark navy (`#0B1F3A`)
- **Secondary Text**: Muted slate blue (`#51627A`)
- **Primary Color**: Dark blue (`#0F2A5C`) for buttons, active indicators, and logo blocks. Hover: `#0A1F47`
- **Accent**: Medium blue (`#2563EB`) for links and focus rings. Light blue tint (`#E3ECFA`) for user bubbles and active pills.
- **Borders**: Soft blue-gray (`#D9E2F0`)
- **Severity Badges** (used solely for vulnerability ratings):
  - **Critical**: Deep red text on pale red tint (`bg-[#FEE2E2] text-[#991B1B] border-[#FCA5A5]`)
  - **High**: Orange on pale orange tint (`bg-[#FFEDD5] text-[#C2410C] border-[#FDBA74]`)
  - **Medium**: Amber on pale amber tint (`bg-[#FEF3C7] text-[#B45309] border-[#FCD34D]`)
  - **Low**: Blue on pale blue tint (`bg-[#DBEAFE] text-[#1D4ED8] border-[#93C5FD]`)

---

## Project Structure

```
hackfix-ai-frontend/
├── app/
│   ├── api/
│   │   ├── chat/route.ts        # POST /api/chat handler
│   │   └── scan/
│   │       ├── route.ts         # POST /api/scan handler
│   │       └── [id]/route.ts    # GET /api/scan/{id} handler
│   ├── globals.css              # Global styles & zero-animation override
│   ├── layout.tsx               # Root HTML layout and metadata
│   └── page.tsx                 # Main ChatGPT-style layout & chat container
├── components/
│   ├── Sidebar.tsx              # 260px collapsible history sidebar & mobile drawer
│   ├── ChatMessage.tsx          # Right-aligned user bubbles & left-aligned assistant
│   ├── Composer.tsx             # Sticky bottom input box (URL + textarea + ZIP)
│   ├── UrlInput.tsx             # Validated URL input with globe icon
│   ├── FileChip.tsx             # Attached ZIP badge with progress bar and remove button
│   ├── DropOverlay.tsx          # Dashed blue-border full-window drag-drop target
│   ├── OwnershipModal.tsx       # Mandatory ownership confirmation modal before scan
│   ├── QuickReplies.tsx         # Context-sensitive prompt chips
│   ├── ScanStepper.tsx          # 4-step pipeline: FIND -> PROVE -> FIX -> VERIFY
│   ├── ScanLog.tsx              # Collapsible timestamped monospace scan events
│   ├── RiskGauge.tsx            # Static 0-100 security score gauge
│   ├── FindingCard.tsx          # Expandable finding card with diffs and safe proofs
│   ├── ReportSummary.tsx        # Findings overview, risk distribution, download
│   ├── SettingsModal.tsx        # Fast-switch FastAPI backend endpoint modal
│   ├── EmptyState.tsx           # Initial screen with 4 actionable suggestion cards
│   └── Toast.tsx                # Accessible notification toasts
├── hooks/
│   ├── useHackFix.ts            # Core application state & API coordinator
│   └── useToast.ts              # Toast notification dispatcher
├── lib/
│   ├── api-client.ts            # FastAPI integration client & standalone mock layer
│   ├── mock-data.ts             # Realistic security vulnerabilities and diffs
│   ├── types.ts                 # TypeScript data contracts
│   └── utils.ts                 # Formatting and severity color mappings
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## Quick Start & Run Instructions

### 1. Install dependencies

```bash
cd hackfix-ai-frontend
npm install
```

### 2. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for production

```bash
npm run build
npm run start
```

---

## FastAPI Backend Wiring

The frontend is architected to operate standalone out-of-the-box using `lib/api-client.ts`. To connect to a live Python FastAPI backend:

1. Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_FASTAPI_URL=http://localhost:8000
   ```
   *(Or click the gear icon in the sidebar to configure the URL dynamically at runtime).*

2. Ensure your FastAPI backend implements the following endpoints:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/scan` | Accepts `multipart/form-data` with `target_url`, optional `source_zip` file, and `ownership_verified` boolean. Returns `ScanReport` JSON. |
| `GET` | `/api/scan/{id}` | Returns the full scan findings, logs, and risk score for scan `{id}`. |
| `POST` | `/api/chat` | Accepts `{ sessionId, scanId, message }`. Returns assistant `reply` and suggested `quickReplies`. |
| `POST` | `/api/scan/{id}/retest` | Accepts `{ finding_id }`. Executes non-destructive validation probe and returns `{ status: "verified_fixed", verifiedAt: string }`. |

### Example FastAPI Handler Signatures

```python
from fastapi import FastAPI, UploadFile, File, Form
from pydantic import BaseModel

app = FastAPI(title="HackFix AI Backend")

@app.post("/api/scan")
async def start_scan(
    target_url: str = Form(...),
    ownership_verified: bool = Form(...),
    source_zip: UploadFile = File(None)
):
    # 1. FIND vulnerabilities (Semgrep / ZAP)
    # 2. PROVE findings in safe sandbox
    # 3. FIX: generate AST code diffs
    # 4. Return ScanReport
    ...

@app.post("/api/chat")
async def chat_interaction(payload: ChatRequest):
    # LLM reasoning over AST findings and proofs
    ...

@app.post("/api/scan/{scan_id}/retest")
async def retest_vulnerability(scan_id: str, payload: RetestRequest):
    # Automated exploit probe against patched endpoint
    ...
```

---

## User Experience & Accessibility Features

- **Keyboard Navigation**:
  - `Enter`: Submit message / start scan
  - `Shift + Enter`: Multi-line prompt in composer
  - `Ctrl + K` / `Cmd + K`: Start a new scan immediately
- **Drag & Drop**: Dragging any `.zip` file into the browser window displays the drop overlay and attaches the source bundle.
- **Ownership Verification**: First scan requires explicit consent confirming application authorization.
- **Interactive Re-Testing**: Click "Re-test" on any finding to trigger an automated exploit re-test that updates status to **Verified fixed**.

