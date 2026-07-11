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
    onSave: (data: { name: string; aisle: string }) => void;
    onCancel: () => void;
}) {
    const [name, setName] = useState(initial?.name ?? '');
    const [aisle, setAisle] = useState(initial?.aisle ?? '');

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        onSave({ name, aisle });
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