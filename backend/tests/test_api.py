import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.storage.database import init_db

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["db_connected"] is True
    assert "version" in data

def test_scan_missing_url(client):
    response = client.post("/api/scan", json={"target_url": "", "ownership_verified": True})
    assert response.status_code == 400
    assert "required" in response.json()["detail"].lower()

def test_scan_unverified_ownership(client):
    response = client.post("/api/scan", json={"target_url": "https://example.com", "ownership_verified": False})
    assert response.status_code == 403
    assert "ownership" in response.json()["detail"].lower()

def test_scan_ssrf_prohibited_ip(client):
    response = client.post("/api/scan", json={"target_url": "http://169.254.169.254/latest/", "ownership_verified": True})
    assert response.status_code == 400
    assert "restricted" in response.json()["detail"].lower() or "prohibited" in response.json()["detail"].lower()

def test_scan_create_and_get_lifecycle(client):
    # Create valid scan
    create_res = client.post(
        "/api/scan",
        json={"target_url": "https://example.com", "ownership_verified": True}
    )
    assert create_res.status_code == 201
    scan_data = create_res.json()
    scan_id = scan_data["id"]
    assert scan_id.startswith("scan-")
    assert scan_data["targetUrl"] == "https://example.com/"
    assert scan_data["status"] == "queued"

    # Fetch scan status
    get_res = client.get(f"/api/scan/{scan_id}")
    assert get_res.status_code == 200
    report = get_res.json()
    assert report["id"] == scan_id
    assert report["ownershipVerified"] is True

def test_get_nonexistent_scan(client):
    response = client.get("/api/scan/nonexistent-id-999")
    assert response.status_code == 404

def test_chat_endpoint(client):
    payload = {
        "message": "What should I fix first?",
    }
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert len(data["reply"]) > 0
    assert "quickReplies" in data
    assert isinstance(data["quickReplies"], list)

def test_retest_nonexistent_scan(client):
    payload = {"finding_id": "test-finding-1"}
    response = client.post("/api/scan/nonexistent-scan-id/retest", json=payload)
    assert response.status_code == 404

def test_report_download_nonexistent(client):
    response = client.get("/api/scan/nonexistent-scan-id/report?format=pdf")
    assert response.status_code == 404

def test_simulation_requires_target_or_scan(client):
    response = client.post("/api/simulation", json={})
    assert response.status_code == 400
    assert "website link must be provided" in response.json()["detail"].lower()

def test_simulation_zero_vulnerabilities(client):
    payload = {
        "targetUrl": "https://secure-site.example.com",
        "findings": []
    }
    response = client.post("/api/simulation", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["riskLevel"] == "Low"
    assert "zero exploitable vulnerabilities" in data["executiveSummary"].lower()
    assert len(data["stages"]) == 4
    for stage in data["stages"]:
        assert stage["status"] == "blocked_by_patch"

def test_simulation_with_findings(client):
    payload = {
        "targetUrl": "https://vulnerable-test.com",
        "findings": [
            {
                "id": "f-1",
                "title": "Missing Content-Security-Policy",
                "technicalName": "CSP Missing",
                "category": "A05:2021-Security Misconfiguration",
                "severity": "medium",
                "score": 5.0,
                "endpoint": "GET /",
                "impact": "Clickjacking and cross-site scripting risks",
                "proof": "No CSP header detected",
                "evidence": "Header missing"
            }
        ]
    }
    response = client.post("/api/simulation", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["targetUrl"] == "https://vulnerable-test.com"
    assert len(data["stages"]) >= 4
    assert "boardroomTakeaway" in data



