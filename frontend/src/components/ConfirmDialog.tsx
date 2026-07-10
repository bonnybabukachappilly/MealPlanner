export function ConfirmDialog({
    title,
    message,
    confirmLabel = 'Delete',
    onConfirm,
    onCancel,
}: {
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h2>{title}</h2>
                <p className="empty-note">{message}</p>
                <div className="modal__actions">
                    <button className="btn btn--ghost" onClick={onCancel}>
                        Cancel
                    </button>
                    <button className="btn btn--danger" onClick={onConfirm}>
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}