from __future__ import annotations

import hashlib
import hmac
import json
import os
import secrets
from typing import Literal
from urllib import parse, request
from uuid import uuid4

from fastapi import BackgroundTasks, Depends, FastAPI, Header, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from .db import engine, get_db
from .legacy_import import import_legacy_json_if_needed
from .models import Base, GameFeedback, GameQuestions, SessionToken, Subscription, User


DEFAULT_CLIENT_ORIGINS = [
    "http://127.0.0.1:5173",
    "http://localhost:5173",
    "http://127.0.0.1:5174",
    "http://localhost:5174",
]
SEED_ADMIN_EMAIL = os.getenv("SEED_ADMIN_EMAIL", "").strip().lower()
SEED_ADMIN_PASSWORD = os.getenv("SEED_ADMIN_PASSWORD", "").strip()
SEED_TEACHER_EMAIL = os.getenv("SEED_TEACHER_EMAIL", "").strip().lower()
SEED_TEACHER_PASSWORD = os.getenv("SEED_TEACHER_PASSWORD", "").strip()
SEED_TEACHER_NAME = os.getenv("SEED_TEACHER_NAME", "Teacher").strip() or "Teacher"
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "").strip()
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "").strip()
PREMIUM_DURATION_MS = 30 * 24 * 60 * 60 * 1000
BLOCKED_FEEDBACK_TERMS = {
    "fuck",
    "shit",
    "bitch",
    "idiot",
    "stupid",
    "ahmoq",
    "tentak",
    "jinni",
    "la'nati",
    "lanati",
    "so'kin",
    "sokin",
}


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
    questions: list[object] = Field(default_factory=list)


class QuestionsResponse(BaseModel):
    game_key: str
    questions: list[object]


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
    allow_origin_regex=r"https://.*\.vercel\.app|http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


def now_ms() -> int:
    import time

    return int(time.time() * 1000)


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


def build_user_out(user: User) -> UserOut:
    return UserOut(id=user.id, email=user.email, username=user.username, roles=list(user.roles or []))


def is_teacher_like(user: User) -> bool:
    return any(role in {"teacher", "admin"} for role in (user.roles or []))


def build_feedback_item(item: GameFeedback) -> FeedbackItem:
    return FeedbackItem(
        id=item.id,
        gameKey=item.game_key,
        gameTitle=item.game_title,
        userId=item.user_id,
        userName=item.user_name,
        message=item.message,
        status=item.status,  # type: ignore[arg-type]
        createdAt=item.created_at,
        approvedBy=item.approved_by,
        approvedByName=item.approved_by_name,
        approvedAt=item.approved_at,
    )


def build_subscription_payload(item: Subscription | None) -> BillingStatusResponse:
    if not item:
        return BillingStatusResponse(active=False, plan="starter", expires_at=None)

    active = bool(item.active) and isinstance(item.expires_at, int) and item.expires_at > now_ms()
    return BillingStatusResponse(active=active, plan=item.plan or "starter", expires_at=item.expires_at)


def contains_blocked_feedback_terms(message: str) -> bool:
    lowered = message.lower()
    normalized = "".join(char if char.isalnum() or char.isspace() else " " for char in lowered)
    words = {word for word in normalized.split() if word}
    return any(term in lowered or term in words for term in BLOCKED_FEEDBACK_TERMS)


def send_feedback_to_telegram(item: GameFeedback) -> None:
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        return

    text = (
        "Yangi izoh keldi!\n\n"
        f"O'yin: {item.game_title}\n"
        f"User: {item.user_name}\n"
        f"Xabar: {item.message}\n"
        f"Vaqt: {item.created_at}"
    )
    body = parse.urlencode(
        {
            "chat_id": TELEGRAM_CHAT_ID,
            "text": text,
        }
    ).encode("utf-8")

    req = request.Request(
        url=f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage",
        data=body,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        method="POST",
    )
    try:
        with request.urlopen(req, timeout=10) as response:
            payload = json.loads(response.read().decode("utf-8"))
            if not payload.get("ok"):
                print("Telegram notification failed:", payload)
    except Exception as exc:
        print("Telegram notification failed:", exc)


