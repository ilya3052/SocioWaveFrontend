import styles from './groups.module.css';
import {API_VERSION, BASE_URL, sendForDebug, verifyAndRefreshToken} from "../../../../utils/utils.js";
import {useEffect, useState, useCallback} from "react";
import {Link, useNavigate} from "react-router-dom";
import GroupCard from "../groupCard/groupCard.jsx";
import ConfirmModal from "../../../../components/confirmModal/ConfirmModal.jsx";
import toast from "react-hot-toast";


const GroupsTab = () => {

    const navigate = useNavigate();

    const [groups, setGroups] = useState([]);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchGroups = useCallback(async () => {
        if (!(await verifyAndRefreshToken())) {
            navigate("/login");
            return;
        }
        const token = localStorage.getItem("access_token");
        try {
            const response = await fetch(`${BASE_URL}/${API_VERSION}/social-entities/groups/all?exclude_fields=abs_stats`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            if (response.ok) {
                const data = await response.json();
                setGroups(data);
            }
        } catch (err) {
            toast.error('Ошибка при загрузке групп');
        } finally {
            setIsLoading(false);
        }
    }, [navigate]);

    const handleDeleteClick = (groupID) => {
        setDeleteTarget(groupID);
    }

    const confirmDelete = async () => {
        try {
            if (!(await verifyAndRefreshToken())) {
                navigate("/login");
                return;
            }
            const token = localStorage.getItem("access_token");
            const res = await fetch(`${BASE_URL}/${API_VERSION}/social-entities/groups/${deleteTarget}/`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                }
            });
            if (res.status === 204) {
                toast.success('Группа удалена');
                setDeleteTarget(null);
                setGroups(prev => prev.filter(g => g.id !== deleteTarget));
            } else {
                toast.error('Ошибка при удалении группы');
                setDeleteTarget(null);
            }
        } catch (err) {
            toast.error('Ошибка при удалении группы');
            setDeleteTarget(null);
        }
    }

    useEffect(() => {
        fetchGroups();
    }, [fetchGroups]);

    return (
        <div className={styles.tabContent}>
            <div className={styles.groupsHeader}>
                <h3>Мои группы</h3>
                <Link to="/profile/groups/add" className={styles.addGroup}>
                    Добавить группу
                </Link>
            </div>

            <div className={styles.groupsGrid}>
                {isLoading ? (
                    <p className={styles.noGroups}>Загрузка...</p>
                ) : groups.length > 0 ? (
                    groups.map(group => (
                        <GroupCard
                            key={group.id}
                            group={group}
                            onDelete={handleDeleteClick}
                        />
                    ))
                ) : (
                    <p className={styles.noGroups}>
                        У вас пока нет подключённых групп.<br/>
                        Нажмите «Добавить группу», чтобы начать.
                    </p>
                )}
            </div>

            <ConfirmModal
                isOpen={!!deleteTarget}
                onCancel={() => setDeleteTarget(null)}
                onConfirm={confirmDelete}
                title="Подтверждение удаления"
                message="Вы уверены, что хотите удалить эту группу?"
            />
        </div>
    );
};

export default GroupsTab;