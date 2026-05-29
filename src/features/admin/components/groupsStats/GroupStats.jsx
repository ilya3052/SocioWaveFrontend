import React from "react";
import styles from "./GroupStats.module.css";
import PlatformChart from "../chart/chart.jsx";

const GroupsStats = (stats) => {
    const group_stats = stats.stats;
    const vk_count = group_stats.vk_count;
    const tg_count = group_stats.tg_count;
    const total_count = vk_count + tg_count;

    return (
        <section className={styles.adminSection}>
            <h2>Группы</h2>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>Всего групп подключено</div>
                    <div className={styles.statValue}>{total_count}</div>
                </div>
                <PlatformChart
                    groupStats={group_stats}
                />
            </div>
        </section>
    );
};

export default GroupsStats;