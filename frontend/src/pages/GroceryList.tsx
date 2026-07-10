import { useMemo, useState } from 'react';
import {
  mealPlan,
  recipes,
  components,
  inventory,
  groceryExtras as initialExtras,
} from '../data/dummyData';
import { currentWeekStart, formatWeekLabel } from '../utils/dates';

interface LineItem {
  name: string;
  unit: string;
  needed: number;
  have: number;
  aisle: string;
  price?: number;
}

export function GroceryList() {
  const weekStart = currentWeekStart();
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [hidden, setHidden] = useState<Record<string, boolean>>({});
  const [extras, setExtras] = useState(initialExtras.filter((e) => e.weekStart === weekStart));
  const [newExtra, setNewExtra] = useState('');

  const items = useMemo<LineItem[]>(() => {
    const needed = new Map<string, LineItem>();
    const uncooked = mealPlan.filter(
      (m) => m.weekStart === weekStart && !m.cooked && m.dayOfWeek !== 'Staging'
    );

    for (const entry of uncooked) {
      const ingredientSets = entry.recipeId
        ? [recipes.find((r) => r.id === entry.recipeId)?.ingredients ?? []]
        : entry.isBowl
        ? (entry.componentIds ?? []).map(
            (id) => components.find((c) => c.id === id)?.ingredients ?? []
          )
        : [];

      for (const set of ingredientSets) {
        for (const ing of set) {
          const key = ing.name;
          const existing = needed.get(key);
          if (existing) {
            existing.needed += ing.quantity;
          } else {
            needed.set(key, { name: ing.name, unit: ing.unit, needed: ing.quantity, have: 0, aisle: ing.aisle });
          }
        }
      }
    }

    for (const item of needed.values()) {
      const stock = inventory.find(
        (i) => i.trackType === 'quantity' && i.itemName.toLowerCase() === item.name.toLowerCase()
      );
      item.have = stock?.quantity ?? 0;
    }

    return Array.from(needed.values()).filter((i) => i.needed - i.have > 0);
  }, [weekStart]);

  const restock = inventory.filter((i) => i.trackType === 'expiry' && i.lowFlag);

  const byAisle = useMemo(() => {
    const map = new Map<string, LineItem[]>();
    items
      .filter((i) => !hidden[i.name])
      .forEach((i) => {
        const list = map.get(i.aisle) ?? [];
        list.push(i);
        map.set(i.aisle, list);
      });
    return map;
  }, [items, hidden]);

  function toggleCheck(name: string) {
    setChecked((prev) => ({ ...prev, [name]: !prev[name] }));
  }

  function addExtra() {
    if (!newExtra.trim()) return;
    setExtras((prev) => [
      ...prev,
      { id: `ge${Date.now()}`, weekStart, itemName: newExtra.trim(), checked: false },
    ]);
    setNewExtra('');
  }

  return (
    <div className="page">
      <div className="page__header page__header--row">
        <div>
          <h1>Grocery List</h1>
          <p className="page__subtitle">Week of {formatWeekLabel(weekStart)}</p>
        </div>
        <button className="btn btn--ghost" onClick={() => window.print()}>
          🖨 Print
        </button>
      </div>

      {restock.length > 0 && (
        <section className="panel panel--restock">
          <div className="panel__header">
            <h2>Restock</h2>
          </div>
          <ul className="list">
            {restock.map((i) => (
              <li key={i.id} className="list-row">
                <span className="list-row__title">{i.itemName}</span>
                <span className="pill pill--warn">marked low</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="panel">
        <div className="panel__header">
          <h2>Buy this week</h2>
        </div>
        {byAisle.size === 0 && <p className="empty-note">Nothing to buy — pantry covers everything planned.</p>}
        {Array.from(byAisle.entries()).map(([aisle, list]) => (
          <div key={aisle} className="grocery-aisle">
            <div className="grocery-aisle__label">{aisle}</div>
            {list.map((item) => {
              const need = Math.max(0, item.needed - item.have);
              return (
                <div key={item.name} className="grocery-row">
                  <input
                    type="checkbox"
                    checked={!!checked[item.name]}
                    onChange={() => toggleCheck(item.name)}
                  />
                  <span className={checked[item.name] ? 'grocery-row__name grocery-row__name--done' : 'grocery-row__name'}>
                    {item.name}
                  </span>
                  <span className="grocery-row__qty">
                    buy {need}
                    {item.unit}
                  </span>
                  <span className="grocery-row__price">₹—</span>
                  <button className="icon-btn" title="Move to pantry">
                    →
                  </button>
                  <button
                    className="icon-btn"
                    title="Hide"
                    onClick={() => setHidden((prev) => ({ ...prev, [item.name]: true }))}
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </section>

      <section className="panel">
        <div className="panel__header">
          <h2>Extras</h2>
        </div>
        <ul className="list">
          {extras.map((e) => (
            <li key={e.id} className="list-row">
              <input
                type="checkbox"
                checked={e.checked}
                onChange={() =>
                  setExtras((prev) =>
                    prev.map((x) => (x.id === e.id ? { ...x, checked: !x.checked } : x))
                  )
                }
              />
              <span className="list-row__title">{e.itemName}</span>
              {e.price !== undefined && <span className="list-row__price">₹{e.price}</span>}
            </li>
          ))}
        </ul>
        <div className="toolbar">
          <input
            className="input"
            placeholder="💸 log unplanned buy…"
            value={newExtra}
            onChange={(ev) => setNewExtra(ev.target.value)}
            onKeyDown={(ev) => ev.key === 'Enter' && addExtra()}
          />
          <button className="btn btn--accent" onClick={addExtra}>
            Add
          </button>
        </div>
      </section>
    </div>
  );
}
