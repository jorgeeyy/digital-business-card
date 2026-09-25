from sqlalchemy import select
from sqlalchemy.orm import Session

from models import User


def get_by_id(db: Session, user_id: int) -> User | None:
    return db.get(User, user_id)


def get_by_email(db: Session, email: str) -> User | None:
    return db.execute(select(User).where(User.email == email)).scalar_one_or_none()


def get_by_google_id(db: Session, google_id: str) -> User | None:
    return db.execute(select(User).where(User.google_id == google_id)).scalar_one_or_none()


def get_by_username(db: Session, username: str) -> User | None:
    return db.execute(select(User).where(User.username == username)).scalar_one_or_none()


def username_taken(db: Session, username: str, exclude_user_id: int | None = None) -> bool:
    stmt = select(User).where(User.username == username)
    if exclude_user_id:
        stmt = stmt.where(User.id != exclude_user_id)
    return db.scalars(stmt.limit(1)).first() is not None


def create(db: Session, **fields) -> User:
    user = User(**fields)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def save(db: Session, user: User) -> User:
    db.commit()
    db.refresh(user)
    return user
