import React from 'react';

import styles from './ReportGrid.module.css';
import ReportCard from "../reportCard/ReportCard.jsx";

const ReportsGrid = ({reports = [], totalCount = 0}) => {
    return (
        <div className={styles.reportsResults}>
            <div className={styles.resultsHeader}>
                <div className={styles.resultsCount}>
                    Найдено <strong>{totalCount}</strong> отчётов — показано <strong>{reports.length}</strong>
                </div>
            </div>

            <div className={styles.reportsGrid}>
                {reports.map((report, index) => (
                    <ReportCard
                        key={index}
                        filename={report.filename}
                        platform={report.platform}
                        date={report.date}
                        link={report.relative_path}
                        format={report.format}
                    />
                ))}
            </div>
        </div>
    );
};

export default ReportsGrid;