import React, {useEffect, useState} from 'react';

import styles from './ReportsPage.module.css';
import SearchFilters from "../../components/searchFilters/SearchFilters.jsx";
import ReportsGrid from "../../components/reportGrid/ReportGrid.jsx";
import Pagination from "../../components/pagination/Pagination.jsx";
import {API_VERSION, BASE_URL, verifyAndRefreshToken} from "../../../../utils/utils.js";
import {useNavigate} from "react-router-dom";
import toast from "react-hot-toast";

const PAGE_SIZE = 5;

const ReportsPage = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [currentPageResults, setCurrentPageResults] = useState([]);
    const [totalCount, setTotalCount] = useState(0);

    const [platform, setPlatform] = useState('all');
    const [reportType, setReportType] = useState('all');
    const [format, setFormat] = useState('all');
    const [period, setPeriod] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [fetchTrigger, setFetchTrigger] = useState(0);

    const navigate = useNavigate();

    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    const buildQuery = (page) => {
        const params = new URLSearchParams();
        params.set('page', page);
        if (platform !== 'all') params.set('platform', platform);
        if (reportType !== 'all') params.set('report_type', reportType);
        if (format !== 'all') params.set('report_format', format);
        if (period !== 'all') params.set('period', period);
        if (searchQuery) params.set('search', searchQuery);
        return params.toString();
    };

    const fetchReports = async (page = 1) => {
        if (!(await verifyAndRefreshToken())) {
            navigate("/login");
            return;
        }
        const token = localStorage.getItem("access_token");

        const response = await fetch(`${BASE_URL}/${API_VERSION}/reports/?${buildQuery(page)}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
        if (response.ok) {
            return await response.json();
        }
        throw new Error(await response.json());
    }

    useEffect(() => {
        fetchReports(currentPage)
            .then(
                res => {
                    setTotalCount(res.count);
                    setCurrentPageResults(res.results);
                }
        ).catch(
            () => toast.error('Ошибка при загрузке отчётов')
        );
    }, [currentPage, fetchTrigger, navigate]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleSearch = () => {
        setCurrentPage(1);
        setFetchTrigger(prev => prev + 1);
    };

    return (
        <section className={styles.reportsSection}>
            <SearchFilters
                platform={platform}
                reportType={reportType}
                format={format}
                period={period}
                searchQuery={searchQuery}
                setPlatform={setPlatform}
                setFormat={setFormat}
                setPeriod={setPeriod}
                setReportType={setReportType}
                setSearchQuery={setSearchQuery}
                onSearch={handleSearch}
            />
            <ReportsGrid reports={currentPageResults} totalCount={totalCount} />
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />
        </section>
    );
};

export default ReportsPage;