import React from 'react';
import styles from './AccountCard.module.css';

const AccountCard = ({account, onDelete, onActivate, platform, accountsCount}) => {
    const getLoadColor = (percentage) => {
        if (percentage <= 33) return styles.loadLow;
        if (percentage <= 66) return styles.loadMedium;
        return styles.loadHigh;
    };


    return (
        <div className={styles.accountCard}>
            <div className={styles.accountInfo}>
                <span className={styles.accountName}>{account.name}</span>
            </div>
            {account.is_activated ? <>
                <div className={styles.accountGroups}>{account.groups_count} групп</div>
                <div className={styles.accountLoad}>

                    <span className={`${styles.loadPercentage} ${getLoadColor(account.load.toFixed(2))}`}>
                        { (account.load % 1 === 0) ? account.load : account.load.toFixed(2) }%
                    </span>
                    <div className={styles.loadBar}>
                        <div
                            className={`${styles.loadFill} ${getLoadColor(account.load.toFixed(2))}`}
                            style={{width: `${account.load.toFixed(2)}%`}}
                        ></div>
                    </div>
                </div>
            </> : <span className={styles.notActivated}>не активирован</span>}

            <div className={styles.actions}>
                {account.is_activated ? (
                    <span className={styles.statusActive}>
                        <span>●</span> активен
                    </span>
                ) : (
                    <button
                        className={`${styles.actionLink} ${styles.activateLink}`}
                        onClick={() => onActivate(account.id)}
                    >
                        активировать
                    </button>
                )}
                {accountsCount > 1 && <button
                    className={`${styles.actionLink} ${styles.deleteLink}`}
                    onClick={() => onDelete(account.id, platform)}
                >
                    удалить
                </button>}
            </div>
        </div>
    );
};

export default AccountCard;
