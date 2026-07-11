from typing import Optional
from uuid import UUID

from backend.domain import Inventory
from backend.domain.repositories import InventoryRepo


class GetInventories:
    def __init__(self, repo: InventoryRepo) -> None:
        self._repo: InventoryRepo = repo

    async def execute(self) -> list[Inventory | None]:
        return await self._repo.get_all()


class GetInventory:
    def __init__(self, repo: InventoryRepo) -> None:
        self._repo: InventoryRepo = repo

    async def execute(self, idx: UUID) -> Optional[Inventory]:
        return await self._repo.get_by_id(idx)
