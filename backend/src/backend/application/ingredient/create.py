
from typing import Optional
from uuid import UUID, uuid4

from sqlalchemy.ext.asyncio import AsyncSession

from backend.domain import Ingredient, IngredientRepo
from backend.schemas import CreateIngredientRequest
from backend.exceptions.general import DuplicateEntryFound, DBCreationFailed


class CreateIngredient:
    def __init__(self, repo: IngredientRepo, session: AsyncSession) -> None:
        self._repo: IngredientRepo = repo
        self._session: AsyncSession = session

    async def execute(self, schema: CreateIngredientRequest) -> Ingredient:
        exists: Optional[Ingredient] = await self._repo.get_by_name(
            schema.name)

        if exists:
            raise DuplicateEntryFound(
                f'Ingredient with {schema.name} exists')

        idx: UUID = uuid4()

        await self._repo.create(schema.convert(idx))
        await self._session.flush()

        model: Optional[Ingredient] = await self._repo.get_by_id(idx)

        if model is None:
            raise DBCreationFailed(
                f'Something went wrong while creating "{schema.name}"')

        return model
