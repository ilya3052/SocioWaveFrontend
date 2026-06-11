import styles from './groups.module.css';
import {API_VERSION, BASE_URL, sendForDebug, verifyAndRefreshToken} from "../../../../utils/utils.js";
import {useEffect, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import GroupCard from "../groupCard/groupCard.jsx";


const GroupsTab = () => {

    const navigate = useNavigate();

    const [groups, setGroups] = useState([]);

    const handleDelete = async (groupID) => {
        try {
            if (!(await verifyAndRefreshToken())) {
                navigate("/login");
                return;
            }
            const token = localStorage.getItem("access_token");
            const res = await fetch(`${BASE_URL}/${API_VERSION}/social-entities/groups/${groupID}/`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                }
            });
            if (res.status === 204) {
                window.location.reload();
            }
        } catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        const getGroups = async () => {
            if (!(await verifyAndRefreshToken())) {
                navigate("/login");
                return;
            }
            const token = localStorage.getItem("access_token");
            try {
                return await fetch(`${BASE_URL}/${API_VERSION}/social-entities/groups/?exclude_fields=abs_stats`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });
            } catch (err) {
                console.log(err);
            }
        };

        const fetchGroupData = async () => {
            if (!(await verifyAndRefreshToken())) {
                navigate("/login");
                return;
            }
            const token = localStorage.getItem("access_token");

            try {
                const response = await getGroups(token);

                if (response.ok) {
                    const data = await response.json();
                    await sendForDebug(data)
                    setGroups(data);

                }
            } catch (err) {
                console.error("Ошибка при загрузке пользовательских данных:", err);
            }
        };

        fetchGroupData();
    }, [navigate]);

    return (
        <div className={styles.tabContent}>
            <div className={styles.groupsHeader}>
                <h3>Мои группы</h3>
                <Link to="/profile/groups/add" className={styles.addGroup}>
                    Добавить группу
                </Link>
            </div>

            {/* Сетка с карточками групп */}
            <div className={styles.groupsGrid}>
                {groups.length > 0 ? (
                    groups.map(group => (
                        <GroupCard
                            key={group.id}
                            group={group}
                            onDelete={handleDelete}
                        />
                    ))
                ) : (
                    <p className={styles.noGroups}>
                        У вас пока нет подключённых групп.<br/>
                        Нажмите «Добавить группу», чтобы начать.
                    </p>
                )}
            </div>
        </div>
    );
};

export default GroupsTab;