import React, {useEffect, useState} from 'react';
import styles from './compareGroups.module.css';
import useCompareStore from "../../../../store/compareStore.js";
import {useNavigate} from "react-router-dom";
import {API_VERSION, BASE_URL, verifyAndRefreshToken} from "../../../../utils/utils.js";
import toast from "react-hot-toast";
import Loader from "../../../../components/loader/Loader.jsx";


const CompareGroups = () => {
    const compareIds = useCompareStore(state => state.compareIds);
    const navigate = useNavigate();

    const [groupsData, setGroupsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleGroupsDataForCompare = async () => {
        if (!(await verifyAndRefreshToken())) {
            navigate("/login");
            return;
        }
        const token = localStorage.getItem("access_token");
        const groupIdsStr = compareIds.join(',')
        let url = `${BASE_URL}/${API_VERSION}/social-entities/groups/compare/`;
        if (groupIdsStr) {
            url = url.concat(`?groups_ids=${groupIdsStr}`);
        }
        const res = await fetch(url,{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${token}`
            }
        });
        return await res.json()
    }

    useEffect(() => {
        handleGroupsDataForCompare().then(
            res => {
                if ('error' in res) {
                    setError(res.error);
                    setGroupsData([]);
                    return
                }
                setGroupsData(res)
            }
        ).catch(
            () => toast.error('Ошибка при загрузке данных для сравнения')
        ).finally(() => setLoading(false))
    }, [navigate, compareIds]);

    const saveReport = async (reportType) => {
        setIsSaving(true);
        try {
            if (!(await verifyAndRefreshToken())) {
                navigate("/login");
                return;
            }
            const token = localStorage.getItem("access_token");
            const groupIdsStr = compareIds.join(',')
            let url = `${BASE_URL}/${API_VERSION}/reports/compare/`;
            if (groupIdsStr) {
                url = url.concat(`?groups_ids=${groupIdsStr}`);
            }
            url = url.concat(`&type=${reportType.toUpperCase()}`);
            const res = await fetch(url, {
                method: 'GET',
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            if (res.ok) {
                const data = await res.json();
                window.open(`${window.location.origin}/${data}`, '_blank');
            }
        } finally {
            setIsSaving(false);
        }
    }

    if (loading) {
        return <Loader text="Загрузка данных для сравнения..." fullPage/>;
    }

    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.emptyState}>
                    <div className={styles.emptyStateTitle}>Ошибка загрузки</div>
                    <div className={styles.emptyStateText}>{error}</div>
                </div>
            </div>
        );
    }

    if (!groupsData || groupsData.length === 0) {
        return (
            <div className={styles.container}>
                <div className={styles.emptyState}>
                    <div className={styles.emptyStateTitle}>Нет данных для сравнения</div>
                    <div className={styles.emptyStateText}>
                        Добавьте группы в список сравнения на главной странице, затем вернитесь сюда.
                    </div>
                </div>
            </div>
        );
    }

    const formatNumber = (num) => {
        return new Intl.NumberFormat('ru-RU').format(num);
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Сравнение групп</h1>
                <p className={styles.subtitle}>Выбрано групп: {groupsData.length}</p>
            </header>

            <div className={styles.tableWrapper}>
                <table className={styles.compareTable}>
                    <thead>
                        <tr>
                            <th className={styles.featureHeader}>Признак</th>
                            {groupsData.map(group => (
                                <th key={group.id} className={styles.groupHeader}>
                                    {group.name}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className={styles.featureCell}>Платформа</td>
                            {groupsData.map(group => (
                                <td key={group.id}>
                                    <span className={`${styles.platformBadge} ${group.platform.alias === 'TG' ? styles.tg : styles.vk}`}>
                                        {group.platform.alias}
                                    </span>
                                </td>
                            ))}
                        </tr>
                        <tr>
                            <td className={styles.featureCell}>Дата добавления</td>
                            {groupsData.map(group => (
                                <td key={group.id}>{new Date(group.added_at).toLocaleDateString('ru-RU')}</td>
                            ))}
                        </tr>
                        <tr>
                            <td className={styles.featureCell}>Подписчики</td>
                            {groupsData.map(group => (
                                <td key={group.id}>{formatNumber(group.abs_stats.participants_count)}</td>
                            ))}
                        </tr>
                        <tr>
                            <td className={styles.featureCell}>Лайки</td>
                            {groupsData.map(group => (
                                <td key={group.id}>{formatNumber(group.abs_stats.likes_count)}</td>
                            ))}
                        </tr>
                        <tr>
                            <td className={styles.featureCell}>Комментарии</td>
                            {groupsData.map(group => (
                                <td key={group.id}>{formatNumber(group.abs_stats.comms_count)}</td>
                            ))}
                        </tr>
                        <tr>
                            <td className={styles.featureCell}>Просмотры</td>
                            {groupsData.map(group => (
                                <td key={group.id}>{formatNumber(group.abs_stats.views_count)}</td>
                            ))}
                        </tr>
                        <tr>
                            <td className={styles.featureCell}>Репосты</td>
                            {groupsData.map(group => (
                                <td key={group.id}>{formatNumber(group.abs_stats.repost_count)}</td>
                            ))}
                        </tr>
                        <tr>
                            <td className={styles.featureCell}>Кол-во постов</td>
                            {groupsData.map(group => (
                                <td key={group.id}>{formatNumber(group.abs_stats.posts_count)}</td>
                            ))}
                        </tr>
                        <tr>
                            <td className={styles.featureCell}>Прирост за неделю</td>
                            {groupsData.map(group => (
                                <td key={group.id} className={group.increase > 0 ? styles.positive : group.increase < 0 ? styles.negative : ''}>
                                    {group.increase > 0 ? '+' : ''}{formatNumber(group.increase)}
                                </td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className={styles.saveBtnContainer}>
                <button
                    className={`${styles.btnExport} ${isSaving ? styles.saving : ''}`}
                    onClick={async () => await saveReport('xlsx')}
                    disabled={isSaving}
                >
                    {isSaving ? 'Загрузка...' : 'Сохранить в Excel'}
                </button>
                <button
                    className={`${styles.btnExport} ${isSaving ? styles.saving : ''}`}
                    onClick={async () => await saveReport('pdf')}
                    disabled={isSaving}
                >
                    {isSaving ? 'Загрузка...' : 'Сохранить в PDF'}
                </button></div>
        </div>
    );
};

export default CompareGroups;