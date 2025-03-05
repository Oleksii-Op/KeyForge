import os

import pytest
from io import BytesIO
from httpx import AsyncClient
from fastapi import status


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "algorithm",
    [
        "sha256",
        "md5",
        "sha512",
    ],
)
async def test_upload_file(
    client: AsyncClient,
    algorithm: str,
):
    binary_data = bytes(range(1, 255))
    file_like = BytesIO(binary_data)

    files = {
        "file": ("test.bin", file_like, "multipart/form-data"),
    }
    response = await client.post(
        f"/api/file-sum?algorithm={algorithm}",
        files=files,
    )

    assert response.status_code == status.HTTP_200_OK
    json_data = response.json()

    assert "hash" in json_data
    assert json_data["algorithm"] == algorithm
    assert json_data["size"] == len(binary_data)


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "algorithm",
    [
        "sha256",
        "md5",
        "sha512",
    ],
)
async def test_upload_file_above_limit(
    client: AsyncClient,
    algorithm: str,
):
    size_512_mib = 512 * 1024 * 1024
    above_limit = size_512_mib + (512 * 1024)
    binary_data = os.urandom(above_limit)
    file_like = BytesIO(binary_data)
    files = {
        "file": (
            "test.bin",
            file_like,
            "multipart/form-data",
        ),
    }
    response = await client.post(
        f"/api/file-sum?algorithm={algorithm}",
        files=files,
    )

    assert response.status_code == status.HTTP_413_REQUEST_ENTITY_TOO_LARGE
