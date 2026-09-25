from datetime import UTC, datetime, timedelta

from fastapi import Depends, HTTPException, Request, Response
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from config import settings
from database import get_db
from models import User
from repositories import users as users_repo

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ALGORITHM = "HS256"
COOKIE_NAME = "session_token"


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_session_token(user_id: int) -> str:
    return jwt.encode(
        {
            "sub": str(user_id),
            "exp": datetime.now(UTC) + timedelta(days=settings.access_token_expire_days),
        },
        settings.secret_key,
        algorithm=ALGORITHM,
    )


def set_session_cookie(response: Response, user_id: int) -> None:
    response.set_cookie(
        key=COOKIE_NAME,
        value=create_session_token(user_id),
        max_age=settings.access_token_expire_days * 24 * 60 * 60,
        httponly=True,
        samesite="lax",
        secure=False,
        path="/",
    )


def clear_session_cookie(response: Response) -> None:
    response.delete_cookie(key=COOKIE_NAME, path="/")


def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    if (token := request.cookies.get(COOKIE_NAME)) is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
        user_id = int(payload.get("sub"))
    except (JWTError, ValueError, TypeError):
        raise HTTPException(status_code=401, detail="Invalid or expired session") from None
    if (user := users_repo.get_by_id(db, user_id)) is None:
        raise HTTPException(status_code=401, detail="User not found")
    else:
        return user
