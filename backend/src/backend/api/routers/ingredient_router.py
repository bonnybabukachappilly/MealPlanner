from typing import Optional
from uuid import UUID


from backend.domain.entities.ingredient import Ingredient
from fastapi import APIRouter, HTTPException, status

from backend.application.ingredient import (
    GetIngredient, GetIngredients,
    CreateIngredient, UpdateIngredient,
    DeleteIngredient
)
from backend.api.dependencies import IngredientDeps, SessionDeps
from backend.exceptions.general import (
    DuplicateEntryFound, DBCreationFailed,
    ItemNotFound
)
from backend.schemas import (
    IngredientResponse, CreateIngredientRequest,
    UpdateIngredientRequest
)


router = APIRouter(prefix='/ingredient', tags=['Ingredients'])


@router.get(
    path='',
    response_model=list[IngredientResponse | None],
    status_code=status.HTTP_200_OK)
async def get_all(repo: IngredientDeps) -> list[IngredientResponse | None]:
    use_case = GetIngredients(repo)

    data: list[Ingredient | None] = await use_case.execute()

    return [
        IngredientResponse.model_validate(
            d, from_attributes=True
        ) for d in (data or [])
    ]


@router.get(
    path='/{idx}',
    response_model=Optional[IngredientResponse],
    status_code=status.HTTP_200_OK)
async def get_one(
        idx: UUID, repo: IngredientDeps) -> Optional[IngredientResponse]:
    use_case = GetIngredient(repo)

    data: Optional[Ingredient] = await use_case.execute(idx)

    if data:
        return IngredientResponse.model_validate(data, from_attributes=True)

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f'Unable to find ingredient with id: {idx}'
    )


@router.post(
    path='/',
    response_model=IngredientResponse,
    status_code=status.HTTP_201_CREATED)
async def create(
        body: CreateIngredientRequest,
        session: SessionDeps,
        repo: IngredientDeps) -> IngredientResponse:
    use_case = CreateIngredient(repo, session)

    try:
        data: Ingredient = await use_case.execute(body)
        await session.commit()

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

    return IngredientResponse.model_validate(data, from_attributes=True)


@router.patch(
    path='/{idx}',
    response_model=IngredientResponse,
    status_code=status.HTTP_202_ACCEPTED)
async def update(
    idx: UUID,
        body: UpdateIngredientRequest,
        session: SessionDeps,
        repo: IngredientDeps) -> IngredientResponse:
    use_case = UpdateIngredient(repo, session)

    try:
        data: Optional[Ingredient] = await use_case.execute(idx, body)
        await session.commit()

    except ItemNotFound as e:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        ) from e

    return IngredientResponse.model_validate(data, from_attributes=True)


@router.delete(
    path='/{idx}',
    status_code=status.HTTP_204_NO_CONTENT)
async def delete(
    idx: UUID,
        session: SessionDeps,
        repo: IngredientDeps) -> None:
    use_case = DeleteIngredient(repo, session)

    try:
        await use_case.execute(idx)
        await session.commit()

    except ItemNotFound as e:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        ) from e
