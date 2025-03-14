from enum import Enum

from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives.asymmetric import rsa, ed25519
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
from cryptography.hazmat.primitives.asymmetric.rsa import RSAPrivateKey
from fastapi import HTTPException


class RSASizeEnum(int, Enum):
    """Enumeration of supported RSA key sizes.

    Defines the valid bit lengths for RSA key generation, which can be
    used as API parameters and validated by FastAPI.
    """

    RSA_1024 = 1024  # Less secure, suitable for testing only
    RSA_2048 = 2048  # Minimum recommended for general use
    RSA_4096 = 4096  # Higher security for sensitive applications
    RSA_8192 = 8192  # Maximum security, significant performance impact


def gen_rsa_private_key_pem(
    password: str | None,
    key_size: int,
) -> str:
    """Generate an RSA private key and return it in PEM format.

    Creates a new RSA private key with the specified key size and optionally
    encrypts it with a password.

    Args:
        password (str | None): Optional password to encrypt the private key.
            If None or empty string, the key will not be encrypted.
        key_size (int): The size of the RSA key in bits. Should be one of the
            values defined in RSASizeEnum (1024, 2048, 4096, or 8192).
            Larger key sizes provide more security but slower operations.

    Returns:
        str: The PEM-encoded RSA private key as a string.
            If a password was provided, returns an encrypted private key
            that begins with "-----BEGIN ENCRYPTED PRIVATE KEY-----".
            Otherwise, returns an unencrypted private key that begins
            with "-----BEGIN PRIVATE KEY-----".
    """
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=key_size,
        backend=default_backend(),
    )

    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=(
            serialization.NoEncryption()
            if password is None or password == ""
            else serialization.BestAvailableEncryption(
                password=password.encode("utf-8"),
            )
        ),
    )
    return private_pem.decode("utf-8")


def gen_rsa_ed25519_public_key_pem(
    pem: str,
    password: str | None,
) -> str:
    """Generate a public key from a private key (RSA or ED25519) in PEM format.

    Extracts the public key component from a PEM-encoded private key. If the private
    key is encrypted, the correct password must be provided.

    Args:
        pem (str): The PEM-encoded private key (RSA or ED25519) as a string.
        password (str | None): The password to decrypt the private key, if encrypted.
            Should be None or empty string for unencrypted private keys.

    Returns:
        str: The PEM-encoded public key as a string, beginning with
            "-----BEGIN PUBLIC KEY-----".

    Raises:
        HTTPException (422): If the private key data format is invalid or if
            a password was provided for an unencrypted key, or if the password
            is incorrect for an encrypted key.
    """
    try:
        private_key: RSAPrivateKey | Ed25519PrivateKey = (
            serialization.load_pem_private_key(
                pem.encode("utf-8"),
                password=password.encode("utf-8") if password else None,
            )
        )
    except ValueError:
        raise HTTPException(
            status_code=422,
            detail="Could not deserialize key data. The data may be in an incorrect format.",
        )
    except TypeError:
        raise HTTPException(
            status_code=422,
            detail="Password was given but private key is not encrypted.",
        )
    public_key = private_key.public_key()
    public_pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    )
    return public_pem.decode("utf-8")


def gen_ed25519_private_key_pem(
    password: str | None,
) -> str:
    """Generate an ED25519 private key and return it in PEM format.

    Creates a new ED25519 private key (256 bits) and optionally encrypts it with a password.
    ED25519 is a modern elliptic curve algorithm that provides strong security with
    shorter key lengths compared to RSA.

    Args:
        password (str | None): Optional password to encrypt the private key.
            If None or empty string, the key will not be encrypted.

    Returns:
        str: The PEM-encoded ED25519 private key as a string.
            If a password was provided, returns an encrypted private key
            that begins with "-----BEGIN ENCRYPTED PRIVATE KEY-----".
            Otherwise, returns an unencrypted private key that begins
            with "-----BEGIN PRIVATE KEY-----".
    """
    private_key = ed25519.Ed25519PrivateKey.generate()

    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=(
            serialization.NoEncryption()
            if password is None or password == ""
            else serialization.BestAvailableEncryption(
                password=password.encode("utf-8"),
            )
        ),
    )
    return private_pem.decode("utf-8")
