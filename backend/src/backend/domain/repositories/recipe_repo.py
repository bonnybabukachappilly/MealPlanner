from abc import ABC, abstractmethod
from typing import Optional
from uuid import UUID

from backend.domain import Recipe, RecipeIngredient
from backend.db.models import RecipeModel, RecipeIngredientModel


class RecipeIngredientRepo(ABC):
    @abstractmethod
    async def get_by_id(self, idx: UUID) -> Optional[RecipeIngredient]:
        ...

    @abstractmethod
    async def get_all(self) -> list[RecipeIngredient | None]:
        ...

    @abstractmethod
    async def create(self, data: RecipeIngredient) -> None:
        ...

    @abstractmethod
    async def update(self, data: RecipeIngredient) -> None:
        ...

    @abstractmethod
    async def delete(self, idx: UUID) -> None:
        ...

    @staticmethod
    @abstractmethod
    def _to_entity(model: RecipeIngredientModel) -> RecipeIngredient:
        ...

    @staticmethod
    @abstractmethod
    def _to_model(entity: RecipeIngredient) -> RecipeIngredientModel:
        ...


class RecipeRepo(ABC):
    @abstractmethod
    async def get_by_id(self, idx: UUID) -> Optional[Recipe]:
        ...

    @abstractmethod
    async def get_all(self) -> list[Recipe | None]:
        ...

    @abstractmethod
    async def create(self, data: Recipe) -> None:
        ...

    @abstractmethod
    async def update(self, data: Recipe) -> None:
        ...

    @abstractmethod
    async def delete(self, idx: UUID) -> None:
        ...

    @staticmethod
    @abstractmethod
    def _to_entity(model: RecipeModel) -> Recipe:
        ...

    @staticmethod
    @abstractmethod
    def _to_model(entity: Recipe) -> RecipeModel:
        ...
