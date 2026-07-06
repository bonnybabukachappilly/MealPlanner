import { useState } from 'react';
import { inventory as initialInventory } from '../data/dummyData';
import { daysUntil } from '../utils/dates';
import type { InventoryItem } from '../types';

export function Pantry() {
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [editingId, setEditingId] = useState<string | null>(null);

  const quantityItems = inventory.filter((i) => i.trackType === 'quantity');
  const expiryItems = inventory.filter((i) => i.trackType === 'expiry');

  function toggleLowFlag(id: string) {
    setInventory((prev) =>
      prev.map((i) => (i.id === id ? { ...i, lowFlag: !i.lowFlag } : i))
    );
  }

  return (
    <div className="page">
      <div className="page__header">
        <h1>Pantry</h1>
        <p className="page__subtitle">What's on hand, tracked by count or by expiry.</p>
      </div>

      <div className="two-col">
        <section className="two-col__main">
          <h2>Tracked by quantity</h2>
          <div className="pantry-list">
            {quantityItems.map((item) => {
              const low = item.quantity <= item.lowStockThreshold;
              return (
                <div
                  key={item.id}
                  className="pantry-row"
                  onClick={() => setEditingId(item.id === editingId ? null : item.id)}
                >
                  <span className="pantry-row__name">{item.ingredientName}</span>
                  <span className="pantry-row__qty">
                    {item.quantity}
                    {item.unit}
                  </span>
                  <span className={low ? 'pill pill--warn' : 'pill pill--ok'}>
                    {low ? 'Low stock' : 'Stocked'}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <aside className="two-col__side">
          <h2>Tracked by expiry</h2>
          <div className="pantry-list">
            {expiryItems.map((item) => {
              const days = item.expiryDate ? daysUntil(item.expiryDate) : null;
              return (
                <div key={item.id} className="pantry-row">
                  <span className="pantry-row__name">{item.ingredientName}</span>
                  <span className="pantry-row__qty">
                    {days !== null ? (days <= 0 ? 'expires today' : `${days}d left`) : '—'}
                  </span>
                  <button
                    className={item.lowFlag ? 'btn btn--sm btn--accent' : 'btn btn--sm btn--ghost'}
                    onClick={() => toggleLowFlag(item.id)}
                  >
                    {item.lowFlag ? 'Marked low' : 'Mark low'}
                  </button>
                </div>
              );
            })}
          </div>
          <p className="empty-note">
            Marking an item low adds it to the grocery list's restock section.
          </p>
        </aside>
      </div>
    </div>
  );
}
