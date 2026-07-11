from typing import Optional
from uuid import UUID

from backend.domain.entities.inventory import Inventory
from fastapi import APIRouter, status, HTTPException

from backend.schemas import (
    InventoryResponse, CreateInventoryRequest, inventory
)
from backend.api.dependencies import InventoryDeps, SessionDeps
from backend.application.inventory import (
    CreateInventory, GetInventories, GetInventory,
    DeleteInventory, UpdateInventory
)
from backend.exceptions.general import (
    DuplicateEntryFound, ItemNotFound
)

router = APIRouter(prefix='/pantry', tags=['Pantry'])


@router.get(
    '', response_model=list[InventoryResponse],
    status_code=status.HTTP_200_OK)
async def get_all(inventory_repo: InventoryDeps) -> list[InventoryResponse]:
    use_case = GetInventories(inventory_repo)

    data: list[Inventory | None] = await use_case.execute()

    return [
        InventoryResponse.model_validate(
            d, from_attributes=True) for d in (data or [])
    ]


@router.get(
    '/{idx}', response_model=Optional[InventoryResponse],
    status_code=status.HTTP_200_OK)
async def get_one(
        idx: UUID,
        inventory_repo: InventoryDeps) -> Optional[InventoryResponse]:
    use_case = GetInventory(inventory_repo)

    data: Optional[Inventory] = await use_case.execute(idx)

    if data is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f'Unable to find the inventory with id {idx}'
        )

    return InventoryResponse.model_validate(data, from_attributes=True)


@router.post(
    '', status_code=status.HTTP_201_CREATED,
    response_model=InventoryResponse)
async def create(
        body: CreateInventoryRequest,
        session: SessionDeps,
        inventory_repo: InventoryDeps) -> InventoryResponse:

    use_case = CreateInventory(inventory_repo, session)

    try:
        data: Inventory = await use_case.execute(body)

        await session.commit()

    except DuplicateEntryFound as e:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e)
        ) from e

    return InventoryResponse.model_validate(data, from_attributes=True)


@router.put(
    '/{idx}', status_code=status.HTTP_202_ACCEPTED,
    response_model=InventoryResponse)
async def update(
        idx: UUID,
        body: CreateInventoryRequest,
        session: SessionDeps,
        inventory_repo: InventoryDeps) -> InventoryResponse:

    use_case = UpdateInventory(inventory_repo, session)

    try:
        data: Optional[Inventory] = await use_case.execute(idx, body)
        await session.commit()

    except DuplicateEntryFound as e:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e)
        ) from e

    return InventoryResponse.model_validate(data, from_attributes=True)


@router.delete('/{idx}', status_code=status.HTTP_204_NO_CONTENT)
async def delete(
        idx: UUID, session: SessionDeps,
        inventory_repo: InventoryDeps) -> None:

    use_case = DeleteInventory(inventory_repo, session)

    try:
        await use_case.execute(idx)
        await session.commit(

        )

    except ItemNotFound as e:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        ) from e
