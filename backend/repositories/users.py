from sqlalchemy.orm import Session

from models import User


def get_by_id(db: Session, user_id: int) -> User | None:
    return db.get(User, user_id)


def get_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


def get_by_google_id(db: Session, google_id: str) -> User | None:
    return db.query(User).filter(User.google_id == google_id).first()


def get_by_username(db: Session, username: str) -> User | None:
    return db.query(User).filter(User.username == username).first()


def username_taken(db: Session, username: str, exclude_user_id: int | None = None) -> bool:
    q = db.query(User).filter(User.username == username)
    if exclude_user_id:
        q = q.filter(User.id != exclude_user_id)
    return q.first() is not None


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
