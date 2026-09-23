"""Cloudflare R2 upload client with local filesystem fallback."""

import os
import uuid
from pathlib import Path

from config import settings

UPLOADS_DIR = Path(__file__).parent / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)


def _r2_configured() -> bool:
    return bool(
        settings.r2_account_id
        and settings.r2_access_key_id
        and settings.r2_secret_access_key
        and settings.r2_bucket
    )


def upload_bytes(data: bytes, key: str, content_type: str) -> str:
    """Upload to R2 if configured, otherwise save locally. Returns public URL."""
    if _r2_configured():
        return _upload_r2(data, key, content_type)
    return _upload_local(data, key)


def _upload_r2(data: bytes, key: str, content_type: str) -> str:
    import boto3
    from botocore.client import Config

    endpoint = f"https://{settings.r2_account_id}.r2.cloudflarestorage.com"
    client = boto3.client(
        "s3",
        endpoint_url=endpoint,
        aws_access_key_id=settings.r2_access_key_id,
        aws_secret_access_key=settings.r2_secret_access_key,
        config=Config(signature_version="s3v4"),
        region_name="auto",
    )
    client.put_object(
        Bucket=settings.r2_bucket,
        Key=key,
        Body=data,
        ContentType=content_type,
    )
    if settings.r2_public_url:
        return f"{settings.r2_public_url.rstrip('/')}/{key}"
    return f"{endpoint}/{settings.r2_bucket}/{key}"


def _upload_local(data: bytes, key: str) -> str:
    filename = f"{uuid.uuid4().hex[:8]}-{os.path.basename(key)}"
    path = UPLOADS_DIR / filename
    path.write_bytes(data)
    return f"{settings.public_base_url}/uploads/{filename}"


def local_file_url(filename: str) -> str | None:
    """Resolve a local uploads filename to a filesystem path (for serving)."""
    safe = os.path.basename(filename)
    path = UPLOADS_DIR / safe
    if path.is_file():
        return str(path)
    return None
