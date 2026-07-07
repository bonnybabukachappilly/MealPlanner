from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.database import get_db
from backend.models.inventory import InventoryItem
from backend.schemas.inventory import (
    InventoryItemCreate,
    InventoryItemRead,
    InventoryItemUpdate,
)

router = APIRouter()


@router.get("/", response_model=list[InventoryItemRead])
async def list_inventory(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(InventoryItem))
    return result.scalars().all()


@router.get("/{item_id}", response_model=InventoryItemRead)
async def get_inventory_item(item_id: str, db: AsyncSession = Depends(get_db)):
    item = await db.get(InventoryItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    return item


@router.post("/", response_model=InventoryItemRead, status_code=201)
async def create_inventory_item(
    payload: InventoryItemCreate, db: AsyncSession = Depends(get_db)
):
    item = InventoryItem(**payload.model_dump())
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


@router.patch("/{item_id}", response_model=InventoryItemRead)
async def update_inventory_item(
    item_id: str, payload: InventoryItemUpdate, db: AsyncSession = Depends(get_db)
):
    item = await db.get(InventoryItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)

    await db.commit()
    await db.refresh(item)
    return item


@router.delete("/{item_id}", status_code=204)
async def delete_inventory_item(item_id: str, db: AsyncSession = Depends(get_db)):
    item = await db.get(InventoryItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    await db.delete(item)
    await db.commit()
