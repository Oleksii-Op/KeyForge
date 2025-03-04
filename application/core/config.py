from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import BaseModel


class RunTime(BaseModel):
    host: str = "0.0.0.0"
    port: int = 8000
    workers: int = 4
    reload: bool = False


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env.template", ".env"),
        case_sensitive=False,
        env_prefix="APP_CONFIG__",
        env_nested_delimiter="__",
        env_file_encoding="utf-8",
    )
    runtime: RunTime = RunTime()
    project_name: str


settings = Settings()  # type: ignore
