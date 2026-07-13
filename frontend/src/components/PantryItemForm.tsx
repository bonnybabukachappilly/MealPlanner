import { useEffect, useState } from 'react';
import type { PantryEntry, TrackType } from '../types';
import { createIngredient, listEmptyPantryIngredients, type IngredientItem } from '../api/ingredients';
import { ApiError } from '../api/client';
import type { PantryFormData } from '../api/pantry';

function ingredientErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    const detail = (err.body as { detail?: unknown })?.detail;
    if (typeof detail === 'string') return detail;
    return `Request failed (${err.status})`;
  }
  return 'Could not create ingredient.';
}

export function PantryItemForm({
  initial,
  error,
  onSave,
  onCancel,
}: {
  initial?: PantryEntry;
  error?: string | null;
  onSave: (data: PantryFormData) => void;
  onCancel: () => void;
}) {
  const [ingredients, setIngredients] = useState<IngredientItem[]>([]);
  const [ingredientsLoading, setIngredientsLoading] = useState(true);
  const [ingredientsError, setIngredientsError] = useState<string | null>(null);
  const [ingredientId, setIngredientId] = useState(initial?.ingredientId ?? '');
  const [trackType, setTrackType] = useState<TrackType>(initial?.trackType ?? 'quantity');
  const [quantity, setQuantity] = useState(initial?.quantity?.toString() ?? '');
  const [unit, setUnit] = useState(initial?.unit ?? '');
  const [quantityThreshold, setQuantityThreshold] = useState(
    initial?.quantityThreshold?.toString() ?? ''
  );
  const [expiryDate, setExpiryDate] = useState(initial?.expiryDate ?? '');
  const [expiryDateThreshold, setExpiryDateThreshold] = useState(
    initial?.expiryDateThreshold?.toString() ?? ''
  );
  const selectedIngredient = ingredients.find((i) => i.id === ingredientId);

  // "+ New ingredient" shortcut state
  const [addingIngredient, setAddingIngredient] = useState(false);
  const [newIngredientName, setNewIngredientName] = useState('');
  const [newIngredientAisle, setNewIngredientAisle] = useState('');
  const [newIngredientUnit, setNewIngredientUnit] = useState('');
  const [newIngredientError, setNewIngredientError] = useState<string | null>(null);
  const [newIngredientSaving, setNewIngredientSaving] = useState(false);


  useEffect(() => {
    listEmptyPantryIngredients()
      .then((list) => {
        setIngredients(list);
        setIngredientId((prev) => prev || (list[0]?.id ?? ''));
      })
      .catch(() => setIngredientsError('Could not load ingredients.'))
      .finally(() => setIngredientsLoading(false));
  }, []);

  useEffect(() => {
    if (selectedIngredient) {
      setUnit(selectedIngredient.unit);
    }
  }, [selectedIngredient?.id]);

  function openNewIngredient() {
    setNewIngredientName('');
    setNewIngredientAisle('');
    setNewIngredientUnit('');
    setNewIngredientError(null);
    setAddingIngredient(true);
  }

  function handleCreateIngredient(e: React.FormEvent) {
    e.preventDefault();
    setNewIngredientError(null);
    setNewIngredientSaving(true);

    createIngredient({
      name: newIngredientName, aisle: newIngredientAisle,
      unit: newIngredientUnit
    })
      .then((created) => {
        setIngredients((prev) => [...prev, created]);
        setIngredientId(created.id);
        setAddingIngredient(false);
      })
      .catch((err) => setNewIngredientError(ingredientErrorMessage(err)))
      .finally(() => setNewIngredientSaving(false));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      ingredientId,
      trackType,
      quantity: quantity ? Number(quantity) : undefined,
      unit: unit || undefined,
      quantityThreshold: quantityThreshold ? Number(quantityThreshold) : undefined,
      expiryDate: expiryDate || undefined,
      expiryDateThreshold: expiryDateThreshold ? Number(expiryDateThreshold) : undefined,
      lowFlag: initial?.lowFlag ?? false,
    });
  }

  const canSubmit = initial ? true : Boolean(ingredientId);

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h2>{initial ? 'Edit pantry item' : 'Add pantry item'}</h2>

        <label className="form-field">
          Ingredient
          {initial ? (
            // Backend's update endpoint doesn't accept a new ingredient_id,
            // so this is display-only when editing.
            <input className="input" value={initial.ingredientName} disabled />
          ) : ingredientsLoading ? (
            <input className="input" value="Loading ingredients…" disabled />
          ) : (
            <div className="pantry-ingredient-picker">
              {ingredients.length === 0 ? (
                <input className="input" value="No ingredients yet — add one below" disabled />
              ) : (
                <select
                  className="input"
                  value={ingredientId}
                  onChange={(e) => setIngredientId(e.target.value)}
                  required
                >
                  {ingredients.map((ing) => (
                    <option key={ing.id} value={ing.id}>
                      {ing.name} ({ing.aisle})
                    </option>
                  ))}
                </select>
              )}
              {!addingIngredient && (
                <button type="button" className="link-btn" onClick={openNewIngredient}>
                  + New ingredient
                </button>
              )}
            </div>
          )}
        </label>

        {!initial && addingIngredient && (
          <div className="pantry-new-ingredient">
            <label className="form-field">
              New ingredient name
              <input
                className="input"
                value={newIngredientName}
                onChange={(e) => setNewIngredientName(e.target.value)}
                autoFocus
              />
            </label>
            <label className="form-field">
              Aisle
              <input
                className="input"
                value={newIngredientAisle}
                onChange={(e) => setNewIngredientAisle(e.target.value)}
              />
            </label>
            <label className="form-field">
              Unit
              <select
                className="input"
                value={newIngredientUnit}
                onChange={(e) => setNewIngredientUnit(e.target.value)}
              >
                <option value="">Select unit…</option>
                <option value="g">g (mass)</option>
                <option value="ml">ml (volume)</option>
                <option value="pc">pc (count)</option>
              </select>
            </label>
            {newIngredientError && <p className="form-error">{newIngredientError}</p>}
            <div className="pantry-new-ingredient__actions">
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => setAddingIngredient(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn--accent btn--sm"
                disabled={!newIngredientName.trim() || !newIngredientAisle.trim() || newIngredientSaving}
                onClick={handleCreateIngredient}
              >
                {newIngredientSaving ? 'Saving…' : 'Add ingredient'}
              </button>
            </div>
          </div>
        )}

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
              <input
                className="input"
                value={unit}
                disabled
                required
              />
            </label>
            <label className="form-field">
              Low stock threshold
              <input
                className="input"
                type="number"
                value={quantityThreshold}
                onChange={(e) => setQuantityThreshold(e.target.value)}
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

        {(error || ingredientsError) && <p className="form-error">{error ?? ingredientsError}</p>}

        <div className="modal__actions">
          <button type="button" className="btn btn--ghost" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn--accent" disabled={!canSubmit}>
            Save
          </button>
        </div>
      </form>
    </div>
  );
}