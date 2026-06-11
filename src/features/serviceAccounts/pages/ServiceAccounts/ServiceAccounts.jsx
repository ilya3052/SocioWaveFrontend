import React, {useEffect, useState} from 'react';
import styles from './serviceAccounts.module.css';
import AccountsSection from '../../components/AccountsSection/AccountsSection.jsx';
import {Link, useNavigate} from "react-router-dom";
import {API_VERSION, BASE_URL, sendForDebug, verifyAndRefreshToken} from "../../../../utils/utils.js";
import ConfirmModal from "../../../../components/confirmModal/ConfirmModal.jsx";
import toast from "react-hot-toast";

const ServiceAccounts = () => {
    const [telegramAccounts, setTgAccounts] = useState([]);

    const [vkAccounts, setVkAccounts] = useState([]);

    const [totalGroupCount, setTotalGroupCount] = useState(0);

    const [deleteTarget, setDeleteTarget] = useState(null);

    const navigate = useNavigate();

    const deleteServiceAccount = async (accountId, token) => {
        try {
            const res = await fetch(`${BASE_URL}/${API_VERSION}/service-accounts/${accountId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            return res.status === 204;
        } catch (e) {
            await sendForDebug(e);
            return false;
        }
    }

    const handleDeleteAccount = async (accountId) => {
        setDeleteTarget(accountId);
    }

    const confirmDelete = async () => {
        if (!(await verifyAndRefreshToken())) {
            navigate("/login");
            return;
        }
        const token = localStorage.getItem("access_token");
        if (!(await deleteServiceAccount(deleteTarget, token))) {
            toast.error('Произошла ошибка при удалении сервисного аккаунта');
            setDeleteTarget(null);
            return;
        }
        toast.success('Сервисный аккаунт удалён');
        setDeleteTarget(null);
    }

    const handleActivateAccount = async (accountId) => {
        if (!(await verifyAndRefreshToken())) {
            navigate("/login");
            return;
        }
        const token = localStorage.getItem("access_token");

        try {
            const res = await fetch(`${BASE_URL}/${API_VERSION}/service-accounts/activate/${accountId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });
            const data = await res.json();
            await navigator.clipboard.writeText(data.token);
            toast.success('Одноразовый токен скопирован в буфер обмена');
        } catch (e) {
            toast.error('Ошибка при активации аккаунта');
        }
    }

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                if (!(await verifyAndRefreshToken())) {
                    navigate("/login");
                    return;
                }
                const token = localStorage.getItem("access_token");
                const res = await fetch(`${BASE_URL}/${API_VERSION}/service-accounts/all/`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                });

                if (res.ok) {
                    const data = await res.json();
                    const account_data = data.data;
                    const total_groups_count = data.total_group_count;
                    setTotalGroupCount(total_groups_count);
                    setVkAccounts(account_data.filter(item => {
                        if (item.platform.alias === "VK") {
                            item.load = total_groups_count === 0 ? 0 : (item.groups_count / total_groups_count) * 100;
                            return true;
                        }
                        return false;
                    }));

                    setTgAccounts(account_data.filter(item => {
                        if (item.platform.alias === "TG") {
                            item.load = total_groups_count === 0 ? 0 : (item.groups_count / total_groups_count) * 100;
                            return true;
                        }
                        return false;
                    }));
                }
            } catch (e) {
                toast.error('Ошибка при загрузке сервисных аккаунтов');
            }
        };
        fetchAccounts();
    }, [navigate]);


    return (
        <main className={styles.accountsContainer}>
            {/* Кнопка добавления */}
            <div className={styles.addBtnContainer}>
                <Link to="/admin_panel/service_accounts/add" className={styles.addBtn}>
                    Добавить сервисный аккаунт
                </Link>
            </div>

            {/* Основной контент */}
            <div className={styles.accountsLayout}>
                {/* Telegram аккаунты */}
                <AccountsSection
                    title="Telegram аккаунты"
                    count={`Аккаунтов: ${telegramAccounts.length}`}
                    accounts={telegramAccounts}
                    onDeleteAccount={handleDeleteAccount}
                    onActivateAccount={handleActivateAccount}
                    sectionType="TG"
                />

                {/* VK приложения */}
                <AccountsSection
                    title="VK приложения"
                    count={`Приложений: ${vkAccounts.length}`}
                    accounts={vkAccounts}
                    onDeleteAccount={handleDeleteAccount}
                    onActivateAccount={handleActivateAccount}
                    sectionType="VK"
                />
            </div>

            <ConfirmModal
                isOpen={!!deleteTarget}
                onCancel={() => setDeleteTarget(null)}
                onConfirm={confirmDelete}
                title="Подтверждение удаления"
                message="Вы уверены, что хотите удалить этот сервисный аккаунт?"
            />
        </main>
    );
};

export default ServiceAccounts;

