# Setup — Campus Notice Desk

Python 3.10+. Notion free/Education Plus. Meta WhatsApp Cloud API test number is enough. You do not need to scrape a college group.

## 1. Install

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
cp .env.example .env
```

## 2. Notion integration

1. Open [Internal integrations](https://www.notion.so/profile/integrations/internal).
2. Create one named **Campus Notice Desk**.
3. Copy the secret (`secret_…`) into `NOTION_API_KEY`.
4. Create a page **Campus Notice Desk**.
5. **… → Connections →** add the integration.
6. Copy the page id from the URL into `NOTION_PARENT_PAGE_ID`.

## 3. Databases

```bash
python scripts/bootstrap_notion.py
```

Paste the three IDs into `.env`. On the parent page, add linked database views:

- **Pending approval** — Notices filtered `Status = Pending` or `Needs human`
- **Due this week** — Notices with a Deadline, calendar or table
- **Sent today** — Run Log filtered to `Action = sent`
- **Inbox** — newest first

Share every database with the integration if bootstrap did not.

## 4. Prove the engine without WhatsApp

```bash
python scripts/simulate_inbound.py
python scripts/simulate_inbound.py "Good morning"
uvicorn app.main:app --reload --port 8000
```

Confirm Run Log rows are attributed to the **integration**, not your user.

## 5. Optional: Gemini

Put `GEMINI_API_KEY` in `.env`. Heuristics still run if the key is missing; notices with fuzzy dates go to **Needs human**.

## 6. Optional: WhatsApp Cloud API

1. [developers.facebook.com](https://developers.facebook.com) → app → add **WhatsApp**.
2. Copy the **test** phone number id and a token into `.env`.
3. Add your phone as a tester.
4. After deploy, Callback URL: `https://<host>/webhooks/whatsapp`
5. Verify token: `campus-notice-desk` (or `WHATSAPP_VERIFY_TOKEN`)
6. Subscribe to `messages`
7. `DIGEST_WHATSAPP_TO` = the class test list in E.164 (`9198…`)

Inbound: people **forward or type** the messy circular to the test number. That is the legal trigger. Group-listen via WhatsApp Web clones is out of scope.

Text send only works inside the 24-hour service window after they message you. For a cold blast, use a template or the Resend email fallback.

## 7. Optional: email send

[Resend](https://resend.com) free tier: `RESEND_API_KEY`, `RESEND_FROM`, `NOTICE_EMAIL_TO`.

## 8. Notion approval webhook

After the service is on a public URL:

1. Integration → webhooks → `https://<host>/webhooks/notion`
2. First ping prints a `verification_token` in logs — paste into `NOTION_WEBHOOK_VERIFICATION_TOKEN`
3. Subscribe to `page.properties_updated`

Until that exists, hit `GET /cron/approvals` after you flip a card to **Approved**.

## 9. Deploy later

- **Vercel:** this repo already has `api/index.py` + `vercel.json`
- **Render / Railway:** `Procfile` runs uvicorn
- Cron: daily `GET /cron/reminders`, every few minutes `GET /cron/approvals`

## Troubleshooting

- **Notion 404 / unauthorized** — the integration is not connected to the parent page or the DB ids are wrong.
- **Run Log empty** — you are still in dry-run (`/health` shows `"dry_run": true`).
- **WhatsApp verify 403** — token mismatch with the dashboard.
- **Approved but nothing sent** — no WA/email keys; check Run Log `channel=log`, then wire Resend for demo day.
