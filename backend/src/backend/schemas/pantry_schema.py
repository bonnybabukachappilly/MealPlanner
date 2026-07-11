from datetime import date
from typing import Any, Optional, Self
from uuid import UUID

from pydantic import BaseModel, Field, model_validator

from backend.domain import PantryTrackType, Ingredient


class PantryResponse(BaseModel):
    id: UUID
    ingredient: Ingredient
    quantity: Optional[float]
    unit: Optional[str]
    quantity_threshold: Optional[float]
    expiry_date: Optional[date]
    expiry_date_threshold: Optional[int]
    track_type: PantryTrackType
    low_flag: bool


class CreatePantryRequest(BaseModel):
    ingredient_id: UUID
    quantity: Optional[float] = Field(default=None)
    unit: Optional[str] = Field(default=None)
    quantity_threshold: Optional[float] = Field(default=None)
    expiry_date: Optional[date] = Field(default=None)
    expiry_date_threshold: Optional[int] = Field(default=None)
    track_type: PantryTrackType
    low_flag: Optional[bool] = Field(default=False)

    @model_validator(mode='after')
    def validate_by_track_type(self) -> Self:
        if (self.track_type == PantryTrackType.QUANTITY and
                not all([self.quantity, self.unit, self.quantity_threshold])):

            raise ValueError(
                "For QUANTITY tracking, 'quantity', 'unit', and "
                "'quantity_threshold' are required.")

        if (self.track_type == PantryTrackType.EXPIRY and
                not all([self.expiry_date, self.expiry_date_threshold])):
            raise ValueError("For EXPIRY tracking, 'expiry_date' is required.")

        if (self.track_type in [
                PantryTrackType.EXPIRY,
                PantryTrackType.QUANTITY] and self.low_flag is True):
            raise ValueError(
                "For EXPIRY/QUANTITY tracking, 'low_flag' is calculated.")

        return self


class UpdatePantryRequest(CreatePantryRequest):
    ingredient_id: Any = Field(default=None, exclude=True)
