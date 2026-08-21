from __future__ import annotations

import logging

import httpx

from app.config import Settings, get_settings
from app.models import ParsedNotice, SendResult

log = logging.getLogger(__name__)


def deliver(parsed: ParsedNotice, *, override_draft: str | None = None, settings: Settings | None = None) -> SendResult:
    """Send the approved notice outside Notion. WhatsApp first, email fallback, log last."""
    settings = settings or get_settings()
    body = (override_draft or parsed.draft or parsed.title).strip()
    heading = f"[{parsed.category}] {parsed.title}"
    if parsed.deadline:
        heading += f" — due {parsed.deadline}"
    message = f"{heading}\n\n{body}".strip()

    wa = _whatsapp(message, settings)
    if wa.ok:
        return wa
    email = _email(heading, body, settings)
    if email.ok:
        return email
    log.info("Outbound log-only: %s", message)
    return SendResult(
        ok=True,
        channel="log",
        detail="No WhatsApp/email keys. Logged outbound (wire a sender before demo day).",
        recipients=[],
    )


def _whatsapp(message: str, settings: Settings) -> SendResult:
    if not (settings.whatsapp_token and settings.whatsapp_phone_number_id and settings.digest_whatsapp_to):
        return SendResult(ok=False, channel="whatsapp", detail="WhatsApp not configured")
    sent: list[str] = []
    errors: list[str] = []
    url = f"https://graph.facebook.com/v21.0/{settings.whatsapp_phone_number_id}/messages"
    headers = {
        "Authorization": f"Bearer {settings.whatsapp_token}",
        "Content-Type": "application/json",
    }
    with httpx.Client(timeout=20) as client:
        for to in settings.digest_whatsapp_to:
            payload = {
                "messaging_product": "whatsapp",
                "to": to.lstrip("+"),
                "type": "text",
                "text": {"body": message[:4096], "preview_url": True},
            }
            r = client.post(url, headers=headers, json=payload)
            if r.is_success:
                sent.append(to)
            else:
                errors.append(f"{to}: {r.status_code} {r.text[:180]}")
                log.warning("WhatsApp send failed for %s: %s", to, r.text[:300])
    if sent:
        detail = f"WhatsApp sent to {len(sent)} number(s)."
        if errors:
            detail += " Partial failures: " + "; ".join(errors)
        return SendResult(ok=True, channel="whatsapp", detail=detail, recipients=sent)
    return SendResult(ok=False, channel="whatsapp", detail="; ".join(errors) or "send failed")


def _email(subject: str, body: str, settings: Settings) -> SendResult:
    if not (settings.resend_api_key and settings.resend_from and settings.notice_email_to):
        return SendResult(ok=False, channel="email", detail="Email not configured")
    recipients = [e.strip() for e in settings.notice_email_to.split(",") if e.strip()]
    with httpx.Client(timeout=20) as client:
        r = client.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {settings.resend_api_key}",
                "Content-Type": "application/json",
            },
            json={
                "from": settings.resend_from,
                "to": recipients,
                "subject": subject[:200],
                "text": body,
            },
        )
    if r.is_success:
        return SendResult(ok=True, channel="email", detail=f"Email sent to {', '.join(recipients)}", recipients=recipients)
    log.warning("Resend failed: %s", r.text[:300])
    return SendResult(ok=False, channel="email", detail=r.text[:300])
