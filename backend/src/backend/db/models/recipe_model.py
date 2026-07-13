from datetime import datetime
from typing import Any, Optional
from uuid import UUID, uuid4

from sqlalchemy import (
    String, Integer, Text, DateTime,
    func, Numeric, ForeignKey
)
from sqlalchemy.dialects.postgresql import UUID as PG_UUID, ARRAY
from sqlalchemy.orm import mapped_column, Mapped, relationship

from backend.db import Base
from backend.db.models import IngredientModel


class RecipeIngredientModel(Base):
    __tablename__: Any = 'recipe_ingredients'

    id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        default=uuid4
    )

    recipe_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey('recipes.id', ondelete='CASCADE'),
        nullable=False
    )
    recipe: Mapped["RecipeModel"] = relationship(lazy='joined')

    ingredient_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey('ingredients.id', ondelete='RESTRICT'),
        nullable=False
    )

    ingredient: Mapped["IngredientModel"] = relationship(lazy='joined')

    quantity: Mapped[float] = mapped_column(
        Numeric(10, 2),
        nullable=False
    )

    unit: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )


class RecipeModel(Base):
    __tablename__: Any = 'recipes'

    id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        default=uuid4
    )

    name: Mapped[str] = mapped_column(
        String(150),
        nullable=False
    )

    category: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    servings: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    prep_time: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    instructions: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    tags: Mapped[list[str]] = mapped_column(
        ARRAY(String(50)),
        nullable=False,
        default=list
    )

    rating: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True
    )

    photo: Mapped[Optional[str]] = mapped_column(
        String(500),
        nullable=True
    )

    source_urls: Mapped[list[str]] = mapped_column(
        ARRAY(String(500)),
        nullable=False,
        default=list
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now()
    )

    ingredients: Mapped[list["RecipeIngredientModel"]] = relationship(
        lazy='selectin',
        cascade='all, delete-orphan',
        passive_deletes=True
    )
