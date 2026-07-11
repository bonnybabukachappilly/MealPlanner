from datetime import date, timedelta
from typing import Optional, cast
from uuid import UUID, uuid4

from backend.domain.entities.ingredient import Ingredient
from sqlalchemy.ext.asyncio import AsyncSession

from backend.domain import Pantry, PantryTrackType
from backend.domain.repositories import PantryRepo, IngredientRepo
from backend.schemas import CreatePantryRequest
from backend.exceptions.general import (
    DuplicateEntryFound, DBCreationFailed,
    ItemNotFound
)


class CreatePantry:
    def __init__(
            self, repo: PantryRepo, i_repo: IngredientRepo,
            session: AsyncSession) -> None:
        self._repo: PantryRepo = repo
        self._i_repo: IngredientRepo = i_repo
        self._session: AsyncSession = session

    async def execute(self, schema: CreatePantryRequest) -> Pantry:
        _ingredient: Optional[Ingredient] = await self._i_repo.get_by_id(
            schema.ingredient_id)

        if _ingredient is None:
            raise ItemNotFound(
                f'Ingredient with id: {schema.ingredient_id} not found.'
            )

        exists: Optional[Pantry] = await self._repo.get_by_ingredient_id(
            schema.ingredient_id
        )

        if exists:
            raise DuplicateEntryFound(
                f'Ingredient with id: {schema.ingredient_id} ',
                'already added to pantry.'
            )

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

        idx: UUID = uuid4()

        pantry = Pantry(
            id=idx,
            ingredient=_ingredient,
            quantity=schema.quantity,
            unit=schema.unit,
            quantity_threshold=schema.quantity_threshold,
            expiry_date=schema.expiry_date,
            expiry_date_threshold=schema.expiry_date_threshold,
            track_type=schema.track_type,
            low_flag=_low_flag
        )

        await self._repo.create(pantry)
        await self._session.flush()

        model: Optional[Pantry] = await self._repo.get_by_id(idx)

        if model is None:
            raise DBCreationFailed(
                f'Something went wrong while creating "{schema.ingredient_id}"'
            )

        return model
