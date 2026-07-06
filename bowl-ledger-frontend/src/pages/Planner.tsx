import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mealPlan as initialMealPlan, recipes, components, cookBatches } from '../data/dummyData';
import { DAYS, MEAL_TYPES, currentWeekStart, shiftWeek, formatWeekLabel } from '../utils/dates';
import type { MealPlanEntry, DayOfWeek } from '../types';

function dishNameFor(entry: MealPlanEntry): string {
  if (entry.customName) return entry.customName;
  if (entry.recipeId) return recipes.find((r) => r.id === entry.recipeId)?.name ?? 'Unknown';
  if (entry.isBowl) {
    const names = (entry.componentIds ?? []).map(
      (id) => components.find((c) => c.id === id)?.name.split(' ')[0] ?? '?'
    );
    return names.join(' + ');
  }
  return 'Untitled';
}

function photoFor(entry: MealPlanEntry): string | undefined {
  if (entry.recipeId) return recipes.find((r) => r.id === entry.recipeId)?.photo;
  if (entry.isBowl) {
    const firstId = entry.componentIds?.[0];
    return components.find((c) => c.id === firstId)?.photo;
  }
  return undefined;
}

const SLOT_CLASS: Record<string, string> = {
  Breakfast: 'meal-color-0',
  'Morning Snack': 'meal-color-1',
  Lunch: 'meal-color-2',
  'Evening Snack': 'meal-color-3',
  Dinner: 'meal-color-4',
  Extras: 'meal-color-5',
};

export function Planner() {
  const navigate = useNavigate();
  const [weekStart, setWeekStart] = useState(currentWeekStart());
  const [entries, setEntries] = useState<MealPlanEntry[]>(initialMealPlan);
  const [dragId, setDragId] = useState<string | null>(null);

  const weekEntries = entries.filter((e) => e.weekStart === weekStart);
  const staging = weekEntries.filter((e) => e.dayOfWeek === 'Staging');

  function entriesFor(day: DayOfWeek, mealType: string) {
    return weekEntries.filter((e) => e.dayOfWeek === day && e.mealType === mealType);
  }

  function handleDrop(day: DayOfWeek, mealType: string) {
    if (!dragId) return;
    setEntries((prev) =>
      prev.map((e) =>
        e.id === dragId
          ? { ...e, dayOfWeek: day, mealType: mealType as MealPlanEntry['mealType'], weekStart }
          : e
      )
    );
    setDragId(null);
  }

  function MealCard({ entry }: { entry: MealPlanEntry }) {
    const fromFridge = Boolean(entry.batchId);
    const batch = fromFridge ? cookBatches.find((b) => b.id === entry.batchId) : undefined;
    const photo = photoFor(entry);

    return (
      <div
        className={`meal-card ${SLOT_CLASS[entry.mealType] ?? ''}`}
        draggable
        onDragStart={() => setDragId(entry.id)}
      >
        {photo && <img src={photo} alt="" className="meal-card__photo" />}
        <div className="meal-card__body">
          <div className="meal-card__name">{dishNameFor(entry)}</div>
          <div className="meal-card__tags">
            <span className={entry.cooked ? 'pill pill--ok' : 'pill pill--muted'}>
              {entry.cooked ? 'Cooked' : fromFridge ? 'from fridge 🧊' : 'Planned'}
            </span>
          </div>
          {fromFridge && !entry.cooked && batch && (
            <button
              className="btn btn--sm btn--accent"
              onClick={() =>
                setEntries((prev) =>
                  prev.map((e) => (e.id === entry.id ? { ...e, cooked: true } : e))
                )
              }
            >
              eat now
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="page page--wide">
      <div className="page__header page__header--row">
        <div>
          <h1>Planner</h1>
          <p className="page__subtitle">Drag meals between days and sections.</p>
        </div>
        <div className="week-nav">
          <button className="btn btn--ghost" onClick={() => setWeekStart(shiftWeek(weekStart, -1))}>
            ← Prev
          </button>
          <button className="btn btn--ghost" onClick={() => setWeekStart(currentWeekStart())}>
            Today
          </button>
          <span className="week-nav__label">{formatWeekLabel(weekStart)}</span>
          <button className="btn btn--ghost" onClick={() => setWeekStart(shiftWeek(weekStart, 1))}>
            Next →
          </button>
        </div>
      </div>

      <div className="planner-grid">
        <div className="planner-grid__corner" />
        {DAYS.map((d) => (
          <div key={d.key} className="planner-grid__day-header">
            {d.key}
          </div>
        ))}

        {MEAL_TYPES.map((mealType) => (
          <>
            <div key={mealType} className="planner-grid__row-header">
              {mealType}
            </div>
            {DAYS.map((d) => (
              <div
                key={d.key + mealType}
                className="planner-grid__cell"
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(d.key as DayOfWeek, mealType)}
              >
                {entriesFor(d.key as DayOfWeek, mealType).map((entry) => (
                  <MealCard key={entry.id} entry={entry} />
                ))}
              </div>
            ))}
          </>
        ))}
      </div>

      <div className="staging-area">
        <div className="panel__header">
          <h2>Staging</h2>
          <button className="link-btn" onClick={() => navigate('/recipes')}>
            Browse recipes to add →
          </button>
        </div>
        <div
          className="staging-area__drop"
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop('Staging', 'Staging')}
        >
          {staging.length === 0 && <p className="empty-note">Drag a card here to park it for later.</p>}
          {staging.map((entry) => (
            <MealCard key={entry.id} entry={entry} />
          ))}
        </div>
      </div>
    </div>
  );
}
