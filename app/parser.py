from __future__ import annotations

import json
import logging
import re
from datetime import date, datetime, timedelta, timezone

import httpx

from app.config import Settings, get_settings
from app.dedupe import fingerprint
from app.models import ParsedNotice

log = logging.getLogger(__name__)

GREETING_RE = re.compile(
    r"^\s*(good\s*(morning|night|afternoon|evening)|gm+|gn+|ok+|okay+|yes+|yeah+|lol+|haha+|thanks?|ty|👍|🙏|🌸|🌹)[\s!.]*$",
    re.I,
)
DEADLINE_RE = re.compile(
    r"\b(last date|deadline|submit by|due|before|on or before|closes? on)\b",
    re.I,
)
EXAM_RE = re.compile(
    r"\b(exam|internal|externals?|mid[- ]?sem|end[- ]?sem|hall ticket|timetable|time table|seating)\b",
    re.I,
)
FEST_RE = re.compile(
    r"\b(fest|audition|concert|dj night|freshers|farewell|cultural)\b",
    re.I,
)
CIRCULAR_RE = re.compile(
    r"\b(circular|notice|office order|holiday|postponed|rescheduled|attendance|mandatory)\b",
    re.I,
)
COCURR_RE = re.compile(
    r"\b(workshop|hackathon|club|nss|ncc|sports|placement|internship|seminar)\b",
    re.I,
)
DATE_PATTERNS = [
    re.compile(r"\b(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})\b"),
    re.compile(
        r"\b(\d{1,2})\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*(\d{2,4})?\b",
        re.I,
    ),
]
MONTHS = {
    "jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
    "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12,
}

SYSTEM_PROMPT = """You file college WhatsApp noise into a notice desk.
Return ONLY JSON with this shape:
{
  "is_notice": boolean,
  "title": "short human title, max 80 chars",
  "category": "Exam|Circular|Deadline|Fest|Co-curricular|Ignore|Unknown",
  "urgency": "Critical|High|Medium|Low|None",
  "deadline": "YYYY-MM-DD or null",
  "audience": "who this applies to",
  "draft": "the clean broadcast a class rep would send, 1-4 sentences",
  "why": "one or two sentences a human can scan",
  "confidence": 0.0-1.0,
  "needs_human": boolean
}
Rules:
- Stickers, good morning, ok, memes, chatter → is_notice=false, category=Ignore.
- If it is a real circular/exam/fest/deadline, is_notice=true.
- needs_human=true when confidence < 0.65, audience is unclear, or the date is ambiguous.
- Do not invent a deadline. null if none.
- Title for humans, not JSON. No hashtags.
- Draft should be sendable after a human approves it.
- Understand Hinglish and informal college English.
"""


def parse_inbound(text: str, *, today: date | None = None, settings: Settings | None = None) -> ParsedNotice:
    today = today or datetime.now(timezone.utc).date()
    settings = settings or get_settings()
    raw = (text or "").strip()
    fp = fingerprint(raw)

    if not raw or GREETING_RE.match(raw) or len(raw) < 8:
        return ParsedNotice(
            is_notice=False,
            title="Not a notice",
            category="Ignore",
            urgency="None",
            why="Too short or chatter. An if-statement handled this.",
            confidence=0.95,
            needs_human=False,
            fingerprint=fp,
        )

    heuristic = _heuristic(raw, today, fp)
    if not settings.has_llm:
        return heuristic

    try:
        llm = _llm_parse(raw, today, settings)
        merged = _merge(heuristic, llm, fp)
        return merged
    except Exception:
        log.exception("LLM parse failed, using heuristics")
        heuristic.needs_human = True
        heuristic.why = (heuristic.why + " LLM failed; held for a human.").strip()
        return heuristic


def _heuristic(text: str, today: date, fp: str) -> ParsedNotice:
    deadline = _extract_deadline(text, today)
    category = "Unknown"
    if EXAM_RE.search(text):
        category = "Exam"
    elif FEST_RE.search(text):
        category = "Fest"
    elif COCURR_RE.search(text):
        category = "Co-curricular"
    elif CIRCULAR_RE.search(text) or DEADLINE_RE.search(text):
        category = "Circular" if CIRCULAR_RE.search(text) else "Deadline"

    is_notice = category != "Unknown" or bool(deadline) or len(text) > 40
    if category == "Unknown" and is_notice:
        category = "Circular" if is_notice else "Unknown"

    urgency = _urgency_from_deadline(deadline, today) if deadline else "None"
    if DEADLINE_RE.search(text) and urgency == "None":
        urgency = "Medium"

    title = _title_from_text(text)
    needs_human = category == "Unknown" or (is_notice and not deadline and DEADLINE_RE.search(text) is not None)
    draft = text.strip() if is_notice else ""
    why = "Rule-based parse. " + (
        f"Deadline {deadline}." if deadline else "No date found."
    )
    return ParsedNotice(
        is_notice=is_notice and category != "Ignore",
        title=title,
        category=category if is_notice else "Ignore",
        urgency=urgency,  # type: ignore[arg-type]
        deadline=deadline,
        audience="all students",
        draft=draft[:1500],
        why=why,
        confidence=0.55 if is_notice else 0.4,
        needs_human=needs_human or (is_notice and category == "Unknown"),
        fingerprint=fp,
    )


