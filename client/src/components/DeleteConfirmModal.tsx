import { createPortal } from 'react-dom';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  itemLabel: string;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemLabel,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return createPortal(
    <div
      className="delete-confirm-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-confirm-title"
      onClick={onClose}
    >
      <div className="delete-confirm-modal__content" onClick={(e) => e.stopPropagation()}>
        <h3 id="delete-confirm-title" className="delete-confirm-modal__title">
          {title}
        </h3>
        <p className="delete-confirm-modal__text">
          Êtes-vous sûr de vouloir supprimer &laquo; {itemLabel} &raquo; ? Cette action est irréversible.
        </p>
        <div className="delete-confirm-modal__actions">
          <button
            type="button"
            className="delete-confirm-modal__btn delete-confirm-modal__btn--cancel"
            onClick={onClose}
          >
            Annuler
          </button>
          <button
            type="button"
            className="delete-confirm-modal__btn delete-confirm-modal__btn--confirm"
            onClick={handleConfirm}
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
