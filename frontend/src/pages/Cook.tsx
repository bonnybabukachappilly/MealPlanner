import { useState } from 'react';
import {
  mealPlan,
  recipes,
  components,
  cookBatches as initialBatches,
  CATEGORY_SAFETY_HOURS,
} from '../data/dummyData';
import { currentWeekStart, hoursSince } from '../utils/dates';
import { CategoryTag } from '../components/CategoryTag';
import type { CookBatch, MealPlanEntry } from '../types';

function dishNameFor(entry: MealPlanEntry): string {
  if (entry.customName) return entry.customName;
  if (entry.recipeId) return recipes.find((r) => r.id === entry.recipeId)?.name ?? 'Unknown';
  if (entry.isBowl) {
    return (entry.componentIds ?? [])
      .map((id) => components.find((c) => c.id === id)?.name.split(' ')[0] ?? '?')
      .join(' + ');
  }
  return 'Untitled';
}

function ageStatus(batch: CookBatch): 'green' | 'yellow' | 'red' {
  const threshold = CATEGORY_SAFETY_HOURS[batch.category] ?? 96;
  const effectiveThreshold = batch.storageLocation === 'freezer' ? threshold * 22.5 : threshold; // ~90 days vs 96h baseline feel
  const hrs = hoursSince(batch.cookedDate);
  const ratio = hrs / effectiveThreshold;
  if (ratio < 0.7) return 'green';
  if (ratio < 1) return 'yellow';
  return 'red';
}

export function Cook() {
  const [batches, setBatches] = useState<CookBatch[]>(initialBatches);
  const weekStart = currentWeekStart();

  const toCook = mealPlan.filter(
    (m) => m.weekStart === weekStart && !m.cooked && m.dayOfWeek !== 'Staging'
  );

  const active = batches.filter((b) => !b.wasted && b.servingsRemaining > 0);

  function availableBatchFor(entry: MealPlanEntry): CookBatch | undefined {
    if (entry.recipeId) {
      return active.find(
        (b) => b.recipeId === entry.recipeId && b.servingsRemaining - b.servingsAllocated > 0
      );
    }
    if (entry.isBowl) {
      const firstComp = entry.componentIds?.[0];
      return active.find(
        (b) => b.componentId === firstComp && b.servingsRemaining - b.servingsAllocated > 0
      );
    }
    return undefined;
  }

  function adjustServings(id: string, delta: number) {
    setBatches((prev) =>
      prev.map((b) =>
        b.id === id
          ? { ...b, servingsRemaining: Math.max(0, b.servingsRemaining + delta) }
          : b
      )
    );
  }

  function toss(id: string) {
    setBatches((prev) => prev.map((b) => (b.id === id ? { ...b, wasted: true } : b)));
  }

  return (
    <div className="page">
      <div className="page__header page__header--row">
        <div>
          <h1>Cook</h1>
          <p className="page__subtitle">What's queued, and what's already made.</p>
        </div>
        <button className="btn btn--accent" onClick={() => alert('Log an ad-hoc cook — will save once backend is wired up')}>
          + log a cook
        </button>
      </div>

      <section className="panel">
        <div className="panel__header">
          <h2>To cook (planned)</h2>
        </div>
        {toCook.length === 0 ? (
          <p className="empty-note">Everything planned for this week is already cooked.</p>
        ) : (
          <ul className="list">
            {toCook.map((entry) => {
              const batch = availableBatchFor(entry);
              return (
                <li key={entry.id} className="list-row list-row--cook">
                  <span className="list-row__tag">{entry.dayOfWeek} · {entry.mealType}</span>
                  <span className="list-row__title">{dishNameFor(entry)}</span>
                  <span className="list-row__actions">
                    {batch && (
                      <button
                        className="btn btn--sm btn--ghost"
                        onClick={() => alert('Reserved from fridge — will persist once backend is wired up')}
                      >
                        serve from fridge
                      </button>
                    )}
                    <button
                      className="btn btn--sm btn--accent"
                      onClick={() => alert('Cook now — will deduct pantry + create batch once backend is wired up')}
                    >
                      cook now
                    </button>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="panel">
        <div className="panel__header">
          <h2>In the fridge / freezer</h2>
        </div>
        <div className="fridge-grid">
          {active.map((b) => {
            const status = ageStatus(b);
            const available = b.servingsRemaining - b.servingsAllocated;
            return (
              <div className="fridge-tile" key={b.id}>
                <div className="fridge-tile__photo">
                  {b.photo ? <img src={b.photo} alt={b.dishName} /> : <div className="dish-card__photo-placeholder">🍲</div>}
                </div>
                <div className="fridge-tile__body">
                  <div className="fridge-tile__name">{b.dishName}</div>
                  <CategoryTag category={b.category} small />
                  <div className="fridge-tile__age">
                    {hoursSince(b.cookedDate)}h · {b.storageLocation}
                  </div>
                  <div className={`age-bar age-bar--${status}`}>
                    <div className="age-bar__fill" />
                  </div>
                  <div className="fridge-tile__servings">
                    {available} left of {b.servingsMade} made
                    {b.servingsAllocated > 0 && ` · ${b.servingsAllocated} planned`}
                  </div>
                  <div className="fridge-tile__actions">
                    <button className="btn btn--sm btn--ghost" onClick={() => adjustServings(b.id, -1)}>
                      −1 serving
                    </button>
                    <button className="btn btn--sm btn--ghost" onClick={() => toss(b.id)}>
                      toss
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
