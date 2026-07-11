
from typing import Optional
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from backend.domain import Ingredient, IngredientRepo
from backend.schemas import UpdateIngredientRequest
from backend.exceptions.general import ItemNotFound


class UpdateIngredient:
    def __init__(self, repo: IngredientRepo, session: AsyncSession) -> None:
        self._repo: IngredientRepo = repo
        self._session: AsyncSession = session

    async def execute(
            self, idx: UUID,
            schema: UpdateIngredientRequest) -> Ingredient:
        model: Optional[Ingredient] = await self._repo.get_by_id(idx)

        if model is None:
            raise ItemNotFound(
                f'Unable to find ingredient with id: {idx}')

        model.name = schema.name or model.name
        model.aisle = schema.aisle or model.aisle

        try:
            await self._repo.update(model)
            await self._session.flush()

        except ItemNotFound as e:
            await self._session.rollback()
            raise ItemNotFound from e

        return model
