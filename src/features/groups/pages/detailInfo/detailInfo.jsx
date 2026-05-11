import React, {useEffect, useState, useRef} from 'react';
import styles from './detailInfo.module.css';
import TopPosts from "../../components/topPosts/topPosts.jsx";
import {useNavigate, useParams} from "react-router-dom";
import {API_VERSION, BASE_URL, sendForDebug, verifyAndRefreshToken} from "../../../../utils/utils.js";
import {Chart, registerables} from 'chart.js';

Chart.register(...registerables);

const DetailInfo = () => {
    const {slug} = useParams();
    const [groupData, setGroupData] = useState(null);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

    const [bestPostData, setBestPostData] = useState(null);

    const [dailyData, setDailyData] = useState(null);
    const [hourlyData, setHourlyData] = useState(null);

    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);
    const activityChartRef = useRef(null);
    const activityChartInstanceRef = useRef(null);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchGroupDetailData = async () => {
            let token = localStorage.getItem("access_token");
            if (!token) {
                if (!(await verifyAndRefreshToken())) {
                    navigate("/login");
                    return;
                }
                return;
            }
            token = localStorage.getItem("access_token");
            const res = await fetch(`${BASE_URL}/${API_VERSION}/social-entities/groups/${slug}/?exclude_fields=service_account_id,user,external_id,slug`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });
            if (res.ok) {
                return await res.json();
            }
            return await res.text();
        }

        const fetchGroupBestPosts = async (group_id) => {
            let token = localStorage.getItem("access_token");
            if (!token) {
                if (!(await verifyAndRefreshToken())) {
                    navigate("/login");
                    return;
                }
                return;
            }
            token = localStorage.getItem("access_token");
            const res = await fetch(`${BASE_URL}/${API_VERSION}/stats/${group_id}/best/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });
            if (res.ok) {
                return await res.json();
            }
        }

        const fetchSnapshotStatsData = async (group_id) => {
            let token = localStorage.getItem("access_token");
            if (!token) {
                if (!(await verifyAndRefreshToken())) {
                    navigate("/login");
                    return;
                }
                return;
            }
            token = localStorage.getItem("access_token");
            const res = await fetch(`${BASE_URL}/${API_VERSION}/stats/${group_id}/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });
            if (res.ok) {
                return await res.json();
            }
        }
        const daily = [];
        const hourly = [];

        fetchGroupDetailData().then(
            res => {
                setGroupData(res);
                fetchGroupBestPosts(res.id).then(
                    res => {
                        setBestPostData(res);
                    }
                ).catch(
                    async (e) => {
                        console.error(e);
                        await sendForDebug(e);
                    }
                );

                fetchSnapshotStatsData(res.id).then(
                    res => {
                        for (let i = 0; i < res.length; i++) {
                            if (res[i].type === 'DAILY') {
                                daily.push(res[i]);
                            }
                            else if (res[i].type === 'HOURLY') {
                                hourly.push(res[i]);
                            }
                        }
                        setDailyData(daily);
                        setHourlyData(hourly);
                    }
                ).catch(
                    async (e) => {
                        console.error(e);
                        await sendForDebug(e);
                    }
                )
            }
        ).catch(
            async (e) => {
                console.error(e);
                await sendForDebug(e);
            }
        );

    }, [slug]);

    const stats = groupData?.abs_stats;
    useEffect(() => {
        if (!dailyData || !dailyData.length || !stats) return;

        const labels = [];

        const data = [];
        const currentParticipants = stats.participants_count;
        for (let i = dailyData.length - 1; i >= 0; i--) {
            const item = dailyData[i];

            const date = new Date(item.timestamp);
            labels.unshift(date.toLocaleDateString('ru-RU'));

            if (i === dailyData.length - 1) {
                data.unshift(currentParticipants);
            } else {
                const nextItem = dailyData[i + 1];
                const delta = nextItem.stats[0]?.participants_delta || 0;
                const prevParticipants = data[0] - delta;
                data.unshift(prevParticipants);
            }
        }

        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }

        const ctx = chartRef.current.getContext('2d');
        chartInstanceRef.current = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Подписчики',
                    data: data,
                    borderColor: '#2c5aa0',
                    backgroundColor: 'rgba(44, 90, 160, 0.1)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 4,
                    pointBackgroundColor: '#2c5aa0'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: '#e9ecef'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });

    }, [dailyData, stats]);

    useEffect(() => {
        if (!hourlyData || !hourlyData.length) return;

        const labels = hourlyData.map(item => {
            const date = new Date(item.timestamp);
            return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        });

        const likesData = hourlyData.map(item => item.stats[0]?.likes_count || 0);
        const viewsData = hourlyData.map(item => item.stats[0]?.views_count || 0);

        if (activityChartInstanceRef.current) {
            activityChartInstanceRef.current.destroy();
        }

        const ctx = activityChartRef.current.getContext('2d');
        activityChartInstanceRef.current = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Лайки',
                        data: likesData,
                        borderColor: '#e74c3c',
                        backgroundColor: 'rgba(231, 76, 60, 0.1)',
                        fill: true,
                        tension: 0.3,
                        pointRadius: 3,
                        pointBackgroundColor: '#e74c3c'
                    },
                    {
                        label: 'Просмотры',
                        data: viewsData,
                        borderColor: '#3498db',
                        backgroundColor: 'rgba(52, 152, 219, 0.1)',
                        fill: true,
                        tension: 0.3,
                        pointRadius: 3,
                        pointBackgroundColor: '#3498db'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#e9ecef'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });

    }, [hourlyData]);

    const handleDelete = async () => {
        let token = localStorage.getItem("access_token");
        if (!token) {
            if (!(await verifyAndRefreshToken())) {
                navigate("/login");
                return;
            }
            return;
        }
        token = localStorage.getItem("access_token");
        const res = await fetch(`${BASE_URL}/${API_VERSION}/social-entities/groups/${groupData.id}/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });
        if (res.status === 204) {
            setShowDeleteModal(false);
            navigate('/groups');
        }
        // Здесь будет fetch запрос на бэк
    };

    if (!groupData) {
        return <div>Загрузка...</div>;
    }


    const addedAt = new Date(groupData.added_at);
    const addedDate = addedAt.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    return (
        <main className={styles.groupInfoContainer}>
            <section className={styles.groupHeader}>
                <div className={styles.groupLogo}>
                    <img
                        src={groupData.photo_url}
                        alt="Логотип группы"
                        className={styles.logoImg}
                        onError={(e) => console.log(e)}
                    />
                </div>
                <div className={styles.groupNamePlatform}>
                    <h1 className={styles.groupName}>{groupData.name}</h1>
                    <span className={styles.groupPlatform}>{groupData.platform.alias}</span>
                </div>
                <div className={styles.groupActions}>
                    <button
                        className={`${styles.actionBtn} ${styles.delete}`}
                        onClick={() => setShowDeleteModal(true)}
                    >
                        Удалить группу
                    </button>
                </div>
            </section>

            {/* Блок 2: общая информация */}
            <section className={styles.groupGeneralInfo}>
                <h2>Общая информация</h2>
                <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Описание:</span>
                    <div className={styles.infoValue}>
                        {groupData.description ? (
                            <>
                                {groupData.description.length > 150 && !isDescriptionExpanded
                                    ? `${groupData.description.slice(0, 150)}...`
                                    : groupData.description}
                                {groupData.description.length > 150 && (
                                    <button
                                        className={styles.expandBtn}
                                        onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                                    >
                                        {isDescriptionExpanded ? ' Свернуть' : ' Читать далее'}
                                    </button>
                                )}
                            </>
                        ) : (
                            <span className={styles.noData}>Описание отсутствует</span>
                        )}
                    </div>
                </div>
                <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Дата подключения к системе:</span>
                    <span className={styles.infoValue}>{addedDate}</span>
                </div>
            </section>

            <section className={styles.groupStats}>
                <h2>Статистика</h2>
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statValue}>{stats.posts_count}</div>
                        <div className={styles.statLabel}>Посты</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statValue}>{stats.participants_count}</div>
                        <div className={styles.statLabel}>Подписчики</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statValue}>{stats.likes_count}</div>
                        <div className={styles.statLabel}>Лайки</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statValue}>{stats.repost_count}</div>
                        <div className={styles.statLabel}>Репосты</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statValue}>{stats.comms_count}</div>
                        <div className={styles.statLabel}>Комментарии</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statValue}>—</div>
                        <div className={styles.statLabel}>Охваты</div>
                    </div>
                </div>

                <div className={styles.updateBtnContainer}>
                    <button className={styles.actionBtn}>Актуализировать информацию</button>
                </div>
            </section>

            {/* Блок 3.1: лучшие посты */}
            <TopPosts bestPosts={bestPostData}/>

            {/* Блок 4: графики */}
            <section className={styles.groupCharts}>
                <h2>Графики</h2>
                <div className={styles.chartsGrid}>
                    <div className={styles.chartCard}>
                        <h3>Рост подписчиков</h3>
                        {dailyData && dailyData.length ? (
                            <div className={styles.chartContainer}>
                                <canvas ref={chartRef}></canvas>
                            </div>
                        ) : (
                            <div className={styles.noData}>Нет данных для графика</div>
                        )}
                    </div>
                    <div className={styles.chartCard}>
                        <h3>Активность по часам (лайки и просмотры)</h3>
                        {hourlyData && hourlyData.length ? (
                            <div className={styles.chartContainer}>
                                <canvas ref={activityChartRef}></canvas>
                            </div>
                        ) : (
                            <div className={styles.noData}>Нет данных для графика</div>
                        )}
                    </div>
                </div>
            </section>

            {/* Модальное окно удаления */}
            {showDeleteModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h3>Подтверждение удаления</h3>
                        <p>Вы уверены, что хотите удалить группу "{groupData.name}"?</p>
                        <div className={styles.modalActions}>
                            <button
                                className={`${styles.modalBtn} ${styles.modalBtnCancel}`}
                                onClick={() => setShowDeleteModal(false)}
                            >
                                Отмена
                            </button>
                            <button
                                className={`${styles.modalBtn} ${styles.modalBtnConfirm}`}
                                onClick={handleDelete}
                            >
                                Да
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Кнопка сохранить */}
            <div className={styles.saveBtnContainer}>
                <button className={styles.saveBtn}>Сохранить в PDF</button>
            </div>
        </main>
    );
};

export default DetailInfo;