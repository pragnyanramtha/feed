from __future__ import annotations

import hashlib
import hmac
import json
import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Header, HTTPException, Query, Request, Response

from app.config import get_settings
from app.ingest import ingest
from app.models import InboundEvent

log = logging.getLogger(__name__)
router = APIRouter()


@router.get("/webhooks/whatsapp")
def verify_whatsapp(
    hub_mode: str | None = Query(default=None, alias="hub.mode"),
    hub_verify_token: str | None = Query(default=None, alias="hub.verify_token"),
    hub_challenge: str | None = Query(default=None, alias="hub.challenge"),
):
    settings = get_settings()
    if hub_mode == "subscribe" and hub_verify_token == settings.whatsapp_verify_token:
        return Response(content=hub_challenge or "", media_type="text/plain")
    raise HTTPException(status_code=403, detail="verify token mismatch")


@router.post("/webhooks/whatsapp")
async def whatsapp_inbound(
    request: Request,
    x_hub_signature_256: str | None = Header(default=None),
):
    raw = await request.body()
    settings = get_settings()
    if settings.whatsapp_app_secret:
        if not x_hub_signature_256 or not _valid_sig(raw, x_hub_signature_256, settings.whatsapp_app_secret):
            raise HTTPException(status_code=403, detail="bad signature")

    payload = json.loads(raw.decode("utf-8") or "{}")
    events = list(_extract_messages(payload))
    results = []
    for event in events:
        results.append(ingest(event).model_dump())
    return {"ok": True, "handled": len(results), "results": results}


def _valid_sig(raw: bytes, header: str, secret: str) -> bool:
    expected = "sha256=" + hmac.new(secret.encode(), raw, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, header)


def _extract_messages(payload: dict):
    for entry in payload.get("entry") or []:
        for change in entry.get("changes") or []:
            value = change.get("value") or {}
            contacts = {c.get("wa_id"): c.get("profile", {}).get("name") for c in value.get("contacts") or []}
            for msg in value.get("messages") or []:
                mid = msg.get("id")
                from_id = msg.get("from") or "unknown"
                sender = contacts.get(from_id) or from_id
                text = ""
                media_note = None
                mtype = msg.get("type")
                if mtype == "text":
                    text = (msg.get("text") or {}).get("body") or ""
                elif mtype == "image":
                    text = (msg.get("image") or {}).get("caption") or ""
                    media_note = "[Image attached]"
                elif mtype == "document":
                    doc = msg.get("document") or {}
                    text = doc.get("caption") or ""
                    media_note = f"[Document: {doc.get('filename') or 'file'}]"
                elif mtype in {"audio", "video", "sticker"}:
                    media_note = f"[{mtype}]"
                else:
                    text = str(msg.get(mtype) or "")
                if media_note and text:
                    text = f"{text}\n{media_note}"
                elif media_note and not text:
                    text = media_note
                ts = msg.get("timestamp")
                received = None
                if ts:
                    try:
                        received = datetime.fromtimestamp(int(ts), tz=timezone.utc)
                    except (TypeError, ValueError):
                        received = None
                yield InboundEvent(
                    text=text,
                    sender=sender,
                    source="whatsapp",
                    external_id=mid,
                    received_at=received,
                    media_note=media_note,
                )
