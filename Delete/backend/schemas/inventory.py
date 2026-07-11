from datetime import date
from typing import ClassVar, Optional, Self
from uuid import UUID

from pydantic import BaseModel, ConfigDict, model_validator, Field

from backend.domain import InventoryTrackType
from .ingredient import IngredientResponse


class InventoryResponse(BaseModel):
    id: UUID
    ingredient: IngredientResponse
    quantity: Optional[float]
    unit: Optional[str]
    low_stock_threshold: Optional[float]
    expiry_date: Optional[date]
    expiry_date_threshold: Optional[int]
    track_type: InventoryTrackType
    low_flag: bool

    model_config: ClassVar[ConfigDict] = {'from_attributes': True}


class CreateInventoryRequest(BaseModel):
    ingredient_name: str
    quantity: Optional[float] = Field(default=None)
    unit: Optional[str] = Field(default=None)
    low_stock_threshold: Optional[float] = Field(default=None)
    expiry_date: Optional[date] = Field(default=None)
    expiry_date_threshold: Optional[int] = Field(default=None)
    track_type: InventoryTrackType
    low_flag: Optional[bool] = Field(default=False)

    @model_validator(mode='after')
    def validate_by_track_type(self) -> Self:
        if (self.track_type == InventoryTrackType.QUANTITY and
                not all([self.quantity, self.unit, self.low_stock_threshold])):

            raise ValueError(
                "For QUANTITY tracking, 'quantity', 'unit', and "
                "'low_stock_threshold' are required.")

        if (self.track_type == InventoryTrackType.EXPIRY and
                not all([self.expiry_date, self.expiry_date_threshold])):
            raise ValueError("For EXPIRY tracking, 'expiry_date' is required.")

        if (self.track_type in [
                InventoryTrackType.EXPIRY,
                InventoryTrackType.QUANTITY] and self.low_flag is True):
            raise ValueError(
                "For EXPIRY/QUANTITY tracking, 'low_flag' is calculated.")

        return self


class UpdateInventoryRequest(BaseModel):
    ingredient_name: str
    quantity: Optional[float] = Field(default=None)
    unit: Optional[str] = Field(default=None)
    low_stock_threshold: Optional[float] = Field(default=None)
    expiry_date: Optional[date] = Field(default=None)
    expiry_date_threshold: Optional[int] = Field(default=None)
    track_type: InventoryTrackType
    low_flag: Optional[bool] = Field(default=False)

    @model_validator(mode='after')
    def validate_by_track_type(self) -> Self:
        if (self.track_type == InventoryTrackType.QUANTITY and
                not all([self.quantity, self.unit, self.low_stock_threshold])):

            raise ValueError(
                "For QUANTITY tracking, 'quantity', 'unit', and "
                "'low_stock_threshold' are required.")

        if (self.track_type == InventoryTrackType.EXPIRY and
                not all([self.expiry_date, self.expiry_date_threshold])):
            raise ValueError("For EXPIRY tracking, 'expiry_date' is required.")

        if (self.track_type in [
                InventoryTrackType.EXPIRY,
                InventoryTrackType.QUANTITY] and self.low_flag is True):
            raise ValueError(
                "For EXPIRY/QUANTITY tracking, 'low_flag' is calculated.")

        return self
