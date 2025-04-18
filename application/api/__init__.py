from fastapi import APIRouter
from api.hashers import router as hash_router
from api.keys import router as keys_router
from api.files import router as files_router
from core.config import settings

router = APIRouter(
    prefix=settings.prefix.api,
)

router.include_router(hash_router)
router.include_router(keys_router)
router.include_router(files_router)
