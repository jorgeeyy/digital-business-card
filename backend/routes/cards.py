from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import User
from schemas import CardCreate, CardOut, CardUpdate, PublishRequest, UsernameAvailable
from services import cards as cards_service
from services import users as users_service

router = APIRouter(prefix="/api/cards", tags=["cards"])


@router.get("/username-available")
def username_available(u: str, db: Session = Depends(get_db)):
    return UsernameAvailable(available=users_service.username_available(db, u))


@router.get("", response_model=list[CardOut])
def list_cards(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return cards_service.list_cards(db, user)


@router.post("", response_model=CardOut)
def create_card(
    body: CardCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    return cards_service.create_card(db, user, body)


@router.get("/{card_id}", response_model=CardOut)
def get_card(card_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return cards_service.get_card(db, user, card_id)


@router.put("/{card_id}", response_model=CardOut)
def update_card(
    card_id: int,
    body: CardUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return cards_service.update_card(db, user, card_id, body)


@router.post("/{card_id}/publish", response_model=CardOut)
def publish_card(
    card_id: int,
    body: PublishRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return cards_service.publish_card(db, user, card_id, body)


@router.delete("/{card_id}")
def delete_card(
    card_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    return cards_service.delete_card(db, user, card_id)
