from typing import Optional
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from backend.domain import Inventory
from backend.domain.repositories import InventoryRepo
from backend.exceptions.general import ItemNotFoundException


class DeleteInventory:
    def __init__(self, repo: InventoryRepo, session: AsyncSession) -> None:
        self._repo: InventoryRepo = repo
        self._session: AsyncSession = session

    async def execute(self, idx: UUID) -> None:
        _exists: Optional[Inventory] = await self._repo.get_by_id(idx)

        if _exists is None:
            raise ItemNotFoundException(
                f'Unable to find Inventory with id {idx}'
            )

        await self._repo.delete(idx)
        await self._session.flush()
