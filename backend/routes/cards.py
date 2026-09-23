import json
import re

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth import get_current_user
from config import settings
from database import get_db
from models import Card, User
from schemas import CardCreate, CardOut, CardUpdate, PublishRequest, UsernameAvailable

router = APIRouter(prefix="/api/cards", tags=["cards"])

RESERVED_USERNAMES = {
    "api", "login", "signup", "onboarding", "dashboard", "editor", "admin",
    "static", "assets", "media", "uploads", "www", "app", "settings",
    "help", "about", "terms", "privacy", "support", "blog",
}

USERNAME_RE = re.compile(r"^[a-z0-9][a-z0-9_-]{2,29}$")


def _card_out(card: Card, user: User) -> CardOut:
    return CardOut(
        id=card.id,
        config=card.config,
        html=card.html,
        published=card.published,
        username=user.username,
        public_url=f"{settings.public_base_url}/{user.username}"
        if card.published and user.username
        else None,
        created_at=card.created_at,
        updated_at=card.updated_at,
    )


def _validate_username(username: str, db: Session, exclude_user_id: int | None = None) -> None:
    if not USERNAME_RE.match(username):
        raise HTTPException(
            status_code=400,
            detail="Username must be 3-30 chars, start with a letter or number, and use only a-z, 0-9, - or _",
        )
    if username in RESERVED_USERNAMES:
        raise HTTPException(status_code=400, detail="This username is reserved")
    q = db.query(User).filter(User.username == username)
    if exclude_user_id:
        q = q.filter(User.id != exclude_user_id)
    if q.first():
        raise HTTPException(status_code=409, detail="Username is already taken")


@router.get("/username-available")
def username_available(u: str, db: Session = Depends(get_db)):
    username = u.lower().strip()
    if not USERNAME_RE.match(username) or username in RESERVED_USERNAMES:
        return UsernameAvailable(available=False)
    else:
        return UsernameAvailable(available=db.query(User).filter(User.username == username).first() is None)


@router.get("", response_model=list[CardOut])
def list_cards(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cards = db.query(Card).filter(Card.user_id == user.id).order_by(Card.id.desc()).all()
    return [_card_out(c, user) for c in cards]


@router.post("", response_model=CardOut)
def create_card(body: CardCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    _validate_json(body.config)
    card = Card(user_id=user.id, config=body.config, html=body.html, published=False)
    db.add(card)
    db.commit()
    db.refresh(card)
    return _card_out(card, user)


@router.get("/{card_id}", response_model=CardOut)
def get_card(card_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    card = _get_own_card(card_id, user, db)
    return _card_out(card, user)


@router.put("/{card_id}", response_model=CardOut)
def update_card(card_id: int, body: CardUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    card = _get_own_card(card_id, user, db)
    _validate_json(body.config)
    card.config = body.config
    card.html = body.html
    db.commit()
    db.refresh(card)
    return _card_out(card, user)


@router.post("/{card_id}/publish", response_model=CardOut)
def publish_card(card_id: int, body: PublishRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    card = _get_own_card(card_id, user, db)
    username = body.username.lower().strip()
    _validate_username(username, db, exclude_user_id=user.id)
    user.username = username
    card.published = True
    db.commit()
    db.refresh(card)
    db.refresh(user)
    return _card_out(card, user)


@router.delete("/{card_id}")
def delete_card(card_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    card = _get_own_card(card_id, user, db)
    db.delete(card)
    db.commit()
    return {"ok": True}


def _get_own_card(card_id: int, user: User, db: Session) -> Card:
    card = db.get(Card, card_id)
    if card is None or card.user_id != user.id:
        raise HTTPException(status_code=404, detail="Card not found")
    else:
        return card


def _validate_json(config: str) -> None:
    try:
        json.loads(config)
    except (json.JSONDecodeError, TypeError):
        raise HTTPException(status_code=400, detail="Invalid config JSON")
