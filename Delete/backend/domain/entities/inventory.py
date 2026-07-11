from enum import Enum
from dataclasses import dataclass
from datetime import date
from typing import Optional
from uuid import UUID

from .ingredient import Ingredient


class InventoryTrackType(str, Enum):
    QUANTITY = "quantity"
    EXPIRY = "expiry"
    UNTRACK = "untrack"


@dataclass
class Inventory:
    id: UUID
    ingredient: Ingredient
    quantity: Optional[float]
    unit: Optional[str]
    low_stock_threshold: Optional[float]
    expiry_date: Optional[date]
    expiry_date_threshold: Optional[int]
    track_type: InventoryTrackType
    low_flag: bool
