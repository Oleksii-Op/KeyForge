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
