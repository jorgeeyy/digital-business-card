from urllib.parse import urlencode

import httpx
from sqlalchemy.orm import Session

from auth import hash_password, verify_password
from config import settings
from errors import ServiceError
from models import User
from repositories import users as users_repo
from schemas import LoginRequest, SignupRequest


def signup(db: Session, body: SignupRequest) -> User:
    email = body.email.lower().strip()
    if users_repo.get_by_email(db, email) is not None:
        raise ServiceError(400, "An account with this email already exists")
    return users_repo.create(
        db,
        email=email,
        password_hash=hash_password(body.password),
        display_name=email.split("@")[0],
    )


def login(db: Session, body: LoginRequest) -> User:
    email = body.email.lower().strip()
    user = users_repo.get_by_email(db, email)
    if (
        user is None
        or not user.password_hash
        or not verify_password(body.password, user.password_hash)
    ):
        raise ServiceError(401, "Invalid email or password")
    return user


def google_authorize_url() -> str:
    if not settings.google_client_id or not settings.google_client_secret:
        raise ServiceError(400, "Google login is not configured")
    return "https://accounts.google.com/o/oauth2/v2/auth?" + urlencode(
        {
            "client_id": settings.google_client_id,
            "redirect_uri": settings.google_redirect_uri,
            "response_type": "code",
            "scope": "openid email profile",
            "access_type": "online",
            "prompt": "select_account",
        }
    )


def _exchange_code_for_token(client: httpx.Client, code: str) -> str:
    res = client.post(
        "https://oauth2.googleapis.com/token",
        data={
            "code": code,
            "client_id": settings.google_client_id,
            "client_secret": settings.google_client_secret,
            "redirect_uri": settings.google_redirect_uri,
            "grant_type": "authorization_code",
        },
    )
    if res.status_code != 200:
        raise ServiceError(400, "Google token exchange failed")
    return res.json()["access_token"]


def _fetch_google_userinfo(client: httpx.Client, access_token: str) -> dict:
    res = client.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    if res.status_code != 200:
        raise ServiceError(400, "Failed to fetch Google profile")
    return res.json()


def _find_or_create_google_user(db: Session, userinfo: dict) -> User:
    google_id = userinfo.get("sub")
    email = (userinfo.get("email") or "").lower().strip()
    name = userinfo.get("name") or ""
    email_verified = userinfo.get("email_verified", False)

    if not email or not email_verified:
        raise ServiceError(400, "Google account email is not verified")

    user = users_repo.get_by_google_id(db, google_id)
    if user is not None:
        return user
    user = users_repo.get_by_email(db, email)
    if user is not None:
        user.google_id = google_id
        return users_repo.save(db, user)
    return users_repo.create(
        db,
        email=email,
        google_id=google_id,
        display_name=name or email.split("@")[0],
    )


def google_callback(db: Session, code: str) -> User:
    if not settings.google_client_id or not settings.google_client_secret:
        raise ServiceError(400, "Google login is not configured")
    if not code:
        raise ServiceError(400, "Missing authorization code")

    with httpx.Client(timeout=15) as client:
        access_token = _exchange_code_for_token(client, code)
        userinfo = _fetch_google_userinfo(client, access_token)
    return _find_or_create_google_user(db, userinfo)
