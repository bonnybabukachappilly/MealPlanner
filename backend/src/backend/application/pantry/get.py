
from typing import Optional
from uuid import UUID

from backend.domain import Pantry
from backend.domain.repositories import PantryRepo


class GetPantry:
    def __init__(self, repo: PantryRepo) -> None:
        self._repo: PantryRepo = repo

    async def execute(self, idx: UUID) -> Optional[Pantry]:
        return await self._repo.get_by_id(idx)


class GetPantries:
    def __init__(self, repo: PantryRepo) -> None:
        self._repo: PantryRepo = repo

    async def execute(self) -> list[Pantry | None]:
        return await self._repo.get_all()
