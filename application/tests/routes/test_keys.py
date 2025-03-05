from httpx import AsyncClient
from fastapi import status
import pytest


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "password",
    [
        "password",
        "",
        "jfsjdopderpi30130975jfslkd;;lasdkjgbsdjkaspd483",
    ],
)
async def test_ed25519_keygen(
    client: AsyncClient,
    password: str,
):
    response = await client.post(
        f"/api/gened25519-private-key",
        json={
            "password": password,
        },
    )
    assert response.status_code == status.HTTP_201_CREATED


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "keysize, password",
    [
        (256, "password"),
        (512, ""),
        (12288, "password"),
    ],
)
async def test_rsa_keygen_wrong_keysize(
    client: AsyncClient,
    keysize: int,
    password: str,
):
    response = await client.post(
        f"/api/genrsa-private-key?key_size={keysize}",
        json={
            "password": password,
        },
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "keysize, password",
    [
        (1024, "password"),
        (2048, ""),
        (4096, "password"),
        (8192, ""),
    ],
)
async def test_rsa_keygen(
    client: AsyncClient,
    keysize: int,
    password: str,
):
    response = await client.post(
        f"/api/genrsa-private-key?key_size={keysize}",
        json={
            "password": password,
        },
    )
    assert response.status_code == status.HTTP_201_CREATED
    assert response.json() is not None
