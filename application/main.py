from fastapi import FastAPI
import uvicorn

from api import router as api_router
from utils.healthcheck import router as healthcheck_router
from core.config import settings
from fastapi.middleware.cors import CORSMiddleware
from core.otel import set_opentelemetry_exporter


app = FastAPI(
    title=settings.project_name,
)
set_opentelemetry_exporter(application=app)

app.include_router(api_router)
app.include_router(healthcheck_router)

app.add_middleware(
    CORSMiddleware,  # type: ignore
    settings.all_cors_origins,
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
