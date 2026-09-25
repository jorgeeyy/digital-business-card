from fastapi import APIRouter, Depends
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session

from database import get_db
from errors import ServiceError
from services import cards as cards_service

router = APIRouter(tags=["public"])


@router.get("/{username}", response_class=HTMLResponse)
def serve_card(username: str, db: Session = Depends(get_db)):
    username = username.lower().strip()
    if "." in username or "@" in username:
        raise ServiceError(404, "Not found")
    html = cards_service.get_published_html(db, username)
    if html is None:
        raise ServiceError(404, "Card not found")
    return HTMLResponse(content=html)
