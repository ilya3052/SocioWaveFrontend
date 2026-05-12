import React, {useState} from 'react';
import styles from './searchFilters.module.css';

const SearchFilters = ({
    setPlatform, setMinParticipants, setMaxParticipants, setSortBy,
    platform = 'ALL', sortBy = 'subscribers_desc',
    minParticipants = '', maxParticipants = ''
}) => {
    const [isRangeOpen, setIsRangeOpen] = useState(false);
    const [isPlatformOpen, setIsPlatformOpen] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);

    const platforms = [
        { value: 'ALL', label: 'Все платформы' },
        { value: 'TG', label: 'Telegram' },
        { value: 'VK', label: 'ВК' },
    ];

    const sortOptions = [
        { value: 'subscribers_desc', label: 'По убыванию' },
        { value: 'subscribers_asc', label: 'По возрастанию' },
        { value: 'name_asc', label: 'А-Я' },
        { value: 'name_desc', label: 'Я-А' },
    ];

    const normalizedPlatform = platform.toUpperCase();
    const currentPlatform = platforms.find(p => p.value === normalizedPlatform)?.label || 'Все платформы';
    const currentSort = sortOptions.find(s => s.value === sortBy)?.label || 'По убыванию';

    const hasMin = minParticipants !== '' && minParticipants !== undefined;
    const hasMax = maxParticipants !== '' && maxParticipants !== undefined;
    const formatValue = (val) => {
        const str = String(val);
        return str.length > 4 ? str.slice(0, 4) + '..' : str;
    };
    const rangeLabel = hasMin || hasMax
        ? `${hasMin ? `от ${formatValue(minParticipants)}` : ''}${hasMin && hasMax ? ' ' : ''}${hasMax ? `до ${formatValue(maxParticipants)}` : ''}`.trim()
        : 'Диапазон';

    return (
        <div className={styles.filtersInline}>
            <div className={styles.filterGroup}>
                <div className={styles.filterTitle}>Платформа</div>
                <div className={styles.dropdownWrapper}>
                    <button
                        className={`${styles.dropdownToggle} ${isPlatformOpen ? styles.dropdownToggleOpen : ''}`}
                        onClick={() => setIsPlatformOpen(!isPlatformOpen)}
                    >
                        {currentPlatform}
                        <span className={styles.arrow}>▼</span>
                    </button>
                    {isPlatformOpen && (
                        <div className={styles.dropdownContent}>
                            {platforms.map(opt => (
                                <div
                                    key={opt.value}
                                    className={styles.dropdownOption}
                                    onClick={() => {
                                        setPlatform(opt.value);
                                        setIsPlatformOpen(false);
                                    }}
                                >
                                    {opt.label}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.filterGroup}>
                <div className={styles.filterTitle}>Подписчики</div>
                <div className={styles.dropdownWrapper}>
                    <button
                        className={`${styles.dropdownToggle} ${isRangeOpen ? styles.dropdownToggleOpen : ''}`}
                        onClick={() => setIsRangeOpen(!isRangeOpen)}
                    >
                        {rangeLabel}
                        <span className={styles.arrow}>▼</span>
                    </button>
                    {isRangeOpen && (
                        <div className={styles.dropdownContent}>
                            <div className={styles.rangeInputs}>
                                <input
                                    type="number"
                                    className={styles.rangeInput}
                                    placeholder="От"
                                    value={minParticipants}
                                    onChange={e => setMinParticipants(e.target.value)}
                                />
                                <span>—</span>
                                <input
                                    type="number"
                                    className={styles.rangeInput}
                                    placeholder="До"
                                    value={maxParticipants}
                                    onChange={e => setMaxParticipants(e.target.value)}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.filterGroup}>
                <div className={styles.filterTitle}>Сортировка</div>
                <div className={styles.dropdownWrapper}>
                    <button
                        className={`${styles.dropdownToggle} ${isSortOpen ? styles.dropdownToggleOpen : ''}`}
                        onClick={() => setIsSortOpen(!isSortOpen)}
                    >
                        {currentSort}
                        <span className={styles.arrow}>▼</span>
                    </button>
                    {isSortOpen && (
                        <div className={styles.dropdownContent}>
                            {sortOptions.map(opt => (
                                <div
                                    key={opt.value}
                                    className={styles.dropdownOption}
                                    onClick={() => {
                                        setSortBy(opt.value);
                                        setIsSortOpen(false);
                                    }}
                                >
                                    {opt.label}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchFilters;