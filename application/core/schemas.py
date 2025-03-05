from pydantic import BaseModel, Field


class PrivateKeyOut(BaseModel):
    private_key: str


class PublicKeyOut(BaseModel):
    public_key: str


class PasswordIn(BaseModel):
    password: str | None = None


class PrivateKeyIn(BaseModel):
    public_key: str
    password: str | None = None


class HashOut(BaseModel):
    hash: str


class BasePayload(BaseModel):
    payload: str | None


class Argon2HashParams(BasePayload):
    length: int = Field(default=32, ge=8, le=32)
    memory_cost: int = Field(default=65536, ge=8, le=244141)


class BcryptHashParams(BasePayload):
    rounds: int = Field(default=12, ge=8, le=32)


class FileHashedResponse(BaseModel):
    filename: str
    algorithm: str
    hash: str
    size: int
