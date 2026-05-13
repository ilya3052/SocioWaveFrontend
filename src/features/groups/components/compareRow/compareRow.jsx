import React from 'react';
import styles from './compareRow.module.css';

const CompareRow = ({
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
        <tr className={styles.row}>
            <td>
                <a href={detailsLink} className={styles.groupLink} target={"_blank"}>{name}</a>
            </td>
            <td>
                <span className={`${styles.platformBadge} ${platform === 'TG' ? styles.tg : styles.vk}`}>
                    {platform}
                </span>
            </td>
            <td>{dateAdded}</td>
            <td>{subscribers}</td>
            <td>{likes}</td>
            <td>{comments}</td>
            <td>{views}</td>
            <td>{reposts}</td>
            <td>{postsCount}</td>
            <td className={`${styles.growth} ${isPositive ? styles.positive : ''} ${isNegative ? styles.negative : ''}`}>
                {isPositive ? '+' : ''}{growth}
            </td>
            <td className={styles.chartPlaceholder}>доступно в PDF версии отчета</td>
        </tr>
    );
};

export default CompareRow;