# GameHub Full Stack

Bu loyiha endi faqat frontend emas, balki local ishlaydigan to'liq `frontend + backend + API` holatiga keltirilgan.

## Nimalar bor

- `React + Vite + TypeScript` frontend
- `Node.js` built-in `http` server asosidagi backend
- parallel `FastAPI` backend
- Teacher/Admin auth
- Persistent user storage
- Persistent `game-questions` API
- Billing / premium checkout API
- Premium status sync
- Local JSON database (`backend/data`)

## API endpointlar

- `POST /users/` - teacher register
- `POST /auth/login` - login
- `POST /auth/logout` - logout
- `GET /users/me` - current user
- `GET /game-questions/:key` - o'yin savollarini olish
- `PUT /game-questions/:key` - o'yin savollarini saqlash
- `GET /billing/status` - premium holati
- `POST /billing/checkout` - checkout / premium aktivatsiya
- `POST /billing/cancel` - premium bekor qilish
- `GET /health` - backend healthcheck

## Ishga tushirish

1. `.env.example` dan `.env` yarating.
2. Frontend dependency allaqachon `package.json` ichida.
3. Ikki terminalda ishga tushiring:

```bash
npm run dev:api
```

```bash
npm run dev
```

Frontend:

- `http://127.0.0.1:5173`

Backend:

- `http://127.0.0.1:8000`

FastAPI:

- `http://127.0.0.1:8010`
- docs: `http://127.0.0.1:8010/docs`

## FastAPI o'rnatish

```bash
python3.11 -m venv .venv-fastapi
./.venv-fastapi/bin/pip install -r backend_fastapi/requirements.txt
```

Ishga tushirish:

```bash
npm run dev:api:fastapi
```

## Default admin

Backend birinchi ishga tushganda seed admin yaratadi:

- Email: `admin@gamehub.local`
- Password: `admin1234`

Buni `.env` orqali almashtirish mumkin:

- `SEED_ADMIN_EMAIL`
- `SEED_ADMIN_PASSWORD`

## Storage

Persistent ma'lumotlar shu yerda saqlanadi:

- `backend/data/users.json`
- `backend/data/sessions.json`
- `backend/data/game-questions.json`
- `backend/data/subscriptions.json`

## Frontend-backend ulanishi

Frontend default `VITE_API_BASE_URL=http://127.0.0.1:8010` bilan ishlaydi. Teacher savollari, auth va premium checkout endi backend API orqali ishlaydi.

## Deploy

### Backend: Render

- Config: `render.yaml`
- Root dir: `backend_fastapi`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

Render env vars:

- `CLIENT_ORIGINS=https://your-frontend.vercel.app`
- `SEED_ADMIN_EMAIL=...`
- `SEED_ADMIN_PASSWORD=...`

Muhim:

- backend JSON fayllarga yozadi
- Render’da persistent disk ulash tavsiya qilinadi
- aks holda restart yoki redeploydan keyin data yo‘qolishi mumkin

### Frontend: Vercel

- Config: `vercel.json`
- Build command: `npm run build`
- Output directory: `dist`

Vercel env var:

- `VITE_API_BASE_URL=https://your-render-service.onrender.com`

## Eslatma

- Bu local/full-stack dev versiya.
- Database hozir JSON file asosida.
- Production uchun keyingi qadam: PostgreSQL, JWT refresh rotation, rate limiting, validation layer, webhook payment, password reset, audit log.
