import React from 'react';
import styles from './confirmModal.module.css';

const ConfirmModal = ({isOpen, onCancel, onConfirm, title, message, confirmText = "Да", cancelText = "Отмена"}) => {
    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onCancel}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                {title && <h3 className={styles.modalTitle}>{title}</h3>}
                {message && <p className={styles.modalMessage}>{message}</p>}
                <div className={styles.modalActions}>
                    <button
                        className={`${styles.modalBtn} ${styles.modalBtnCancel}`}
                        onClick={onCancel}
                    >
                        {cancelText}
                    </button>
                    <button
                        className={`${styles.modalBtn} ${styles.modalBtnConfirm}`}
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
