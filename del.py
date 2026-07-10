from pydantic import BaseModel, model_validator, Field
from enum import Enum

from typing import Optional, Self


class InventoryTrackType(str, Enum):
    QUANTITY = "quantity"
    EXPIRY = "expiry"
    UNTRACK = "untrack"


class CreateInventoryRequest(BaseModel):
    item_name: str
    quantity: Optional[float] = Field(default=None)
    unit: Optional[str] = Field(default=None)
    low_stock_threshold: Optional[float] = Field(default=None)
    expiry_date: Optional[str] = Field(default=None)
    track_type: InventoryTrackType
    low_flag: bool = Field(default=False)

    @model_validator(mode='after')
    def validate_by_track_type(self) -> Self:
        if not all([self.quantity, self.unit, self.low_stock_threshold]):
            raise ValueError("Missing data")

        return self


CreateInventoryRequest(
    item_name="Bonny",
    # quantity=20,
    unit='5',
    low_stock_threshold=5,
    expiry_date="date",
    track_type=InventoryTrackType.QUANTITY,
    # low_flag=False
)
