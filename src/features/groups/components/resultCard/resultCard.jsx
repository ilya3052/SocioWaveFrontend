import React from 'react';
import styles from './ResultCard.module.css';
import {Link} from "react-router-dom";
import {REDIRECT_URL} from "../../../../utils/utils.js";

const ResultCard = ({
                        id,
                        platform,
                        title,
                        stats,
                        detailsLink = "#",
                        isSelected,
                        onToggleCompare
                    }) => {
    const isTg = platform.toLowerCase() === 'tg';

    const lastUpdatedAt = new Date(stats.last_updated_at);
    const time = lastUpdatedAt.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });


    return (
        <div className={styles.resultCard}>
            <div className={styles.cardHeader}>
        <span className={`${styles.platformBadge} ${isTg ? styles.platformTg : styles.platformVk}`}>
          {platform.toUpperCase()}
        </span>
                <div className={styles.cardTitle}>{title}</div>
                <label className={styles.compareToggle}>
                    <input
                        type="checkbox"
                        className={styles.compareCheckbox}
                        checked={isSelected}
                        onChange={() => onToggleCompare(id)}
                    />
                    <span className={styles.compareLabel}>Сравнить</span>
                </label>
            </div>
            <div className={styles.cardStats}>
                <span>Подписчики: {stats.participants_count}</span>
                <span>Лайки: {stats.likes_count}</span>
                <span>Комментарии: {stats.comms_count}</span>
                <span>Репосты: {stats.repost_count}</span>
                <span>Просмотры: {stats.views_count}</span>
            </div>
            <div className={styles.cardMeta}>
                <span className={styles.statsUpdated}>обновлено {time}</span>
            </div>
            <div className={styles.cardActions}>
                <Link to={`${REDIRECT_URL}/groups/${detailsLink}`}
                   className={styles.detailsLink}>Подробнее</Link>
            </div>
        </div>
    );
};

export default ResultCard;