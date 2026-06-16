import React, {useState} from 'react';
import styles from './OutlierAlert.module.css';


const OutlierAlert = ({postData}) => {
    const [expanded, setExpanded] = useState(false);

    if (postData === null || postData === undefined) {
        return null;
    }

    if (Array.isArray(postData)) {
        if (postData.length !== 0) {
            return (
                <section className={styles.outlierAlertOk}>
                    <div className={styles.outlierAlertOkBody}>
                        <div className={styles.outlierAlertOkTitle}>Выделяющихся постов нет</div>
                        <div className={styles.outlierAlertOkText}>
                            Все посты в рамках нормы — сильных отклонений не обнаружено.
                        </div>
                    </div>
                </section>
            );
        }

        return (
            <section className={styles.outlierAlert}>
                <div className={styles.outlierAlertIcon}>!</div>
                <div className={styles.outlierAlertBody}>
                    <div className={styles.outlierAlertHeader}>
                        <div className={styles.outlierAlertTitle}>Обнаружены выделяющиеся посты</div>
                        <button
                            className={styles.outlierAlertToggle}
                            onClick={() => setExpanded(prev => !prev)}
                        >
                            {postData.length} {expanded ? '▲' : '▼'}
                        </button>
                    </div>
                    {expanded && (
                        <p className={styles.outlierAlertExpandedText}>
                            Посты, чьи метрики отклоняются от средних значений по группе.
                        </p>
                    )}
                    {expanded && (
                        <div className={styles.outlierAlertChips}>
                            {postData.map((post, index) => (
                                <a
                                    key={post.id || index}
                                    className={styles.outlierAlertChip}
                                    href={post.link || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    #{post.id || index + 1}
                                </a>
                            ))}
                        </div>
                    )}
                    {expanded && (
                        <p className={styles.outlierAlertDisclaimer}>
                            Данные носят ознакомительный характер и не претендуют на истину в последней инстанции,
                            настоятельно рекомендуем проверять их!
                        </p>
                    )}
                </div>
            </section>
        );
    }

    let errorCause = null;
    if (typeof postData === 'object' && 'error_cause' in postData) {
        errorCause = postData.error_cause;
    } else if (typeof postData === 'string') {
        try {
            console.log(postData)
            const parsed = JSON.parse(postData);
            errorCause = parsed.error_cause;
        } catch {
            const match = postData.match(/['"]error_cause['"]\s*:\s*['"]([^'"]+)['"]/);
            if (match) {
                errorCause = match[1];
            }
        }
    }

    const messages = {
        model: {title: 'Модели ещё не обучены', text: 'Модели еще не обучены, попробуйте позже'},
        post_stats: {title: 'Данные о постах не собраны', text: 'Данные о постах еще не собраны'},
        group: {title: 'Ошибка загрузки данных группы', text: 'Ошибка при загрузке данных для группы'},
        post_stats_collected: {title: 'Выявление отклонений пока недоступно', text: 'Выявление отклонений пока недоступно, попробуйте позже'},
    };

    const msg = messages[errorCause] || {title: 'Неизвестная ошибка', text: 'Произошла неизвестная ошибка'};
    const isWarning = errorCause === 'post_stats_collected';

    return (
        <section className={`${styles.outlierAlert} ${isWarning ? '' : styles.outlierAlertError}`}>
            <div className={styles.outlierAlertIcon}>!</div>
            <div className={styles.outlierAlertBody}>
                <div className={styles.outlierAlertTitle}>{msg.title}</div>
                <div className={styles.outlierAlertText}>{msg.text}</div>
            </div>
        </section>
    );
};

export default OutlierAlert;
