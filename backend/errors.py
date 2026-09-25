from fastapi import Request
from fastapi.responses import JSONResponse


class ServiceError(Exception):
    """Business-rule error raised by the service layer.

    Translated to an HTTP response by the handler registered in main.py,
    so services never depend on FastAPI.
    """

    def __init__(self, status_code: int, detail: str):
        super().__init__(detail)
        self.status_code = status_code
        self.detail = detail


def register_exception_handler(app) -> None:
    @app.exception_handler(ServiceError)
    async def handle_service_error(request: Request, exc: ServiceError):
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})
