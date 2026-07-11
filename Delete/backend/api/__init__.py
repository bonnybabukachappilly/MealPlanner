from fastapi import APIRouter

from .routers.pantry import router as pantry_router


api_router = APIRouter(prefix='/api')

api_router.include_router(pantry_router)
