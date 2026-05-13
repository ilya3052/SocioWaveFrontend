import React from 'react';
import styles from './compareColumn.module.css';

const CompareColumn = ({
    name,
    platform,
    dateAdded,
    subscribers,
    likes,
    comments,
    views,
    reposts,
    postsCount,
    growth,
    detailsLink = "#"
}) => {
    const isPositive = growth > 0;
    const isNegative = growth < 0;

    return (
        <td className={styles.column}>
            <div className={styles.header}>
                <a href={detailsLink} className={styles.groupLink}>{name}</a>
                <span className={`${styles.platformBadge} ${platform === 'TG' ? styles.tg : styles.vk}`}>
                    {platform}
                </span>
            </div>
            <div className={styles.cell}>{dateAdded}</div>
            <div className={styles.cell}>{subscribers}</div>
            <div className={styles.cell}>{likes}</div>
            <div className={styles.cell}>{comments}</div>
            <div className={styles.cell}>{views}</div>
            <div className={styles.cell}>{reposts}</div>
            <div className={styles.cell}>{postsCount}</div>
            <div className={`${styles.cell} ${isPositive ? styles.positive : ''} ${isNegative ? styles.negative : ''}`}>
                {isPositive ? '+' : ''}{growth}
            </div>
            <div className={`${styles.cell} ${styles.chartPlaceholder}`}>доступно в файловой версии отчета</div>
        </td>
    );
};

export default CompareColumn;