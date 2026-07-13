from dataclasses import dataclass
from datetime import datetime
from typing import Optional
from uuid import UUID

from backend.db import Base
from backend.db.models import IngredientModel


@dataclass
class RecipeIngredient:
    id: UUID
    recipe: 'Recipe'
    ingredient_id: UUID
    ingredient: IngredientModel
    quantity: float
    unit: str


@dataclass
class Recipe(Base):
    id: UUID
    name: str
    category: str
    servings: int
    prep_time: str
    instructions: str
    tags: list[str]
    rating: Optional[int]
    photo: Optional[str]
    source_urls: list[str]
    created_at: datetime
    ingredients: list["RecipeIngredient"]
