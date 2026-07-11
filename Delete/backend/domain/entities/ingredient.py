from dataclasses import dataclass
from typing import Optional
from uuid import UUID


@dataclass
class Ingredient:
    id: UUID
    name: str
    default_unit: Optional[str]
    default_aisle: Optional[str]
