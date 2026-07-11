from dataclasses import dataclass
from datetime import datetime
from typing import Optional
from uuid import UUID


from .ingredient import Ingredient


@dataclass
class RecipeIngredient:

    id: UUID
    recipe_id: UUID
    ingredient_id: UUID
    quantity: float
    unit: str
    recipe: "Recipe"
    ingredient: Ingredient


@dataclass
class Recipe:

    id: UUID
    name: str
    category: str
    servings: int
    prep_time: str
    instructions: str
    tags: list[str]
    rating: int
    photo: Optional[str]
    source_urls: list[str]
    created_at: datetime
    ingredients: list["RecipeIngredient"]
