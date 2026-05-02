import React, {useEffect, useState} from 'react';
import styles from './summaryInfo.module.css';
import ResultCard from "../../components/resultCard/resultCard.jsx";
import SearchFilters from "../../components/searchFilters/searchFilters.jsx";
import {useNavigate} from "react-router-dom";
import {API_VERSION, BASE_URL, sendForDebug, verifyAndRefreshToken} from "../../../../utils/utils.js";


const SummaryInfo = () => {

    const [groupsData, setGroupsData] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                let token = localStorage.getItem("access_token");
                if (!token) {
                    if (!(await verifyAndRefreshToken())) {
                        navigate("/login");
                        return;
                    }
                    return;
                }
                const params = new URLSearchParams({exclude_fields: 'user_id,user,platform_id,service_account_id'});
                const res = await fetch(`${BASE_URL}/${API_VERSION}/social-entities/groups/?${params}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        "Authorization": `Bearer ${token}`
                    }
                });
                if (!res.ok) {
                    const err = await res.text();
                    console.log(err);
                    await sendForDebug(err);
                    return
                }
                const data = await res.json();
                setGroupsData(data);
            }
            catch (e) {
                await sendForDebug(e);
                console.log(e);
            }
        }
        fetchGroups();
    }, [navigate]);

    return (
        <div className={styles.siteContainer}>
            <section className={styles.searchSection}>
                <div className={styles.searchCompactRow}>
                    <SearchFilters/>

                    <input
                        type="text"
                        className={styles.searchInput}
                        placeholder="Введите название группы или ключевые слова..."
                    />

                    <button className={styles.searchBtn}>Найти</button>
                </div>
            </section>

            <section className={styles.resultsSection}>
                <div className={styles.resultsHeader}>
                    <div className={styles.resultsCount}>Найдено групп: {groupsData.length}</div>
                </div>

                <div className={styles.resultsGrid}>
                    {groupsData.map((group) => {
                        console.log(group);
                        return <ResultCard
                            key={group.id}
                            id={group.id}
                            platform={group.platform.alias}
                            title={group.name}
                            detailsLink={group.slug}
                            stats={group.abs_stats}
                        />
                    })}
                    {/*<ResultCard*/}
                    {/*    platform="TG"*/}
                    {/*    title="IT Новости"*/}
                    {/*    stats="очень полезный текст с информацией о группе"*/}
                    {/*    detailsLink="group.html"*/}
                    {/*/>*/}
                    {/*<ResultCard*/}
                    {/*    platform="VK"*/}
                    {/*    title="Маркетинг Pro"*/}
                    {/*    stats="очень полезный текст с информацией о группе"*/}
                    {/*/>*/}
                    {/*<ResultCard*/}
                    {/*    platform="TG"*/}
                    {/*    title="Дизайн и Креатив"*/}
                    {/*    stats="очень полезный текст с информацией о группе"*/}
                    {/*/>*/}
                    {/*<ResultCard*/}
                    {/*    platform="TG"*/}
                    {/*    title="Дизайн и Креатив"*/}
                    {/*    stats="очень полезный текст с информацией о группе"*/}
                    {/*/>*/}
                </div>
            </section>
        </div>
    );
};

export default SummaryInfo;