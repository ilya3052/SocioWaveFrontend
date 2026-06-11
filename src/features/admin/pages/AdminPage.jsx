import React, {useEffect, useState} from "react";
import styles from "./AdminPage.module.css";

import GroupsStats from "../components/groupsStats/GroupStats.jsx";
import AccountsStats from "../components/accountStats/AccountStats.jsx";
import LoadStats from "../components/loadStats/LoadStats.jsx";
import {useNavigate} from "react-router-dom";
import {API_VERSION, BASE_URL, verifyAndRefreshToken} from "../../../utils/utils.js";

const AdminPage = () => {

    const navigate = useNavigate();

    const [groupStats, setGroupStats] = useState({vk_count: null, tg_count: null});
    const [accountStats, setAccountStats] = useState({vk_count: null, tg_count: null});
    const [isSaving, setIsSaving] = useState(false);
    const [loadStats, setLoadStats] = useState({
        min: {id: null, name: null, count: null},
        max: {id: null, name: null, count: null}
    });

    useEffect(() => {
        let isMounted = true;
        const abortController = new AbortController();

        const fetchSummaryInfo = async () => {
            if (!(await verifyAndRefreshToken())) {
                navigate("/login");
                return;
            }
            const token = localStorage.getItem("access_token");
            try {
                const res = await fetch(`${BASE_URL}/${API_VERSION}/admin/summary/`, {
                    method: 'GET',
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    signal: abortController.signal
                });
                if (res.ok && isMounted) {
                    const data = await res.json();
                    console.log(data);
                    setGroupStats(data.group_info);
                    setAccountStats(data.service_account_info);
                    setLoadStats(data.service_account_loading_info);
                }
            } catch (err) {
                if (err.name !== 'AbortError' && isMounted) {
                    console.log(err);
                }
            }
        };
        fetchSummaryInfo();
        return () => {
            isMounted = false;
            abortController.abort();
        };
    }, [navigate]);

    const saveReport = async (reportType) => {
        setIsSaving(true);
        try {
            if (!(await verifyAndRefreshToken())) {
                navigate("/login");
                return;
            }
            const token = localStorage.getItem("access_token");
            const res = await fetch(`${BASE_URL}/${API_VERSION}/reports/admin/`, {
                method: 'POST',
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({type: reportType.toUpperCase()})
            });
            if (res.ok) {
                const data = await res.json();
                console.log(data);
                window.open(data, '_blank');
            }
        } finally {
            setIsSaving(false);
        }
    }


    return (
        <main className={styles.adminContainer}>
            <GroupsStats stats={groupStats}/>
            <AccountsStats stats={accountStats}/>
            <LoadStats stats={loadStats} groupStats={groupStats}/>

            <div className={styles.saveBtnContainer}>
                <button
                    className={`${styles.saveBtn} ${isSaving ? styles.saving : ''}`}
                    onClick={async () => await saveReport('xlsx')}
                    disabled={isSaving}
                >
                    {isSaving ? 'Загрузка...' : 'Сохранить в Excel'}
                </button>
                <button
                    className={`${styles.saveBtn} ${isSaving ? styles.saving : ''}`}
                    onClick={async () => await saveReport('pdf')}
                    disabled={isSaving}
                >
                    {isSaving ? 'Загрузка...' : 'Сохранить в PDF'}
                </button>
            </div>
        </main>
    );
};

export default AdminPage;