"""initial postgresql schema

Revision ID: 20260401_000001
Revises:
Create Date: 2026-04-01 09:00:00
"""

from alembic import op
import sqlalchemy as sa


revision = "20260401_000001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("username", sa.String(length=120), nullable=False),
        sa.Column("password_hash", sa.Text(), nullable=False),
        sa.Column("roles", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.BigInteger(), nullable=False),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "sessions",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("user_id", sa.String(length=36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("access_token", sa.String(length=128), nullable=False),
        sa.Column("refresh_token", sa.String(length=128), nullable=False),
        sa.Column("created_at", sa.BigInteger(), nullable=False),
    )
    op.create_index("ix_sessions_user_id", "sessions", ["user_id"], unique=False)
    op.create_index("ix_sessions_access_token", "sessions", ["access_token"], unique=True)
    op.create_index("ix_sessions_refresh_token", "sessions", ["refresh_token"], unique=True)

    op.create_table(
        "game_questions",
        sa.Column("game_key", sa.String(length=120), primary_key=True),
        sa.Column("questions", sa.JSON(), nullable=False),
        sa.Column("updated_at", sa.BigInteger(), nullable=False),
        sa.Column("updated_by", sa.String(length=36), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
    )

    op.create_table(
        "game_feedback",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("game_key", sa.String(length=120), nullable=False),
        sa.Column("game_title", sa.String(length=255), nullable=False),
        sa.Column("user_id", sa.String(length=36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("user_name", sa.String(length=120), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("created_at", sa.BigInteger(), nullable=False),
        sa.Column("approved_by", sa.String(length=36), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("approved_by_name", sa.String(length=120), nullable=True),
        sa.Column("approved_at", sa.BigInteger(), nullable=True),
    )
    op.create_index("ix_game_feedback_game_key", "game_feedback", ["game_key"], unique=False)
    op.create_index("ix_game_feedback_user_id", "game_feedback", ["user_id"], unique=False)
    op.create_index("ix_game_feedback_status", "game_feedback", ["status"], unique=False)
    op.create_index("ix_game_feedback_created_at", "game_feedback", ["created_at"], unique=False)

    op.create_table(
        "subscriptions",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.String(length=36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("full_name", sa.String(length=120), nullable=False),
        sa.Column("plan", sa.String(length=50), nullable=False),
        sa.Column("billing_cycle", sa.String(length=50), nullable=False),
        sa.Column("seats", sa.Integer(), nullable=False),
        sa.Column("method", sa.String(length=50), nullable=False),
        sa.Column("active", sa.Boolean(), nullable=False),
        sa.Column("expires_at", sa.BigInteger(), nullable=True),
        sa.Column("updated_at", sa.BigInteger(), nullable=False),
        sa.Column("transaction_id", sa.String(length=64), nullable=False),
        sa.UniqueConstraint("user_id", name="uq_subscriptions_user_id"),
    )
    op.create_index("ix_subscriptions_user_id", "subscriptions", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_subscriptions_user_id", table_name="subscriptions")
    op.drop_table("subscriptions")
    op.drop_index("ix_game_feedback_created_at", table_name="game_feedback")
    op.drop_index("ix_game_feedback_status", table_name="game_feedback")
    op.drop_index("ix_game_feedback_user_id", table_name="game_feedback")
    op.drop_index("ix_game_feedback_game_key", table_name="game_feedback")
    op.drop_table("game_feedback")
    op.drop_table("game_questions")
    op.drop_index("ix_sessions_refresh_token", table_name="sessions")
    op.drop_index("ix_sessions_access_token", table_name="sessions")
    op.drop_index("ix_sessions_user_id", table_name="sessions")
    op.drop_table("sessions")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
