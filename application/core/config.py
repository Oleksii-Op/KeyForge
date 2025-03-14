from typing import Annotated, Any

from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import (
    BaseModel,
    AnyUrl,
    BeforeValidator,
    computed_field,
)


def parse_cors(v: Any) -> list[str] | str:
    if isinstance(v, str) and not v.startswith("["):
        return [i.strip() for i in v.split(",")]
    elif isinstance(v, list | str):
        return v
    raise ValueError(v)


class RunTime(BaseModel):
    host: str = "0.0.0.0"
    port: int = 8000
    workers: int = 4
    reload: bool = False


class OPTLSettings(BaseModel):
    service_name: str
    replica_id: int
    collector_host: str
    collector_port: int
    sampling_rate: int

    @property
    def collector(self) -> str:
        return f"{self.collector_host}:{self.collector_port}"


class ApiPrefix(BaseModel):
    api: str = "/api"
    utils: str = "/utils"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env.template", ".env"),
        case_sensitive=False,
        env_prefix="APP_CONFIG__",
        env_nested_delimiter="__",
        env_file_encoding="utf-8",
    )
    runtime: RunTime = RunTime()
    prefix: ApiPrefix = ApiPrefix()
    project_name: str
    optl: OPTLSettings

    FRONTEND_HOST: str

    BACKEND_CORS_ORIGINS: Annotated[
        list[AnyUrl] | str,
        BeforeValidator(parse_cors),
    ] = []

    @computed_field  # type: ignore[prop-decorator]
    @property
    def all_cors_origins(self) -> list[str]:
        return [str(origin).rstrip("/") for origin in self.BACKEND_CORS_ORIGINS] + [
            self.FRONTEND_HOST
        ]


settings = Settings()  # type: ignore
