from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.logging import LoggingInstrumentor
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.sdk.trace.sampling import (
    TraceIdRatioBased,
)
from starlette.types import ASGIApp


def setting_otlp(
    app: ASGIApp,
    app_name: str,
    endpoint: str,
    log_correlation: bool = True,
) -> None:
    """Configure OpenTelemetry instrumentation for a FastAPI application.

    Sets up distributed tracing with OpenTelemetry for a FastAPI application,
    configuring the trace provider, exporter, and instrumenting both the FastAPI
    app and optionally the logging system.

    Args:
        app (ASGIApp): The FastAPI application instance to instrument.
        app_name (str): Service name to identify this application in traces.
            This name will appear in the trace visualization and be used
            for filtering and grouping.
        endpoint (str): OTLP gRPC endpoint where traces will be exported,
            typically in the format "http://collector:4317" or similar.
        log_correlation (bool, optional): Whether to enable correlation between
            logs and traces by instrumenting the logging system. Defaults to True.
            When enabled, trace IDs and span IDs will be included in log records.

    Notes:
        - Sampling is configured to ALWAYS_OFF at the root, meaning only traces
          initiated by other systems will be recorded (no self-initiated traces).
        - Some common endpoints like health checks and documentation are excluded
          from tracing to reduce noise and unnecessary data.
        - This function does not return anything but modifies the global
          OpenTelemetry state and instruments the provided FastAPI application.

    Example:
        ```python
        app = FastAPI()

        setting_otlp(
            app=app,
            app_name="user-service",
            endpoint="http://otel-collector:4317",
        )
        ```

    https://opentelemetry-python-contrib.readthedocs.io/en/latest/index.html
    """
    # Setting OpenTelemetry
    # set the service name to show in traces
    resource = Resource.create(
        attributes={
            "service.name": app_name,
            "compose_service": app_name,
        }
    )

    # set the tracer provider
    tracer = TracerProvider(
        resource=resource,
        # sampler=ParentBased(
        #     root=ALWAYS_OFF,
        #     remote_parent_sampled=ALWAYS_ON,
        # ),
        sampler=TraceIdRatioBased(
            rate=1,
        ),
    )

    trace.set_tracer_provider(tracer)

    tracer.add_span_processor(
        BatchSpanProcessor(
            OTLPSpanExporter(endpoint=endpoint),
        ),
    )

    if log_correlation:
        LoggingInstrumentor().instrument(
            set_logging_format=True,
        )

    FastAPIInstrumentor.instrument_app(
        app,
        tracer_provider=tracer,
        excluded_urls="/api/file-sum,/docs,/redoc,/utils/health-check",
    )
