from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from .models import GameFeedback, GameQuestions, SessionToken, Subscription, User


BACKEND_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BACKEND_DIR / "data"
USERS_FILE = DATA_DIR / "users.json"
SESSIONS_FILE = DATA_DIR / "sessions.json"
GAME_QUESTIONS_FILE = DATA_DIR / "game-questions.json"
GAME_FEEDBACK_FILE = DATA_DIR / "game-feedback.json"
SUBSCRIPTIONS_FILE = DATA_DIR / "subscriptions.json"


def read_json(path: Path, fallback: Any) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return fallback


def import_legacy_json_if_needed(db: Session) -> None:
    known_user_ids: set[str] = set()

    if db.scalar(select(User).limit(1)) is None:
        users = read_json(USERS_FILE, [])
        for item in users:
            if not isinstance(item, dict) or not item.get("id") or not item.get("email"):
                continue
            user_id = str(item["id"])
            known_user_ids.add(user_id)
            db.add(
                User(
                    id=user_id,
                    email=str(item["email"]).strip().lower(),
                    username=str(item.get("username") or item["email"]).strip(),
                    password_hash=str(item.get("passwordHash") or ""),
                    roles=list(item.get("roles") or []),
                    created_at=int(item.get("createdAt") or 0),
                )
            )
        db.commit()
    else:
        known_user_ids.update(db.scalars(select(User.id)).all())

    if not known_user_ids:
        known_user_ids.update(db.scalars(select(User.id)).all())

    if db.scalar(select(SessionToken).limit(1)) is None:
        sessions = read_json(SESSIONS_FILE, [])
        for item in sessions:
            if not isinstance(item, dict) or not item.get("id") or not item.get("userId"):
                continue
            if str(item["userId"]) not in known_user_ids:
                continue
            db.add(
                SessionToken(
                    id=str(item["id"]),
                    user_id=str(item["userId"]),
                    access_token=str(item.get("accessToken") or ""),
                    refresh_token=str(item.get("refreshToken") or ""),
                    created_at=int(item.get("createdAt") or 0),
                )
            )
        db.commit()

    if db.scalar(select(GameQuestions).limit(1)) is None:
        payload = read_json(GAME_QUESTIONS_FILE, {})
        if isinstance(payload, dict):
            for game_key, value in payload.items():
                if not isinstance(value, dict):
                    continue
                questions = value.get("questions")
                if not isinstance(questions, list):
                    questions = []
                db.add(
                    GameQuestions(
                        game_key=str(game_key),
                        questions=questions,
                        updated_at=int(value.get("updatedAt") or 0),
                        updated_by=(
                            str(value["updatedBy"])
                            if value.get("updatedBy") and str(value["updatedBy"]) in known_user_ids
                            else None
                        ),
                    )
                )
        db.commit()

    if db.scalar(select(GameFeedback).limit(1)) is None:
        items = read_json(GAME_FEEDBACK_FILE, [])
        for item in items:
            if not isinstance(item, dict) or not item.get("id") or not item.get("userId"):
                continue
            if str(item["userId"]) not in known_user_ids:
                continue
            db.add(
                GameFeedback(
                    id=str(item["id"]),
                    game_key=str(item.get("gameKey") or ""),
                    game_title=str(item.get("gameTitle") or item.get("gameKey") or ""),
                    user_id=str(item["userId"]),
                    user_name=str(item.get("userName") or ""),
                    message=str(item.get("message") or ""),
                    status=str(item.get("status") or "pending"),
                    created_at=int(item.get("createdAt") or 0),
                    approved_by=(
                        str(item["approvedBy"])
                        if item.get("approvedBy") and str(item["approvedBy"]) in known_user_ids
                        else None
                    ),
                    approved_by_name=str(item["approvedByName"]) if item.get("approvedByName") else None,
                    approved_at=int(item["approvedAt"]) if item.get("approvedAt") else None,
                )
            )
        db.commit()

    if db.scalar(select(Subscription).limit(1)) is None:
        items = read_json(SUBSCRIPTIONS_FILE, [])
        for item in items:
            if not isinstance(item, dict) or not item.get("userId"):
                continue
            if str(item["userId"]) not in known_user_ids:
                continue
            db.add(
                Subscription(
                    user_id=str(item["userId"]),
                    email=str(item.get("email") or ""),
                    full_name=str(item.get("fullName") or ""),
                    plan=str(item.get("plan") or "starter"),
                    billing_cycle=str(item.get("billingCycle") or "monthly"),
                    seats=int(item.get("seats") or 1),
                    method=str(item.get("method") or "card"),
                    active=bool(item.get("active")),
                    expires_at=int(item["expiresAt"]) if item.get("expiresAt") else None,
                    updated_at=int(item.get("updatedAt") or 0),
                    transaction_id=str(item.get("transactionId") or ""),
                )
            )
        db.commit()
