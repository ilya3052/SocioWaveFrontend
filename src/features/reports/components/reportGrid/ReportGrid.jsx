// src/components/reports/ReportsGrid.jsx
import React from 'react';

import styles from './ReportGrid.module.css';
import ReportCard from "../reportCard/ReportCard.jsx";

const ReportsGrid = () => {
    const reports = [
        { title: "Разработка_лайф.TG.23-10-2025.pdf", platform: "TG", date: "23.10.2025" },
        { title: "Маркетинг_про.VK.20-10-2025.pdf", platform: "VK", date: "20.10.2025" },
        { title: "Tech_Новости.TG.17-10-2025.pdf", platform: "TG", date: "17.10.2025" },
        { title: "Аналитика_продаж.TG.15-10-2025.pdf", platform: "TG", date: "15.10.2025" },
        { title: "SMM_стратегия.VK.10-10-2025.pdf", platform: "VK", date: "10.10.2025" },
    ];

    return (
        <div className={styles.reportsResults}>
            <div className={styles.resultsHeader}>
                <div className={styles.resultsCount}>
                    Найдено <strong>16</strong> отчётов — показано <strong>1–10</strong>
                </div>
            </div>

            <div className={styles.reportsGrid}>
                {reports.map((report, index) => (
                    <ReportCard
                        key={index}
                        title={report.title}
                        platform={report.platform}
                        date={report.date}
                    />
                ))}
            </div>
        </div>
    );
};

export default ReportsGrid;