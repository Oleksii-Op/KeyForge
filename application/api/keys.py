from fastapi import APIRouter, status

from core.keysengine import (
    RSASizeEnum,
    gen_rsa_private_key_pem,
    gen_ed25519_private_key_pem,
    gen_rsa_ed25519_public_key_pem,
)
from core.schemas import (
    PrivateKeyOut,
    PublicKeyOut,
    PrivateKeyIn,
    PasswordIn,
)
from opentelemetry import trace


tracer = trace.get_tracer(__name__)

router = APIRouter(tags=["Keys"])


@tracer.start_as_current_span(__name__)
@router.post(
    "/genrsa-private-key",
    status_code=status.HTTP_201_CREATED,
    response_model=PrivateKeyOut,
)
async def genrsa_private_key(
    key_size: RSASizeEnum,
    password: PasswordIn,
):
    with tracer.start_as_current_span("genrsa-private-key"):
        current_span = trace.get_current_span()
        current_span.set_attribute("keySize", key_size)
        private_pem = gen_rsa_private_key_pem(
            password=password.password,
            key_size=key_size.value,
        )
        return PrivateKeyOut(
            private_key=private_pem,
        )


@tracer.start_as_current_span(__name__)
@router.post(
    "/gened25519-private-key",
    status_code=status.HTTP_201_CREATED,
    response_model=PrivateKeyOut,
)
async def gened25519_private_key(
    password: PasswordIn,
):
    with tracer.start_as_current_span("gened25519-private-key"):
        private_pem = gen_ed25519_private_key_pem(
            password=password.password,
        )
        return PrivateKeyOut(
            private_key=private_pem,
        )


@tracer.start_as_current_span(__name__)
@router.post(
    "/gen-public-key",
    status_code=status.HTTP_201_CREATED,
    response_model=PublicKeyOut,
)
async def gen_public_key(
    payload: PrivateKeyIn,
) -> PublicKeyOut:
    with tracer.start_as_current_span("gen-public-key"):
        public_key = gen_rsa_ed25519_public_key_pem(
            pem=payload.public_key,
            password=payload.password,
        )
        return PublicKeyOut(
            public_key=public_key,
        )
