from datetime import UTC, datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


def utcnow():
    return datetime.now(UTC)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(unique=True, index=True)
    password_hash: Mapped[str | None] = mapped_column()
    google_id: Mapped[str | None] = mapped_column(unique=True)
    username: Mapped[str | None] = mapped_column(unique=True, index=True)
    display_name: Mapped[str | None] = mapped_column()
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=True, default=utcnow)

    cards: Mapped[list["Card"]] = relationship(back_populates="user")


class Card(Base):
    __tablename__ = "cards"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    config: Mapped[str] = mapped_column(Text, default="{}")
    html: Mapped[str] = mapped_column(Text, default="")
    published: Mapped[bool] = mapped_column(Boolean, nullable=True, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=True, default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=True, default=utcnow, onupdate=utcnow
    )

    user: Mapped["User"] = relationship(back_populates="cards")
