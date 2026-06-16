import React from "react";
import styles from "./LoadStats.module.css";

const LoadStats = ({stats, groupStats}) => {
    const account_with_minimum_usage = stats.min;
    const account_with_maximum_usage = stats.max;
    const total_groups_count = groupStats.vk_count + groupStats.tg_count;

    const min_usage_acc_loading_percentage = (total_groups_count === 0 ? 0 : (account_with_minimum_usage.count / total_groups_count) * 100).toFixed(2);
    const max_usage_acc_loading_percentage = (total_groups_count === 0 ? 0 : (account_with_maximum_usage.count / total_groups_count) * 100).toFixed(2);

    const getStyleByPercentage = (percentage) => {
        if (percentage < 33) {
            return styles.low;
        } else if (percentage >= 33 && percentage <= 66) {
            return styles.medium;
        } else {
            return styles.high;
        }
    };

    return (
        <section className={styles.adminSection}>
            <h2>Нагрузка сервисных аккаунтов</h2>

            <div className={styles.loadStats}>
                <div className={styles.loadCard}>
                    <h3>Минимальная нагрузка</h3>

                    <div className={styles.accountInfo}>
                        <span className={styles.accountName}>{account_with_minimum_usage.name}</span>
                        <span
                            className={`${styles.loadPercentage} ${getStyleByPercentage(min_usage_acc_loading_percentage)}`}>{min_usage_acc_loading_percentage}%</span>
                    </div>

                    <div className={styles.loadDetails}>
                        {account_with_minimum_usage.count} групп из {total_groups_count} подключенных
                    </div>
                </div>

                <div className={styles.loadCard}>
                    <h3>Максимальная нагрузка</h3>

                    <div className={styles.accountInfo}>
                        <span className={styles.accountName}>{account_with_maximum_usage.name}</span>
                        <span
                            className={`${styles.loadPercentage} ${getStyleByPercentage(max_usage_acc_loading_percentage)}`}>
              {max_usage_acc_loading_percentage}%
            </span>
                    </div>

                    <div className={styles.loadDetails}>
                        {account_with_maximum_usage.count} групп из {total_groups_count} подключенных
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LoadStats;