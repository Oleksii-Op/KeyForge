from fastapi import APIRouter, Response
from core.config import settings

router = APIRouter(
    prefix=settings.prefix.utils,
    tags=["Utils"],
)


@router.get("/health-check")
async def health_check() -> Response:
    """
    Endpoint for Docker/Kubernetes Health Check.
    """
    return Response(status_code=200)
