from fastapi import APIRouter

from .routers.ingredient_router import router as ingredient_router


api_router = APIRouter(prefix='/api')

api_router.include_router(ingredient_router)
