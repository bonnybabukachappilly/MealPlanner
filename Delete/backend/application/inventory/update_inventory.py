from datetime import date, timedelta
from typing import Optional, cast
from uuid import UUID

from backend.schemas import CreateInventoryRequest
from sqlalchemy.ext.asyncio import AsyncSession

from backend.domain import Inventory, InventoryTrackType
from backend.domain.repositories import InventoryRepo
from backend.exceptions.general import ItemNotFound


class UpdateInventory:
    def __init__(self, repo: InventoryRepo, session: AsyncSession) -> None:
        self._repo: InventoryRepo = repo
        self._session: AsyncSession = session

    async def execute(
            self, idx: UUID,
            schema: CreateInventoryRequest) -> Optional[Inventory]:
        _model: Optional[Inventory] = await self._repo.get_by_id(idx)

        if _model is None:
            raise ItemNotFound(
                f'Unable to find Inventory with id {idx}'
            )

        _low_flag: bool = False

        match schema.track_type:
            case InventoryTrackType.QUANTITY:
                qty: float = cast(float, schema.quantity)
                qty_th: float = cast(float, schema.low_stock_threshold)

                if qty <= qty_th:
                    _low_flag = True

            case InventoryTrackType.EXPIRY:
                exp_date: date = cast(date, schema.expiry_date)
                exp_date_th: int = cast(int, schema.expiry_date_threshold)

                today: date = date.today()
                delta: timedelta = exp_date - today

                if 0 <= delta.days <= exp_date_th:
                    _low_flag = True

            case InventoryTrackType.UNTRACK:
                if schema.low_flag:
                    _low_flag = schema.low_flag

        _model.quantity = schema.quantity
        _model.unit = schema.unit
        _model.low_stock_threshold = schema.low_stock_threshold
        _model.expiry_date = schema.expiry_date
        _model.expiry_date_threshold = schema.expiry_date_threshold
        _model.track_type = schema.track_type
        _model.low_flag = _low_flag

        try:
            await self._repo.update(_model)
            await self._session.flush()

        except ItemNotFound as e:
            await self._session.rollback()
            raise ItemNotFound from e

        return await self._repo.get_by_id(idx)
