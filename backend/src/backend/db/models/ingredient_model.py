from typing import Any
from uuid import UUID, uuid4

from sqlalchemy import String
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import mapped_column, Mapped

from backend.db import Base


class IngredientModel(Base):
    __tablename__: Any = 'ingredients'

    id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        default=uuid4
    )

    name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
        unique=True
    )

    aisle: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )
