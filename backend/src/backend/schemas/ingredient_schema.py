from typing import Optional
from uuid import UUID

from pydantic import BaseModel

from backend.domain import Ingredient


class IngredientResponse(BaseModel):
    id: UUID
    name: str
    aisle: str


class CreateIngredientRequest(BaseModel):
    name: str
    aisle: str

    def convert(self, idx: UUID) -> Ingredient:
        return Ingredient(
            id=idx,
            name=self.name,
            aisle=self.aisle
        )


class UpdateIngredientRequest(BaseModel):
    name: Optional[str]
    aisle: Optional[str]
