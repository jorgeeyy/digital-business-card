import re
import uuid

from errors import ServiceError
from r2 import upload_bytes
from schemas import UploadResponse

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


def upload_media(
    *, user_id: int, filename: str | None, content_type: str | None, data: bytes
) -> UploadResponse:
    content_type = (content_type or "").lower()
    if content_type not in ALLOWED_TYPES:
        raise ServiceError(400, f"Unsupported file type: {content_type}")
    if not data:
        raise ServiceError(400, "Empty file")
    if len(data) > MAX_SIZE:
        raise ServiceError(400, "File too large (max 25MB)")

    ext = ALLOWED_TYPES[content_type]
    safe_name = re.sub(r"[^a-z0-9_-]", "", (filename or "file").rsplit(".", 1)[0].lower())[:40]
    key = f"user-{user_id}/{uuid.uuid4().hex[:12]}-{safe_name}.{ext}"
    return UploadResponse(url=upload_bytes(data, key, content_type))