def seed_admin(db: Session) -> None:
    if not SEED_ADMIN_EMAIL or not SEED_ADMIN_PASSWORD:
        return

    users = list(db.scalars(select(User)))
    target = next((user for user in users if user.email == SEED_ADMIN_EMAIL), None)

    for user in users:
        roles = list(user.roles or [])
        if user.email == SEED_ADMIN_EMAIL:
            user.roles = ["admin", "teacher"]
            user.password_hash = hash_password(SEED_ADMIN_PASSWORD)
            continue

        if "admin" in roles:
            user.roles = [role for role in roles if role != "admin"] or ["teacher"]

    if not target:
        db.add(
            User(
                id=str(uuid4()),
                email=SEED_ADMIN_EMAIL,
                username="Admin",
                password_hash=hash_password(SEED_ADMIN_PASSWORD),
                roles=["admin", "teacher"],
                created_at=now_ms(),
            )
        )

    db.commit()


def seed_teacher(db: Session) -> None:
    if not SEED_TEACHER_EMAIL or not SEED_TEACHER_PASSWORD:
        return

    users = list(db.scalars(select(User)))
    target = next((user for user in users if user.email == SEED_TEACHER_EMAIL), None)

    for user in users:
        roles = list(user.roles or [])

        if user.email == SEED_TEACHER_EMAIL:
            user.roles = ["teacher"]
            user.username = SEED_TEACHER_NAME
            user.password_hash = hash_password(SEED_TEACHER_PASSWORD)
            continue

        if "teacher" in roles and "admin" not in roles:
            remaining_roles = [role for role in roles if role != "teacher"]
            user.roles = remaining_roles or ["student"]

    if not target:
        db.add(
            User(
                id=str(uuid4()),
                email=SEED_TEACHER_EMAIL,
                username=SEED_TEACHER_NAME,
                password_hash=hash_password(SEED_TEACHER_PASSWORD),
                roles=["teacher"],
                created_at=now_ms(),
            )
        )

    db.commit()


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)
    db = next(get_db())
    try:
        import_legacy_json_if_needed(db)
        seed_admin(db)
        seed_teacher(db)
    finally:
        db.close()


def get_authorization_token(authorization: str | None) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        return ""
    return authorization.replace("Bearer ", "", 1).strip()


