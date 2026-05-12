import React, {useEffect, useState} from 'react';
import styles from './summaryInfo.module.css';
import ResultCard from "../../components/resultCard/resultCard.jsx";
import SearchFilters from "../../components/searchFilters/searchFilters.jsx";
import {useNavigate} from "react-router-dom";
import {API_VERSION, BASE_URL, sendForDebug, verifyAndRefreshToken} from "../../../../utils/utils.js";


const SummaryInfo = () => {

    const [groupsData, setGroupsData] = useState([]);

    const navigate = useNavigate();

    const [platform, setPlatform] = useState("ALL");
    const [minParticipants, setMinParticipants] = useState(-1);
    const [maxParticipants, setMaxParticipants] = useState(-1);
    const [sortBy, setSortBy] = useState("subscribers_desc");
    const [searchQuery, setSearchQuery] = useState("");
    
    const fetchGroups = async (filters) => {
        let token = localStorage.getItem("access_token");
        if (!token) {
            if (!(await verifyAndRefreshToken())) {
                navigate("/login");
                return;
            }
            return;
        }
        let url = `${BASE_URL}/${API_VERSION}/social-entities/groups/?exclude_fields=users_ids,users,platform_id,service_account_id`;
        if (filters) {
            url = url.concat('&').concat(filters.toString())
        }
        console.log(url);
        const res = await fetch(url, {
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
        console.log(data);
        return data;
    }

    useEffect(() => {
        fetchGroups().then(
            data => {setGroupsData(data)}
        ).catch(
            e => console.log(e)
        );
    }, [navigate]);

    const handleSearch = () => {
        const filters = new URLSearchParams();
        console.log(platform)
        if (platform !== "ALL") filters.append("platform", platform);
        if (minParticipants && minParticipants > -1) filters.append("min_participants", minParticipants);
        if (maxParticipants && maxParticipants > -1) filters.append("max_participants", maxParticipants);
        if (searchQuery && searchQuery.trim().length > 0) filters.append("q", searchQuery.trim());
        let url = `${BASE_URL}/${API_VERSION}/social-entities/groups/?exclude_fields=users_ids,users,platform_id,service_account_id`;

        console.log(url);
        fetchGroups(filters.toString()).then(
            data => {setGroupsData(data)}
        ).catch(
            e => console.log(e)
        );
    }
    useEffect(() => {
        switch (sortBy) {
            case 'subscribers_desc':
                groupsData.sort((a, b) => b.abs_stats.participants_count - a.abs_stats.participants_count);
                break;
            case 'subscribers_asc':
                groupsData.sort((a, b) => a.abs_stats.participants_count - b.abs_stats.participants_count);
                break;
            case 'name_desc':
                groupsData.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'name_asc':
                groupsData.sort((a, b) => a.name.localeCompare(b.name));
                break;
            default:
                break;
        }
    }, [groupsData, sortBy]);

    return (
        <div className={styles.siteContainer}>
            <section className={styles.searchSection}>
                <div className={styles.searchCompactRow}>
                    <SearchFilters setPlatform={setPlatform} setMinParticipants={setMinParticipants}
                                   setMaxParticipants={setMaxParticipants} setSortBy={setSortBy}
                                   platform={platform} sortBy={sortBy}
                                   minParticipants={minParticipants > -1 ? minParticipants : ''}
                                   maxParticipants={maxParticipants > -1 ? maxParticipants : ''}/>
                    
                    <input
                        type="text"
                        className={styles.searchInput}
                        placeholder="Введите название группы или ключевые слова..."
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />

                    <button className={styles.searchBtn} onClick={handleSearch}>Найти</button>
                </div>
            </section>

            <section className={styles.resultsSection}>
                <div className={styles.resultsHeader}>
                    <div className={styles.resultsCount}>Найдено групп: {groupsData.length}</div>
                </div>

                <div className={styles.resultsGrid}>
                    {groupsData.map((group) => {
                        return <ResultCard
                            key={group.id}
                            id={group.id}
                            platform={group.platform.alias}
                            title={group.name}
                            detailsLink={group.slug}
                            stats={group.abs_stats}
                        />
                    })}
                </div>
            </section>
        </div>
    );
};

export default SummaryInfo;