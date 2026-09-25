from fastapi import APIRouter, Depends, UploadFile
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import User
from schemas import UploadResponse
from services import media as media_service

router = APIRouter(prefix="/api/media", tags=["media"])


@router.post("/upload", response_model=UploadResponse)
async def upload_media(
    file: UploadFile,
    user: User = Depends(get_current_user),
):
    data = await file.read()
    return media_service.upload_media(
        user_id=user.id,
        filename=file.filename,
        content_type=file.content_type,
        data=data,
    )
