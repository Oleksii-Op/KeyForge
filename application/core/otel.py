from fastapi import FastAPI
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import (
    OTLPSpanExporter as OTLPSpanExporterGRPC,
)
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.sdk.trace.sampling import TraceIdRatioBased
from opentelemetry import trace
from core.config import settings

resource = Resource(
    attributes={
        "service.name": settings.optl.service_name,
        "replica_id": settings.optl.replica_id,
        "cluster": "A",
        "datacenter": "europe-east1",
    }
)


def set_opentelemetry_exporter(application: FastAPI):
    sampler = TraceIdRatioBased(1 / settings.optl.sampling_rate)
    tracer = TracerProvider(resource=resource, sampler=sampler)
    trace.set_tracer_provider(tracer)

    tracer.add_span_processor(
        BatchSpanProcessor(
            OTLPSpanExporterGRPC(
                endpoint=settings.optl.collector,
                insecure=True,
            ),
        )
    )

    FastAPIInstrumentor().instrument_app(
        application,
        tracer_provider=tracer,
        # Do not remove as it generates a lot of spans
        excluded_urls="/api/file-sum /docs /redoc /utils/health-check",
    )