def _llm_parse(text: str, today: date, settings: Settings) -> ParsedNotice:
    user = f"Today is {today.isoformat()}.\n\nMessage:\n{text[:8000]}"
    if settings.gemini_api_key:
        payload = _gemini(user, settings)
    else:
        payload = _openai(user, settings)
    return ParsedNotice.model_validate(payload)


def _gemini(user: str, settings: Settings) -> dict:
    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"{settings.gemini_model}:generateContent"
    )
    body = {
        "system_instruction": {"parts": [{"text": SYSTEM_PROMPT}]},
        "contents": [{"role": "user", "parts": [{"text": user}]}],
        "generationConfig": {
            "temperature": 0.1,
            "responseMimeType": "application/json",
        },
    }
    with httpx.Client(timeout=30) as client:
        r = client.post(url, params={"key": settings.gemini_api_key}, json=body)
        r.raise_for_status()
        data = r.json()
    text = data["candidates"][0]["content"]["parts"][0]["text"]
    return _loads_json(text)


def _openai(user: str, settings: Settings) -> dict:
    url = f"{settings.openai_base_url}/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.openai_api_key}",
        "Content-Type": "application/json",
    }
    body = {
        "model": settings.openai_model,
        "temperature": 0.1,
        "response_format": {"type": "json_object"},
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user},
        ],
    }
    with httpx.Client(timeout=30) as client:
        r = client.post(url, headers=headers, json=body)
        r.raise_for_status()
        data = r.json()
    return _loads_json(data["choices"][0]["message"]["content"])


def _loads_json(text: str) -> dict:
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text)
    return json.loads(text)


def _merge(heuristic: ParsedNotice, llm: ParsedNotice, fp: str) -> ParsedNotice:
    deadline = llm.deadline or heuristic.deadline
    category = llm.category if llm.category != "Unknown" else heuristic.category
    urgency = llm.urgency if llm.urgency != "None" else heuristic.urgency
    if deadline and urgency == "None":
        urgency = _urgency_from_deadline(deadline, datetime.now(timezone.utc).date())  # type: ignore[assignment]
    needs_human = llm.needs_human or llm.confidence < 0.65 or category == "Unknown"
    if not llm.is_notice:
        category = "Ignore"
        needs_human = False
    return ParsedNotice(
        is_notice=llm.is_notice,
        title=(llm.title or heuristic.title)[:80],
        category=category,
        urgency=urgency,
        deadline=deadline,
        audience=llm.audience or heuristic.audience,
        draft=(llm.draft or heuristic.draft)[:1500],
        why=(llm.why or heuristic.why)[:500],
        confidence=llm.confidence,
        needs_human=needs_human,
        fingerprint=fp,
    )


def _urgency_from_deadline(deadline: str, today: date) -> str:
    try:
        due = date.fromisoformat(deadline)
    except ValueError:
        return "Medium"
    delta = (due - today).days
    if delta < 0:
        return "High"
    if delta <= 1:
        return "Critical"
    if delta <= 3:
        return "High"
    if delta <= 7:
        return "Medium"
    return "Low"


def _extract_deadline(text: str, today: date) -> str | None:
    lower = text.lower()
    if "tomorrow" in lower or "tmrw" in lower or "tommorow" in lower:
        return (today + timedelta(days=1)).isoformat()
    if re.search(r"\btoday\b", lower):
        return today.isoformat()

    m = DATE_PATTERNS[0].search(text)
    if m:
        d, mo, y = int(m.group(1)), int(m.group(2)), int(m.group(3))
        if y < 100:
            y += 2000
        try:
            return date(y, mo, d).isoformat()
        except ValueError:
            try:
                return date(y, d, mo).isoformat()
            except ValueError:
                pass

    m = DATE_PATTERNS[1].search(text)
    if m:
        d = int(m.group(1))
        mo = MONTHS[m.group(2)[:3].lower()]
        y = int(m.group(3)) if m.group(3) else today.year
        if y < 100:
            y += 2000
        try:
            parsed = date(y, mo, d)
            if parsed < today - timedelta(days=30) and not m.group(3):
                parsed = date(today.year + 1, mo, d)
            return parsed.isoformat()
        except ValueError:
            return None
    return None


def _title_from_text(text: str) -> str:
    line = text.strip().splitlines()[0]
    line = re.sub(r"\s+", " ", line)
    if len(line) <= 80:
        return line
    return line[:77] + "…"
