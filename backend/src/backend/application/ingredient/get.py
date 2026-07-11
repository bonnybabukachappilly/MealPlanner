
from typing import Optional
from uuid import UUID

from backend.domain import Ingredient, IngredientRepo


class GetIngredient:
    def __init__(self, repo: IngredientRepo) -> None:
        self._repo: IngredientRepo = repo

    async def execute(self, idx: UUID) -> Optional[Ingredient]:
        return await self._repo.get_by_id(idx)


class GetIngredients:
    def __init__(self, repo: IngredientRepo) -> None:
        self._repo: IngredientRepo = repo

    async def execute(self) -> list[Ingredient | None]:
        return await self._repo.get_all()
