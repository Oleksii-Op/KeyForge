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
) -> PrivateKeyOut:
    """Generate an RSA private key with configurable size and optional encryption.

    Creates a new RSA private key of the specified bit size and returns it in PEM format.
    The key can optionally be protected with password-based encryption for secure storage.

    Technical details:
    - Uses a secure random number generator for key creation
    - Implements PKCS#8 format for the private key
    - Uses optimal 65537 (0x10001) as the public exponent
    - When encrypted, uses AES-256-CBC with PBKDF2 key derivation

    Args:
        key_size (RSASizeEnum): The RSA key size in bits. Options:
            - 1024: Fastest but least secure (for testing only)
            - 2048: Standard security (recommended minimum)
            - 4096: Enhanced security (recommended for sensitive applications)
            - 8192: Maximum security (with significant performance impact)
        password (PasswordIn): Password protection configuration:
            - password (str, optional): Password to encrypt the private key.
              If None or empty, the key will be unencrypted.

    Returns:
        PrivateKeyOut: Object containing:
            - private_key (str): The PEM-encoded RSA private key.
              Format begins with "-----BEGIN PRIVATE KEY-----" if unencrypted,
              or "-----BEGIN ENCRYPTED PRIVATE KEY-----" if encrypted.

    Performance considerations:
        - Generating larger keys (4096, 8192) can take significant time
        - Key generation is CPU-intensive; server load may increase with frequent requests

    Security note:
        Key size of 2048 bits or larger is recommended for general use.
        1024-bit keys should only be used for non-sensitive test environments.
    """
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

    # BackgroundTasks!!!
    # async def task(data):
    #     otherdata = await db.fetch("some sql")
    #     newdata = somelongcomputation(data, otherdata)  # this blocks other requests
    #     await db.execute("some sql", newdata)
    #
    # @app.post("/profile")
    # async def profile(data: Data, background_tasks: BackgroundTasks):
    #     background_tasks.add_task(task, data)
    #     return {}

    # Solution
    # from fastapi.concurrency import run_in_threadpool
    # async def task(data):
    #     otherdata = await db.fetch("some sql")
    #     newdata = await run_in_threadpool(lambda: somelongcomputation(data, otherdata))
    #     await db.execute("some sql", newdata)


@tracer.start_as_current_span(__name__)
@router.post(
    "/gened25519-private-key",
    status_code=status.HTTP_201_CREATED,
    response_model=PrivateKeyOut,
)
async def gened25519_private_key(
    password: PasswordIn,
) -> PrivateKeyOut:
    """Generate an Ed25519 private key with optional encryption.

    Creates a new Ed25519 elliptic curve private key (256 bits) and returns it in PEM format.
    The key can optionally be protected with password-based encryption for secure storage.

    Ed25519 is a modern elliptic curve signature algorithm that offers:
    - Faster operations compared to RSA
    - Strong security with much smaller key sizes (256 bits vs 2048+ for RSA)
    - Side-channel attack resistance with deterministic signatures
    - Small signatures (64 bytes) for efficient transmission and storage

    Args:
        password (PasswordIn): Password protection configuration:
            - password (str, optional): Password to encrypt the private key.
              If None or empty, the key will be unencrypted.

    Returns:
        PrivateKeyOut: Object containing:
            - private_key (str): The PEM-encoded Ed25519 private key.
              Format begins with "-----BEGIN PRIVATE KEY-----" if unencrypted,
              or "-----BEGIN ENCRYPTED PRIVATE KEY-----" if encrypted.

    Performance note:
        Ed25519 key generation is significantly faster than RSA key generation
        and suitable for resource-constrained environments.

    Use cases:
        Ideal for SSH keys, TLS certificates, document signing, and IoT device authentication
        where performance, security, and small key/signature size are important.
    """
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
    """Extract the public key from a private key (RSA or Ed25519).

    Derives the corresponding public key from a PEM-encoded private key.
    Works with both RSA and Ed25519 private keys, encrypted or unencrypted.
    If the private key is encrypted, the correct password must be provided.

    This endpoint is useful when you need to:
    - Generate a public key from an existing private key
    - Verify that you have the correct password for an encrypted private key
    - Extract the public component for sharing without exposing the private key

    Args:
        payload (PrivateKeyIn): The private key information:
            - private_key (str): PEM-encoded private key (RSA or Ed25519)
            - password (str, optional): Password to decrypt the private key
              if it's encrypted. Should be None for unencrypted keys.

    Returns:
        PublicKeyOut: Object containing:
            - public_key (str): The PEM-encoded public key.
              Format begins with "-----BEGIN PUBLIC KEY-----".

    Raises:
        HTTPException (422): If one of these errors occurs:
            - The private key data is in an invalid format or corrupted
            - A password was provided but the private key is not encrypted
            - No password was provided but the private key is encrypted
            - The provided password is incorrect for decrypting the key

    Notes:
        - The public key format uses SubjectPublicKeyInfo (SPKI) encoding
        - The returned public key is compatible with most cryptographic libraries
          and systems including OpenSSL, SSH (after conversion), and TLS
    """
    with tracer.start_as_current_span("gen-public-key"):
        public_key = gen_rsa_ed25519_public_key_pem(
            pem=payload.private_key,
            password=payload.password,
        )
        return PublicKeyOut(
            public_key=public_key,
        )
