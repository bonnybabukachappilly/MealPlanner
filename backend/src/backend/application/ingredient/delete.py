
from typing import Optional
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from backend.domain import Ingredient, IngredientRepo
from backend.exceptions.general import ItemNotFound


class DeleteIngredient:
    def __init__(self, repo: IngredientRepo, session: AsyncSession) -> None:
        self._repo: IngredientRepo = repo
        self._session: AsyncSession = session

    async def execute(self, idx: UUID) -> None:
        model: Optional[Ingredient] = await self._repo.get_by_id(idx)

        if model is None:
            raise ItemNotFound(
                f'Unable to find ingredient with id: {idx}')

        await self._repo.delete(idx)
        await self._session.flush()
