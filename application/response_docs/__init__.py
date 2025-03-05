from fastapi import status

TOO_LARGE_FILE = {
    status.HTTP_413_REQUEST_ENTITY_TOO_LARGE: {
        "detail": "File is too large. Exceeds 512 MiB",
        "content": {
            "application/json": {
                "example": {"detail": "File is too large. Exceeds 512 MiB"}
            }
        },
    },
}
