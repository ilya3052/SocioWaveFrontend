import React from 'react';
import styles from './searchFilters.module.css';

const SearchFilters = () => {
    return (
        <div className={styles.filtersInline}>
            <div className={styles.filterGroup}>
                <div className={styles.filterTitle}>Платформа</div>
                <select className={styles.platformSelect}>
                    <option value="all">Все платформы</option>
                    <option value="tg">Telegram</option>
                    <option value="vk">VK</option>
                </select>
            </div>

            <div className={styles.filterGroup}>
                <div className={styles.filterTitle}>Подписчики</div>
                <div className={styles.dropdownWrapper}>
                    <button className={styles.dropdownToggle}>Диапазон</button>
                    <div className={styles.dropdownContent}>
                        <div className={styles.rangeInputs}>
                            <input
                                type="number"
                                className={styles.rangeInput}
                                placeholder="От"
                            />
                            <span>—</span>
                            <input
                                type="number"
                                className={styles.rangeInput}
                                placeholder="До"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.filterGroup}>
                <div className={styles.filterTitle}>Сортировка</div>
                <select className={styles.sortSelect}>
                    <option value="subscribers_desc">По убыванию</option>
                    <option value="subscribers_asc">По возрастанию</option>
                    <option value="name_asc">А-Я</option>
                    <option value="name_desc">Я-А</option>
                </select>
            </div>
        </div>
    );
};

export default SearchFilters;