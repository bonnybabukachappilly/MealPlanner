from enum import Enum
from dataclasses import dataclass
from datetime import date
from typing import Optional
from uuid import UUID

from .ingredient import Ingredient


class PantryTrackType(str, Enum):
    QUANTITY = "quantity"
    EXPIRY = "expiry"
    UNTRACK = "untrack"


@dataclass
class Pantry:
    id: UUID
    ingredient: Ingredient
    quantity: Optional[float]
    unit: Optional[str]
    quantity_threshold: Optional[float]
    expiry_date: Optional[date]
    expiry_date_threshold: Optional[int]
    track_type: PantryTrackType
    low_flag: bool
