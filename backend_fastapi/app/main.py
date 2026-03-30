from __future__ import annotations

import hashlib
import hmac
import json
import os
import secrets
from pathlib import Path
from typing import Any, Literal
from uuid import uuid4

from fastapi import Depends, FastAPI, Header, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


ROOT_DIR = Path(__file__).resolve().parents[2]
DATA_DIR = ROOT_DIR / "backend" / "data"
USERS_FILE = DATA_DIR / "users.json"
SESSIONS_FILE = DATA_DIR / "sessions.json"
GAME_QUESTIONS_FILE = DATA_DIR / "game-questions.json"
GAME_FEEDBACK_FILE = DATA_DIR / "game-feedback.json"
SUBSCRIPTIONS_FILE = DATA_DIR / "subscriptions.json"
DEFAULT_CLIENT_ORIGINS = [
    "http://127.0.0.1:5173",
    "http://localhost:5173",
    "http://127.0.0.1:5174",
    "http://localhost:5174",
]
SEED_ADMIN_EMAIL = os.getenv("SEED_ADMIN_EMAIL", "admin@gamehub.local")
SEED_ADMIN_PASSWORD = os.getenv("SEED_ADMIN_PASSWORD", "admin1234")
PREMIUM_DURATION_MS = 30 * 24 * 60 * 60 * 1000


class UserCreate(BaseModel):
    email: str
    username: str = Field(min_length=2)
    password: str = Field(min_length=4)


class LoginInput(BaseModel):
    email: str
    password: str = Field(min_length=1)


class UserOut(BaseModel):
    id: str
    email: str
    username: str
    roles: list[str]


class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class QuestionsPayload(BaseModel):
    questions: list[Any] = Field(default_factory=list)


class QuestionsResponse(BaseModel):
    game_key: str
    questions: list[Any]


class FeedbackCreateInput(BaseModel):
    game_key: str = Field(min_length=1)
    game_title: str | None = None
    message: str = Field(min_length=1)


class FeedbackItem(BaseModel):
    id: str
    gameKey: str
    gameTitle: str
    userId: str
    userName: str
    message: str
    status: Literal["pending", "approved"]
    createdAt: int
    approvedBy: str | None = None
    approvedByName: str | None = None
    approvedAt: int | None = None


class FeedbackListResponse(BaseModel):
    items: list[FeedbackItem]


class BillingCheckoutInput(BaseModel):
    plan: Literal["starter", "pro", "team"] = "starter"
    billingCycle: Literal["monthly", "yearly"] = "monthly"
    method: Literal["card", "click", "payme"] = "card"
    fullName: str = Field(min_length=1)
    email: str
    seats: int = Field(default=1, ge=1, le=500)
    promoCode: str | None = None


class BillingStatusResponse(BaseModel):
    active: bool
    plan: str
    expires_at: int | None


class BillingCheckoutResponse(BaseModel):
    ok: bool = True
    transaction_id: str
    active: bool
    plan: str
    expires_at: int | None


def get_client_origins() -> list[str]:
    raw = os.getenv("CLIENT_ORIGINS", "").strip()
    if raw:
        origins = [item.strip().rstrip("/") for item in raw.split(",") if item.strip()]
        if origins:
            return origins

    single_origin = os.getenv("CLIENT_ORIGIN", "").strip().rstrip("/")
    if single_origin:
        return [single_origin]

    return DEFAULT_CLIENT_ORIGINS


CLIENT_ORIGINS = get_client_origins()

