import React, {useEffect, useState} from 'react';
import styles from './compareGroups.module.css';
import CompareColumn from '../../components/compareRow/compareColumn.jsx';
import useCompareStore from "../../../../store/compareStore.js";
import {useNavigate} from "react-router-dom";
import {API_VERSION, BASE_URL, verifyAndRefreshToken} from "../../../../utils/utils.js";


const CompareGroups = () => {
    const compareIds = useCompareStore(state => state.compareIds);
    const navigate = useNavigate();

    const [groupsData, setGroupsData] = useState([]);

    const [error, setError] = useState('');

    const handleGroupsDataForCompare = async () => {
        let token = localStorage.getItem("access_token");
        if (!token) {
            if (!(await verifyAndRefreshToken())) {
                navigate("/login");
                return [];
            }
            return [];
        }
        token = localStorage.getItem("access_token");
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
                console.log(res)
                if ('error' in res) {
                    setError(res.error);
                    setGroupsData([]);
                    return
                }
                setGroupsData(res)
            }
        ).catch(
            e => console.log(e)
        )
    }, [navigate, compareIds]);

    if (error) {
        return <div className={styles.container}>{error}</div>
    }

    if (!groupsData || groupsData.length === 0) {
        return <div className={styles.container}>Загрузка или нет данных для сравнения...</div>
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
                        <tr>
                            <td className={styles.featureCell}>Графики</td>
                            {groupsData.map(group => (
                                <td key={group.id} className={styles.chartPlaceholder}>доступно в файловой версии отчета</td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className={styles.actions}>
                <button className={styles.btnExport}>Экспорт в PDF</button>
            </div>
        </div>
    );
};

export default CompareGroups;