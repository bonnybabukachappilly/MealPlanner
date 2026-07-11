from abc import ABC, abstractmethod
from typing import Optional
from uuid import UUID


from backend.db.models import PantryModel
from backend.domain import Pantry


class PantryRepo(ABC):

    @abstractmethod
    async def get_by_id(self, idx: UUID) -> Optional[Pantry]:
        ...

    @abstractmethod
    async def get_by_ingredient_id(
            self, ingredient_id: UUID) -> Optional[Pantry]:
        ...

    @abstractmethod
    async def get_by_ingredient_name(self, name: str) -> Optional[Pantry]:
        ...

    @abstractmethod
    async def get_all(self) -> list[Pantry | None]:
        ...

    @abstractmethod
    async def create(self, data: Pantry) -> None:
        ...

    @abstractmethod
    async def update(self, data: Pantry) -> None:
        ...

    @abstractmethod
    async def delete(self, idx: UUID) -> None:
        ...

    @staticmethod
    @abstractmethod
    def _to_entity(model: PantryModel) -> Pantry:
        ...

    @staticmethod
    @abstractmethod
    def _to_model(entity: Pantry) -> PantryModel:
        ...
