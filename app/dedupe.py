from __future__ import annotations

import hashlib
import re

_URL = re.compile(r"https?://\S+", re.I)
_NOISE = re.compile(r"[\U0001F300-\U0001FAFF]")


def fingerprint(text: str) -> str:
    """Stable id for near-duplicate inbound messages."""
    return hashlib.sha256(_normalize(text).encode("utf-8")).hexdigest()[:16]


def _normalize(text: str) -> str:
    cleaned = _URL.sub("", text or "")
    cleaned = _NOISE.sub("", cleaned)
    cleaned = cleaned.lower()
    cleaned = re.sub(r"[^a-z0-9\u0900-\u097f\s]", " ", cleaned)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned
