import { useState } from 'react';
import type { IngredientItem } from '../api/ingredients';

export function IngredientForm({
    initial,
    error,
    onSave,
    onCancel,
}: {
    initial?: IngredientItem;
    error?: string | null;
    onSave: (data: { name: string; unit: string; aisle: string }) => void;
    onCancel: () => void;
}) {
    const [name, setName] = useState(initial?.name ?? '');
    const [aisle, setAisle] = useState(initial?.aisle ?? '');
    const [unit, setUnit] = useState(initial?.unit ?? '');

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        onSave({ name, aisle, unit });
    }

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
                <h2>{initial ? 'Edit ingredient' : 'Add ingredient'}</h2>

                <label className="form-field">
                    Name
                    <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
                </label>

                <label className="form-field">
                    Aisle
                    <input className="input" value={aisle} onChange={(e) => setAisle(e.target.value)} required />
                </label>

                <label className="form-field">
                    Unit
                    <select className="input" value={unit} onChange={(e) => setUnit(e.target.value)} required>
                        <option value="">Select unit…</option>
                        <option value="g">g (mass)</option>
                        <option value="ml">ml (volume)</option>
                        <option value="pc">pc (count)</option>
                    </select>
                </label>

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