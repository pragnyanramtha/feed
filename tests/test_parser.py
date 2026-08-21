from datetime import date

from app.dedupe import fingerprint
from app.parser import parse_inbound


def test_greetings_are_ignored():
    parsed = parse_inbound("Good morning 🌸")
    assert parsed.is_notice is False
    assert parsed.category == "Ignore"
    assert parsed.needs_human is False


def test_ok_is_ignored():
    parsed = parse_inbound("ok")
    assert parsed.is_notice is False


def test_exam_postponement_extracts_deadline():
    parsed = parse_inbound(
        "guys internals postponed to 28 Aug, hall ticket collect from office tmrw",
        today=date(2026, 8, 21),
    )
    assert parsed.is_notice is True
    assert parsed.category == "Exam"
    assert parsed.deadline in {"2026-08-28", "2026-08-22"}
    assert parsed.urgency in {"Critical", "High", "Medium", "Low"}


def test_last_date_becomes_deadline_category_or_circular():
    parsed = parse_inbound(
        "Exam form last date 22/08/2026 submit in admin block before 5pm",
        today=date(2026, 8, 21),
    )
    assert parsed.is_notice is True
    assert parsed.deadline == "2026-08-22"
    assert parsed.urgency == "Critical"


def test_empty_does_not_crash():
    parsed = parse_inbound("   ")
    assert parsed.is_notice is False


def test_fingerprint_stable_and_ignores_urls_and_emoji():
    a = fingerprint("Submit form https://bit.ly/x 🌸")
    b = fingerprint("submit form")
    assert a == b
    assert fingerprint("different") != a
