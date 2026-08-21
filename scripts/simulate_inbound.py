#!/usr/bin/env python3
"""Push one messy WhatsApp-style message through the engine.

    python scripts/simulate_inbound.py
    python scripts/simulate_inbound.py "internals postponed to 28 Aug, hall ticket tmrw"
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from app.config import get_settings  # noqa: E402
from app.ingest import ingest  # noqa: E402
from app.models import InboundEvent  # noqa: E402

DEFAULT = (
    "guys internals postponed to 28 Aug, hall ticket collect from office tmrw. "
    "attendance compulsory. fwd to class group - CR"
)


def main() -> None:
    text = " ".join(sys.argv[1:]).strip() or DEFAULT
    settings = get_settings()
    event = InboundEvent(text=text, sender="CR", source="manual", external_id="sim-1")
    result = ingest(event)
    print(json.dumps(result.model_dump(mode="json"), indent=2))
    if settings.dry_run:
        print("\n[dry-run] Notion DBs not configured. Parser still ran. Set .env to file cards.")


if __name__ == "__main__":
    main()
