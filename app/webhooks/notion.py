from __future__ import annotations

import logging

from fastapi import APIRouter, Request

from app.config import get_settings
from app.ingest import fulfill_approval
from app.notion_ops import NotionDesk, select_name

log = logging.getLogger(__name__)
router = APIRouter()


@router.post("/webhooks/notion")
async def notion_webhook(request: Request):
    """Notion fires this when a human changes a Notice. We only act on Approved/Rejected."""
    payload = await request.json()
    if "verification_token" in payload and "type" not in payload:
        token = payload["verification_token"]
        log.warning("Notion webhook verification_token=%s — paste into NOTION_WEBHOOK_VERIFICATION_TOKEN", token)
        return {"ok": True, "verification_token": token}

    settings = get_settings()
    expected = settings.notion_webhook_verification_token
    if expected and payload.get("verification_token") and payload.get("verification_token") != expected:
        return {"ok": False, "reason": "token mismatch"}

    events = payload.get("events") or ([payload] if payload.get("type") else [])
    handled = []
    desk = NotionDesk(settings)
    for event in events:
        etype = event.get("type") or event.get("event_type")
        entity = event.get("entity") or event.get("data") or {}
        page_id = entity.get("id") or (event.get("data") or {}).get("id")
        if etype not in {"page.properties_updated", "page.content_updated"}:
            continue
        if not page_id or not desk.notion:
            continue
        try:
            page = desk.get_page(page_id)
        except Exception:
            log.exception("Could not load Notion page %s", page_id)
            continue
        parent = page.get("parent") or {}
        if parent.get("database_id", "").replace("-", "") != settings.notion_notices_db_id.replace("-", ""):
            continue
        status = select_name(page, "Status")
        if status in {"Approved", "Rejected"}:
            handled.append(fulfill_approval(page_id, desk=desk).model_dump())
    return {"ok": True, "handled": len(handled), "results": handled}
