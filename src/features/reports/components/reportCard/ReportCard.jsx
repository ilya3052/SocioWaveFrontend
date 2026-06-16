import React from 'react';
import styles from './ReportCard.module.css';

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}.${mm}.${yyyy}`;
};

const ReportCard = ({filename, platform, date, format, link}) => {
    return (
        <div className={styles.reportCard}>
            <div className={styles.reportInfo}>
                <div className={styles.reportTitle}>{filename}</div>
                <div className={styles.reportMeta}>
                    <span className={`${styles.platformBadge} ${platform === '-' ? styles.platformNone : styles[`platform-${platform?.toLowerCase()}`]}`}>
                        {platform}
                    </span>
                    <span className={styles.typeBadge}>{format}</span>
                    <span className={styles.reportDate}>{formatDate(date)}</span>
                </div>
            </div>
            <button onClick={() => window.open(link, '_blank')} className={styles.downloadLink}>Скачать</button>
        </div>
    );
};

export default ReportCard;