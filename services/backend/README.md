# Backend

Bu loyiha uchun yagona backend endi shu FastAPI servis hisoblanadi va saqlash qatlami PostgreSQL ga ko‘chirildi.

## Port

- FastAPI: `http://127.0.0.1:8010`
- Swagger docs: `http://127.0.0.1:8010/docs`

## Database

- PostgreSQL kerak
- `DATABASE_URL` misol:

```bash
DATABASE_URL=postgresql+psycopg://postgres:postgres@127.0.0.1:5432/gamehub
```

## O'rnatish

```bash
python3.11 -m venv .venv-fastapi
./.venv-fastapi/bin/pip install -r services/backend/requirements.txt
```

## Migration

```bash
cd services/backend
../../.venv-fastapi/bin/alembic upgrade head
```

Alembic birinchi migrationda kerakli jadvallarni yaratadi. Agar `data/*.json` ichida eski ma'lumotlar bo‘lsa, backend startup paytida bo‘sh PostgreSQL bazaga ularni import qiladi.

## Ishga tushirish

```bash
./.venv-fastapi/bin/python -m uvicorn --app-dir services/backend app.main:app --reload --host 127.0.0.1 --port 8010
```

## Frontendni FastAPI ga ulash

`.env` ichida:

```bash
VITE_API_BASE_URL=http://127.0.0.1:8010
DATABASE_URL=postgresql+psycopg://postgres:postgres@127.0.0.1:5432/gamehub
```
