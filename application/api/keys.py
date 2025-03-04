from fastapi import APIRouter, status
from core.keysengine import (
    RSASizeEnum,
    gen_rsa_private_key_pem,
    gen_ed25519_private_key_pem,
)
from core.schemas import PrivateKeyOut

router = APIRouter(tags=["Keys"])


@router.post(
    "/genrsa-private-key",
    status_code=status.HTTP_201_CREATED,
    response_model=PrivateKeyOut,
)
async def genrsa_private_key(
    key_size: RSASizeEnum,
    password: str | None = None,
):
    private_pem = gen_rsa_private_key_pem(
        password=password,
        key_size=key_size.value,
    )
    return PrivateKeyOut(
        private_key=private_pem,
    )


@router.post(
    "/gened25519-private-key",
    status_code=status.HTTP_201_CREATED,
    response_model=PrivateKeyOut,
)
async def gened25519_private_key(
    password: str | None = None,
):
    private_pem = gen_ed25519_private_key_pem(
        password=password,
    )
    return PrivateKeyOut(
        private_key=private_pem,
    )
