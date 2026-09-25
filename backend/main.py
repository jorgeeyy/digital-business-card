from pathlib import Path

from alembic.config import Config
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse

from alembic import command
from config import settings
from database import Base, engine  # noqa: F401 — Base used by models/alembic
from errors import register_exception_handler
from r2 import local_file_url
from routes import auth, cards, media, public


def run_migrations() -> None:
    """Apply pending Alembic migrations on startup."""
    cfg = Config(str(Path(__file__).parent / "alembic.ini"))
    command.upgrade(cfg, "head")


run_migrations()

app = FastAPI(title="Tap Card API", version="0.1.0")

register_exception_handler(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(cards.router)
app.include_router(media.router)


@app.get("/uploads/{filename}")
def serve_upload(filename: str):
    path = local_file_url(filename)
    if path:
        return FileResponse(
            path,
            headers={"Cache-Control": "public, max-age=31536000, immutable"},
        )
    else:
        return JSONResponse(status_code=404, content={"detail": "Not found"})


@app.get("/api/health")
def health():
    return {"ok": True}


# Public card route must be last: it catches /{username}
app.include_router(public.router)
