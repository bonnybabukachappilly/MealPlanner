# backend/main.py
import uvicorn
import traceback
import logging

from contextlib import asynccontextmanager
from typing import Any, AsyncGenerator
from asyncio import sleep

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from starlette.exceptions import HTTPException as StarletteHTTPException


from backend.api.middleware import RequestIDMiddleware
from backend.api import api_router
from backend.core.logging import configure_logging
from backend.db import engine
from fastapi.responses import JSONResponse

from backend.api.exception_handlers import (
    http_exception_handler,
    unhandled_exception_handler,
    validation_exception_handler,
)

logger = logging.getLogger(__name__)

configure_logging()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, Any]:
    connected = False
    retries = 5
    while not connected and retries > 0:
        try:
            async with engine.connect() as conn:
                await conn.execute(text("SELECT 1"))
                connected = True
                break
        except Exception:
            retries -= 1
            await sleep(2)
    else:
        raise RuntimeError("Database connection failed during startup")

    yield
    await engine.dispose()


app = FastAPI(
    title="Finance Dashboard API",
    version="1.0.0",
    lifespan=lifespan,
)


# ── Middleware ────────────────────────────────────────────────────────────
app.add_middleware(RequestIDMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Exception handlers ────────────────────────────────────────────────────
app.add_exception_handler(
    StarletteHTTPException,
    http_exception_handler)  # type: ignore
app.add_exception_handler(
    RequestValidationError,
    validation_exception_handler)  # type: ignore
app.add_exception_handler(Exception, unhandled_exception_handler)

# ── Routes ────────────────────────────────────────────────────────────────


@app.get("/health", tags=["Health"])
async def health_check() -> JSONResponse:
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        db_status = "ok"
    except Exception:
        db_status = "error"

    payload: dict[str, str] = {
        "status": "ok" if db_status == "ok" else "degraded",
        "db": db_status,
        "version": "1.0.0"
    }

    return JSONResponse(content=payload,
                        status_code=200 if db_status == "ok" else 503)

app.include_router(api_router)


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000,
                reload=True, log_level=logging.INFO)
