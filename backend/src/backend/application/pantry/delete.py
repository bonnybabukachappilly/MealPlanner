
from typing import Optional
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from backend.domain import Pantry
from backend.domain.repositories import PantryRepo
from backend.exceptions.general import ItemNotFound


class DeletePantry:
    def __init__(self, repo: PantryRepo, session: AsyncSession) -> None:
        self._repo: PantryRepo = repo
        self._session: AsyncSession = session

    async def execute(self, idx: UUID) -> None:
        model: Optional[Pantry] = await self._repo.get_by_id(idx)

        if model is None:
            raise ItemNotFound(
                f'Unable to find pantry with id: {idx}')

        await self._repo.delete(idx)
        await self._session.flush()
