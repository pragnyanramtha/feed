from __future__ import annotations

import os
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(PROJECT_ROOT / ".env")


def _env(key: str, default: str = "") -> str:
    return (os.getenv(key) or default).strip()


@dataclass(frozen=True)
class Settings:
    notion_api_key: str
    notion_parent_page_id: str
    notion_notices_db_id: str
    notion_inbox_db_id: str
    notion_run_log_db_id: str
    notion_webhook_verification_token: str

    gemini_api_key: str
    gemini_model: str
    openai_api_key: str
    openai_base_url: str
    openai_model: str

    whatsapp_token: str
    whatsapp_phone_number_id: str
    whatsapp_verify_token: str
    whatsapp_app_secret: str
    whatsapp_default_to: str
    digest_whatsapp_to: tuple[str, ...]

    resend_api_key: str
    resend_from: str
    notice_email_to: str

    dry_run: bool

    @property
    def has_notion(self) -> bool:
        return bool(
            self.notion_api_key
            and self.notion_notices_db_id
            and self.notion_inbox_db_id
            and self.notion_run_log_db_id
        )

    @property
    def has_llm(self) -> bool:
        return bool(self.gemini_api_key or self.openai_api_key)


@lru_cache
def get_settings() -> Settings:
    digest = tuple(
        p.strip()
        for p in _env("DIGEST_WHATSAPP_TO").split(",")
        if p.strip()
    )
    default_to = _env("WHATSAPP_DEFAULT_TO")
    if default_to and default_to not in digest:
        digest = (default_to, *digest)

    notion_key = _env("NOTION_API_KEY")
    notices = _env("NOTION_NOTICES_DB_ID")
    inbox = _env("NOTION_INBOX_DB_ID")
    run_log = _env("NOTION_RUN_LOG_DB_ID")

    return Settings(
        notion_api_key=notion_key,
        notion_parent_page_id=_env("NOTION_PARENT_PAGE_ID"),
        notion_notices_db_id=notices,
        notion_inbox_db_id=inbox,
        notion_run_log_db_id=run_log,
        notion_webhook_verification_token=_env("NOTION_WEBHOOK_VERIFICATION_TOKEN"),
        gemini_api_key=_env("GEMINI_API_KEY"),
        gemini_model=_env("GEMINI_MODEL", "gemini-2.0-flash"),
        openai_api_key=_env("OPENAI_API_KEY"),
        openai_base_url=_env("OPENAI_BASE_URL", "https://api.openai.com/v1").rstrip("/"),
        openai_model=_env("OPENAI_MODEL", "gpt-4o-mini"),
        whatsapp_token=_env("WHATSAPP_TOKEN"),
        whatsapp_phone_number_id=_env("WHATSAPP_PHONE_NUMBER_ID"),
        whatsapp_verify_token=_env("WHATSAPP_VERIFY_TOKEN", "campus-notice-desk"),
        whatsapp_app_secret=_env("WHATSAPP_APP_SECRET"),
        whatsapp_default_to=default_to,
        digest_whatsapp_to=digest,
        resend_api_key=_env("RESEND_API_KEY"),
        resend_from=_env("RESEND_FROM"),
        notice_email_to=_env("NOTICE_EMAIL_TO"),
        dry_run=not (notion_key and notices and inbox and run_log),
    )
