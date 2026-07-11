# backend/infrastructure/ingredient.py

from typing import Optional
from uuid import UUID

from sqlalchemy import Result, select, func, delete
from sqlalchemy.ext.asyncio import AsyncSession

from backend.exceptions.general import ItemNotFound
from backend.db.models import IngredientModel
from backend.domain.entities.ingredient import Ingredient
from backend.domain.repositories import IngredientRepo


class SQLIngredientRepo(IngredientRepo):
    def __init__(self, session: AsyncSession) -> None:
        self._session: AsyncSession = session

    async def get_by_id(self, idx: UUID) -> Optional[Ingredient]:
        _result: Result[tuple[IngredientModel]] = await self._session.execute(
            select(IngredientModel).where(IngredientModel.id == idx)
        )

        model: Optional[IngredientModel] = _result.scalar_one_or_none()

        return self._to_entity(model) if model else None

    async def get_by_name(self, name: str) -> Optional[Ingredient]:
        _result: Result[tuple[IngredientModel]] = await self._session.execute(
            select(IngredientModel)
            .where(func.lower(IngredientModel.name) == name.lower())
        )

        model: Optional[IngredientModel] = _result.scalar_one_or_none()

        return self._to_entity(model) if model else None

    async def get_all(self) -> list[Ingredient | None]:
        _result: Result[tuple[IngredientModel]] = await self._session.execute(
            select(IngredientModel)
        )

        return [self._to_entity(m) for m in _result.scalars().all()]

    async def add(self, data: Ingredient) -> None:
        model: IngredientModel = self._from_entity(data)
        self._session.add(model)

    async def update(self, data: Ingredient) -> None:
        _result: Result[tuple[IngredientModel]] = await self._session.execute(
            select(IngredientModel).where(IngredientModel.id == data.id)
        )

        model: Optional[IngredientModel] = _result.scalar_one_or_none()

        if model is None:
            raise ItemNotFound(f"Ingredient {data.id} not found")

        model.name = data.name
        model.default_unit = data.default_unit

    async def delete(self, idx: UUID) -> None:
        await self._session.execute(
            delete(IngredientModel).where(IngredientModel.id == idx)
        )

    @staticmethod
    def _to_entity(model: IngredientModel) -> Ingredient:
        return Ingredient(
            id=model.id,
            name=model.name,
            default_unit=model.default_unit,
            default_aisle=model.default_aisle
        )

    @staticmethod
    def _from_entity(entity: Ingredient) -> IngredientModel:
        return IngredientModel(
            id=entity.id,
            name=entity.name,
            default_unit=entity.default_unit,
        )
