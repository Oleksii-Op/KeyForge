from fastapi import FastAPI, Request, status
from pydantic import ValidationError
import logging
from fastapi.responses import ORJSONResponse


logger = logging.getLogger(__name__)


def exception_handler(app: FastAPI):
    @app.exception_handler(ValidationError)
    def validation_exception_handler(request: Request, exc: ValidationError):
        logger.error("Unexpected validation error", exc_info=exc)
        return ORJSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={"detail": "Validation error", "message": "Unexpected error"},
        )
