from httpx import AsyncClient
from fastapi import status
import pytest
from tests.conftest import long_string
from core.schemas import PrivateKeyOut


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
        "/api/gened25519-private-key",
        json={
            "password": password,
        },
    )
    assert response.status_code == status.HTTP_201_CREATED


@pytest.mark.asyncio
async def test_ed25519_keygen_long_password(
    client: AsyncClient,
):
    response = await client.post(
        "/api/gened25519-private-key",
        json={
            "password": long_string,
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

    public_key = await client.post(
        url="/api/gen-public-key",
        json={
            "private_key": response.json()["private_key"],
            "password": password,
        },
    )

    assert response.status_code == status.HTTP_201_CREATED
    assert response.json() is not None

    assert public_key.status_code == status.HTTP_201_CREATED
    assert public_key.json() is not None


@pytest.mark.asyncio
async def test_rsa_keygen_long_password(
    client: AsyncClient,
):
    response = await client.post(
        "/api/genrsa-private-key?key_size=1024",
        json={
            "password": long_string,
        },
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


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
async def test_failed_rsa_public_key(
    client: AsyncClient,
    gen_random_rsa_keys: PrivateKeyOut,
):
    response = await client.post(
        url="/api/gen-public-key",
        json={
            "private_key": gen_random_rsa_keys.private_key,
            "password": "password_that_should_not_be",
        },
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    assert (
        response.json()["detail"]
        == "Password was given but private key is not encrypted."
    )


@pytest.mark.asyncio
async def test_gen_ed25519_public_key(
    client: AsyncClient,
    gen_random_ed25519_private_key: PrivateKeyOut,
):
    response = await client.post(
        url="/api/gen-public-key",
        json={
            "private_key": gen_random_ed25519_private_key.private_key,
            "password": None,
        },
    )
    assert response.status_code == status.HTTP_201_CREATED
    assert response.json() is not None
