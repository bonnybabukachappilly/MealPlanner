from datetime import date, timedelta
from typing import Optional, cast
from uuid import uuid4

from backend.exceptions.general import DuplicateEntryException
from backend.domain import InventoryTrackType, Inventory
from backend.domain.repositories import InventoryRepo
from backend.schemas import CreateInventoryRequest

from sqlalchemy.ext.asyncio import AsyncSession


class CreateInventory:
    def __init__(self, repo: InventoryRepo, session: AsyncSession) -> None:
        self._repo: InventoryRepo = repo
        self._session: AsyncSession = session

    async def execute(self, schema: CreateInventoryRequest) -> Inventory:

        existing: Optional[Inventory] = await self._repo.get_by_name(
            schema.item_name)

        if existing:
            raise DuplicateEntryException(
                f'An item with name \'{schema.item_name}\' exists')

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

        data = Inventory(
            id=uuid4(),
            item_name=schema.item_name,
            quantity=schema.quantity,
            unit=schema.unit,
            low_stock_threshold=schema.low_stock_threshold,
            expiry_date=schema.expiry_date,
            expiry_date_threshold=schema.expiry_date_threshold,
            track_type=schema.track_type,
            low_flag=_low_flag
        )

        await self._repo.add(data)
        await self._session.flush()

        return data
