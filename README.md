# Campus Notice Desk

WhatsApp is where college information actually lands. It is a terrible filing system. This service turns that noise into a **shared notice desk in Notion**: categorized, dated, approved by a human, then sent cleanly — with a Run Log your code writes.

Your code is the engine. Notion is the interface. A trigger fires, a real message goes out, a row lands in the Run Log.

```
WhatsApp / POST /inbound
        │
        ▼
   this service          ──►  parse, dedupe, hold garbage
        │
        ├──► Notion Inbox + Notices (Pending / Needs human)
        │
        │    human Approves or Rejects in Notion
        │
        ├──► WhatsApp digest or email          ← real-world action
        └──► Run Log row (written by the integration, not by you)
```

Built for the Notion track: one job, killed cleanly. Not a chatbot. Not a Zapier chain. Not a feed dump.

## The job this kills

Someone in the class group reads 200 messages, decides what is a circular vs junk, forwards the three that matter, and nobody reminds anyone before the deadline.

Students still all see the **same** board — Exam, Circular, Fest, Deadline — not a private Instagram feed each. Urgency and due date are fields on the card when the message had them.

## What you need

| Piece | Why |
|---|---|
| Notion workspace + internal integration | The desk humans operate |
| This repo, deployed with a public HTTPS URL | So webhooks can fire without you |
| Meta WhatsApp Cloud API **test number** | People forward/send messy notices *to* it. You do not scrape the official group |
| Gemini (or any OpenAI-compatible) key | Read Hinglish / messy paragraphs. Greetings are handled by an if-statement |
| Optional: Resend | Email digest if WhatsApp templates stall — still counts as outside Notion |

Day-one Notion setup is in [docs/setup.md](docs/setup.md).

## Quick start (no deploy yet)

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
cp .env.example .env

# Parser only — no Notion keys required
python scripts/simulate_inbound.py
python scripts/simulate_inbound.py "Good morning"

pytest
uvicorn app.main:app --reload --port 8000
```

Then:

```bash
curl -s localhost:8000/health | python -m json.tool
curl -s localhost:8000/inbound -H 'content-type: application/json' \
  -d '{"text":"Exam form last date 22/08/2026 submit in admin block before 5pm","sender":"office"}'
```

Wire Notion when you are ready:

1. Create a parent page **Campus Notice Desk**, share it with the integration.
2. `python scripts/bootstrap_notion.py` — creates **Notices**, **Inbox**, **Run Log**.
3. Paste the three database IDs into `.env`.
4. On the parent page, add linked views: **Pending approval**, **Due this week**, **Sent today**.
5. Simulate again. Cards should appear as the integration, not as you.

Deploy later (Vercel / Render / Railway). Point Meta at `https://<host>/webhooks/whatsapp` and Notion at `https://<host>/webhooks/notion`. Cron `GET /cron/reminders` daily and `GET /cron/approvals` as a backup poll.

## API

| Method | Path | What |
|---|---|---|
| GET | `/health` | Config flags. Fine to hit during judging |
| POST | `/inbound` | Generic trigger (paste, form, another webhook) |
| GET/POST | `/webhooks/whatsapp` | Meta Cloud API verify + inbound |
| POST | `/webhooks/notion` | Human flipped **Approved** / **Rejected** |
| GET | `/cron/approvals` | Drain Approved cards if the Notion webhook was slow |
| GET | `/cron/reminders` | Re-send for notices due tomorrow |

`POST /inbound` body:

```json
{
  "text": "internals postponed to 28 Aug, hall ticket tmrw",
  "sender": "CR",
  "source": "inbound",
  "external_id": "optional-idempotency-key"
}
```

## Notion (judged — design this, do not dump JSON)

A stranger opens the workspace and can run the job.

**Notices** — the board. Title, category, deadline, urgency, audience, status (`Pending` → `Approved` / `Rejected` → `Sent`, or `Needs human`), two-line why, editable draft.

**Inbox** — raw inbound. Proof the trigger fired.

**Run Log** — written only by this integration. Time, trigger, action (`parsed` / `held` / `sent` / `failed` / `duplicate` / `ignored` / `reminder`), result.

Turn the service off. The desk is still useful: pending work, what went out, what is overdue.

## Where AI earns it

- A messy Hinglish paragraph → title, category, deadline, draft broadcast.
- Ambiguous date or unclear audience → **Needs human**, not a silent drop.
- `Good morning`, `ok`, stickers → an if-statement. No model.

If an if-statement could have done it, an if-statement does it.

## Project layout

```
app/
  main.py            FastAPI engine
  parser.py          rules first, then Gemini/OpenAI
  ingest.py          inbound → Notion → wait
  senders.py         WhatsApp Cloud API, then Resend, then log
  notion_ops.py      human-readable pages (from the WA→Notion reference)
  webhooks/          Meta + Notion
  reminders.py       cron
scripts/bootstrap_notion.py
scripts/simulate_inbound.py
pitch/Campus-Notice-Desk.pptx
```

## What we are not building

- Unofficial WhatsApp Web scrapers (ToS, bans, dead QR mid-demo)
- A Zapier canvas with a Notion page on top
- A student-facing React app
- Per-person generated feeds
- Five extra features

The reference we started from, [whatsapp-notion-sync](https://github.com/AyushUnleashed/whatsapp-notion-sync), is a one-way group dump into Notion pages. We kept its Notion client patterns and replaced the dump with a notice desk, an approval gate, a real send, and a Run Log.

## Pitch (7 slides, judging template)

[pitch/Campus-Notice-Desk.pptx](pitch/Campus-Notice-Desk.pptx)

1. Title — project, Notion Track, team, college  
2. Problem + existing gap  
3. Proposed solution  
4. Architecture + tech stack  
5. Key features  
6. Impact + feasibility  
7. Demo + conclusion  

Edit `TEAM_NAME`, `TEAM_ID`, `COLLEGE` at the top of `pitch/generate_pptx.py`, then:

```bash
python pitch/generate_pptx.py
```

## License

MIT. Notion API usage follows your integration’s workspace permissions.
