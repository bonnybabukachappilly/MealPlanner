from dataclasses import dataclass
from uuid import UUID


@dataclass
class Ingredient:
    id: UUID
    name: str
    unit: str
    aisle: str
    in_pantry: bool
