from enum import Enum

from cryptography.hazmat.backends import default_backend

from cryptography.hazmat.primitives.asymmetric import rsa, ed25519, dsa
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
from cryptography.hazmat.primitives.asymmetric.rsa import RSAPrivateKey
from fastapi import HTTPException


class RSASizeEnum(int, Enum):
    RSA_1024 = 1024
    RSA_2048 = 2048
    RSA_4096 = 4096
    RSA_8192 = 8192


def gen_rsa_private_key_pem(password: str | None, key_size) -> str:
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=key_size,
        backend=default_backend(),
    )
    if password is None or password == "":
        encryption_algorithm = serialization.NoEncryption()
    else:
        encryption_algorithm = serialization.BestAvailableEncryption(
            password=password.encode("utf-8"),
        )
    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=encryption_algorithm,
    )
    return private_pem.decode("utf-8")


def gen_rsa_ed25519_public_key_pem(
    pem: str,
    password: str | None,
) -> str:
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


def gen_ed25519_private_key_pem(password: str | None) -> str:
    private_key = ed25519.Ed25519PrivateKey.generate()
    if password is None or password == "":
        encryption_algorithm = serialization.NoEncryption()
    else:
        encryption_algorithm = serialization.BestAvailableEncryption(
            password=password.encode("utf-8"),
        )
    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=encryption_algorithm,
    )
    return private_pem.decode("utf-8")
