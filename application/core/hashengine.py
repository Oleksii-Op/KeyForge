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
    """Enumeration of supported hashing algorithms.

    Provides string-based enum values for supported hashlib algorithms that can be
    used as API parameters and validated by FastAPI.
    """

    SHA512 = "sha512"
    SHA256 = "sha256"
    SHA384 = "sha384"
    MD5 = "md5"


class HashLib:
    """Wrapper class for hashlib algorithms.

    Provides a unified interface for working with different hashlib algorithms,
    supporting both string and file hashing operations.
    """

    __algorithms = {
        "sha256": sha256,
        "sha384": sha384,
        "sha512": sha512,
        "md5": md5,
    }

    def __init__(self, algorithm: str):
        """Initialize a HashLib instance with the specified algorithm.

        Args:
            algorithm (str): The name of the hashing algorithm to use.
                Must be one of: 'sha256', 'sha384', 'sha512', or 'md5'.

        Raises:
            ValueError: If the specified algorithm is not supported.
        """
        self.hasher: Type[HASHLIB] = self.__algorithms.get(algorithm, None)
        if self.hasher is None:
            raise ValueError(
                f"Hash algorithm '{self.hasher}' is not supported",
            )

    def hash(self, payload: str) -> str:
        """Hash a string payload using the selected algorithm.

        Args:
            payload (str): The string to be hashed.

        Returns:
            str: The hexadecimal digest of the hashed payload.
        """
        return self.hasher(payload.encode()).hexdigest()

    def hash_file(self, file: UploadFile) -> str:
        """Hash the contents of an uploaded file using the selected algorithm.

        Processes the file in chunks to efficiently handle large files without
        loading the entire file into memory.

        Args:
            file (UploadFile): The FastAPI UploadFile object to be hashed.

        Returns:
            str: The hexadecimal digest of the hashed file content.
        """
        hasher = self.hasher()
        for chunk in file.file:
            hasher.update(chunk)
        return hasher.hexdigest()


def rand_integer() -> int:
    """Generate a random integer between 32 and 128 (inclusive).

    Used primarily for generating random-sized tokens when a payload
    is not provided to hashing functions.

    Returns:
        int: A random integer between 32 and 128.
    """
    return randint(32, 128)


def bcrypt_hash(
    payload: str | None,
    rounds: int,
) -> str:
    """Create a bcrypt hash from a payload with specified cost factor.

    If no payload is provided, a random token will be generated and hashed.

    Args:
        payload (str | None): The string to hash, or None to use a random token.
        rounds (int): The cost factor (work factor) for the bcrypt algorithm,
            typically between 8 and 32. Higher values increase security but
            also increase computation time.

    Returns:
        str: The bcrypt hash string in the format:
            $2b$[rounds]$[22 character salt][31 character hash]
    """
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
    """Create an Argon2 hash from a payload with specified parameters.

    If no payload is provided, a random token will be generated and hashed.

    Args:
        payload (str | None): The string to hash, or None to use a random token.
        memory_cost (int): The amount of memory to use in kibibytes (KiB).
            Higher values increase resistance to GPU attacks but require more resources.
        length (int): The length of the hash output in bytes, typically between 8 and 32.

    Returns:
        str: The Argon2 hash string in the format:
            $argon2id$v=[version]$m=[memory],t=[time],p=[parallelism]$[salt]$[hash]
    """
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
