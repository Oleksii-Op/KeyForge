from random import choice

import pytest_asyncio
from typing import AsyncGenerator
from main import app
from httpx import ASGITransport, AsyncClient
from core.keysengine import (
    gen_rsa_private_key_pem,
    gen_ed25519_private_key_pem,
)
from core.schemas import PrivateKeyOut


@pytest_asyncio.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as ac:
        yield ac


@pytest_asyncio.fixture
async def gen_random_rsa_keys() -> AsyncGenerator[PrivateKeyOut, None]:
    key_size = choice([1024, 2048, 4096, 8192])
    private_key = gen_rsa_private_key_pem(
        password=None,
        key_size=key_size,
    )
    yield PrivateKeyOut(private_key=private_key)


@pytest_asyncio.fixture
async def gen_random_ed25519_private_key() -> AsyncGenerator[PrivateKeyOut, None]:
    private_key = gen_ed25519_private_key_pem(
        password=None,
    )
    yield PrivateKeyOut(private_key=private_key)


long_string = (
    "2c6c68ebee48c28ba60de4cf980032dc0f5fd06fa4681922d17f5"
    "0a4facd6f3d5da9a88f8e20f20a32beed6d3be328de13f2f17409"
    "44ac4ef8ed70cd63680442b9243e259b2a6ff213fb21e98518046"
    "a298f4b329653354f5d55b957f5b6be819a237503c9c2071c4578"
    "b6d3b2be0c5925b32de75c1bd58366fb58cd525af28d79dca501b3"
    "cc86ca82dce54310a8eee863062d01e623640617fe382c354c46dc"
    "7e1b56c4687ff3a291d0c3aac5da10fde7588317c5c1f3a72175b4"
    "acabe5c9d4da55f7cd94dce22615de1acd3cc3050fd557e36142a43"
    "f37ec51f8ecf2612bdc07e555ad1c6ec185736eac436e69544a0121"
    "a0f5fb584b8e83e5127885e027da77e26a39b5ce2b86b75fb620be8"
    "d2d8ef6e2ac1e14356edcb7c5d6524b4b125f98bf96d80ef441bf27"
    "96f56bhf9383jksk02lkdnu93u93dsdsbyv8yf7tv6vsiskjdv6t6d8s"
    "2c6c68ebee48c28ba60de4cf980032dc0f5fd06fa4681922d17f5"
    "0a4facd6f3d5da9a88f8e20f20a32beed6d3be328de13f2f17409"
)
