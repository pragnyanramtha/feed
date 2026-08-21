from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

Category = Literal[
    "Exam",
    "Circular",
    "Deadline",
    "Fest",
    "Co-curricular",
    "Ignore",
    "Unknown",
]
Urgency = Literal["Critical", "High", "Medium", "Low", "None"]
NoticeStatus = Literal["Pending", "Approved", "Rejected", "Sent", "Needs human"]
InboxStatus = Literal["Received", "Parsed", "Duplicate", "Garbage"]
RunAction = Literal[
    "parsed",
    "held",
    "sent",
    "failed",
    "duplicate",
    "ignored",
    "reminder",
]
RunTrigger = Literal["inbound", "whatsapp", "approval", "cron", "manual"]


class InboundEvent(BaseModel):
    text: str = ""
    sender: str = "unknown"
    source: RunTrigger = "inbound"
    external_id: str | None = None
    received_at: datetime | None = None
    media_note: str | None = None


class ParsedNotice(BaseModel):
    is_notice: bool = False
    title: str = "Untitled"
    category: Category = "Unknown"
    urgency: Urgency = "None"
    deadline: str | None = None
    audience: str = "all students"
    draft: str = ""
    why: str = ""
    confidence: float = 0.0
    needs_human: bool = True
    fingerprint: str = ""


class IngestResult(BaseModel):
    ok: bool
    dry_run: bool = False
    action: RunAction
    reason: str
    notice_id: str | None = None
    inbox_id: str | None = None
    run_log_id: str | None = None
    parsed: ParsedNotice | None = None


class ApprovalDecision(BaseModel):
    notice_page_id: str
    status: NoticeStatus
    override_draft: str | None = None
    override_category: Category | None = None


class HealthResponse(BaseModel):
    ok: bool = True
    service: str = "campus-notice-desk"
    dry_run: bool
    notion: bool
    llm: bool
    whatsapp: bool
    email: bool


class SendResult(BaseModel):
    ok: bool
    channel: Literal["whatsapp", "email", "log"]
    detail: str
    recipients: list[str] = Field(default_factory=list)
