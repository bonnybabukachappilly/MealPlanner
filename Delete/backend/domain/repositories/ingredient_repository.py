# backend/domain/repositories/ingredient_repository.py

from abc import ABC, abstractmethod
from typing import Optional
from uuid import UUID


from backend.domain.entities.ingredient import Ingredient


class IngredientRepo(ABC):

    @abstractmethod
    async def get_by_id(self, idx: UUID) -> Optional[Ingredient]:
        ...

    @abstractmethod
    async def get_by_name(self, name: str) -> Optional[Ingredient]:
        ...

    @abstractmethod
    async def get_all(self) -> list[Ingredient | None]:
        ...

    @abstractmethod
    async def add(self, data: Ingredient) -> None:
        ...

    @abstractmethod
    async def update(self, data: Ingredient) -> None:
        ...

    @abstractmethod
    async def delete(self, idx: UUID) -> None:
        ...
