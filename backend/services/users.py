import re

from sqlalchemy.orm import Session

from errors import ServiceError
from models import User
from repositories import users as users_repo

RESERVED_USERNAMES = {
    "api", "login", "signup", "onboarding", "dashboard", "editor", "admin",
    "static", "assets", "media", "uploads", "www", "app", "settings",
    "help", "about", "terms", "privacy", "support", "blog",
}

USERNAME_RE = re.compile(r"^[a-z0-9][a-z0-9_-]{2,29}$")


def validate_username(db: Session, username: str, exclude_user_id: int | None = None) -> None:
    if not USERNAME_RE.match(username):
        raise ServiceError(
            400,
            "Username must be 3-30 chars, start with a letter or number, and use only a-z, 0-9, - or _",
        )
    if username in RESERVED_USERNAMES:
        raise ServiceError(400, "This username is reserved")
    if users_repo.username_taken(db, username, exclude_user_id=exclude_user_id):
        raise ServiceError(409, "Username is already taken")


def username_available(db: Session, u: str) -> bool:
    username = u.lower().strip()
    if not USERNAME_RE.match(username) or username in RESERVED_USERNAMES:
        return False
    return not users_repo.username_taken(db, username)


def claim_username(db: Session, user: User, username: str) -> User:
    username = username.lower().strip()
    validate_username(db, username, exclude_user_id=user.id)
    user.username = username
    return users_repo.save(db, user)
