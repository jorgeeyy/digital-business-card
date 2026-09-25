from sqlalchemy.orm import Session

from models import Card


def list_for_user(db: Session, user_id: int) -> list[Card]:
    return db.query(Card).filter(Card.user_id == user_id).order_by(Card.id.desc()).all()


def get_by_id(db: Session, card_id: int) -> Card | None:
    return db.get(Card, card_id)


def get_latest_published_for_user(db: Session, user_id: int) -> Card | None:
    return (
        db.query(Card)
        .filter(Card.user_id == user_id, Card.published == True)  # noqa: E712
        .order_by(Card.id.desc())
        .first()
    )


def create(db: Session, *, user_id: int, config: str, html: str) -> Card:
    card = Card(user_id=user_id, config=config, html=html, published=False)
    db.add(card)
    db.commit()
    db.refresh(card)
    return card


def save(db: Session, card: Card) -> Card:
    db.commit()
    db.refresh(card)
    return card


def delete(db: Session, card: Card) -> None:
    db.delete(card)
    db.commit()
