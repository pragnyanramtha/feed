from __future__ import annotations

import logging
from datetime import date, datetime, timezone
from typing import Any

from notion_client import Client

from app.config import Settings, get_settings
from app.models import InboundEvent, ParsedNotice, RunAction, RunTrigger

log = logging.getLogger(__name__)

# Notion rich_text items cap at 2000 characters.
_RT_LIMIT = 1900


def _rt(text: str | None) -> dict:
    content = (text or "")[:_RT_LIMIT]
    return {"rich_text": [{"type": "text", "text": {"content": content}}] if content else []}


def _title(text: str) -> dict:
    return {"title": [{"type": "text", "text": {"content": (text or "Untitled")[:2000]}}]}


def _select(name: str | None) -> dict:
    if not name:
        return {"select": None}
    return {"select": {"name": name}}


def _date(value: str | datetime | date | None) -> dict:
    if value is None:
        return {"date": None}
    if isinstance(value, datetime):
        start = value.astimezone(timezone.utc).isoformat()
    elif isinstance(value, date):
        start = value.isoformat()
    else:
        start = value
    return {"date": {"start": start}}


def _checkbox(v: bool) -> dict:
    return {"checkbox": bool(v)}


def _text_block(content: str, *, italic: bool = False, color: str | None = None) -> dict:
    annotations: dict[str, Any] = {}
    if italic:
        annotations["italic"] = True
    if color:
        annotations["color"] = color
    item: dict[str, Any] = {"type": "text", "text": {"content": content[:2000]}}
    if annotations:
        item["annotations"] = annotations
    return {
        "object": "block",
        "type": "paragraph",
        "paragraph": {"rich_text": [item]},
    }


def _heading(content: str) -> dict:
    return {
        "object": "block",
        "type": "heading_2",
        "heading_2": {"rich_text": [{"type": "text", "text": {"content": content[:2000]}}]},
    }


class NotionDesk:
    """Writes human-readable rows. Adapted from AyushUnleashed/whatsapp-notion-sync."""

    def __init__(self, settings: Settings | None = None, client: Client | None = None):
        self.settings = settings or get_settings()
        self.notion = client or (
            Client(auth=self.settings.notion_api_key) if self.settings.notion_api_key else None
        )

    def create_inbox(self, event: InboundEvent, status: str) -> str | None:
        if not self.notion:
            return None
        title = (event.text or event.media_note or "empty").splitlines()[0][:80]
        page = self.notion.pages.create(
            parent={"database_id": self.settings.notion_inbox_db_id},
            properties={
                "Name": _title(title or "Inbound"),
                "Received at": _date(event.received_at or datetime.now(timezone.utc)),
                "Sender": _rt(event.sender),
                "Raw": _rt(event.text or event.media_note),
                "Source": _select(event.source if event.source in {"inbound", "whatsapp", "manual"} else "inbound"),
                "External id": _rt(event.external_id),
                "Status": _select(status),
            },
        )
        return page["id"]

    def find_notice_by_fingerprint(self, fingerprint: str) -> str | None:
        if not self.notion or not fingerprint:
            return None
        res = self.notion.databases.query(
            database_id=self.settings.notion_notices_db_id,
            filter={"property": "Fingerprint", "rich_text": {"equals": fingerprint}},
            page_size=1,
        )
        results = res.get("results") or []
        return results[0]["id"] if results else None

    def create_notice(self, event: InboundEvent, parsed: ParsedNotice, status: str) -> str | None:
        if not self.notion:
            return None
        children = [
            _heading("What came in"),
            _text_block(event.text or event.media_note or "(empty)"),
            _heading("Draft to send"),
            _text_block(parsed.draft or "(none)"),
            _heading("Why"),
            _text_block(parsed.why or "", italic=True, color="gray"),
            _text_block(
                f"{event.sender} · {(event.received_at or datetime.now(timezone.utc)).strftime('%d %b, %I:%M %p')}",
                italic=True,
                color="gray",
            ),
        ]
        page = self.notion.pages.create(
            parent={"database_id": self.settings.notion_notices_db_id},
            properties={
                "Name": _title(parsed.title),
                "Category": _select(parsed.category),
                "Status": _select(status),
                "Urgency": _select(parsed.urgency),
                "Deadline": _date(parsed.deadline),
                "Audience": _rt(parsed.audience),
                "Draft": _rt(parsed.draft),
                "Why": _rt(parsed.why),
                "Fingerprint": _rt(parsed.fingerprint),
                "External id": _rt(event.external_id),
                "Sender": _rt(event.sender),
                "Source": _select("WhatsApp" if event.source == "whatsapp" else "Manual"),
                "Needs human": _checkbox(parsed.needs_human or status == "Needs human"),
            },
            children=children,
        )
        return page["id"]

    def write_run_log(
        self,
        *,
        trigger: RunTrigger,
        action: RunAction,
        title: str,
        result: str,
        notice_id: str | None = None,
        error: str | None = None,
    ) -> str | None:
        if not self.notion:
            return None
        now = datetime.now(timezone.utc)
        page = self.notion.pages.create(
            parent={"database_id": self.settings.notion_run_log_db_id},
            properties={
                "Name": _title(f"{action}: {title[:80]}"),
                "Time": _date(now),
                "Trigger": _select(trigger),
                "Action": _select(action),
                "Notice": _rt(notice_id or title),
                "Result": _rt(result),
                "Error": _rt(error),
            },
        )
        return page["id"]

    def get_page(self, page_id: str) -> dict:
        assert self.notion
        return self.notion.pages.retrieve(page_id)

    def update_notice(self, page_id: str, properties: dict) -> None:
        if not self.notion:
            return
        self.notion.pages.update(page_id, properties=properties)

    def mark_sent(self, page_id: str, detail: str) -> None:
        self.update_notice(
            page_id,
            {
                "Status": _select("Sent"),
                "Needs human": _checkbox(False),
            },
        )
        # Keep a breadcrumb on the page body.
        if self.notion:
            self.notion.blocks.children.append(
                block_id=page_id,
                children=[
                    _heading("Sent"),
                    _text_block(detail, italic=True, color="gray"),
                ],
            )

    def query_due_notices(self, on_date: date) -> list[dict]:
        if not self.notion:
            return []
        res = self.notion.databases.query(
            database_id=self.settings.notion_notices_db_id,
            filter={
                "and": [
                    {"property": "Status", "select": {"equals": "Sent"}},
                    {"property": "Deadline", "date": {"equals": on_date.isoformat()}},
                ]
            },
            page_size=20,
        )
        return res.get("results") or []

    def query_pending_approved(self) -> list[dict]:
        """Backup poll if Notion webhooks are slow."""
        if not self.notion:
            return []
        res = self.notion.databases.query(
            database_id=self.settings.notion_notices_db_id,
            filter={"property": "Status", "select": {"equals": "Approved"}},
            page_size=20,
        )
        return res.get("results") or []


def select_name(page: dict, prop: str) -> str | None:
    node = (page.get("properties") or {}).get(prop) or {}
    sel = node.get("select") or {}
    return sel.get("name")


def rich_text(page: dict, prop: str) -> str:
    node = (page.get("properties") or {}).get(prop) or {}
    bits = node.get("rich_text") or node.get("title") or []
    return "".join(b.get("plain_text", "") for b in bits)


def page_title(page: dict) -> str:
    return rich_text(page, "Name") or "Untitled"
