import React, {useEffect, useState} from 'react';
import styles from './serviceAccounts.module.css';
import AccountsSection from '../../components/AccountsSection/AccountsSection.jsx';
import {Link, useNavigate} from "react-router-dom";
import {API_VERSION, BASE_URL, sendForDebug, verifyAndRefreshToken} from "../../../../utils/utils.js";

const ServiceAccounts = () => {
    const [telegramAccounts, setTgAccounts] = useState([]);

    const [vkAccounts, setVkAccounts] = useState([]);

    const [totalGroupCount, setTotalGroupCount] = useState(0);

    const navigate = useNavigate();

    const getAllRelatedGroup = async (accountId, token) => {
        try {
            const res = await fetch(`${BASE_URL}/${API_VERSION}/service-accounts/${accountId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                return (await res.json()).groups;
            } else {
                const err = await res.text();
                await sendForDebug(err);
                console.log('Ошибка' + err);
                return null;
            }
        } catch (e) {
            console.log(e);
            await sendForDebug(e);
            return null;
        }
    }

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
            console.log(e);
            await sendForDebug(e);
            return false;
        }
    }

    const updateGroups = async (groups, platform, token) => {
        if (!token) {
            if (!(await verifyAndRefreshToken())) {
                navigate("/login");
                return;
            }
            return;
        }
        for (const group of groups) {
            const getAccountRequest = await fetch(`${BASE_URL}/${API_VERSION}/service-accounts/${platform}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            let accountId;
            if (getAccountRequest.ok) {
                const data = await getAccountRequest.json();
                accountId = data.id;
            } else {
                const err = await getAccountRequest.text();
                console.error('Ошибка при получении аккаунта: ' + err);
                await sendForDebug(err);
                return false;
            }
            const updateAccountRequest = await fetch(`${BASE_URL}/${API_VERSION}/social-entities/groups/${group.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    service_account_id: accountId,
                })
            });
            if (!updateAccountRequest.ok) {
                const err = await updateAccountRequest.text();
                console.log(err);
                await sendForDebug(err);
                return false;
            }
        }
        return true;
    }

    const handleDeleteAccount = async (accountId, platform) => {
        let token = localStorage.getItem("access_token");
        if (!token) {
            if (!(await verifyAndRefreshToken())) {
                navigate("/login");
                return;
            }
            return;
        }
        // 1) запрос id всех групп связанных с аккаунтом
        // 2) перепривязка каждой группы к новому аккаунту (добавить функционал по исключению удаляемого аккаунта из выборки через not acc_id__in=[1,2,3]
        // 3) удаление старого во избежание его повторной привязки к группам
        const related_groups = await getAllRelatedGroup(accountId, token);
        console.log(related_groups);
        if (!related_groups) {
            alert('Произошла ошибка при удалении сервисного аккаунта');
        }

        if (!(await deleteServiceAccount(accountId, token))) {
            alert('Произошла ошибка при удалении сервисного аккаунта');
            return;
        }

        // возможно стоит посылать запросы в очередь которая будет с задержкой отправлять их на сервер
        if (!(await updateGroups(related_groups, platform, token))) {
            alert('Произошла ошибка при удалении сервисного аккаунта');
        }
        window.location.reload();
    }

    const handleActivateAccount = async (accountId) => {
        let token = localStorage.getItem("access_token");
        if (!token) {
            if (!(await verifyAndRefreshToken())) {
                navigate("/login");
                return;
            }
            return;
        }

        await fetch(`${BASE_URL}/${API_VERSION}/service-accounts/activate/${accountId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        })
            .then(async res => {
                await navigator.clipboard.writeText(
                    (await res.json()).token
                );
                alert('Одноразовый токен для активации аккаунта скопирован в буфер обмена. Активируйте аккаунт с помощью специальной консольной утилиты');
            })
            .catch(e => {
                console.log(e);
            });
    }

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                let token = localStorage.getItem("access_token");
                if (!token) {
                    if (!(await verifyAndRefreshToken())) {
                        navigate("/login");
                        return;
                    }
                    return;
                }
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
                    console.log('total groups count', total_groups_count)
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
                    console.log(data);
                }
            } catch (e) {
                console.log(e);
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
        </main>
    );
};

export default ServiceAccounts;

