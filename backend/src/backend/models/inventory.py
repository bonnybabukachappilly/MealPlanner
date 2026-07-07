from datetime import date
import enum
from typing import Any
import uuid

from sqlalchemy import String, Integer, Boolean, Date, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column

from backend.database import Base


class TrackType(str, enum.Enum):
    QUANTITY = 'quantity'
    EXPIRY = 'expiry'


class InventoryItem(Base):
    __tablename__: Any = 'inventory_items'

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid.uuid4())
    )

    ingredient_name: Mapped[str] = mapped_column(String, nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, default=0)
    unit: Mapped[str] = mapped_column(String, default='')
    low_stock_threshold: Mapped[int] = mapped_column(Integer, default=0)
    expiry_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    track_type: Mapped[TrackType] = mapped_column(
        SAEnum(TrackType, native_enum=False), nullable=False
    )
    low_flag: Mapped[bool] = mapped_column(Boolean, default=False)
