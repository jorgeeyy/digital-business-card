import json

from sqlalchemy.orm import Session

from config import settings
from errors import ServiceError
from models import Card, User
from repositories import cards as cards_repo
from repositories import users as users_repo
from schemas import CardCreate, CardOut, CardUpdate, PublishRequest
from services import users as users_service


def to_dto(card: Card, user: User) -> CardOut:
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


def _validate_config_json(config: str) -> None:
    try:
        json.loads(config)
    except (json.JSONDecodeError, TypeError):
        raise ServiceError(400, "Invalid config JSON")


def _get_own_card(db: Session, user: User, card_id: int) -> Card:
    card = cards_repo.get_by_id(db, card_id)
    if card is None or card.user_id != user.id:
        raise ServiceError(404, "Card not found")
    return card


def list_cards(db: Session, user: User) -> list[CardOut]:
    return [to_dto(c, user) for c in cards_repo.list_for_user(db, user.id)]


def create_card(db: Session, user: User, body: CardCreate) -> CardOut:
    _validate_config_json(body.config)
    card = cards_repo.create(db, user_id=user.id, config=body.config, html=body.html)
    return to_dto(card, user)


def get_card(db: Session, user: User, card_id: int) -> CardOut:
    return to_dto(_get_own_card(db, user, card_id), user)


def update_card(db: Session, user: User, card_id: int, body: CardUpdate) -> CardOut:
    card = _get_own_card(db, user, card_id)
    _validate_config_json(body.config)
    card.config = body.config
    card.html = body.html
    card = cards_repo.save(db, card)
    return to_dto(card, user)


def publish_card(db: Session, user: User, card_id: int, body: PublishRequest) -> CardOut:
    card = _get_own_card(db, user, card_id)
    username = body.username.lower().strip()
    users_service.validate_username(db, username, exclude_user_id=user.id)
    user.username = username
    card.published = True
    cards_repo.save(db, card)
    db.refresh(user)
    return to_dto(card, user)


def delete_card(db: Session, user: User, card_id: int) -> dict:
    cards_repo.delete(db, _get_own_card(db, user, card_id))
    return {"ok": True}


def get_published_html(db: Session, username: str) -> str | None:
    user = users_repo.get_by_username(db, username)
    if user is None:
        return None
    card = cards_repo.get_latest_published_for_user(db, user.id)
    return card.html if card and card.html else None
