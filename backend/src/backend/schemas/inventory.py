from datetime import date

from pydantic import BaseModel, ConfigDict

from backend.models.inventory import TrackType


class InventoryItemBase(BaseModel):
    ingredient_name: str
    quantity: int = 0
    unit: str = ""
    low_stock_threshold: int = 0
    expiry_date: date | None = None
    track_type: TrackType
    low_flag: bool = False


class InventoryItemCreate(InventoryItemBase):
    pass


class InventoryItemUpdate(BaseModel):
    ingredient_name: str | None = None
    quantity: int | None = None
    unit: str | None = None
    low_stock_threshold: int | None = None
    expiry_date: date | None = None
    low_flag: bool | None = None


class InventoryItemRead(InventoryItemBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
