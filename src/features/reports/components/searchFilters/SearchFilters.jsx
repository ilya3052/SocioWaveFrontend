import React from 'react';
import styles from './SearchFilters.module.css';

const SearchFilters = ({
                           platform,
                           reportType,
                           format,
                           period,
                           searchQuery,
                           setPlatform,
                           setReportType,
                           setFormat,
                           setPeriod,
                           setSearchQuery,
                           onSearch,
                       }) => {
    return (
        <section className={styles.searchSection}>
            <div className={styles.searchRow}>
                <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Введите название отчёта или ключевые слова..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && onSearch()}
                />
                <button className={styles.searchBtn} onClick={onSearch}>Найти</button>
            </div>

            <div className={styles.filtersRow}>
                <div className={styles.filtersInline}>
                    <div className={styles.filterGroup}>
                        <div className={styles.filterTitle}>Платформа</div>
                        <select className={styles.filterSelect} value={platform}
                                onChange={e => setPlatform(e.target.value)}>
                            <option value="all">Все платформы</option>
                            <option value="tg">Telegram</option>
                            <option value="vk">VK</option>
                        </select>
                    </div>

                    <div className={styles.filterGroup}>
                        <div className={styles.filterTitle}>Тип отчёта</div>
                        <select className={styles.filterSelect} value={reportType}
                                onChange={e => setReportType(e.target.value)}>
                            <option value="all">Все типы</option>
                            <option value="by_group">По группе</option>
                            <option value="comparative">Сравнительный</option>
                        </select>
                    </div>

                    <div className={styles.filterGroup}>
                        <div className={styles.filterTitle}>Формат</div>
                        <select className={styles.filterSelect} value={format}
                                onChange={e => setFormat(e.target.value)}>
                            <option value="all">Все форматы</option>
                            <option value="pdf">PDF</option>
                            <option value="xlsx">XLSX</option>
                        </select>
                    </div>

                    <div className={styles.filterGroup}>
                        <div className={styles.filterTitle}>Период</div>
                        <select className={styles.filterSelect} value={period}
                                onChange={e => setPeriod(e.target.value)}>
                            <option value="day">За последний день</option>
                            <option value="week">За последнюю неделю</option>
                            <option value="month">За последний месяц</option>
                            <option value="year">За последний год</option>
                            <option value="all">За все время</option>
                        </select>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SearchFilters;