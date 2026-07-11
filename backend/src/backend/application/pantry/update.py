from datetime import date, timedelta
from typing import Optional, cast
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from backend.domain import Pantry, PantryTrackType
from backend.domain.repositories import PantryRepo
from backend.schemas import UpdatePantryRequest
from backend.exceptions.general import ItemNotFound


class UpdatePantry:
    def __init__(self, repo: PantryRepo, session: AsyncSession) -> None:
        self._repo: PantryRepo = repo
        self._session: AsyncSession = session

    async def execute(
            self, idx: UUID,
            schema: UpdatePantryRequest) -> Pantry:
        model: Optional[Pantry] = await self._repo.get_by_id(idx)

        if model is None:
            raise ItemNotFound(
                f'Unable to find pantry with id: {idx}')

        _low_flag: bool = False

        match schema.track_type:
            case PantryTrackType.QUANTITY:
                qty: float = cast(float, schema.quantity)
                qty_th: float = cast(float, schema.quantity_threshold)

                if qty <= qty_th:
                    _low_flag = True

            case PantryTrackType.EXPIRY:
                exp_date: date = cast(date, schema.expiry_date)
                exp_date_th: int = cast(int, schema.expiry_date_threshold)

                today: date = date.today()
                delta: timedelta = exp_date - today

                if 0 <= delta.days <= exp_date_th:
                    _low_flag = True

            case PantryTrackType.UNTRACK:
                if schema.low_flag:
                    _low_flag = schema.low_flag

        model.quantity = schema.quantity or model.quantity
        model.unit = schema.unit or model.unit
        model.quantity_threshold = (
            schema.quantity_threshold or model.quantity_threshold)
        model.expiry_date = schema.expiry_date or model.expiry_date
        model.expiry_date_threshold = (
            schema.expiry_date_threshold or model.expiry_date_threshold)
        model.track_type = schema.track_type or model.track_type
        model.low_flag = _low_flag

        try:
            await self._repo.update(model)
            await self._session.flush()

        except ItemNotFound as e:
            await self._session.rollback()
            raise ItemNotFound from e

        return model
