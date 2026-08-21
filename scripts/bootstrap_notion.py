#!/usr/bin/env python3
"""Create the three Notion databases under a parent page and print IDs for .env.

Usage:
    python scripts/bootstrap_notion.py
"""
from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from notion_client import Client  # noqa: E402

from app.config import get_settings  # noqa: E402

SELECT = "select"
RT = "rich_text"
TITLE = "title"
DATE = "date"
CB = "checkbox"


def _select(*names: str) -> dict:
    return {SELECT: {"options": [{"name": n} for n in names]}}


def create_db(notion: Client, parent: str, name: str, properties: dict) -> str:
    page = notion.databases.create(
        parent={"type": "page_id", "page_id": parent},
        title=[{"type": "text", "text": {"content": name}}],
        properties=properties,
        is_inline=True,
    )
    print(f"  created {name}: {page['id']}")
    return page["id"]


def main() -> None:
    settings = get_settings()
    if not settings.notion_api_key or not settings.notion_parent_page_id:
        sys.exit("Set NOTION_API_KEY and NOTION_PARENT_PAGE_ID in .env first.")

    notion = Client(auth=settings.notion_api_key)
    parent = settings.notion_parent_page_id

    print("Creating Campus Notice Desk databases…")

    notices = create_db(
        notion,
        parent,
        "Notices",
        {
            "Name": {TITLE: {}},
            "Category": _select("Exam", "Circular", "Deadline", "Fest", "Co-curricular", "Ignore", "Unknown"),
            "Status": _select("Pending", "Approved", "Rejected", "Sent", "Needs human"),
            "Urgency": _select("Critical", "High", "Medium", "Low", "None"),
            "Deadline": {DATE: {}},
            "Audience": {RT: {}},
            "Draft": {RT: {}},
            "Why": {RT: {}},
            "Fingerprint": {RT: {}},
            "External id": {RT: {}},
            "Sender": {RT: {}},
            "Source": _select("WhatsApp", "Manual"),
            "Needs human": {CB: {}},
        },
    )
    inbox = create_db(
        notion,
        parent,
        "Inbox",
        {
            "Name": {TITLE: {}},
            "Received at": {DATE: {}},
            "Sender": {RT: {}},
            "Raw": {RT: {}},
            "Source": _select("inbound", "whatsapp", "manual"),
            "External id": {RT: {}},
            "Status": _select("Received", "Parsed", "Duplicate", "Garbage"),
        },
    )
    run_log = create_db(
        notion,
        parent,
        "Run Log",
        {
            "Name": {TITLE: {}},
            "Time": {DATE: {}},
            "Trigger": _select("inbound", "whatsapp", "approval", "cron", "manual"),
            "Action": _select("parsed", "held", "sent", "failed", "duplicate", "ignored", "reminder"),
            "Notice": {RT: {}},
            "Result": {RT: {}},
            "Error": {RT: {}},
        },
    )

    print("\nPaste into .env:\n")
    print(f"NOTION_NOTICES_DB_ID={notices}")
    print(f"NOTION_INBOX_DB_ID={inbox}")
    print(f"NOTION_RUN_LOG_DB_ID={run_log}")
    print(
        "\nThen in Notion: add linked views on the parent page — "
        "Pending approval, Due this week, Sent today."
    )


if __name__ == "__main__":
    main()
