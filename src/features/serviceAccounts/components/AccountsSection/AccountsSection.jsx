import React, {useState} from 'react';
import styles from './AccountsSection.module.css';
import AccountCard from '../AccountCard/AccountCard';
import Pagination from '../Pagination/Pagination';

const ITEMS_PER_PAGE = 3;

const AccountsSection = ({title, count, accounts, onDeleteAccount, onActivateAccount, sectionType}) => {
    const [currentPage, setCurrentPage] = useState(1);

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedAccounts = accounts.slice(startIndex, endIndex);

    const totalPages = Math.ceil(accounts.length / ITEMS_PER_PAGE);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const accountsCount = accounts.length;

    return (
        <section className={`${styles.accountsSection} ${styles[sectionType]}`}>
            <div className={styles.sectionHeader}>
                <div className={styles.sectionInfo}>
                    <h2>{title}</h2>
                    <span className={styles.accountsCount}>{count}</span>
                </div>
            </div>

            <div className={styles.accountsList}>
                {paginatedAccounts.map((account) => (
                    <AccountCard
                        key={account.id}
                        account={account}
                        onDelete={onDeleteAccount}
                        onActivate={onActivateAccount}
                        platform={sectionType}
                        accountsCount={accountsCount}
                    />
                ))}
            </div>

            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            )}
        </section>
    );
};

export default AccountsSection;

