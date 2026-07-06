import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { recipes, customDishes } from '../data/dummyData';
import { DishCard } from '../components/DishCard';
import { CategoryTag } from '../components/CategoryTag';

export function Recipes() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(recipes.map((r) => r.category)))],
    []
  );

  const filtered = recipes.filter((r) => {
    const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || r.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const grouped = useMemo(() => {
    const map = new Map<string, typeof recipes>();
    filtered.forEach((r) => {
      const list = map.get(r.category) ?? [];
      list.push(r);
      map.set(r.category, list as typeof recipes);
    });
    return map;
  }, [filtered]);

  return (
    <div className="page">
      <div className="page__header">
        <h1>Recipes</h1>
        <p className="page__subtitle">Full recipes with ingredients and steps.</p>
      </div>

      <div className="toolbar">
        <input
          className="input"
          placeholder="Search recipes…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="input"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button className="btn btn--accent" onClick={() => navigate('/recipes/new')}>
          + New recipe
        </button>
      </div>

      <div className="two-col">
        <div className="two-col__main">
          {grouped.size === 0 && <p className="empty-note">No recipes match your search.</p>}
          {Array.from(grouped.entries()).map(([category, list]) => (
            <div key={category} className="recipe-group">
              <div className="recipe-group__header">
                <CategoryTag category={category} />
                <span className="recipe-group__count">{list.length}</span>
              </div>
              <div className="card-grid card-grid--2">
                {list.map((r) => (
                  <DishCard
                    key={r.id}
                    photo={r.photo}
                    name={r.name}
                    category={r.category}
                    prepTime={r.prepTime}
                    servings={r.servings}
                    rating={r.rating}
                    onClick={() => navigate(`/recipes/${r.id}`)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <aside className="two-col__side">
          <div className="panel__header">
            <h2>Placeholders</h2>
          </div>
          <p className="empty-note">Dishes you know by heart — no full recipe needed.</p>
          <div className="card-grid card-grid--2">
            {customDishes.map((d) => (
              <div className="placeholder-card" key={d.id}>
                <div className="placeholder-card__photo">
                  {d.photo ? <img src={d.photo} alt={d.name} /> : <div className="dish-card__photo-placeholder">🍽</div>}
                </div>
                <div className="placeholder-card__name">{d.name}</div>
                <div className="placeholder-card__notes">{d.notes}</div>
              </div>
            ))}
            <button className="btn btn--ghost" onClick={() => alert('Add placeholder — coming once backend is wired up')}>
              + Add placeholder
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
