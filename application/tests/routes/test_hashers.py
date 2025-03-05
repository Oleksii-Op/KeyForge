from httpx import AsyncClient
from fastapi import status

import pytest
from core.schemas import Argon2HashParams, BcryptHashParams


@pytest.mark.asyncio
async def test_random_token(client: AsyncClient):
    response = await client.get("/api/random-token")
    assert response.status_code == status.HTTP_200_OK
    assert response.json() is not None


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "length, memory_cost",
    [
        (16, 65555),
    ],
)
async def test_argon2_hash(client: AsyncClient, length: int, memory_cost: int):
    params = Argon2HashParams(
        payload="somestring",
        length=length,
        memory_cost=memory_cost,
    )
    response = await client.post(
        "/api/argon2-hash",
        json=params.model_dump(),
    )
    assert response.status_code == status.HTTP_201_CREATED


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "payload, rounds",
    [
        ("sometext", 12),
        ("sometext", 20),
        ("sometext", 32),
    ],
)
async def test_bcrypt_hash(client: AsyncClient, payload: str, rounds: int):
    params = BcryptHashParams(
        payload=payload,
        rounds=rounds,
    )
    response = await client.post(
        "/api/bcrypt-hash",
        json=params.model_dump(),
    )
    assert response.status_code == status.HTTP_201_CREATED


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "payload, rounds",
    [
        ("sometext", 4),
        ("sometext", 7),
        ("sometext", 40),
    ],
)
async def test_bcrypt_hash_wrong_rounds(
    client: AsyncClient,
    payload: str,
    rounds: int,
):
    response = await client.post(
        "/api/bcrypt-hash",
        json={"payload": payload, "rounds": rounds},
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "algorithm, payload",
    [
        ("sha512", "sometext"),
        ("sha256", "sometext"),
        ("sha384", "sometext"),
        ("md5", "sometext"),
    ],
)
async def test_hashlib_hash(
    client: AsyncClient,
    algorithm: str,
    payload: int,
):
    response = await client.post(
        f"/api/hashlib?algorithm={algorithm}",
        json={"payload": payload},
    )
    assert response.status_code == status.HTTP_201_CREATED


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "algorithm, payload",
    [
        ("md4", "sometext"),
        ("sha1", "sometext"),
    ],
)
async def test_hashlib_hash_wrong_algorithm(
    client: AsyncClient,
    algorithm: str,
    payload: int,
):
    response = await client.post(
        f"/api/hashlib?algorithm={algorithm}",
        json={"payload": payload},
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
