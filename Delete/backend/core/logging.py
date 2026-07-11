# backend/core/logging.py
import json
import logging
import sys
from datetime import datetime, timezone
from logging.config import dictConfig
from .config import Settings, get_settings


class JsonFormatter(logging.Formatter):
    def __init__(self, environment: str) -> None:
        super().__init__()
        self.env = environment

    def format(self, record: logging.LogRecord) -> str:
        log_record = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "environment": self.env,
        }
        if record.exc_info:
            log_record["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_record)


class DevFormatter(logging.Formatter):
    """Human-readable console formatter with real newlines for tracebacks."""

    COLORS = {
        "DEBUG": "\033[36m", "INFO": "\033[32m",
        "WARNING": "\033[33m", "ERROR": "\033[31m", "CRITICAL": "\033[41m",
    }
    RESET = "\033[0m"

    def format(self, record: logging.LogRecord) -> str:
        color = self.COLORS.get(record.levelname, "")
        ts = datetime.now(timezone.utc).strftime("%H:%M:%S")
        header = f"{color}{ts} {record.levelname:<8}{self.RESET} {record.name} — {record.getMessage()}"
        if record.exc_info:
            return f"{header}\n{self.formatException(record.exc_info)}"
        return header


def configure_logging() -> None:
    settings: Settings = get_settings()
    is_dev = settings.environment == "development"

    dictConfig({
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "json": {"()": JsonFormatter, "environment": settings.environment},
            "dev": {"()": DevFormatter},
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "stream": sys.stdout,
                "formatter": "dev" if is_dev else "json",
            }
        },
        "root": {"level": settings.log_level, "handlers": ["console"]},
        "loggers": {
            "uvicorn": {"handlers": ["console"], "level": settings.log_level, "propagate": False},
            "uvicorn.error": {"handlers": ["console"], "level": settings.log_level, "propagate": False},
            "uvicorn.access": {"handlers": ["console"], "level": settings.log_level, "propagate": False},
            "backend": {"handlers": ["console"], "level": settings.log_level, "propagate": False},
            "sqlalchemy.engine.Engine": {"handlers": ["console"], "level": settings.log_level, "propagate": False},
        },
    })
