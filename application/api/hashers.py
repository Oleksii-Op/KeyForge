from fastapi import APIRouter, status
import secrets
from core.schemas import (
    Argon2HashParams,
    BasePayload,
    BcryptHashParams,
    HashOut,
)

from core.hashengine import (
    HashLib,
    rand_integer,
    HashLibEnum,
    argon2hash,
    bcrypt_hash,
)
from opentelemetry import trace


tracer = trace.get_tracer(__name__)

router = APIRouter(tags=["Hash"])


# @tracer.start_as_current_span(__name__)
@router.get(
    "/random-token",
    status_code=status.HTTP_200_OK,
    summary="Get a random token",
)
async def random_hash() -> str:
    """
    Get a random token. Min length is 32, max length is 128.
    """
    with tracer.start_as_current_span("random_token"):
        return secrets.token_hex(rand_integer())


@tracer.start_as_current_span(__name__)
@router.post(
    "/argon2-hash",
    status_code=status.HTTP_201_CREATED,
    response_model=HashOut,
    summary="Create Argon2 Hash",
)
async def create_argon2_hash(
    params: Argon2HashParams,
) -> HashOut:
    """
    Create a hash using argon2 based on payload, length and memory cost

    - **payload**: str
    - **length**: int, default = 32, ge = 8, le = 32
    - **memory_cost**: int, default = 65536, le = 244141
    """
    with tracer.start_as_current_span("create-argon2-hash"):
        hashed = argon2hash(
            payload=params.payload,
            length=params.length,
            memory_cost=params.memory_cost,
        )
        return HashOut(
            hash=hashed,
        )


@tracer.start_as_current_span(__name__)
@router.post(
    "/bcrypt-hash",
    status_code=status.HTTP_201_CREATED,
    response_model=HashOut,
    summary="Create Bcrypt Hash",
)
async def create_bcrypt_hash(params: BcryptHashParams) -> HashOut:
    """
    Create a hash using bcrypt based on payload and rounds

    - **payload**: str
    - **rounds**: int, default = 12, ge = 8, le = 32
    """
    with tracer.start_as_current_span("create-bcrypt-hash"):
        hashed = bcrypt_hash(
            payload=params.payload,
            rounds=params.rounds,
        )
        return HashOut(
            hash=hashed,
        )


@tracer.start_as_current_span(__name__)
@router.post(
    "/hashlib",
    status_code=status.HTTP_201_CREATED,
    response_model=HashOut,
    summary="Create hash based on sha256, sha384, sha512, md5",
)
async def create_hashlib_hash(
    algorithm: HashLibEnum,
    payload: BasePayload,
) -> HashOut:
    """
    Create a hash using sha256, sha384, sha512, md5

    - **algorithm**: HashLibEnum class supports -> sha256,sha384,sha512,md5
    - **payload**: str
    """
    with tracer.start_span(name="create-hashlib-hash") as span:
        span.set_attribute(
            "algorithm",
            algorithm.value,
        )
        hashed = HashLib(algorithm=algorithm).hash(
            payload=payload.payload,
        )
        return HashOut(
            hash=hashed,
        )
