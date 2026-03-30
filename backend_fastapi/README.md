# FastAPI Backend

Bu parallel backend `Node` API ga tegmasdan alohida ishlaydi.

## Port

- FastAPI: `http://127.0.0.1:8010`
- Swagger docs: `http://127.0.0.1:8010/docs`

## O'rnatish

```bash
python3.11 -m venv .venv-fastapi
./.venv-fastapi/bin/pip install -r backend_fastapi/requirements.txt
```

## Ishga tushirish

```bash
./.venv-fastapi/bin/python -m uvicorn backend_fastapi.app.main:app --reload --host 127.0.0.1 --port 8010
```

## Frontendni FastAPI ga ulash

`.env` ichida:

```bash
VITE_API_BASE_URL=http://127.0.0.1:8010
```