app = FastAPI(title="GameHub FastAPI", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=CLIENT_ORIGINS,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


def now_ms() -> int:
    import time

    return int(time.time() * 1000)


def ensure_storage() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    for file_path, fallback in (
        (USERS_FILE, []),
        (SESSIONS_FILE, []),
        (GAME_QUESTIONS_FILE, {}),
        (GAME_FEEDBACK_FILE, []),
        (SUBSCRIPTIONS_FILE, []),
    ):
        if not file_path.exists():
            file_path.write_text(json.dumps(fallback, indent=2), encoding="utf-8")


def read_json(path: Path, fallback: Any) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return fallback


def write_json(path: Path, value: Any) -> None:
    path.write_text(json.dumps(value, indent=2), encoding="utf-8")


def normalize_email(value: str) -> str:
    email = str(value or "").strip().lower()
    if "@" not in email or email.startswith("@") or email.endswith("@"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email noto'g'ri.")
    local, _, domain = email.partition("@")
    if not local or "." not in domain:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email noto'g'ri.")
    return email


def hash_password(password: str, salt: str | None = None) -> str:
    salt = salt or secrets.token_hex(16)
    hashed = hashlib.scrypt(password.encode("utf-8"), salt=salt.encode("utf-8"), n=2**14, r=8, p=1).hex()
    return f"{salt}:{hashed}"


def verify_password(password: str, stored: str) -> bool:
    try:
        salt, existing = stored.split(":", 1)
    except ValueError:
        return False
    candidate = hash_password(password, salt).split(":", 1)[1]
    return hmac.compare_digest(existing, candidate)


def seed_admin() -> None:
    users = read_json(USERS_FILE, [])
    if any(user.get("email") == SEED_ADMIN_EMAIL for user in users):
        return

    users.insert(
        0,
        {
            "id": str(uuid4()),
            "email": SEED_ADMIN_EMAIL,
            "username": "Admin",
            "passwordHash": hash_password(SEED_ADMIN_PASSWORD),
            "roles": ["admin", "teacher"],
            "createdAt": now_ms(),
        },
    )
    write_json(USERS_FILE, users)


@app.on_event("startup")
def on_startup() -> None:
    ensure_storage()
    seed_admin()


def get_authorization_token(authorization: str | None) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        return ""
    return authorization.replace("Bearer ", "", 1).strip()


def build_user_out(user: dict[str, Any]) -> UserOut:
    return UserOut(
        id=user["id"],
        email=user["email"],
        username=user["username"],
        roles=list(user.get("roles", [])),
    )


def get_current_user(authorization: str | None = Header(default=None)) -> dict[str, Any]:
    token = get_authorization_token(authorization)
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session topilmadi. Qayta login qiling.")

    sessions = read_json(SESSIONS_FILE, [])
    session = next((item for item in sessions if item.get("accessToken") == token), None)
    if not session:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session topilmadi. Qayta login qiling.")

    users = read_json(USERS_FILE, [])
    user = next((item for item in users if item.get("id") == session.get("userId")), None)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session topilmadi. Qayta login qiling.")

    return user


def get_optional_current_user(authorization: str | None = Header(default=None)) -> dict[str, Any] | None:
    token = get_authorization_token(authorization)
    if not token:
        return None

    sessions = read_json(SESSIONS_FILE, [])
    session = next((item for item in sessions if item.get("accessToken") == token), None)
    if not session:
        return None

    users = read_json(USERS_FILE, [])
    return next((item for item in users if item.get("id") == session.get("userId")), None)


def is_teacher_like(user: dict[str, Any]) -> bool:
    roles = user.get("roles", [])
    return isinstance(roles, list) and any(role in {"teacher", "admin"} for role in roles)


@app.get("/")
def root() -> dict[str, Any]:
    return {
        "status": "ok",
        "service": "gamehub-fastapi",
        "message": "FastAPI backend ishlayapti.",
        "docs": "/docs",
    }


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "gamehub-fastapi"}


@app.post("/users/", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register_user(payload: UserCreate) -> UserOut:
    users = read_json(USERS_FILE, [])
    email = normalize_email(payload.email)

    if any(item.get("email") == email for item in users):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Bu email bilan foydalanuvchi mavjud.")

    user = {
        "id": str(uuid4()),
        "email": email,
        "username": payload.username.strip(),
        "passwordHash": hash_password(payload.password),
        "roles": ["teacher"],
        "createdAt": now_ms(),
    }
    users.insert(0, user)
    write_json(USERS_FILE, users)
    return build_user_out(user)


@app.post("/auth/login", response_model=LoginResponse)
def login(payload: LoginInput) -> LoginResponse:
    users = read_json(USERS_FILE, [])
    user = next((item for item in users if item.get("email") == normalize_email(payload.email)), None)

    if not user or not verify_password(payload.password, user.get("passwordHash", "")):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Email yoki parol noto'g'ri.")

    sessions = read_json(SESSIONS_FILE, [])
    session = {
        "id": str(uuid4()),
        "userId": user["id"],
        "accessToken": secrets.token_hex(32),
        "refreshToken": secrets.token_hex(32),
        "createdAt": now_ms(),
    }
    sessions.append(session)
    write_json(SESSIONS_FILE, sessions)

    return LoginResponse(
        access_token=session["accessToken"],
        refresh_token=session["refreshToken"],
    )


@app.post("/auth/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(authorization: str | None = Header(default=None)) -> Response:
    token = get_authorization_token(authorization)
    if not token:
        return Response(status_code=status.HTTP_204_NO_CONTENT)

    sessions = read_json(SESSIONS_FILE, [])
    write_json(SESSIONS_FILE, [item for item in sessions if item.get("accessToken") != token])
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@app.get("/users/me", response_model=UserOut)
def current_user(user: dict[str, Any] = Depends(get_current_user)) -> UserOut:
    return build_user_out(user)


@app.get("/game-questions/{game_key}", response_model=QuestionsResponse)
def get_game_questions(game_key: str, _: dict[str, Any] = Depends(get_current_user)) -> QuestionsResponse:
    store = read_json(GAME_QUESTIONS_FILE, {})
    value = store.get(game_key) or {}
    questions = value.get("questions") if isinstance(value, dict) else []
    return QuestionsResponse(game_key=game_key, questions=questions if isinstance(questions, list) else [])


@app.put("/game-questions/{game_key}", response_model=QuestionsResponse)
def put_game_questions(
    game_key: str,
    payload: QuestionsPayload,
    user: dict[str, Any] = Depends(get_current_user),
) -> QuestionsResponse:
    store = read_json(GAME_QUESTIONS_FILE, {})
    store[game_key] = {
        "questions": payload.questions,
        "updatedAt": now_ms(),
        "updatedBy": user["id"],
    }
    write_json(GAME_QUESTIONS_FILE, store)
    return QuestionsResponse(game_key=game_key, questions=payload.questions)


@app.get("/game-feedback", response_model=FeedbackListResponse)
def get_game_feedback(user: dict[str, Any] = Depends(get_current_user)) -> FeedbackListResponse:
    items = read_json(GAME_FEEDBACK_FILE, [])
    if not isinstance(items, list):
        items = []

    visible = items if is_teacher_like(user) else [
        item for item in items if item.get("status") == "approved" or item.get("userId") == user["id"]
    ]
    return FeedbackListResponse(items=visible)


@app.post("/game-feedback", response_model=FeedbackItem, status_code=status.HTTP_201_CREATED)
def create_game_feedback(
    payload: FeedbackCreateInput,
    user: dict[str, Any] = Depends(get_current_user),
) -> FeedbackItem:
    items = read_json(GAME_FEEDBACK_FILE, [])
    if not isinstance(items, list):
        items = []

    item = {
        "id": str(uuid4()),
        "gameKey": payload.game_key.strip(),
        "gameTitle": (payload.game_title or payload.game_key).strip(),
        "userId": user["id"],
        "userName": user.get("username") or user.get("email"),
        "message": payload.message.strip(),
        "status": "pending",
        "createdAt": now_ms(),
    }
    items.insert(0, item)
    write_json(GAME_FEEDBACK_FILE, items)
    return FeedbackItem(**item)


@app.put("/game-feedback/{feedback_id}/approve", response_model=FeedbackItem)
def approve_game_feedback(
    feedback_id: str,
    user: dict[str, Any] = Depends(get_current_user),
) -> FeedbackItem:
    if not is_teacher_like(user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Faqat teacher tasdiqlay oladi.")

    items = read_json(GAME_FEEDBACK_FILE, [])
    if not isinstance(items, list):
        items = []

    index = next((idx for idx, item in enumerate(items) if item.get("id") == feedback_id), -1)
    if index < 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Feedback topilmadi.")

    next_item = {
        **items[index],
        "status": "approved",
        "approvedBy": user["id"],
        "approvedByName": user.get("username") or user.get("email"),
        "approvedAt": now_ms(),
    }
    items[index] = next_item
    write_json(GAME_FEEDBACK_FILE, items)
    return FeedbackItem(**next_item)


def build_subscription_payload(item: dict[str, Any] | None) -> BillingStatusResponse:
    if not item:
        return BillingStatusResponse(active=False, plan="starter", expires_at=None)

    expires_at = item.get("expiresAt")
    active = bool(item.get("active")) and isinstance(expires_at, int) and expires_at > now_ms()
    return BillingStatusResponse(
        active=active,
        plan=str(item.get("plan") or "starter"),
        expires_at=expires_at if isinstance(expires_at, int) else None,
    )


@app.get("/billing/status", response_model=BillingStatusResponse)
def billing_status(user: dict[str, Any] = Depends(get_current_user)) -> BillingStatusResponse:
    items = read_json(SUBSCRIPTIONS_FILE, [])
    item = next((entry for entry in items if entry.get("userId") == user["id"]), None)
    return build_subscription_payload(item)


@app.post("/billing/checkout", response_model=BillingCheckoutResponse)
def billing_checkout(
    payload: BillingCheckoutInput,
    user: dict[str, Any] | None = Depends(get_optional_current_user),
) -> BillingCheckoutResponse:
    items = read_json(SUBSCRIPTIONS_FILE, [])
    active = payload.plan in {"pro", "team"}
    expires_at = now_ms() + PREMIUM_DURATION_MS if active else None
    transaction_id = f"PAY-{secrets.token_hex(3).upper()}"

    if user:
        next_item = {
            "userId": user["id"],
            "email": normalize_email(payload.email),
            "fullName": payload.fullName.strip(),
            "plan": payload.plan,
            "billingCycle": payload.billingCycle,
            "seats": payload.seats,
            "method": payload.method,
            "active": active,
            "expiresAt": expires_at,
            "updatedAt": now_ms(),
            "transactionId": transaction_id,
        }
        existing_index = next((index for index, item in enumerate(items) if item.get("userId") == user["id"]), -1)
        if existing_index >= 0:
            items[existing_index] = next_item
        else:
            items.insert(0, next_item)
        write_json(SUBSCRIPTIONS_FILE, items)

    return BillingCheckoutResponse(
        transaction_id=transaction_id,
        active=active,
        plan=payload.plan,
        expires_at=expires_at,
    )


@app.post("/billing/cancel")
def billing_cancel(user: dict[str, Any] = Depends(get_current_user)) -> dict[str, bool]:
    items = read_json(SUBSCRIPTIONS_FILE, [])
    updated: list[dict[str, Any]] = []
    for item in items:
        if item.get("userId") == user["id"]:
            item = {
                **item,
                "active": False,
                "expiresAt": None,
                "updatedAt": now_ms(),
            }
        updated.append(item)
    write_json(SUBSCRIPTIONS_FILE, updated)
    return {"ok": True}
