import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { components } from '../data/dummyData';
import { DishCard } from '../components/DishCard';
import { CategoryTag } from '../components/CategoryTag';
import type { ComponentCategory } from '../types';

const CATEGORY_ORDER: ComponentCategory[] = ['Protein', 'Grain', 'Veg', 'Sauce', 'Dairy', 'Other'];

export function BuildingBlocks() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filtered = components.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="page">
      <div className="page__header">
        <h1>Building Blocks</h1>
        <p className="page__subtitle">
          Batch-cook proteins, grains, veg and sauces to mix into bowls all week.
        </p>
      </div>

      <div className="toolbar">
        <input
          className="input"
          placeholder="Search building blocks…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn btn--accent" onClick={() => navigate('/building-blocks/new')}>
          + New component
        </button>
      </div>

      {CATEGORY_ORDER.map((cat) => {
        const list = filtered.filter((c) => c.category === cat);
        if (list.length === 0) return null;
        return (
          <div key={cat} className="recipe-group">
            <div className="recipe-group__header">
              <CategoryTag category={cat} />
              <span className="recipe-group__count">{list.length}</span>
            </div>
            <div className="card-grid">
              {list.map((c) => (
                <div key={c.id} className="dish-card-wrap">
                  <DishCard
                    photo={c.photo}
                    name={c.name}
                    category={c.category}
                    prepTime={c.prepTime}
                    servings={c.servings}
                    rating={c.rating}
                    onClick={() => navigate(`/building-blocks/${c.id}`)}
                  />
                  <button
                    className="btn btn--ghost btn--sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      alert(`Batch-cook "${c.name}" — will create a cook batch once backend is wired up`);
                    }}
                  >
                    Batch-cook now
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
