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
    """Generate a cryptographically secure random token.

    This endpoint produces a random hexadecimal token suitable for use in security
    contexts like session identifiers, CSRF tokens, or password reset tokens.

    The generated token has a random length between 32 and 128 characters (16-64 bytes),
    providing strong unpredictability and sufficient entropy for security purposes.

    Returns:
        str: A random hexadecimal string with length between 32 and 128 characters.

    Example:
        ```
        GET /random-token

        Response: "7b3f8b3f7a9c7d3e7a8c7d3e7a8c7d3e7a8c7d3e7a8c7d3e7a8c7d3e7a8c"
        ```
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
    """Create a secure password hash using the Argon2 algorithm.

    Argon2 is a modern password-hashing function designed to be resistant to
    various attacks, including GPU-based cracking attempts. It's particularly
    suitable for password storage and verification.

    Args:
        params (Argon2HashParams): Parameters for the Argon2 hash function:
            - payload (str): The string to hash (e.g., a password)
            - length (int, optional): Output hash length in bytes.
              Default: 32, Min: 8, Max: 32
            - memory_cost (int, optional): Memory usage in KiB.
              Default: 65536 (64 MiB), Max: 244141 (~238 MiB)
              Higher values increase resistance to GPU attacks.

    Returns:
        HashOut: An object containing:
            - hash (str): The Argon2 hash string in the format:
              $argon2id$v=19$m=[memory],t=[time],p=[parallelism]$[salt]$[hash]

    Example:
        Request:
        ```json
        {
            "payload": "mySecurePassword",
            "length": 32,
            "memory_cost": 65536
        }
        ```

        Response:
        ```json
        {
            "hash": "$argon2id$v=19$m=65536,t=3,p=4$..."
        }
        ```
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
    """Create a secure password hash using the bcrypt algorithm.

    Bcrypt is a password-hashing function designed to be slow and difficult to crack,
    making it suitable for secure password storage. It includes built-in salting and
    an adaptive cost factor to adjust security over time.

    Args:
        params (BcryptHashParams): Parameters for the bcrypt hash function:
            - payload (str): The string to hash (e.g., a password)
            - rounds (int, optional): Work factor/cost factor that determines
              the computational complexity. Default: 12, Min: 8, Max: 32
              Higher values increase security but also increase hashing time.

    Returns:
        HashOut: An object containing:
            - hash (str): The bcrypt hash string in the format:
              $2b$[rounds]$[22 character salt][31 character hash]

    Example:
        Request:
        ```json
        {
            "payload": "mySecurePassword",
            "rounds": 12
        }
        ```

        Response:
        ```json
        {
            "hash": "$2b$12$..."
        }
        ```
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
    """Create a cryptographic hash of a given payload using standard algorithms.

    This endpoint uses Python's hashlib to generate cryptographic hashes with
    various algorithms. This is useful for data verification, checksums, and
    other non-password hashing purposes.

    Note: For password hashing, prefer the /argon2-hash or /bcrypt-hash endpoints
    which are specifically designed for that purpose.

    Args:
        algorithm (HashLibEnum): The hashing algorithm to use.
            Supported algorithms include:
            - sha256: SHA-2 family hash with 256-bit output
            - sha384: SHA-2 family hash with 384-bit output
            - sha512: SHA-2 family hash with 512-bit output
            - md5: MD5 algorithm (128-bit output, considered cryptographically weak)
        payload (BasePayload): Object containing:
            - payload (str): The string to hash

    Returns:
        HashOut: An object containing:
            - hash (str): The hex-encoded hash value

    Example:
        Request:
        ```json
        {
            "payload": "Hello, world!"
        }
        ```

        With query parameter: ?algorithm=sha256

        Response:
        ```json
        {
            "hash": "315f5bdb76d078c43b8ac0064e4a0164612b1fce77c869345bfc94c75894edd3"
        }
        ```
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
