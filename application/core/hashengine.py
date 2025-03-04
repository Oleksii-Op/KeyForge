import bcrypt
import secrets
from random import randint

from fastapi import UploadFile
from pwdlib.hashers.argon2 import Argon2Hasher
from pwdlib.hashers.bcrypt import BcryptHasher
from hashlib import sha256, sha384, sha512, md5
from enum import Enum
from typing import TypeVar, Type

HASHLIB = TypeVar("HASHLIB", bound=Type[sha256])


class HashLibEnum(str, Enum):
    SHA512 = "sha512"
    SHA256 = "sha256"
    SHA384 = "sha384"
    MD5 = "md5"


class HashLib:
    __algorithms = {
        "sha256": sha256,
        "sha384": sha384,
        "sha512": sha512,
        "md5": md5,
    }

    def __init__(self, algorithm: str):
        self.hasher: Type[HASHLIB] = self.__algorithms.get(algorithm, None)
        if self.hasher is None:
            raise ValueError(
                f"Hash algorithm '{self.hasher}' is not supported",
            )

    def hash(self, payload: str) -> str:
        """Hashes the given payload using the selected hashing algorithm."""
        return self.hasher(payload.encode()).hexdigest()

    def hash_file(self, file: UploadFile) -> str:
        """Hashes the given payload using the selected hashing algorithm."""
        hasher = self.hasher()
        for chunk in file.file:
            hasher.update(chunk)
        return hasher.hexdigest()


def rand_integer() -> int:
    return randint(32, 128)


def bcrypt_hash(
    payload: str | None,
    rounds: int,
) -> str:
    if payload is None:
        payload = secrets.token_bytes(rand_integer())
    password_hasher = BcryptHasher(rounds=rounds)
    return password_hasher.hash(
        password=payload,
        salt=bcrypt.gensalt(),
    )


def argon2hash(
    payload: str | None,
    memory_cost: int,
    length: int,
) -> str:
    if payload is None:
        payload = secrets.token_hex(rand_integer())
    password_hasher = Argon2Hasher(
        hash_len=length,
        memory_cost=memory_cost,
    )
    return password_hasher.hash(
        password=payload,
        salt=bcrypt.gensalt(),
    )
