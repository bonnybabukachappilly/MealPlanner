from typing import Optional, Sequence
from uuid import UUID

from sqlalchemy import Result, select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from backend.db.models import PantryModel
from backend.domain import Pantry, Ingredient
from backend.domain.repositories import PantryRepo
from backend.exceptions.general import ItemNotFound


class SQLPantryRepo(PantryRepo):
    def __init__(self, session: AsyncSession) -> None:
        self._session: AsyncSession = session

    async def get_by_id(self, idx: UUID) -> Optional[Pantry]:
        result: Result[tuple[PantryModel]] = await self._session.execute(
            select(PantryModel)
            .where(PantryModel.id == idx)
        )

        model: Optional[PantryModel] = result.scalar_one_or_none()

        return self._to_entity(model) if model else None

    async def get_by_ingredient_id(
            self, ingredient_id: UUID) -> Optional[Pantry]:
        result: Result[tuple[PantryModel]] = await self._session.execute(
            select(PantryModel)
            .where(PantryModel.ingredient_id == ingredient_id)
        )

        model: Optional[PantryModel] = result.scalar_one_or_none()

        return self._to_entity(model) if model else None

    async def get_by_ingredient_name(self, name: str) -> Optional[Pantry]:
        result: Result[tuple[PantryModel]] = await self._session.execute(
            select(PantryModel)
            .where(PantryModel.ingredient.name == name)
        )

        model: Optional[PantryModel] = result.scalar_one_or_none()

        return self._to_entity(model) if model else None

    async def get_all(self) -> list[Pantry | None]:
        result: Result[tuple[PantryModel]] = await self._session.execute(
            select(PantryModel)
        )

        models: Sequence[PantryModel] = result.scalars().all()

        return [self._to_entity(model) for model in models]

    async def create(self, data: Pantry) -> None:
        model: PantryModel = self._to_model(data)
        self._session.add(model)

    async def update(self, data: Pantry) -> None:
        result: Result[tuple[PantryModel]] = await self._session.execute(
            select(PantryModel)
            .where(PantryModel.id == data.id)
        )

        model: Optional[PantryModel] = result.scalar_one_or_none()

        if model is None:
            raise ItemNotFound(f'Pantry with id: {data.id} not found')

        model.ingredient_id = data.ingredient.id
        model.quantity = data.quantity
        model.unit = data.unit
        model.quantity_threshold = data.quantity_threshold
        model.expiry_date = data.expiry_date
        model.expiry_date_threshold = data.expiry_date_threshold
        model.track_type = data.track_type
        model.low_flag = data.low_flag

    async def delete(self, idx: UUID) -> None:
        await self._session.execute(
            delete(PantryModel)
            .where(PantryModel.id == idx)
        )

    @staticmethod
    def _to_entity(model: PantryModel) -> Pantry:
        return Pantry(
            id=model.id,
            ingredient=Ingredient(
                id=model.ingredient.id,
                name=model.ingredient.name,
                aisle=model.ingredient.aisle
            ),
            quantity=model.quantity,
            unit=model.unit,
            quantity_threshold=model.quantity_threshold,
            expiry_date=model.expiry_date,
            expiry_date_threshold=model.expiry_date_threshold,
            track_type=model.track_type,
            low_flag=model.low_flag
        )

    @staticmethod
    def _to_model(entity: Pantry) -> PantryModel:
        return PantryModel(
            id=entity.id,
            ingredient_id=entity.ingredient.id,
            quantity=entity.quantity,
            unit=entity.unit,
            quantity_threshold=entity.quantity_threshold,
            expiry_date=entity.expiry_date,
            expiry_date_threshold=entity.expiry_date_threshold,
            track_type=entity.track_type,
            low_flag=entity.low_flag
        )
