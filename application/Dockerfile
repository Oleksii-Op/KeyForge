ARG PYTHON_VERSION=3.12.7

FROM python:${PYTHON_VERSION}-slim

LABEL name="KeyForge" \
      version="0.1.1" \
      description="FastAPI Backend Image Modern Cryptographic Toolkit"

ENV POETRY_VERSION=1.8.3

ENV POETRY_CACHE_DIR=/app/.cache

RUN apt-get update -y \
    && apt install wget -y \
    && pip install poetry==${POETRY_VERSION}

WORKDIR /app/

# Copy everything to /app/ in the container
COPY . .

RUN poetry config virtualenvs.in-project true \
    && poetry install --only main \
    && useradd --shell /bin/bash backend \
    && chown -R backend:backend /app

USER backend

EXPOSE 8000

ENTRYPOINT ["poetry", "run"]

CMD ["python", "main.py"]