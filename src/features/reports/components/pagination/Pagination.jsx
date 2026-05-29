// src/components/reports/Pagination.jsx
import React from 'react';
import styles from './Pagination.module.css';

const Pagination = () => {
    return (
        <div className={styles.pagination}>
            <button className={styles.pageBtn}>← Предыдущая</button>
            <button className={`${styles.pageBtn} ${styles.active}`}>1</button>
            <button className={styles.pageBtn}>2</button>
            <button className={styles.pageBtn}>3</button>
            <button className={styles.pageBtn}>Следующая →</button>
        </div>
    );
};

export default Pagination;