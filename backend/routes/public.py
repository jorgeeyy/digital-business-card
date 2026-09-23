from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session

from database import get_db
from models import Card, User

router = APIRouter(tags=["public"])


@router.get("/{username}", response_class=HTMLResponse)
def serve_card(username: str, db: Session = Depends(get_db)):
    username = username.lower().strip()
    if "." in username or "@" in username:
        raise HTTPException(status_code=404, detail="Not found")
    if (user := db.query(User).filter(User.username == username).first()) is None:
        raise HTTPException(status_code=404, detail="Card not found")
    else:
        card = (
            db.query(Card)
            .filter(Card.user_id == user.id, Card.published == True)  # noqa: E712
            .order_by(Card.id.desc())
            .first()
        )
        if card and card.html:
            return HTMLResponse(content=card.html)
        else:
            raise HTTPException(status_code=404, detail="Card not found")
