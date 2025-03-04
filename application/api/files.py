from typing import Any

from fastapi import (
    UploadFile,
    APIRouter,
    status,
    HTTPException,
)
from pydantic import BaseModel

from core.hashengine import HashLibEnum, HashLib

MiB_512 = 512 * 1024 * 1024  # Max size 512 MiB
router = APIRouter(tags=["Files"])

resp = {
    status.HTTP_413_REQUEST_ENTITY_TOO_LARGE: {
        "detail": "File is too large. Exceeds 512 MiB",
        "content": {
            "application/json": {
                "example": {"detail": "File is too large. Exceeds 512 MiB"}
            }
        },
    },
}


class FileHashedResponse(BaseModel):
    filename: str
    algorithm: str
    hash: str
    size: int


@router.post(
    "/file-sum/",
    status_code=status.HTTP_200_OK,
    summary="Upload a file",
    response_model=FileHashedResponse,
    responses=resp,
)
async def upload_file(
    algorithm: HashLibEnum,
    file: UploadFile,
) -> FileHashedResponse:
    """
    Upload a file to get its hash checksum.
    - **algorithm**: HashLibEnum class supports -> sha256,sha384,sha512,md5
    - **file**: File-like object with the maximum size of 512 MiB
    """
    if file.size > MiB_512:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File is too large. Exceeds 512 MiB",
        )
    hashed = HashLib(algorithm=algorithm).hash_file(file=file)
    return FileHashedResponse(
        filename=file.filename,
        algorithm=algorithm.value,
        hash=hashed,
        size=file.size,
    )
