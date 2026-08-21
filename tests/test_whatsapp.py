from app.webhooks.whatsapp import _extract_messages


def test_extracts_text_message():
    payload = {
        "entry": [
            {
                "changes": [
                    {
                        "value": {
                            "contacts": [{"wa_id": "9198", "profile": {"name": "CR"}}],
                            "messages": [
                                {
                                    "id": "wamid.1",
                                    "from": "9198",
                                    "timestamp": "1787300000",
                                    "type": "text",
                                    "text": {"body": "exam postponed to 28 Aug"},
                                }
                            ],
                        }
                    }
                ]
            }
        ]
    }
    events = list(_extract_messages(payload))
    assert len(events) == 1
    assert events[0].sender == "CR"
    assert "postponed" in events[0].text
    assert events[0].source == "whatsapp"
    assert events[0].external_id == "wamid.1"
