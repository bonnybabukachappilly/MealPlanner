from typing import Annotated, AsyncGenerator

from fastapi import Depends

from sqlalchemy.ext.asyncio import AsyncSession

from backend.db import get_db_session
from backend.infrastructure import SQLInventoryRepo


# ---------- Session dependency ----------


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async for session in get_db_session():
        yield session


SessionDeps = Annotated[AsyncSession, Depends(get_session)]


# ---------- Repository dependencies ----------

def get_inventory_repo(session: SessionDeps) -> SQLInventoryRepo:
    return SQLInventoryRepo(session)


InventoryDeps = Annotated[SQLInventoryRepo, Depends(get_inventory_repo)]
