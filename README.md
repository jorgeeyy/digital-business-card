# Tap Card — Digital Business Card Platform

A Linktree-style digital business card app. Build a beautiful card with a visual editor, then publish it to a unique link like `yourapp.com/username`.

## Stack

- **Frontend:** React 19 + TypeScript + Vite (`frontend/`)
- **Backend:** FastAPI + SQLAlchemy + SQLite, managed with [uv](https://docs.astral.sh/uv/) (`backend/`)
- **Auth:** Email/password + Google OAuth (JWT httpOnly cookie)
- **Media:** Cloudflare R2 (local filesystem fallback in dev)

## Project Structure

```
digital-business-card/
├── frontend/          # Vite + React app
│   └── src/
│       ├── pages/     # Landing, Login, Signup, Onboarding, Editor, Dashboard
│       ├── components/# Configurator, pickers, upload, preview
│       ├── store.tsx  # Card config (API-backed + localStorage draft)
│       ├── auth.tsx   # Auth context
│       └── api.ts     # API client
├── backend/           # FastAPI app (uv-managed)
│   ├── pyproject.toml # Dependencies
│   ├── uv.lock        # Locked versions
│   ├── main.py        # App entry, CORS, routers
│   ├── models.py      # User, Card tables
│   ├── auth.py        # Password hashing, JWT, current_user
│   ├── r2.py          # R2 upload + local fallback
│   └── routes/        # auth, cards, media, public card
└── sample/            # Design reference files
```

## Getting Started

### Prerequisites

- Node.js 20+
- Python 3.11+
- [uv](https://docs.astral.sh/uv/)

### 1. Backend (uv)

Requires [uv](https://docs.astral.sh/uv/).

```bash
cd backend
uv sync                              # install deps from uv.lock
cp .env.example .env                 # then edit values (see below)
uv run uvicorn main:app --reload --port 8000
```

Backend runs at http://localhost:8000 (API docs at `/docs`).

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at http://localhost:5173 and proxies `/api` to the backend.

### 3. Open

Visit http://localhost:5173 — sign up, claim a username, build your card, publish.

Public cards are served by the backend at `http://localhost:8000/username` in development.

## Environment Variables (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `SECRET_KEY` | Yes | Random string for signing JWTs |
| `ACCESS_TOKEN_EXPIRE_DAYS` | No (7) | Session lifetime |
| `FRONTEND_ORIGIN` | Yes | `http://localhost:5173` — CORS origin |
| `PUBLIC_BASE_URL` | Yes | `http://localhost:8000` — used in public card links |
| `GOOGLE_CLIENT_ID` | For Google login | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | For Google login | From Google Cloud Console |
| `R2_ACCOUNT_ID` | For R2 uploads | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | For R2 uploads | R2 API token access key |
| `R2_SECRET_ACCESS_KEY` | For R2 uploads | R2 API token secret |
| `R2_BUCKET` | For R2 uploads | Bucket name |
| `R2_PUBLIC_URL` | For R2 uploads | Public bucket URL (e.g. `https://pub-xxx.r2.dev`) |

Without R2 credentials, uploads are stored in `backend/uploads/` and served locally.

### Google OAuth Setup

1. Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Create an **OAuth 2.0 Client ID** (type: Web application)
3. Add authorized redirect URI: `http://localhost:8000/api/auth/google/callback`
4. Copy Client ID and Secret into `backend/.env`

## Features

- Visual card editor: 6 palettes, custom colors, 4 fonts, 3 layouts
- Live preview
- Social links with auto-generated URLs (10 platforms incl. WhatsApp)
- Portrait image/video + QR code upload (R2 or local)
- vCard download, share button
- Email/password + Google auth
- Username claim with live availability check
- Publish → unique public link per card
- Debounced autosave + localStorage offline draft
- Download card as standalone HTML file

## API Overview

```
POST   /api/auth/signup          POST  /api/auth/login
POST   /api/auth/logout          GET   /api/auth/me
GET    /api/auth/google          GET   /api/auth/google/callback
PUT    /api/auth/username        # claim username

GET    /api/cards                POST  /api/cards
PUT    /api/cards/{id}           DELETE /api/cards/{id}
POST   /api/cards/{id}/publish   GET   /api/cards/username-available

POST   /api/media/upload         # multipart file → R2/local URL
GET    /{username}               # public card (serves stored HTML)
```

## Build

```bash
cd frontend && npm run build   # outputs to frontend/dist/
```
