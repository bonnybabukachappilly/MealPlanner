from abc import ABC, abstractmethod
from typing import Optional
from uuid import UUID

from backend.domain import Ingredient
from backend.db.models import IngredientModel


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
    async def get_all_not_in_pantry(self) -> list[Ingredient | None]:
        ...

    @abstractmethod
    async def create(self, data: Ingredient) -> None:
        ...

    @abstractmethod
    async def update(self, data: Ingredient) -> None:
        ...

    @abstractmethod
    async def delete(self, idx: UUID) -> None:
        ...

    @staticmethod
    @abstractmethod
    def _to_entity(model: IngredientModel) -> Ingredient:
        ...

    @staticmethod
    @abstractmethod
    def _to_model(entity: Ingredient) -> IngredientModel:
        ...
