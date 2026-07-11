import { useEffect, useState } from 'react';
import {
    listIngredients,
    createIngredient,
    updateIngredient,
    deleteIngredient,
    type IngredientItem,
} from '../api/ingredients';
import { ApiError } from '../api/client';
import { IngredientForm } from '../components/IngredientForm';
import { ConfirmDialog } from '../components/ConfirmDialog';

function messageFor(err: unknown): string {
    if (err instanceof ApiError) {
        const detail = (err.body as { detail?: unknown })?.detail;
        if (typeof detail === 'string') return detail;
        if (Array.isArray(detail)) return detail.map((d) => d.msg ?? JSON.stringify(d)).join('; ');
        return `Request failed (${err.status})`;
    }
    return 'Something went wrong. Check that the backend is running.';
}

export function Ingredients() {
    const [ingredients, setIngredients] = useState<IngredientItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [formOpen, setFormOpen] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [editingItem, setEditingItem] = useState<IngredientItem | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<IngredientItem | null>(null);

    useEffect(() => {
        listIngredients()
            .then(setIngredients)
            .catch(() => setError('Could not load ingredients.'))
            .finally(() => setLoading(false));
    }, []);

    const filtered = ingredients.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));

    const byAisle = new Map<string, IngredientItem[]>();
    filtered.forEach((i) => {
        const list = byAisle.get(i.aisle) ?? [];
        list.push(i);
        byAisle.set(i.aisle, list);
    });

    function openAddForm() {
        setEditingItem(null);
        setFormError(null);
        setFormOpen(true);
    }

    function openEditForm(item: IngredientItem) {
        setEditingItem(item);
        setFormError(null);
        setFormOpen(true);
    }

    function handleSave(data: { name: string; aisle: string }) {
        setFormError(null);
        const promise = editingItem
            ? updateIngredient(editingItem.id, data)
            : createIngredient(data);

        promise
            .then((saved) => {
                setIngredients((prev) =>
                    editingItem ? prev.map((i) => (i.id === saved.id ? saved : i)) : [...prev, saved]
                );
                setFormOpen(false);
            })
            .catch((err) => setFormError(messageFor(err)));
    }

    function handleDelete(id: string) {
        setIngredients((prev) => prev.filter((i) => i.id !== id));
        deleteIngredient(id).catch(() => {
            listIngredients().then(setIngredients);
        });
    }

    return (
        <div className="page">
            <div className="page__header page__header--row">
                <div>
                    <h1>Ingredients</h1>
                    <p className="page__subtitle">Master ingredient list, grouped by aisle.</p>
                </div>
                <button className="btn btn--accent" onClick={openAddForm}>
                    + Add ingredient
                </button>
            </div>

            <div className="toolbar">
                <input
                    className="input"
                    placeholder="Search ingredients…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {loading && <p className="empty-note">Loading ingredients…</p>}
            {error && <p className="empty-note">{error}</p>}

            {formOpen && (
                <IngredientForm
                    initial={editingItem ?? undefined}
                    error={formError}
                    onSave={handleSave}
                    onCancel={() => setFormOpen(false)}
                />
            )}

            {deleteTarget && (
                <ConfirmDialog
                    title="Delete ingredient"
                    message={`Delete "${deleteTarget.name}"? This can't be undone.`}
                    onConfirm={() => {
                        handleDelete(deleteTarget.id);
                        setDeleteTarget(null);
                    }}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}

            {!loading && !error && (
                <>
                    {byAisle.size === 0 && <p className="empty-note">No ingredients yet.</p>}
                    {Array.from(byAisle.entries()).map(([aisle, list]) => (
                        <div key={aisle} className="grocery-aisle">
                            <div className="grocery-aisle__label">{aisle}</div>
                            <div className="pantry-list">
                                {list.map((item) => (
                                    <div key={item.id} className="pantry-row">
                                        <span className="pantry-row__name">{item.name}</span>
                                        <button className="icon-btn" title="Edit" onClick={() => openEditForm(item)}>
                                            ✎
                                        </button>
                                        <button className="icon-btn" title="Delete" onClick={() => setDeleteTarget(item)}>
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </>
            )}
        </div>
    );
}