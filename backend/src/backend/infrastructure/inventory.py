# backend/domain/repositories/inventory_repository.py

from typing import Optional, Tuple
from uuid import UUID

from backend.exceptions.general import ItemNotFoundException
from sqlalchemy import Result, select, func, delete
from sqlalchemy.ext.asyncio import AsyncSession

from backend.db.models import InventoryModel
from backend.domain import Inventory
from backend.domain.repositories import InventoryRepo


class SQLInventoryRepo(InventoryRepo):
    def __init__(self, session: AsyncSession) -> None:
        self._session: AsyncSession = session

    async def get_by_id(self, idx: UUID) -> Optional[Inventory]:
        _result: Result[tuple[InventoryModel]] = await self._session.execute(
            select(InventoryModel).where(InventoryModel.id == idx)
        )

        model: Optional[InventoryModel] = _result.scalar_one_or_none()

        return self._to_entity(model) if model else None

    async def get_by_name(self, name: str) -> Optional[Inventory]:
        _result: Result[tuple[InventoryModel]] = await self._session.execute(
            select(InventoryModel)
            .where(func.lower(InventoryModel.item_name) == name.lower())
        )

        model: Optional[InventoryModel] = _result.scalar_one_or_none()

        return self._to_entity(model) if model else None

    async def get_all(self) -> list[Inventory | None]:
        _result: Result[tuple[InventoryModel]] = await self._session.execute(
            select(InventoryModel)
        )

        return [self._to_entity(m) for m in _result.scalars().all()]

    async def add(self, data: Inventory) -> None:
        model: InventoryModel = self._from_entity(data)
        self._session.add(model)

    async def update(self, data: Inventory) -> None:
        _result: Result[tuple[InventoryModel]] = await self._session.execute(
            select(InventoryModel).where(InventoryModel.id == data.id)
        )

        model: Optional[InventoryModel] = _result.scalar_one_or_none()

        if model is None:
            raise ItemNotFoundException(f"Inventory {data.id} not found")

        model.item_name = data.item_name
        model.quantity = data.quantity
        model.unit = data.unit
        model.low_stock_threshold = data.low_stock_threshold
        model.expiry_date = data.expiry_date
        model.expiry_date_threshold = data.expiry_date_threshold
        model.track_type = data.track_type
        model.low_flag = data.low_flag

    async def delete(self, idx: UUID) -> None:
        await self._session.execute(
            delete(InventoryModel).where(InventoryModel.id == idx)
        )

    @staticmethod
    def _to_entity(model: InventoryModel) -> Inventory:
        return Inventory(
            id=model.id,
            item_name=model.item_name,
            quantity=model.quantity,
            unit=model.unit,
            low_stock_threshold=model.low_stock_threshold,
            expiry_date=model.expiry_date,
            expiry_date_threshold=model.expiry_date_threshold,
            track_type=model.track_type,
            low_flag=model.low_flag,
        )

    @staticmethod
    def _from_entity(entity: Inventory) -> InventoryModel:
        return InventoryModel(
            id=entity.id,
            item_name=entity.item_name,
            quantity=entity.quantity,
            unit=entity.unit,
            low_stock_threshold=entity.low_stock_threshold,
            expiry_date=entity.expiry_date,
            expiry_date_threshold=entity.expiry_date_threshold,
            track_type=entity.track_type,
            low_flag=entity.low_flag,
        )
