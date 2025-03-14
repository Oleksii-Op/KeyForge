from fastapi import (
    UploadFile,
    APIRouter,
    status,
    HTTPException,
)
from opentelemetry import trace

from response_docs import TOO_LARGE_FILE
from core.schemas import FileHashedResponse
from core.hashengine import HashLibEnum, HashLib

MiB_512 = 512 * 1024 * 1024  # Max size 512 MiB
router = APIRouter(tags=["Files"])

tracer = trace.get_tracer(__name__)


@tracer.start_as_current_span(__name__)
@router.post(
    "/file-sum",
    status_code=status.HTTP_200_OK,
    summary="Upload a file",
    response_model=FileHashedResponse,
    responses=TOO_LARGE_FILE,
)
async def upload_file(
    algorithm: HashLibEnum,
    file: UploadFile,
) -> FileHashedResponse:
    """Calculate and return a cryptographic hash for the uploaded file.

    This endpoint enables users to upload a file and receive a cryptographic hash
    (checksum) of its contents using a specified algorithm. This can be used to verify
    file integrity or detect file modifications.

    Args:
        algorithm (HashLibEnum): The hashing algorithm to use.
            Supported algorithms include sha256, sha384, sha512, and md5.
        file (UploadFile): The file to be hashed, with a maximum size of 512 MiB.
            Files exceeding this limit will be rejected with a 413 error.

    Returns:
        FileHashedResponse: An object containing:
            - filename: Original name of the uploaded file
            - algorithm: The algorithm used for hashing
            - hash: The calculated hash value (hex-encoded)
            - size: Size of the file in bytes

    Raises:
        HTTPException (413): If the file size exceeds 512 MiB.

    Examples:
        A typical request would upload a file and specify an algorithm, receiving
        a response with the file details and its hash:

        Response:
        ```json
        {
            "filename": "example.txt",
            "algorithm": "sha256",
            "hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            "size": 1024
        }
        ```
    """
    if file.size > MiB_512:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File is too large. Exceeds 512 MiB",
        )
    with tracer.start_span(name=__name__) as span:
        span.set_attributes(
            {
                "file_size": file.size,
                "algorithm": algorithm.value,
            }
        )
        hashed = HashLib(algorithm=algorithm).hash_file(file=file)
        return FileHashedResponse(
            filename=file.filename,
            algorithm=algorithm.value,
            hash=hashed,
            size=file.size,
        )
