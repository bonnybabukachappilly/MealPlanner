from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class IngredientResponse(BaseModel):
    id: UUID
    name: str
    unit: str
    aisle: str
    in_pantry: bool


class CreateIngredientRequest(BaseModel):
    name: str
    unit: str
    aisle: str


class UpdateIngredientRequest(BaseModel):
    name: Optional[str] = Field(default=None)
    unit: Optional[str] = Field(default=None)
    aisle: Optional[str] = Field(default=None)


class UpdatePantryIngredientRequest(BaseModel):
    in_pantry: bool
