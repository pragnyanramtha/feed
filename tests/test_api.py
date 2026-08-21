from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    body = r.json()
    assert body["ok"] is True
    assert body["service"] == "campus-notice-desk"


def test_inbound_chatter():
    r = client.post("/inbound", json={"text": "gm", "sender": "student"})
    assert r.status_code == 200
    assert r.json()["action"] == "ignored"


def test_inbound_notice():
    r = client.post(
        "/inbound",
        json={
            "text": "Exam form last date 22/08/2026 submit in admin block before 5pm",
            "sender": "office",
            "source": "inbound",
        },
    )
    assert r.status_code == 200
    body = r.json()
    assert body["ok"] is True
    assert body["action"] in {"parsed", "held", "duplicate"}
    assert body["parsed"]["is_notice"] is True
    assert body["parsed"]["deadline"] == "2026-08-22"


def test_whatsapp_verify():
    r = client.get(
        "/webhooks/whatsapp",
        params={
            "hub.mode": "subscribe",
            "hub.verify_token": "campus-notice-desk",
            "hub.challenge": "12345",
        },
    )
    assert r.status_code == 200
    assert r.text == "12345"
