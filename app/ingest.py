from __future__ import annotations

import logging
from datetime import datetime, timezone

from app.config import get_settings
from app.models import InboundEvent, IngestResult, ParsedNotice
from app.notion_ops import NotionDesk, page_title, rich_text, select_name
from app.parser import parse_inbound
from app.senders import deliver

log = logging.getLogger(__name__)


def ingest(event: InboundEvent, desk: NotionDesk | None = None) -> IngestResult:
    settings = get_settings()
    desk = desk or NotionDesk(settings)
    event.received_at = event.received_at or datetime.now(timezone.utc)
    event.text = (event.text or "").strip()
    if event.media_note and not event.text:
        event.text = event.media_note

    parsed = parse_inbound(event.text, settings=settings)

    if not event.text:
        run_id = desk.write_run_log(
            trigger=event.source,
            action="ignored",
            title="empty inbound",
            result="Empty payload. Nothing silently lost — logged and dropped.",
        )
        return IngestResult(
            ok=True,
            dry_run=settings.dry_run,
            action="ignored",
            reason="empty inbound",
            run_log_id=run_id,
            parsed=parsed,
        )

    inbox_id = desk.create_inbox(event, status="Received")

    if parsed.fingerprint:
        existing = desk.find_notice_by_fingerprint(parsed.fingerprint)
        if existing:
            desk.write_run_log(
                trigger=event.source,
                action="duplicate",
                title=parsed.title,
                result="Same notice already filed. No second card.",
                notice_id=existing,
            )
            if inbox_id:
                from app.notion_ops import _select

                desk.update_notice(inbox_id, {"Status": _select("Duplicate")})
            return IngestResult(
                ok=True,
                dry_run=settings.dry_run,
                action="duplicate",
                reason="fingerprint match",
                notice_id=existing,
                inbox_id=inbox_id,
                parsed=parsed,
            )

    if not parsed.is_notice:
        run_id = desk.write_run_log(
            trigger=event.source,
            action="ignored",
            title=parsed.title,
            result=parsed.why or "Not a notice.",
        )
        if inbox_id:
            from app.notion_ops import _select

            desk.update_notice(inbox_id, {"Status": _select("Garbage")})
        return IngestResult(
            ok=True,
            dry_run=settings.dry_run,
            action="ignored",
            reason=parsed.why,
            inbox_id=inbox_id,
            run_log_id=run_id,
            parsed=parsed,
        )

    status = "Needs human" if parsed.needs_human else "Pending"
    notice_id = desk.create_notice(event, parsed, status=status)
    action = "held" if parsed.needs_human else "parsed"
    run_id = desk.write_run_log(
        trigger=event.source,
        action=action,
        title=parsed.title,
        result=f"Status={status}. {parsed.why}",
        notice_id=notice_id,
    )
    if inbox_id:
        from app.notion_ops import _select

        desk.update_notice(inbox_id, {"Status": _select("Parsed")})

    return IngestResult(
        ok=True,
        dry_run=settings.dry_run,
        action=action,
        reason=parsed.why,
        notice_id=notice_id,
        inbox_id=inbox_id,
        run_log_id=run_id,
        parsed=parsed,
    )


def fulfill_approval(page_id: str, desk: NotionDesk | None = None, parsed_override: ParsedNotice | None = None) -> IngestResult:
    """Called when a human sets Status=Approved on a Notice. Sends, then logs."""
    settings = get_settings()
    desk = desk or NotionDesk(settings)
    page = desk.get_page(page_id) if desk.notion else None
    if page:
        status = select_name(page, "Status")
        if status == "Sent":
            return IngestResult(ok=True, action="sent", reason="already sent", notice_id=page_id)
        if status == "Rejected":
            desk.write_run_log(
                trigger="approval",
                action="ignored",
                title=page_title(page),
                result="Human rejected. Nothing sent.",
                notice_id=page_id,
            )
            return IngestResult(ok=True, action="ignored", reason="rejected", notice_id=page_id)
        if status != "Approved":
            return IngestResult(ok=True, action="held", reason=f"status is {status}", notice_id=page_id)

        parsed = parsed_override or ParsedNotice(
            is_notice=True,
            title=page_title(page),
            category=select_name(page, "Category") or "Circular",  # type: ignore[arg-type]
            urgency=select_name(page, "Urgency") or "None",  # type: ignore[arg-type]
            deadline=None,
            audience=rich_text(page, "Audience"),
            draft=rich_text(page, "Draft"),
            why=rich_text(page, "Why"),
            fingerprint=rich_text(page, "Fingerprint"),
        )
        dl = (page.get("properties") or {}).get("Deadline", {}).get("date") or {}
        if dl.get("start"):
            parsed.deadline = dl["start"][:10]
    else:
        parsed = parsed_override or ParsedNotice(title="Approved notice", is_notice=True, draft="Approved notice")

    sent = deliver(parsed)
    if not sent.ok:
        desk.write_run_log(
            trigger="approval",
            action="failed",
            title=parsed.title,
            result=sent.detail,
            notice_id=page_id,
            error=sent.detail,
        )
        return IngestResult(
            ok=False,
            dry_run=settings.dry_run,
            action="failed",
            reason=sent.detail,
            notice_id=page_id,
            parsed=parsed,
        )

    desk.mark_sent(page_id, f"{sent.channel}: {sent.detail}")
    desk.write_run_log(
        trigger="approval",
        action="sent",
        title=parsed.title,
        result=f"{sent.channel}: {sent.detail}",
        notice_id=page_id,
    )
    return IngestResult(
        ok=True,
        dry_run=settings.dry_run,
        action="sent",
        reason=sent.detail,
        notice_id=page_id,
        parsed=parsed,
    )
