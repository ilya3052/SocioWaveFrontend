import React from 'react';

import styles from './ReportsPage.module.css';
import SearchFilters from "../../components/searchFilters/SearchFilters.jsx";
import ReportsGrid from "../../components/reportGrid/ReportGrid.jsx";
import Pagination from "../../components/pagination/Pagination.jsx";

const ReportsPage = () => {
    return (
        <section className={styles.reportsSection}>
            <SearchFilters />
            <ReportsGrid />
            <Pagination />
        </section>
    );
};

export default ReportsPage;