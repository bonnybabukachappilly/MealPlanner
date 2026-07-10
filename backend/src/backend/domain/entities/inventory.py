from enum import Enum
from dataclasses import dataclass
from datetime import date
from typing import Optional
from uuid import UUID


class InventoryTrackType(str, Enum):
    QUANTITY = "quantity"
    EXPIRY = "expiry"
    UNTRACK = "untrack"


@dataclass
class Inventory:
    id: UUID
    item_name: str
    quantity: Optional[float]
    unit: Optional[str]
    low_stock_threshold: Optional[float]
    expiry_date: Optional[date]
    expiry_date_threshold: Optional[int]
    track_type: InventoryTrackType
    low_flag: bool
