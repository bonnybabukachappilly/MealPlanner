from typing import ClassVar, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class IngredientResponse(BaseModel):
    id: UUID
    name: str
    default_unit: Optional[str]

    model_config: ClassVar[ConfigDict] = {'from_attributes': True}
