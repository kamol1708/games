from __future__ import annotations

from sqlalchemy import BigInteger, Boolean, ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy.types import JSON


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    username: Mapped[str] = mapped_column(String(120))
    password_hash: Mapped[str] = mapped_column("password_hash", Text)
    roles: Mapped[list[str]] = mapped_column(JSON)
    created_at: Mapped[int] = mapped_column("created_at", BigInteger)


class SessionToken(Base):
    __tablename__ = "sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    user_id: Mapped[str] = mapped_column("user_id", ForeignKey("users.id", ondelete="CASCADE"), index=True)
    access_token: Mapped[str] = mapped_column("access_token", String(128), unique=True, index=True)
    refresh_token: Mapped[str] = mapped_column("refresh_token", String(128), unique=True)
    created_at: Mapped[int] = mapped_column("created_at", BigInteger)


class GameQuestions(Base):
    __tablename__ = "game_questions"

    game_key: Mapped[str] = mapped_column("game_key", String(120), primary_key=True)
    questions: Mapped[list[object]] = mapped_column(JSON)
    updated_at: Mapped[int] = mapped_column("updated_at", BigInteger)
    updated_by: Mapped[str | None] = mapped_column("updated_by", ForeignKey("users.id", ondelete="SET NULL"), nullable=True)


class GameFeedback(Base):
    __tablename__ = "game_feedback"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    game_key: Mapped[str] = mapped_column("game_key", String(120), index=True)
    game_title: Mapped[str] = mapped_column("game_title", String(255))
    user_id: Mapped[str] = mapped_column("user_id", ForeignKey("users.id", ondelete="CASCADE"), index=True)
    user_name: Mapped[str] = mapped_column("user_name", String(120))
    message: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(20), index=True)
    created_at: Mapped[int] = mapped_column("created_at", BigInteger, index=True)
    approved_by: Mapped[str | None] = mapped_column("approved_by", ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    approved_by_name: Mapped[str | None] = mapped_column("approved_by_name", String(120), nullable=True)
    approved_at: Mapped[int | None] = mapped_column("approved_at", BigInteger, nullable=True)


class Subscription(Base):
    __tablename__ = "subscriptions"
    __table_args__ = (UniqueConstraint("user_id", name="uq_subscriptions_user_id"),)

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column("user_id", ForeignKey("users.id", ondelete="CASCADE"), index=True)
    email: Mapped[str] = mapped_column(String(320))
    full_name: Mapped[str] = mapped_column("full_name", String(120))
    plan: Mapped[str] = mapped_column(String(50))
    billing_cycle: Mapped[str] = mapped_column("billing_cycle", String(50))
    seats: Mapped[int] = mapped_column()
    method: Mapped[str] = mapped_column(String(50))
    active: Mapped[bool] = mapped_column(Boolean, default=False)
    expires_at: Mapped[int | None] = mapped_column("expires_at", BigInteger, nullable=True)
    updated_at: Mapped[int] = mapped_column("updated_at", BigInteger)
    transaction_id: Mapped[str] = mapped_column("transaction_id", String(64))
