from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone

from app.ingest import fulfill_approval
from app.models import ParsedNotice
from app.notion_ops import NotionDesk, page_title, rich_text, select_name
from app.senders import deliver

log = logging.getLogger(__name__)


def drain_approvals(desk: NotionDesk | None = None) -> list[dict]:
    desk = desk or NotionDesk()
    out = []
    for page in desk.query_pending_approved():
        out.append(fulfill_approval(page["id"], desk=desk).model_dump())
    return out


def send_deadline_reminders(desk: NotionDesk | None = None) -> list[dict]:
    desk = desk or NotionDesk()
    tomorrow = (datetime.now(timezone.utc) + timedelta(days=1)).date()
    results = []
    for page in desk.query_due_notices(tomorrow):
        parsed = ParsedNotice(
            is_notice=True,
            title=page_title(page),
            category=select_name(page, "Category") or "Deadline",  # type: ignore[arg-type]
            urgency="Critical",
            deadline=tomorrow.isoformat(),
            audience=rich_text(page, "Audience"),
            draft=f"Reminder: {page_title(page)} is due tomorrow ({tomorrow.isoformat()}).\n\n{rich_text(page, 'Draft')}",
            why="Cron reminder for a notice already sent.",
        )
        sent = deliver(parsed)
        action = "reminder" if sent.ok else "failed"
        desk.write_run_log(
            trigger="cron",
            action=action,
            title=parsed.title,
            result=sent.detail,
            notice_id=page["id"],
            error=None if sent.ok else sent.detail,
        )
        results.append({"notice_id": page["id"], "ok": sent.ok, "detail": sent.detail})
    return results
