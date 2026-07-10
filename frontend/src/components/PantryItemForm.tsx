import { useState } from 'react';
import type { InventoryItem, TrackType } from '../types';

type FormData = Partial<InventoryItem> & { itemName: string; trackType: TrackType };

export function PantryItemForm({
  initial,
  error,
  onSave,
  onCancel,
}: {
  initial?: InventoryItem;
  error?: string | null;
  onSave: (data: FormData) => void;
  onCancel: () => void;
}) {
  const [itemName, setItemName] = useState(initial?.itemName ?? '');
  const [trackType, setTrackType] = useState<TrackType>(initial?.trackType ?? 'quantity');
  const [quantity, setQuantity] = useState(initial?.quantity?.toString() ?? '');
  const [unit, setUnit] = useState(initial?.unit ?? '');
  const [lowStockThreshold, setLowStockThreshold] = useState(
    initial?.lowStockThreshold?.toString() ?? ''
  );
  const [expiryDate, setExpiryDate] = useState(initial?.expiryDate ?? '');
  const [expiryDateThreshold, setExpiryDateThreshold] = useState(
    initial?.expiryDateThreshold?.toString() ?? ''
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      itemName,
      trackType,
      quantity: quantity ? Number(quantity) : undefined,
      unit: unit || undefined,
      lowStockThreshold: lowStockThreshold ? Number(lowStockThreshold) : undefined,
      expiryDate: expiryDate || undefined,
      expiryDateThreshold: expiryDateThreshold ? Number(expiryDateThreshold) : undefined,
      lowFlag: initial?.lowFlag ?? false,
    });
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h2>{initial ? 'Edit item' : 'Add item'}</h2>

        <label className="form-field">
          Name
          <input className="input" value={itemName} onChange={(e) => setItemName(e.target.value)} required />
        </label>

        <label className="form-field">
          Track by
          <select
            className="input"
            value={trackType}
            onChange={(e) => setTrackType(e.target.value as TrackType)}
          >
            <option value="quantity">Quantity</option>
            <option value="expiry">Expiry</option>
            <option value="untrack">Untracked</option>
          </select>
        </label>

        {trackType === 'quantity' && (
          <>
            <label className="form-field">
              Quantity
              <input
                className="input"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </label>
            <label className="form-field">
              Unit
              <input className="input" value={unit} onChange={(e) => setUnit(e.target.value)} required />
            </label>
            <label className="form-field">
              Low stock threshold
              <input
                className="input"
                type="number"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value)}
                required
              />
            </label>
          </>
        )}

        {trackType === 'expiry' && (
          <>
            <label className="form-field">
              Expiry date
              <input
                className="input"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                required
              />
            </label>
            <label className="form-field">
              Flag when ≤ this many days left
              <input
                className="input"
                type="number"
                value={expiryDateThreshold}
                onChange={(e) => setExpiryDateThreshold(e.target.value)}
                required
              />
            </label>
          </>
        )}
        {error && <p className="form-error">{error}</p>}
        <div className="modal__actions">
          <button type="button" className="btn btn--ghost" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn--accent">
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