def get_current_user(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> User:
    token = get_authorization_token(authorization)
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session topilmadi. Qayta login qiling.")

    session = db.scalar(select(SessionToken).where(SessionToken.access_token == token))
    if not session:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session topilmadi. Qayta login qiling.")

    user = db.get(User, session.user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session topilmadi. Qayta login qiling.")
    return user


def get_optional_current_user(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> User | None:
    token = get_authorization_token(authorization)
    if not token:
        return None

    session = db.scalar(select(SessionToken).where(SessionToken.access_token == token))
    if not session:
        return None
    return db.get(User, session.user_id)


@app.get("/")
def root() -> dict[str, str]:
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
@app.post("/users", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register_user(payload: UserCreate, db: Session = Depends(get_db)) -> UserOut:
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Teacher ro'yxatdan o'tishi yopilgan. Faqat maxsus teacher login bilan kiriladi.",
    )


@app.post("/auth/login", response_model=LoginResponse)
def login(payload: LoginInput, db: Session = Depends(get_db)) -> LoginResponse:
    user = db.scalar(select(User).where(User.email == normalize_email(payload.email)))
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Email yoki parol noto'g'ri.")

    session = SessionToken(
        id=str(uuid4()),
        user_id=user.id,
        access_token=secrets.token_hex(32),
        refresh_token=secrets.token_hex(32),
        created_at=now_ms(),
    )
    db.add(session)
    db.commit()
    return LoginResponse(access_token=session.access_token, refresh_token=session.refresh_token)


@app.post("/auth/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> Response:
    token = get_authorization_token(authorization)
    if token:
        session = db.scalar(select(SessionToken).where(SessionToken.access_token == token))
        if session:
            db.delete(session)
            db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@app.get("/users/me", response_model=UserOut)
def current_user(user: User = Depends(get_current_user)) -> UserOut:
    return build_user_out(user)


@app.get("/game-questions/{game_key}", response_model=QuestionsResponse)
def get_game_questions(
    game_key: str,
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> QuestionsResponse:
    item = db.get(GameQuestions, game_key)
    return QuestionsResponse(game_key=game_key, questions=list(item.questions or []) if item else [])


@app.put("/game-questions/{game_key}", response_model=QuestionsResponse)
def put_game_questions(
    game_key: str,
    payload: QuestionsPayload,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> QuestionsResponse:
    if not is_teacher_like(user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Faqat teacher yoki admin savol saqlay oladi.")

    item = db.get(GameQuestions, game_key)
    if not item:
        item = GameQuestions(game_key=game_key, questions=[], updated_at=0, updated_by=None)
        db.add(item)

    item.questions = payload.questions
    item.updated_at = now_ms()
    item.updated_by = user.id
    db.commit()
    return QuestionsResponse(game_key=game_key, questions=payload.questions)


@app.get("/game-feedback", response_model=FeedbackListResponse)
def get_game_feedback(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> FeedbackListResponse:
    query = select(GameFeedback).order_by(GameFeedback.created_at.desc())
    items = list(db.scalars(query))
    return FeedbackListResponse(items=[build_feedback_item(item) for item in items])


@app.post("/game-feedback", response_model=FeedbackItem, status_code=status.HTTP_201_CREATED)
def create_game_feedback(
    payload: FeedbackCreateInput,
    background_tasks: BackgroundTasks,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> FeedbackItem:
    clean_message = payload.message.strip()
    if contains_blocked_feedback_terms(clean_message):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Izoh ichida nomaqbul so'z bor.")

    item = GameFeedback(
        id=str(uuid4()),
        game_key=payload.game_key.strip(),
        game_title=(payload.game_title or payload.game_key).strip(),
        user_id=user.id,
        user_name=user.username or user.email,
        message=clean_message,
        status="approved",
        created_at=now_ms(),
        approved_by=user.id,
        approved_by_name=user.username or user.email,
        approved_at=now_ms(),
    )
    db.add(item)
    db.commit()
    background_tasks.add_task(send_feedback_to_telegram, item)
    return build_feedback_item(item)


@app.put("/game-feedback/{feedback_id}/approve", response_model=FeedbackItem)
def approve_game_feedback(
    feedback_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> FeedbackItem:
    if not is_teacher_like(user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Faqat teacher tasdiqlay oladi.")

    item = db.get(GameFeedback, feedback_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Feedback topilmadi.")

    item.status = "approved"
    item.approved_by = user.id
    item.approved_by_name = user.username or user.email
    item.approved_at = now_ms()
    db.commit()
    return build_feedback_item(item)


@app.get("/billing/status", response_model=BillingStatusResponse)
def billing_status(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> BillingStatusResponse:
    item = db.scalar(select(Subscription).where(Subscription.user_id == user.id))
    return build_subscription_payload(item)


@app.post("/billing/checkout", response_model=BillingCheckoutResponse)
def billing_checkout(
    payload: BillingCheckoutInput,
    user: User | None = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
) -> BillingCheckoutResponse:
    active = payload.plan in {"pro", "team"}
    expires_at = now_ms() + PREMIUM_DURATION_MS if active else None
    transaction_id = f"PAY-{secrets.token_hex(3).upper()}"

    if user:
        item = db.scalar(select(Subscription).where(Subscription.user_id == user.id))
        if not item:
            item = Subscription(
                user_id=user.id,
                email="",
                full_name="",
                plan="starter",
                billing_cycle="monthly",
                seats=1,
                method="card",
                active=False,
                expires_at=None,
                updated_at=0,
                transaction_id="",
            )
            db.add(item)

        item.email = normalize_email(payload.email)
        item.full_name = payload.fullName.strip()
        item.plan = payload.plan
        item.billing_cycle = payload.billingCycle
        item.seats = 1
        item.method = payload.method
        item.active = active
        item.expires_at = expires_at
        item.updated_at = now_ms()
        item.transaction_id = transaction_id
        db.commit()

    return BillingCheckoutResponse(
        transaction_id=transaction_id,
        active=active,
        plan=payload.plan,
        expires_at=expires_at,
    )


@app.post("/billing/cancel")
def billing_cancel(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict[str, bool]:
    item = db.scalar(select(Subscription).where(Subscription.user_id == user.id))
    if item:
        item.active = False
        item.expires_at = None
        item.updated_at = now_ms()
        db.commit()
    return {"ok": True}
