import { createPortal } from 'react-dom';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  /** Utilisé si `description` est absent */
  itemLabel?: string;
  /** Remplace le texte par défaut (suppression d’un élément) */
  description?: string;
  confirmLabel?: string;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemLabel,
  description,
  confirmLabel = 'Supprimer',
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
          {description ??
            `Êtes-vous sûr de vouloir supprimer « ${itemLabel ?? ''} » ? Cette action est irréversible.`}
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
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
