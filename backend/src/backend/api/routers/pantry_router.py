from typing import Optional
from uuid import UUID


from backend.domain import Pantry
from fastapi import APIRouter, HTTPException, status

from backend.application.pantry import (
    GetPantry, GetPantries,
    CreatePantry, UpdatePantry,
    DeletePantry
)
from backend.api.dependencies import PantryDeps, SessionDeps, IngredientDeps
from backend.exceptions.general import (
    DuplicateEntryFound, DBCreationFailed,
    ItemNotFound
)
from backend.schemas import (
    PantryResponse, CreatePantryRequest,
    UpdatePantryRequest
)


router = APIRouter(prefix='/pantry', tags=['Pantries'])


@router.get(
    path='',
    response_model=list[PantryResponse | None],
    status_code=status.HTTP_200_OK)
async def get_all(repo: PantryDeps) -> list[PantryResponse | None]:
    use_case = GetPantries(repo)

    data: list[Pantry | None] = await use_case.execute()

    return [
        PantryResponse.model_validate(
            d, from_attributes=True
        ) for d in (data or [])
    ]


@router.get(
    path='/{idx}',
    response_model=Optional[PantryResponse],
    status_code=status.HTTP_200_OK)
async def get_one(
        idx: UUID, repo: PantryDeps) -> Optional[PantryResponse]:
    use_case = GetPantry(repo)

    data: Optional[Pantry] = await use_case.execute(idx)

    if data:
        return PantryResponse.model_validate(data, from_attributes=True)

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f'Unable to find ingredient with id: {idx}'
    )


@router.post(
    path='',
    response_model=PantryResponse,
    status_code=status.HTTP_201_CREATED)
async def create(
        body: CreatePantryRequest,
        session: SessionDeps,
        inc_repo: IngredientDeps,
        repo: PantryDeps) -> PantryResponse:
    use_case = CreatePantry(repo, inc_repo, session)

    try:
        data: Pantry = await use_case.execute(body)
        await session.commit()

    except ItemNotFound as e:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        ) from e

    except DuplicateEntryFound as e:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e)
        ) from e

    except DBCreationFailed as e:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        ) from e

    return PantryResponse.model_validate(data, from_attributes=True)


@router.patch(
    path='/{idx}',
    response_model=PantryResponse,
    status_code=status.HTTP_202_ACCEPTED)
async def update(
    idx: UUID,
        body: UpdatePantryRequest,
        session: SessionDeps,
        repo: PantryDeps) -> PantryResponse:
    use_case = UpdatePantry(repo, session)

    try:
        data: Optional[Pantry] = await use_case.execute(idx, body)
        await session.commit()

    except ItemNotFound as e:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        ) from e

    return PantryResponse.model_validate(data, from_attributes=True)


@router.delete(
    path='/{idx}',
    status_code=status.HTTP_204_NO_CONTENT)
async def delete(
    idx: UUID,
        session: SessionDeps,
        repo: PantryDeps) -> None:
    use_case = DeletePantry(repo, session)

    try:
        await use_case.execute(idx)
        await session.commit()

    except ItemNotFound as e:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        ) from e
