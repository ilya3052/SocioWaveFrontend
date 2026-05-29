// src/components/reports/ReportCard.jsx
import React from 'react';
import styles from './ReportCard.module.css';

const ReportCard = ({ title, platform, date }) => {
    return (
        <div className={styles.reportCard}>
            <div className={styles.reportTitle}>{title}</div>
            <div className={styles.reportMeta}>
        <span className={`${styles.platformBadge} ${styles[`platform-${platform.toLowerCase()}`]}`}>
          {platform}
        </span>
                <span className={styles.reportDate}>{date}</span>
            </div>
            <a href="#" className={styles.downloadLink}>📥 Скачать</a>
        </div>
    );
};

export default ReportCard;