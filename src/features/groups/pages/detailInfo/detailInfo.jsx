import React, {useEffect, useState} from 'react';
import styles from './detailInfo.module.css';
import TopPosts from "../../components/topPosts/topPosts.jsx";
import {useNavigate, useParams} from "react-router-dom";
import {API_VERSION, BASE_URL, sendForDebug, verifyAndRefreshToken} from "../../../../utils/utils.js";

const DetailInfo = () => {
    const {slug} = useParams();
    console.log(slug);
    const [groupData, setGroupData] = useState();

    const navigate = useNavigate();

    useEffect(() => {
        const fetchGroupDetailData = async () => {
            console.log('fetch')
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
                console.log(await res.json())
                return await res.json();
            }
            console.log(await res.text())
            return await res.text();
        }
        fetchGroupDetailData().then(
            res => {
                console.log(res);
                setGroupData(res);
            }
        ).catch(
            async (e) => {
                console.error(e);
                await sendForDebug(e);
            }
        )
    }, [navigate, slug]);
    console.log(groupData);
    const stats = groupData.abs_stats;
    // abs_stats
    //     :
    // {id: 1, likes_count: 0, views_count: 17, participants_count: 1, repost_count: 0, …}
    // added_at
    //     :
    //     "2026-04-28T20:25:12.926992Z"
    // id
    //     :
    //     8
    // link
    //     :
    //     "https://vk.ru/public193824248"
    // name
    //     :
    //     "Бан"
    // platform
    //     :
    // {id: 2, name: 'Вконтакте', alias: 'VK'}
    return (
        <main className={styles.groupInfoContainer}>
            <section className={styles.groupHeader}>
                <div className={styles.groupNamePlatform}>
                    <h1 className={styles.groupName}>{groupData.name}</h1>
                    <span className={styles.groupPlatform}>{groupData.platform.alias}</span>
                </div>
                <div className={styles.groupActions}>
                    <button className={`${styles.actionBtn} ${styles.delete}`}>Удалить группу</button>
                </div>
            </section>

            {/* Блок 2: общая информация */}
            <section className={styles.groupGeneralInfo}>
                <h2>Общая информация</h2>
                <p className={styles.groupDescription}>
                    Это пример описания группы. Здесь будет отображаться информация о
                    тематике группы и её особенностях.
                </p>
                <p className={styles.groupJoined}>Дата подключения к системе: 23.10.2025</p>
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
            <TopPosts/>

            {/* Блок 4: графики */}
            <section className={styles.groupCharts}>
                <h2>Графики</h2>
                <div className={styles.chartsGrid}>
                    <div className={styles.chartCard}>
                        <h3>Рост подписчиков</h3>
                        <canvas id="chart-subscribers"></canvas>
                    </div>
                    <div className={styles.chartCard}>
                        <h3>Активность по часам (лайки и просмотры)</h3>
                        <canvas id="chart-activity"></canvas>
                    </div>
                </div>
            </section>

            {/* Кнопка сохранить */}
            <div className={styles.saveBtnContainer}>
                <button className={styles.saveBtn}>Сохранить в PDF</button>
            </div>
        </main>
    );
};

export default DetailInfo;