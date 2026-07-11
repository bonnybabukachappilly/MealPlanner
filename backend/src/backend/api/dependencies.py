from typing import Annotated, AsyncGenerator

from fastapi import Depends

from sqlalchemy.ext.asyncio import AsyncSession

from backend.db import get_db_session
from backend.infrastructure import (
    SQLIngredientRepo, SQLPantryRepo
)


# ---------- Session dependency ----------


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async for session in get_db_session():
        yield session


SessionDeps = Annotated[AsyncSession, Depends(get_session)]


# ---------- Repository dependencies ----------

def get_ingredient_repo(session: SessionDeps) -> SQLIngredientRepo:
    return SQLIngredientRepo(session)


IngredientDeps = Annotated[SQLIngredientRepo, Depends(get_ingredient_repo)]


def get_pantry_repo(session: SessionDeps) -> SQLPantryRepo:
    return SQLPantryRepo(session)


PantryDeps = Annotated[SQLPantryRepo, Depends(get_pantry_repo)]
