from unittest.mock import MagicMock

from app.ingest import ingest
from app.models import InboundEvent, ParsedNotice
from app.notion_ops import NotionDesk


def _desk() -> NotionDesk:
    desk = NotionDesk.__new__(NotionDesk)
    desk.settings = MagicMock(dry_run=True)
    desk.notion = MagicMock()
    desk.create_inbox = MagicMock(return_value="inbox-1")
    desk.find_notice_by_fingerprint = MagicMock(return_value=None)
    desk.create_notice = MagicMock(return_value="notice-1")
    desk.write_run_log = MagicMock(return_value="run-1")
    desk.update_notice = MagicMock()
    return desk


def test_empty_inbound_is_logged_not_crashed():
    result = ingest(InboundEvent(text=""), desk=_desk())
    assert result.ok is True
    assert result.action == "ignored"


def test_chatter_does_not_create_notice():
    desk = _desk()
    result = ingest(InboundEvent(text="Good morning"), desk=desk)
    assert result.action == "ignored"
    desk.create_notice.assert_not_called()
    desk.write_run_log.assert_called()


def test_real_circular_creates_notice_and_run_log():
    desk = _desk()
    result = ingest(
        InboundEvent(
            text="Circular: internals postponed to 28 Aug, hall ticket from office tomorrow",
            sender="CR",
        ),
        desk=desk,
    )
    assert result.ok is True
    assert result.action in {"parsed", "held"}
    desk.create_notice.assert_called_once()
    desk.write_run_log.assert_called()
    assert result.notice_id == "notice-1"


def test_duplicate_fingerprint_does_not_double_file():
    desk = _desk()
    desk.find_notice_by_fingerprint = MagicMock(return_value="existing-notice")
    result = ingest(
        InboundEvent(text="Exam form last date 22/08/2026 submit in admin block before 5pm"),
        desk=desk,
    )
    assert result.action == "duplicate"
    desk.create_notice.assert_not_called()
    assert result.notice_id == "existing-notice"


def test_parsed_notice_shape():
    p = ParsedNotice(title="x", fingerprint="abc")
    assert p.category == "Unknown"
    assert p.needs_human is True
