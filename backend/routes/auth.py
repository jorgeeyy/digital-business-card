from fastapi import APIRouter, Depends, Response
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from auth import clear_session_cookie, get_current_user, set_session_cookie
from config import settings
from database import get_db
from models import User
from schemas import LoginRequest, SignupRequest, UsernameRequest, UserOut
from services import auth as auth_service
from services import users as users_service

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/signup", response_model=UserOut)
def signup(body: SignupRequest, response: Response, db: Session = Depends(get_db)):
    user = auth_service.signup(db, body)
    set_session_cookie(response, user.id)
    return user


@router.post("/login", response_model=UserOut)
def login(body: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = auth_service.login(db, body)
    set_session_cookie(response, user.id)
    return user


@router.post("/logout")
def logout(response: Response):
    clear_session_cookie(response)
    return {"ok": True}


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user


@router.put("/username", response_model=UserOut)
def claim_username(
    body: UsernameRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return users_service.claim_username(db, user, body.username)


@router.get("/google")
def google_login():
    return RedirectResponse(auth_service.google_authorize_url())


@router.get("/google/callback")
def google_callback(code: str, response: Response = None, db: Session = Depends(get_db)):
    user = auth_service.google_callback(db, code)
    redirect = RedirectResponse(f"{settings.frontend_origin}/dashboard")
    set_session_cookie(redirect, user.id)
    return redirect
