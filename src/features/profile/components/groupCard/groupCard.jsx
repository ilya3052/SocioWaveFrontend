import React from 'react';
import styles from './groupCard.module.css';

const GroupCard = ({group, onDelete}) => {

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const getPlatformBadge = (platformName) => {
        const name = platformName.toLowerCase();

        if (name.includes('telegram') || name.includes('pl')) {
            return {label: 'TG', className: styles.platformTg};
        }
        if (name.includes('vk') || name.includes('вконтакте')) {
            return {label: 'VK', className: styles.platformVk};
        }

        return {
            label: platformName.slice(0, 2).toUpperCase(),
            className: styles.platformOther
        };
    };

    const {label, className} = getPlatformBadge(group.platform.name);

    return (
        <div className={styles.groupCard}>
            <div className={styles.groupInfo}>
                <div className={styles.groupNamePlatform}>
                    <span className={styles.groupName}>{group.name}</span>
                </div>
                <div className={styles.groupDate}>
                    Подключена: {formatDate(group.added_at)}
                </div>
            </div>

            <div className={styles.groupActions}>
                <span className={`${styles.platformBadge} ${className}`}>
                    {label}
                </span>
                <button
                    className={styles.deleteGroupBtn}
                    onClick={() => onDelete(group.id)}
                    title="Удалить группу"
                >
                    🗑
                </button>
            </div>
        </div>
    );
};

export default GroupCard;