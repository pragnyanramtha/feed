from __future__ import annotations

import logging

from fastapi import FastAPI
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.ingest import ingest
from app.models import HealthResponse, InboundEvent
from app.reminders import drain_approvals, send_deadline_reminders
from app.webhooks.notion import router as notion_router
from app.webhooks.whatsapp import router as whatsapp_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
    datefmt="%H:%M:%S",
)

app = FastAPI(
    title="Campus Notice Desk",
    description="WhatsApp is the pipe. Notion is the desk. This service is the engine.",
    version="0.1.0",
)
app.include_router(whatsapp_router)
app.include_router(notion_router)


@app.get("/health", response_model=HealthResponse)
def health():
    s = get_settings()
    return HealthResponse(
        dry_run=s.dry_run,
        notion=s.has_notion,
        llm=s.has_llm,
        whatsapp=bool(s.whatsapp_token and s.whatsapp_phone_number_id),
        email=bool(s.resend_api_key and s.resend_from and s.notice_email_to),
    )


@app.post("/inbound")
def inbound(event: InboundEvent):
    """Generic trigger: paste a circular, forward a webhook, hit this from a form."""
    result = ingest(event)
    status = 200 if result.ok else 502
    return JSONResponse(result.model_dump(mode="json"), status_code=status)


@app.post("/cron/approvals")
@app.get("/cron/approvals")
def cron_approvals():
    return {"ok": True, "results": drain_approvals()}


@app.post("/cron/reminders")
@app.get("/cron/reminders")
def cron_reminders():
    return {"ok": True, "results": send_deadline_reminders()}
