import re
import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import User
from r2 import upload_bytes
from schemas import UploadResponse

router = APIRouter(prefix="/api/media", tags=["media"])

ALLOWED_TYPES = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/svg+xml": "svg",
    "video/mp4": "mp4",
    "video/webm": "webm",
    "video/quicktime": "mov",
}
MAX_SIZE = 25 * 1024 * 1024  # 25MB


@router.post("/upload", response_model=UploadResponse)
async def upload_media(
    file: UploadFile,
    user: User = Depends(get_current_user),
):
    content_type = (file.content_type or "").lower()
    if content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {content_type}")

    data = await file.read()
    if len(data) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 25MB)")
    if not data:
        raise HTTPException(status_code=400, detail="Empty file")

    ext = ALLOWED_TYPES[content_type]
    safe_name = re.sub(r"[^a-z0-9_-]", "", (file.filename or "file").rsplit(".", 1)[0].lower())[:40]
    key = f"user-{user.id}/{uuid.uuid4().hex[:12]}-{safe_name}.{ext}"

    url = upload_bytes(data, key, content_type)
    return UploadResponse(url=url)
