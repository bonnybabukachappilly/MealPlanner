from fastapi import APIRouter

from .routers.ingredient_router import router as ingredient_router
from .routers.pantry_router import router as pantry_router


api_router = APIRouter(prefix='/api')

api_router.include_router(ingredient_router)
api_router.include_router(pantry_router)
