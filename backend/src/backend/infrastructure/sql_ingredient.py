from typing import Optional, Sequence
from uuid import UUID

from sqlalchemy import Result, select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from backend.domain import Ingredient
from backend.db.models import IngredientModel
from backend.domain.repositories import IngredientRepo
from backend.exceptions.general import ItemNotFound


class SQLIngredientRepo(IngredientRepo):
    def __init__(self, session: AsyncSession) -> None:
        self._session: AsyncSession = session

    async def get_by_id(self, idx: UUID) -> Optional[Ingredient]:
        result: Result[tuple[IngredientModel]] = await self._session.execute(
            select(IngredientModel)
            .where(IngredientModel.id == idx)
        )

        model: Optional[IngredientModel] = result.scalar_one_or_none()

        return self._to_entity(model) if model else None

    async def get_by_name(self, name: str) -> Optional[Ingredient]:
        result: Result[tuple[IngredientModel]] = await self._session.execute(
            select(IngredientModel)
            .where(IngredientModel.name == name)
        )

        model: Optional[IngredientModel] = result.scalar_one_or_none()

        return self._to_entity(model) if model else None

    async def get_all(self) -> list[Ingredient | None]:
        result: Result[tuple[IngredientModel]] = await self._session.execute(
            select(IngredientModel)
        )

        models: Sequence[IngredientModel] = result.scalars().all()

        return [self._to_entity(model) for model in models]

    async def get_all_not_in_pantry(self) -> list[Ingredient | None]:
        result: Result[tuple[IngredientModel]] = await self._session.execute(
            select(IngredientModel)
            .where(~IngredientModel.in_pantry)
        )

        models: Sequence[IngredientModel] = result.scalars().all()

        return [self._to_entity(model) for model in models]

    async def create(self, data: Ingredient) -> None:
        model: IngredientModel = self._to_model(data)
        self._session.add(model)

    async def update(self, data: Ingredient) -> None:
        result: Result[tuple[IngredientModel]] = await self._session.execute(
            select(IngredientModel)
            .where(IngredientModel.id == data.id)
        )

        model: Optional[IngredientModel] = result.scalar_one_or_none()

        if model is None:
            raise ItemNotFound(f'Ingredient with id: {data.id} not found')

        model.name = data.name
        model.aisle = data.aisle

    async def delete(self, idx: UUID) -> None:
        await self._session.execute(
            delete(IngredientModel)
            .where(IngredientModel.id == idx)
        )

    @staticmethod
    def _to_entity(model: IngredientModel) -> Ingredient:
        return Ingredient(
            id=model.id,
            name=model.name,
            unit=model.unit,
            aisle=model.aisle,
            in_pantry=model.in_pantry
        )

    @staticmethod
    def _to_model(entity: Ingredient) -> IngredientModel:
        return IngredientModel(
            id=entity.id,
            name=entity.name,
            unit=entity.unit,
            aisle=entity.aisle,
            in_pantry=entity.in_pantry
        )
