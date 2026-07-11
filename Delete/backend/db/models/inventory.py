from datetime import date
from typing import Any, Optional
from uuid import UUID, uuid4

from sqlalchemy import (
    String, Numeric, Date, Enum as SQLEnum, Boolean, ForeignKey
)
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import mapped_column, Mapped, relationship

from backend.db import Base
from backend.domain import InventoryTrackType
from backend.db.models import IngredientModel


class InventoryModel(Base):
    __tablename__: Any = 'inventory'

    id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        default=uuid4
    )

    ingredient_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey('ingredients.id', ondelete='RESTRICT'),
        nullable=False,
        unique=True
    )

    ingredient: Mapped["IngredientModel"] = relationship(lazy='joined')

    quantity: Mapped[Optional[float]] = mapped_column(
        Numeric(10, 2),
        nullable=True,
        default=0.0
    )

    unit: Mapped[Optional[str]] = mapped_column(
        String(10),
        nullable=True
    )

    low_stock_threshold: Mapped[Optional[float]] = mapped_column(
        Numeric(10, 2),
        nullable=True,
        default=0.0
    )

    expiry_date: Mapped[Optional[date]] = mapped_column(
        Date,
        nullable=True
    )

    expiry_date_threshold: Mapped[Optional[int]] = mapped_column(
        Numeric(10, 0),
        nullable=True,
        default=0
    )

    track_type: Mapped[InventoryTrackType] = mapped_column(
        SQLEnum(InventoryTrackType, native_enum=False),
        nullable=False
    )

    low_flag: Mapped[bool] = mapped_column(
        Boolean,
        default=False
    )
