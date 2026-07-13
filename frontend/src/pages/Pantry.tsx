import { useEffect, useState } from 'react';
import { listPantryItems, updatePantryItem, createPantryItem, deletePantryItem } from '../api/pantry';
import type { PantryFormData } from '../api/pantry';
import { ApiError } from '../api/client';
import { daysUntil } from '../utils/dates';
import { PantryItemForm } from '../components/PantryItemForm';
import { ConfirmDialog } from '../components/ConfirmDialog';
import type { PantryEntry } from '../types';

function messageFor(err: unknown): string {
  if (err instanceof ApiError) {
    const detail = (err.body as { detail?: unknown })?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) return detail.map((d) => d.msg ?? JSON.stringify(d)).join('; ');
    return `Request failed (${err.status})`;
  }
  return 'Something went wrong. Check that the backend is running.';
}

export function Pantry() {
  const [inventory, setInventory] = useState<PantryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<PantryEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PantryEntry | null>(null);
  const [syncWarning, setSyncWarning] = useState<string | null>(null);

  useEffect(() => {
    listPantryItems()
      .then(setInventory)
      .catch(() => setError('Could not load pantry items.'))
      .finally(() => setLoading(false));
  }, []);

  const quantityItems = inventory.filter((i) => i.trackType === 'quantity');
  const expiryItems = inventory.filter((i) => i.trackType === 'expiry');
  const untrackedItems = inventory.filter((i) => i.trackType === 'untrack');

  function toggleLowFlag(item: PantryEntry) {
    const next = !item.lowFlag;
    setInventory((prev) => prev.map((i) => (i.id === item.id ? { ...i, lowFlag: next } : i)));
    updatePantryItem(item.id, {
      ingredientId: item.ingredientId,
      trackType: item.trackType,
      lowFlag: next,
    }).catch(() => {
      setInventory((prev) => prev.map((i) => (i.id === item.id ? { ...i, lowFlag: item.lowFlag } : i)));
    });
  }

  function openAddForm() {
    setEditingItem(null);
    setFormError(null);
    setFormOpen(true);
  }

  function openEditForm(item: PantryEntry) {
    setEditingItem(item);
    setFormError(null);
    setFormOpen(true);
  }

  function handleSave(data: PantryFormData) {
    setFormError(null);
    const promise = editingItem ? updatePantryItem(editingItem.id, data) : createPantryItem(data);

    promise
      .then((saved) => {
        setInventory((prev) =>
          editingItem ? prev.map((i) => (i.id === saved.id ? saved : i)) : [...prev, saved]
        );
        setFormOpen(false);
      })
      .catch((err) => {
        if (err instanceof Error && err.message === 'PANTRY_SYNC_FAILED') {
          setSyncWarning('Item was saved, but the ingredient may still show as available in the picker. You may need to refresh.');
          setFormOpen(false);
        } else {
          setFormError(messageFor(err));
        }
      });
  }

  function handleDelete(id: string, ingredientId: string) {
    setInventory((prev) => prev.filter((i) => i.id !== id));
    deletePantryItem(id, ingredientId).catch(() => {
      listPantryItems().then(setInventory);
    });
  }

  return (
    <div className="page">
      <div className="page__header page__header--row">
        <div>
          <h1>Pantry</h1>
          <p className="page__subtitle">What's on hand, tracked by count or by expiry.</p>
        </div>
        <button className="btn btn--accent" onClick={openAddForm}>
          + Add item
        </button>
      </div>

      {syncWarning && (
        <p className="empty-note" style={{ color: 'var(--warn)' }}>
          ⚠ {syncWarning}
          <button className="link-btn" onClick={() => setSyncWarning(null)} style={{ marginLeft: 8 }}>
            Dismiss
          </button>
        </p>
      )}

      {loading && <p className="empty-note">Loading pantry…</p>}
      {error && <p className="empty-note">{error}</p>}

      {formOpen && (
        <PantryItemForm
          initial={editingItem ?? undefined}
          error={formError}
          onSave={handleSave}
          onCancel={() => setFormOpen(false)}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete item"
          message={`Delete "${deleteTarget.ingredientName}"? This can't be undone.`}
          onConfirm={() => {
            handleDelete(deleteTarget.id, deleteTarget.ingredientId);
            setDeleteTarget(null);
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {!loading && !error && (
        <div className="two-col">
          <section className="two-col__main">
            <h2>Tracked by quantity</h2>
            <div className="pantry-list">
              {quantityItems.map((item) => {
                return (
                  <div key={item.id} className="pantry-row">
                    <span className="pantry-row__name">{item.ingredientName}</span>
                    <span className="pantry-row__qty">
                      {item.quantity}
                      {item.unit}
                    </span>
                    <span className={item.lowFlag ? 'pill pill--warn' : 'pill pill--ok'}>
                      {item.lowFlag ? 'Low stock' : 'Stocked'}
                    </span>
                    <button className="icon-btn" title="Edit" onClick={() => openEditForm(item)}>
                      ✎
                    </button>
                    <button className="icon-btn" title="Delete" onClick={() => setDeleteTarget(item)}>
                      ✕
                    </button>
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
                    <span className={item.lowFlag ? 'pill pill--warn' : 'pill pill--ok'}>
                      {days === null
                        ? '—'
                        : days <= 0
                          ? 'Expires today'
                          : item.lowFlag
                            ? `Expiring soon · ${days}d left`
                            : `${days}d left`}
                    </span>
                    <button className="icon-btn" title="Edit" onClick={() => openEditForm(item)}>
                      ✎
                    </button>
                    <button className="icon-btn" title="Delete" onClick={() => setDeleteTarget(item)}>
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
            <p className="empty-note"></p>

            <h2>Untracked</h2>
            <div className="pantry-list">
              {untrackedItems.map((item) => (
                <div key={item.id} className="pantry-row">
                  <span className="pantry-row__name">{item.ingredientName}</span>
                  <span className={item.lowFlag ? 'pill pill--warn' : 'pill pill--ok'}>
                    {item.lowFlag ? 'Low stock' : 'Stocked'}
                  </span>
                  <button
                    className={item.lowFlag ? 'btn btn--sm btn--accent' : 'btn btn--sm btn--ghost'}
                    onClick={() => toggleLowFlag(item)}
                  >
                    {item.lowFlag ? 'Marked low' : 'Mark low'}
                  </button>
                  <button className="icon-btn" title="Edit" onClick={() => openEditForm(item)}>
                    ✎
                  </button>
                  <button className="icon-btn" title="Delete" onClick={() => setDeleteTarget(item)}>
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <p className="empty-note">
              Marking an item low adds it to the grocery list's restock section.
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}