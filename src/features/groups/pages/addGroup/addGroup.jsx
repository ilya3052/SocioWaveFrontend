import React, {useEffect, useState} from 'react';
import styles from './addGroup.module.css';
import {useNavigate} from "react-router-dom";
import {API_VERSION, BASE_URL, sendForDebug, verifyAndRefreshToken} from "../../../../utils/utils.js";
import toast from "react-hot-toast";
import PlatformSelector from "../../../../components/platformSelector/platformSelector.jsx";
import AccountInfo from "../../components/accountInfo/accountInfo.jsx";

const AddGroup = () => {
    const [platforms, setPlatforms] = useState([]);

    const [activePlatform, setActivePlatform] = useState(null);
    const [userSocialData, setUserSocialData] = useState({tg_link: null, vk_link: null});
    const [serviceAccount, setServiceAccount] = useState({name: null, id: null});

    const [loadingPlatforms, setLoadingPlatforms] = useState(true);
    const [loadingServiceAccount, setLoadingServiceAccount] = useState(true);

    const [groupData, setGroupData] = useState(null);

    const navigate = useNavigate();

    const fetchPlatforms = async () => {
        try {
            const res = await fetch(`${BASE_URL}/${API_VERSION}/social-entities/platforms/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (res.ok) {
                const data = await res.json();
                setPlatforms(data);
            }
        } catch (err) {
            toast.error('Ошибка при загрузке платформ');
        } finally {
            setLoadingPlatforms(false);
        }
    }

    useEffect(() => {
        fetchPlatforms();
    }, [navigate])

    useEffect(() => {
        const fetchUserData = async () => {
            if (!(await verifyAndRefreshToken())) {
                navigate("/login");
                return;
            }
            const token = localStorage.getItem("access_token");
            try {
                const getUserSocialDataResponse = await fetch(`${BASE_URL}/${API_VERSION}/users/get-social/`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        "Authorization": `Bearer ${token}`
                    }
                });
                if (getUserSocialDataResponse.ok) {
                    const socialData = await getUserSocialDataResponse.json();
                    setUserSocialData(socialData);
                } else {
                    throw new Error(await getUserSocialDataResponse.text());
                }
            } catch (err) {
                toast.error('Ошибка при загрузке данных пользователя');
            }
        }
        fetchUserData();
    }, [navigate, activePlatform]);

    useEffect(() => {
        if (!activePlatform) return;
        const fetchServiceAccounts = async () => {
            if (!(await verifyAndRefreshToken())) {
                navigate("/login");
                return;
            }
            const token = localStorage.getItem("access_token");
            try {
                const getServiceAccountResponse = await fetch(`${BASE_URL}/${API_VERSION}/service-accounts/${activePlatform}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                });
                if (getServiceAccountResponse.ok) {
                    const accountData = await getServiceAccountResponse.json();
                    setServiceAccount(accountData);
                } else if (getServiceAccountResponse.status === 404) {
                    setServiceAccount(null);
                } else {
                    throw new Error(await getServiceAccountResponse.text());
                }
            } catch (err) {
                toast.error('Ошибка при загрузке сервисного аккаунта');
            } finally {
                setLoadingServiceAccount(false)
            }
        }
        fetchServiceAccounts();
    }, [activePlatform, navigate]);


    let groupStatus, groupStatusStyle;

    if (groupData && 'access' in groupData) {
        if (groupData.access === 0) {
            groupStatus = 'Группа найдена и доступна';
            groupStatusStyle = styles.statusSuccess;
        } else if (groupData.access === 1) {
            groupStatus = 'Группа найдена но недоступна для текущего пользователя';
            groupStatusStyle = styles.statusPartialAccess;
        } else if (groupData.access === 2) {
            groupStatus = 'Блок контактов в группе не найден! Проверьте правильность введенных данных и наличие контактов';
            groupStatusStyle = styles.statusPartialAccess;
        } else if (groupData.access === 3) {
            groupStatus = 'Группа не найдена';
            groupStatusStyle = styles.statusError;
        }
    }

    const sendGroupData = async () => {

        const platform = platforms.find(p => p.alias === activePlatform);

        try {
            if (!(await verifyAndRefreshToken())) {
                navigate("/login");
                return;
            }
            const token = localStorage.getItem("access_token");
            const res = await fetch(`${BASE_URL}/${API_VERSION}/social-entities/groups/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },

                body: JSON.stringify({
                    name: groupData.name,
                    link: groupData.groupLink,
                    external_id: groupData.id,
                    platform_id: platform.id,
                    service_account_id: serviceAccount.id,
                })
            });
            if (res.ok) {
                toast.success('Группа добавлена');
                navigate("/profile?tab=groups");
            } else {
                const data = await res.text();
                toast.error(data);
                await sendForDebug(data);
            }
        } catch (err) {
            toast.error('Ошибка при добавлении группы');
        }

    }

    return (
        <main className={styles.addGroupContainer}>
            <h1 className={styles.pageTitle}>Добавить группу</h1>

            <section className={styles.section}>
                <h2>Выберите платформу</h2>
                <PlatformSelector
                    platforms={platforms}
                    activePlatform={activePlatform}
                    setActivePlatform={setActivePlatform}
                    loading={loadingPlatforms}
                />
            </section>

            {/* Блок 2: Информация об аккаунтах */}
            {activePlatform && (serviceAccount ? <section className={styles.section}>
                    <h2>Информация об аккаунтах</h2>
                    <AccountInfo
                        platform={platforms.find(p => p.alias === activePlatform)}
                        activePlatform={activePlatform}
                        userSocialData={userSocialData}
                        loading={loadingServiceAccount}
                        serviceAccount={serviceAccount}
                        setGroupData={setGroupData}
                    />
                </section>
                : <h3>Не найден сервисный аккаунт для платформы, обратитесь к администратору</h3>)}
            {groupData && <section className={styles.section}>
                <h2>Данные о группе</h2>
                <div className={styles.groupData}>
                    <div className={styles.dataRow}>
                        <span className={styles.dataLabel}>Название</span>
                        <span className={styles.dataValue}>{groupData['name'] ? groupData['name'] : 'Не найдено'}</span>
                    </div>
                    <div className={styles.dataRow}>
                        <span className={styles.dataLabel}>Ссылка:</span>
                        <a href={groupData['groupLink']} target={"_blank"}
                           className={styles.dataValue}>{groupData['groupLink']}</a>
                    </div>
                    <div className={styles.dataRow}>
                        <span className={styles.dataLabel}>Статус:</span>
                        <span className={`${styles.dataValue} ${groupStatusStyle}`}>
                {groupStatus}
            </span>
                    </div>
                </div>
            </section>
            }
            {groupData && 'access' in groupData && groupData.access === 0 && <div className={styles.addBtnContainer}>
                <button className={styles.addBtn} onClick={sendGroupData}>Добавить группу</button>
            </div>}
        </main>
    );
};

export default AddGroup;