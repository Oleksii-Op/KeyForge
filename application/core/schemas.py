from pydantic import BaseModel, Field


class PrivateKeyOut(BaseModel):
    private_key: str


class PublicKeyOut(BaseModel):
    public_key: str


class PasswordIn(BaseModel):
    password: str | None = Field(
        None,
        max_length=128,
        min_length=0,
    )


class PrivateKeyIn(PasswordIn):
    private_key: str


class HashOut(BaseModel):
    hash: str


class BasePayload(BaseModel):
    payload: str | None = Field(
        default=None,
        max_length=256,
        min_length=0,
    )


class Argon2HashParams(BasePayload):
    length: int = Field(
        default=32,
        ge=8,
        le=32,
    )
    memory_cost: int = Field(
        default=65536,
        ge=8,
        le=244141,
    )


class BcryptHashParams(BasePayload):
    rounds: int = Field(
        default=12,
        ge=8,
        le=32,
    )


class FileHashedResponse(BaseModel):
    filename: str
    algorithm: str
    hash: str
    size: int
