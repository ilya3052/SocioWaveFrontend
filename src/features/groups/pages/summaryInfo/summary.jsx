import React, {useEffect, useState} from 'react';
import styles from './summaryInfo.module.css';
import ResultCard from "../../components/resultCard/resultCard.jsx";
import SearchFilters from "../../components/searchFilters/searchFilters.jsx";
import {useNavigate} from "react-router-dom";
import {API_VERSION, BASE_URL, sendForDebug, verifyAndRefreshToken} from "../../../../utils/utils.js";
import toast from "react-hot-toast";
import useCompareStore from "../../../../store/compareStore.js";


const SummaryInfo = () => {

    const [groupsData, setGroupsData] = useState([]);
    const [filteredGroups, setFilteredGroups] = useState([]);
    const navigate = useNavigate();

    const [platform, setPlatform] = useState("ALL");
    const [minParticipants, setMinParticipants] = useState(-1);
    const [maxParticipants, setMaxParticipants] = useState(-1);
    const [sortBy, setSortBy] = useState("subscribers_desc");
    const [searchQuery, setSearchQuery] = useState("");

    const compareIds = useCompareStore(state => state.compareIds);
    const toggleCompareId = useCompareStore(state => state.toggleCompareId);

    const handleToggleCompare = (id) => {
        if (!compareIds.includes(id) && compareIds.length >= 12) {
            toast.error('Максимум 12 групп для сравнения');
            return;
        }
        toggleCompareId(id);
    };

    const [currentState, setCurrentState] = useState({
        "platform": platform,
        "minParticipants": minParticipants,
        "maxParticipants": maxParticipants,
        "sortBy": sortBy
    })

    const fetchGroups = async (filters) => {
        if (!(await verifyAndRefreshToken())) {
            navigate("/login");
            return;
        }
        const token = localStorage.getItem("access_token");
        let url = `${BASE_URL}/${API_VERSION}/social-entities/groups/all/?exclude_fields=users_ids,users,platform_id,service_account_id`;
        if (filters) {
            url = url.concat('&').concat(filters.toString())
        }
        const res = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${token}`
            }
        });
        if (!res.ok) {
            const err = await res.text();
            await sendForDebug(err);
            return
        }
        return await res.json();
    }

    useEffect(() => {
        fetchGroups().then(
            data => {setGroupsData(data)}
        ).catch(
            () => toast.error('Ошибка при загрузке групп')
        );
    }, [navigate]);

    const handleSearch = () => {
        const filters = new URLSearchParams();
        if (searchQuery && searchQuery.trim().length > 0) filters.append("q", searchQuery.trim());

        fetchGroups(filters.toString()).then(
            data => {setGroupsData(data)}
        ).catch(
            () => toast.error('Ошибка при поиске групп')
        );
    }

    const handleFilter = () => {
        setCurrentState(prevState => ({
            ...prevState,
            "platform": platform,
            "minParticipants": minParticipants,
            "maxParticipants": maxParticipants,
            "sortBy": sortBy
        }));
    };

    useEffect(() => {
        const filtered = groupsData.filter(group => {
            if (currentState.platform !== 'ALL' && group.platform.alias !== currentState.platform) {
                return false;
            }

            const count = group.abs_stats.participants_count;
            if (currentState.minParticipants && currentState.minParticipants > -1 && count < currentState.minParticipants) return false;
            if (currentState.maxParticipants && currentState.maxParticipants > -1 && count > currentState.maxParticipants) return false;

            return true;
        });

        switch (currentState.sortBy) {
            case 'subscribers_desc':
                filtered.sort((a, b) => b.abs_stats.participants_count - a.abs_stats.participants_count);
                break;
            case 'subscribers_asc':
                filtered.sort((a, b) => a.abs_stats.participants_count - b.abs_stats.participants_count);
                break;
            case 'name_desc':
                filtered.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'name_asc':
                filtered.sort((a, b) => a.name.localeCompare(b.name));
                break;
            default:
                break;
        }

        setFilteredGroups(filtered);
    }, [currentState, groupsData]);

    return (
        <div className={styles.siteContainer}>
            <section className={styles.searchSection}>
                <div className={styles.searchRow}>
                    <input
                        type="text"
                        className={styles.searchInput}
                        placeholder="Введите название группы или ключевые слова..."
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button className={styles.searchBtn} onClick={handleSearch}>Найти</button>
                </div>

                <div className={styles.filtersRow}>
                    <SearchFilters setPlatform={setPlatform} setMinParticipants={setMinParticipants}
                                   setMaxParticipants={setMaxParticipants} setSortBy={setSortBy}
                                   platform={platform} sortBy={sortBy}
                                   minParticipants={minParticipants > -1 ? minParticipants : ''}
                                   maxParticipants={maxParticipants > -1 ? maxParticipants : ''}/>
                    <button className={styles.applyBtn} onClick={handleFilter}>Применить</button>
                </div>
            </section>

            <section className={styles.resultsSection}>
                <div className={styles.resultsHeader}>
                    <div className={styles.resultsCount}>Найдено групп: {filteredGroups.length}</div>
                </div>

                <div className={styles.resultsGrid}>
                    {filteredGroups.map((group) => {
                        return <ResultCard
                            key={group.id}
                            id={group.id}
                            platform={group.platform.alias}
                            title={group.name}
                            detailsLink={group.slug}
                            stats={group.abs_stats}
                            isSelected={compareIds.includes(group.id)}
                            onToggleCompare={handleToggleCompare}
                        />
                    })}
                </div>
            </section>
        </div>
    );
};

export default SummaryInfo;