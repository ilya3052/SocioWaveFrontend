import React from 'react';
import styles from './Pagination.module.css';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pages = [];
        const delta = 2;
        const left = Math.max(2, currentPage - delta);
        const right = Math.min(totalPages - 1, currentPage + delta);

        pages.push(1);
        if (left > 2) pages.push('...');
        for (let i = left; i <= right; i++) pages.push(i);
        if (right < totalPages - 1) pages.push('...');
        if (totalPages > 1) pages.push(totalPages);

        return pages;
    };

    return (
        <div className={styles.pagination}>
            <button
                className={styles.arrowBtn}
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                aria-label="Предыдущая страница"
            >
                <FaChevronLeft />
            </button>

            {getPageNumbers().map((page, idx) =>
                page === '...' ? (
                    <span key={`ellipsis-${idx}`} className={styles.ellipsis}>...</span>
                ) : (
                    <button
                        key={page}
                        className={`${styles.pageBtn} ${page === currentPage ? styles.active : ''}`}
                        onClick={() => onPageChange(page)}
                    >
                        {page}
                    </button>
                )
            )}

            <button
                className={styles.arrowBtn}
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                aria-label="Следующая страница"
            >
                <FaChevronRight />
            </button>
        </div>
    );
};

export default Pagination;