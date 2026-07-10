import { useNavigate } from 'react-router-dom';
import {
  mealPlan,
  recipes,
  inventory,
  cookBatches,
  expenses,
  components,
} from '../data/dummyData';
import { currentWeekStart, dayKeyFor, hoursSince, daysUntil } from '../utils/dates';
import { CategoryTag } from '../components/CategoryTag';

function dishNameFor(entry: (typeof mealPlan)[number]): string {
  if (entry.customName) return entry.customName;
  if (entry.recipeId) return recipes.find((r) => r.id === entry.recipeId)?.name ?? 'Unknown';
  if (entry.isBowl) {
    const names = (entry.componentIds ?? []).map(
      (id) => components.find((c) => c.id === id)?.name.split(' ')[0] ?? '?'
    );
    return names.join(' + ') + ' bowl';
  }
  return 'Meal';
}

export function Dashboard() {
  const navigate = useNavigate();
  const weekStart = currentWeekStart();
  const todayKey = dayKeyFor(new Date());

  const thisWeek = mealPlan.filter((m) => m.weekStart === weekStart && m.dayOfWeek !== 'Staging');
  const todaysMeals = thisWeek.filter((m) => m.dayOfWeek === todayKey);
  const cookedCount = thisWeek.filter((m) => m.cooked).length;
  const plannedCount = thisWeek.length;

  const lowStock = inventory.filter((i) => i.trackType === 'quantity' && i.lowFlag);
  const expiringSoon = inventory.filter((i) => i.trackType === 'expiry' && i.expiryDate);

  const fridgeBatches = cookBatches.filter((b) => !b.wasted && b.servingsRemaining > 0);

  const thisMonth = new Date().getMonth();
  const monthSpend = expenses
    .filter((e) => new Date(e.expenseDate).getMonth() === thisMonth)
    .reduce((sum, e) => sum + e.amount, 0);

  const stats = [
    { label: "Today's meals", value: todaysMeals.length, sub: `of ${MEAL_SLOTS} slots` },
    { label: 'Cooked this week', value: `${cookedCount}/${plannedCount}` },
    { label: 'In the fridge', value: fridgeBatches.length, sub: 'batches' },
    { label: 'Recipes saved', value: recipes.length },
    { label: 'Spent this month', value: `₹${monthSpend.toLocaleString('en-IN')}` },
  ];

  return (
    <div className="page">
      <div className="page__header">
        <h1>Good to see you</h1>
        <p className="page__subtitle">Here's what's cooking this week.</p>
      </div>

      <div className="stat-grid">
        {stats.map((s) => (
          <div className="stat-card" key={s.label}>
            <div className="stat-card__value">{s.value}</div>
            <div className="stat-card__label">{s.label}</div>
            {s.sub && <div className="stat-card__sub">{s.sub}</div>}
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel__header">
            <h2>Today</h2>
          </div>
          {todaysMeals.length === 0 ? (
            <p className="empty-note">Nothing planned yet — head to the Planner to fill today in.</p>
          ) : (
            <ul className="list">
              {todaysMeals.map((m) => (
                <li key={m.id} className="list-row">
                  <span className="list-row__tag">{m.mealType}</span>
                  <span className="list-row__title">{dishNameFor(m)}</span>
                  <span className={m.cooked ? 'pill pill--ok' : 'pill pill--muted'}>
                    {m.cooked ? 'Cooked' : 'Planned'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel">
          <div className="panel__header">
            <h2>Low stock</h2>
            <button className="link-btn" onClick={() => navigate('/pantry')}>
              Open pantry →
            </button>
          </div>
          {lowStock.length === 0 ? (
            <p className="empty-note">Everything's stocked.</p>
          ) : (
            <ul className="list">
              {lowStock.map((i) => (
                <li key={i.id} className="list-row">
                  <span className="list-row__title">{i.itemName}</span>
                  <span className="pill pill--warn">
                    {i.quantity}
                    {i.unit} left
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel">
          <div className="panel__header">
            <h2>Expiring soon</h2>
          </div>
          {expiringSoon.length === 0 ? (
            <p className="empty-note">Nothing expiring in the next few days.</p>
          ) : (
            <ul className="list">
              {expiringSoon.map((i) => {
                const days = daysUntil(i.expiryDate!);
                return (
                  <li key={i.id} className="list-row">
                    <span className="list-row__title">{i.itemName}</span>
                    <span className={days <= 1 ? 'pill pill--danger' : 'pill pill--warn'}>
                      {days <= 0 ? 'today' : `${days}d left`}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="panel panel--wide">
          <div className="panel__header">
            <h2>In the fridge &amp; freezer</h2>
            <button className="link-btn" onClick={() => navigate('/cook')}>
              Open cook tracker →
            </button>
          </div>
          <div className="fridge-grid">
            {fridgeBatches.map((b) => {
              const pct = Math.round(
                ((b.servingsRemaining - b.servingsAllocated) / b.servingsMade) * 100
              );
              return (
                <div className="fridge-tile" key={b.id}>
                  <div className="fridge-tile__photo">
                    {b.photo ? <img src={b.photo} alt={b.dishName} /> : <div className="dish-card__photo-placeholder">🍲</div>}
                  </div>
                  <div className="fridge-tile__body">
                    <div className="fridge-tile__name">{b.dishName}</div>
                    <CategoryTag category={b.category} small />
                    <div className="fridge-tile__age">{hoursSince(b.cookedDate)}h old · {b.storageLocation}</div>
                    <div className="servings-bar">
                      <div className="servings-bar__fill" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="fridge-tile__servings">
                      {b.servingsRemaining - b.servingsAllocated} of {b.servingsMade} left
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

const MEAL_SLOTS = 6;
