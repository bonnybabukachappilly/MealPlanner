import { useMemo, useState } from 'react';
import { expenses as initialExpenses, settings } from '../data/dummyData';
import type { Expense, ExpenseCategory } from '../types';

const CATEGORY_LABEL: Record<ExpenseCategory, string> = {
  groceries: 'Groceries',
  eating_out: 'Eating Out',
  other: 'Other',
};

function monthKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}`;
}

export function Expenses() {
  const [expenses] = useState<Expense[]>(initialExpenses);
  const [monthOffset, setMonthOffset] = useState(0);

  const viewDate = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + monthOffset);
    return d;
  }, [monthOffset]);

  const monthExpenses = expenses.filter(
    (e) => monthKey(new Date(e.expenseDate)) === monthKey(viewDate)
  );

  const total = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const budget = settings.monthlyBudget;
  const pct = Math.min(100, Math.round((total / budget) * 100));

  const byCategory = (['groceries', 'eating_out', 'other'] as ExpenseCategory[]).map((cat) => ({
    cat,
    total: monthExpenses.filter((e) => e.category === cat).reduce((s, e) => s + e.amount, 0),
  }));

  return (
    <div className="page">
      <div className="page__header page__header--row">
        <div>
          <h1>Expenses</h1>
          <p className="page__subtitle">
            {viewDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="week-nav">
          <button className="btn btn--ghost" onClick={() => setMonthOffset((m) => m - 1)}>
            ← Prev
          </button>
          <button className="btn btn--ghost" onClick={() => setMonthOffset(0)}>
            This month
          </button>
          <button className="btn btn--ghost" onClick={() => setMonthOffset((m) => m + 1)}>
            Next →
          </button>
        </div>
      </div>

      <div className="stat-grid stat-grid--expenses">
        <div className="stat-card">
          <div className="stat-card__value">₹{total.toLocaleString('en-IN')}</div>
          <div className="stat-card__label">Spent this month</div>
        </div>
        {byCategory.map((c) => (
          <div className="stat-card" key={c.cat}>
            <div className="stat-card__value">₹{c.total.toLocaleString('en-IN')}</div>
            <div className="stat-card__label">{CATEGORY_LABEL[c.cat]}</div>
          </div>
        ))}
      </div>

      <div className="budget-bar-wrap">
        <div className="budget-bar-wrap__labels">
          <span>Budget: ₹{budget.toLocaleString('en-IN')}</span>
          <span>{pct}%</span>
        </div>
        <div className="budget-bar">
          <div
            className={`budget-bar__fill ${pct >= 100 ? 'budget-bar__fill--over' : ''}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="toolbar">
        <button className="btn btn--ghost" onClick={() => alert('Log eating out — will save once backend is wired up')}>
          🍽 log eating out
        </button>
        <button className="btn btn--accent" onClick={() => alert('Add expense — will save once backend is wired up')}>
          + add expense
        </button>
      </div>

      <section className="panel">
        <div className="panel__header">
          <h2>This month</h2>
        </div>
        <ul className="list">
          {monthExpenses.map((e) => (
            <li key={e.id} className="list-row list-row--cook">
              <span className="list-row__tag">{new Date(e.expenseDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span>
              <span className="list-row__title">{e.itemName}</span>
              <span className="pill pill--muted">{CATEGORY_LABEL[e.category]}</span>
              <span className="list-row__price">₹{e.amount.toLocaleString('en-IN')}</span>
              <span className="list-row__actions">
                <button className="icon-btn" title="Edit">✎</button>
                <button className="icon-btn" title="Delete">✕</button>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
