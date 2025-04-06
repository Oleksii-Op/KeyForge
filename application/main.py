import logging

from fastapi import FastAPI
import uvicorn
from fastapi.responses import ORJSONResponse

from api import router as api_router
from core.config import settings
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator

from utils import setting_otlp
from utils.healthcheck import router as healthcheck_router
from exc_handler import exception_handler
import orjson


class EndpointFilter(logging.Filter):
    # Uvicorn endpoint access log filter
    def filter(self, record: logging.LogRecord) -> bool:
        excluded_paths = ["GET /metrics", "GET /utils/health-check"]
        return not any(path in record.getMessage() for path in excluded_paths)


# Filter out /endpoint
logging.getLogger("uvicorn.access").addFilter(EndpointFilter())

app = FastAPI(
    title=settings.project_name,
    default_response_class=ORJSONResponse,
)

# Setting OpenTelemetry exporter
setting_otlp(
    app=app,
    app_name=settings.optl.service_name,
    endpoint=settings.optl.collector,
)

Instrumentator().instrument(app=app).expose(app=app)

app.include_router(api_router)
app.include_router(healthcheck_router)

app.add_middleware(
    CORSMiddleware,  # type: ignore
    settings.all_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

exception_handler(app=app)


if __name__ == "__main__":
    log_config = uvicorn.config.LOGGING_CONFIG
    log_config["formatters"]["access"]["fmt"] = (
        "%(asctime)s %(levelname)s [%(name)s] [%(filename)s:%(lineno)d] "
        "[trace_id=%(otelTraceID)s span_id=%(otelSpanID)s resource.service.name=%(otelServiceName)s] "
        "- trace_sampled=%(otelTraceSampled)s - %(message)s"
    )
    uvicorn.run(
        "main:app",
        host=settings.runtime.host,
        port=settings.runtime.port,
        reload=settings.runtime.reload,
        workers=settings.workers.workers,
        log_config=log_config,
        proxy_headers=True,
        forwarded_allow_ips="*",
        server_header=False,
    )
