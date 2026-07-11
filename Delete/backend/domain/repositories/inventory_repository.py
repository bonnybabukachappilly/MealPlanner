# backend/domain/repositories/inventory_repository.py

from abc import ABC, abstractmethod
from typing import Optional
from uuid import UUID


from backend.domain import Inventory


class InventoryRepo(ABC):

    @abstractmethod
    async def get_by_id(self, idx: UUID) -> Optional[Inventory]:
        ...

    @abstractmethod
    async def get_by_ingredient_id(
            self, ingredient_id: UUID) -> Optional[Inventory]:
        ...

    @abstractmethod
    async def get_by_name(self, name: str) -> Optional[Inventory]:
        ...

    @abstractmethod
    async def get_all(self) -> list[Inventory | None]:
        ...

    @abstractmethod
    async def add(self, data: Inventory) -> None:
        ...

    @abstractmethod
    async def update(self, data: Inventory) -> None:
        ...

    @abstractmethod
    async def delete(self, idx: UUID) -> None:
        ...
