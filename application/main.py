from fastapi import FastAPI
import uvicorn
from api import router as api_router
from core.config import settings
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(
    title=settings.project_name,
)

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.runtime.host,
        port=settings.runtime.port,
        reload=settings.runtime.reload,
        workers=settings.runtime.workers,
        log_config="log_conf.yaml",
    )
