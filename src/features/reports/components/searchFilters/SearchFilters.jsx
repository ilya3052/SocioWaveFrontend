// src/components/reports/SearchFilters.jsx
import React from 'react';
import styles from './SearchFilters.module.css';

const SearchFilters = () => {
    return (
        <section className={styles.searchSection}>
            <div className={styles.searchCompactRow}>
                <div className={styles.filtersInline}>
                    {/* Платформа */}
                    <div className={styles.filterGroup}>
                        <div className={styles.filterTitle}>Платформа</div>
                        <select className={styles.platformSelect}>
                            <option value="all">Все платформы</option>
                            <option value="tg">Telegram</option>
                            <option value="vk">VK</option>
                        </select>
                    </div>

                    {/* Период */}
                    <div className={styles.filterGroup}>
                        <div className={styles.filterTitle}>Период</div>
                        <select className={styles.periodSelect}>
                            <option value="day">За последний день</option>
                            <option value="week">За последнюю неделю</option>
                            <option value="month" selected>За последний месяц</option>
                            <option value="year">За последний год</option>
                            <option value="all">За все время</option>
                        </select>
                    </div>
                </div>

                <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Введите название отчёта или ключевые слова..."
                />

                <button className={styles.searchBtn}>Найти</button>
            </div>
        </section>
    );
};

export default SearchFilters;