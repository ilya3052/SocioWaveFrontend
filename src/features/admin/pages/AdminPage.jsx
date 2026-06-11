import React, {useEffect, useState} from "react";
import styles from "./AdminPage.module.css";

import GroupsStats from "../components/groupsStats/GroupStats.jsx";
import AccountsStats from "../components/accountStats/AccountStats.jsx";
import LoadStats from "../components/loadStats/LoadStats.jsx";
import {useNavigate} from "react-router-dom";
import {API_VERSION, BASE_URL, confirmEmail, handleTGBind, verifyAndRefreshToken} from "../../../utils/utils.js";
import toast from "react-hot-toast";

const AdminPage = () => {

    const navigate = useNavigate();

    const [showNotifications, setShowNotifications] = useState(false);
    const [notifEmail, setNotifEmail] = useState('');
    const [savedEmail, setSavedEmail] = useState('');
    const [emailEditing, setEmailEditing] = useState(true);
    const [emailConfirmed, setEmailConfirmed] = useState(false);
    const [groupStats, setGroupStats] = useState({vk_count: null, tg_count: null});
    const [accountStats, setAccountStats] = useState({vk_count: null, tg_count: null});
    const [isSaving, setIsSaving] = useState(false);
    const [loadStats, setLoadStats] = useState({
        min: {id: null, name: null, count: null},
        max: {id: null, name: null, count: null}
    });
    const [emailSent, setEmailSent] = useState(false);
    const [emailError, setEmailError] = useState(false);
    const [tgLink, setTgLink] = useState('');

    const fetchNotifications = async () => {
        if (!(await verifyAndRefreshToken())) {
            navigate("/login");
            return;
        }
        const token = localStorage.getItem("access_token");
        try {
            const res = await fetch(`${BASE_URL}/${API_VERSION}/users/me/?exclude_fields=id,first_name,last_name,username,vk_link,tg_id,vk_id,is_staff`, {
                method: 'GET',
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            if (res.ok) {
                const data = await res.json();
                if (data.data.email) {
                    setNotifEmail(data.data.email);
                    setSavedEmail(data.data.email);
                    setEmailConfirmed(!!data.data.is_email_confirmed);
                    setEmailEditing(false);
                } else {
                    setNotifEmail('');
                    setSavedEmail('');
                    setEmailConfirmed(false);
                    setEmailEditing(true);
                }
                setTgLink(data.data.tg_link || '');
            }
        } catch (err) {
            toast.error('Ошибка при загрузке настроек уведомлений');
        }
    };

    const handleTGUnbind = async () => {
        if (!(await verifyAndRefreshToken())) {
            navigate("/login");
            return;
        }
        const token = localStorage.getItem("access_token");
        try {
            const res = await fetch(`${BASE_URL}/${API_VERSION}/users/unbind-social/?platform=TG`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({tg_id: null, tg_link: null})
            });
            if (res.ok) {
                setTgLink('');
                toast.success('Telegram отвязан');
            } else {
                const err = await res.text();
                toast.error(err);
            }
        } catch (err) {
            toast.error('Ошибка при отвязке Telegram');
        }
    };

    useEffect(() => {
        let isMounted = true;
        const abortController = new AbortController();
        const fetchSummaryInfo = async () => {
            if (!(await verifyAndRefreshToken())) {
                navigate("/login");
                return;
            }
            const token = localStorage.getItem("access_token");
            try {
                const res = await fetch(`${BASE_URL}/${API_VERSION}/admin/summary/`, {
                    method: 'GET',
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    signal: abortController.signal
                });
                if (res.ok && isMounted) {
                    const data = await res.json();
                    setGroupStats(data.group_info);
                    setAccountStats(data.service_account_info);
                    setLoadStats(data.service_account_loading_info);
                }
            } catch (err) {
                if (err.name !== 'AbortError' && isMounted) {
                    toast.error('Ошибка при загрузке сводной информации');
                }
            }
        };
        fetchSummaryInfo();
        return () => {
            isMounted = false;
            abortController.abort();
        };
    }, [navigate]);

    useEffect(() => {
        if (showNotifications) {
            setEmailSent(false);
            setEmailError(false);
            fetchNotifications();
        }
    }, [showNotifications]);

    const saveReport = async (reportType) => {
        setIsSaving(true);
        try {
            if (!(await verifyAndRefreshToken())) {
                navigate("/login");
                return;
            }
            const token = localStorage.getItem("access_token");
            const res = await fetch(`${BASE_URL}/${API_VERSION}/reports/admin/`, {
                method: 'POST',
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({type: reportType.toUpperCase()})
            });
            if (res.ok) {
                const data = await res.json();
                window.open(data, '_blank');
                toast.success('Отчёт сохранён');
            } else {
                toast.error('Ошибка при сохранении отчёта');
            }
        } catch (err) {
            toast.error('Ошибка при сохранении отчёта');
        } finally {
            setIsSaving(false);
        }
    }


    return (
        <main className={styles.adminContainer}>
            <GroupsStats stats={groupStats}/>
            <AccountsStats stats={accountStats}/>
            <LoadStats stats={loadStats} groupStats={groupStats}/>

            <div className={styles.saveBtnContainer}>
                <button
                    className={`${styles.saveBtn} ${isSaving ? styles.saving : ''}`}
                    onClick={async () => await saveReport('xlsx')}
                    disabled={isSaving}
                >
                    {isSaving ? 'Загрузка...' : 'Сохранить в Excel'}
                </button>
                <button
                    className={`${styles.saveBtn} ${isSaving ? styles.saving : ''}`}
                    onClick={async () => await saveReport('pdf')}
                    disabled={isSaving}
                >
                    {isSaving ? 'Загрузка...' : 'Сохранить в PDF'}
                </button>
            </div>

            {/* Плавающая кнопка + панель уведомлений */}
            <div className={styles.notifWrapper}>
                {showNotifications && (
                    <div className={styles.notifPopup}>
                        <div className={styles.notifPopupHeader}>
                            <h3>Настройка уведомлений</h3>
                            <button
                                className={styles.notifPopupClose}
                                onClick={() => setShowNotifications(false)}
                            >
                                ✕
                            </button>
                        </div>
                        <div className={styles.notifPopupBody}>
                            <div className={styles.notifRow}>
                                <div className={styles.notifRowInfo}>
                                    <strong>Email</strong>
                                    {emailEditing ? (
                                        <input
                                            className={styles.notifEmailInput}
                                            type="email"
                                            placeholder="Введите email"
                                            value={notifEmail}
                                            onChange={e => {
                                                if (e.target.value !== notifEmail) {
                                                    setNotifEmail(e.target.value)
                                                }
                                            }}
                                        />
                                    ) : (
                                        <span className={styles.notifRowValue}>
                                            {notifEmail || 'Не указан'}
                                        </span>
                                    )}
                                </div>
                                {emailEditing ? (
                                    <button className={styles.notifRowBtn} onClick={async () => {
                                        if (notifEmail !== savedEmail) {
                                            await confirmEmail({navigate, setEmailSent, setEmailError, email: notifEmail});
                                            setSavedEmail(notifEmail);
                                        }
                                        setEmailEditing(false);
                                    }}>
                                        Сохранить
                                    </button>
                                ) : (
                                    <div className={styles.notifEmailActions}>
                                        {!emailConfirmed && notifEmail && (
                                            <button
                                                className={styles.notifRowBtnGreen}
                                                onClick={async () => {
                                                    await confirmEmail({navigate, setEmailSent, setEmailError, email: notifEmail});
                                                }}
                                            >
                                                {emailSent ? 'Письмо отправлено' : emailError ? 'Ошибка' : 'Подтвердить'}
                                            </button>
                                        )}
                                        <button
                                            className={styles.notifRowBtnAlt}
                                            onClick={() => setEmailEditing(true)}
                                        >
                                            Изменить
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className={styles.notifRow}>
                                <div className={styles.notifRowInfo}>
                                    <strong>Telegram</strong>
                                    {tgLink ? (
                                        <span className={styles.notifRowValue}>
                                            Привязан (
                                            <a
                                                href={tgLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={styles.notifTgLink}
                                            >
                                                @{tgLink.replace('https://t.me/', '')}
                                            </a>
                                            )
                                        </span>
                                    ) : (
                                        <span className={styles.notifRowStatus}>Не привязан</span>
                                    )}
                                </div>
                                {tgLink ? (
                                    <button className={styles.notifRowBtnDanger} onClick={handleTGUnbind}>
                                        Отвязать
                                    </button>
                                ) : (
                                    <button className={styles.notifRowBtn} onClick={() => {
                                        handleTGBind({navigate, toast})
                                    }}>
                                        Привязать
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                <button
                    className={`${styles.notifFab} ${showNotifications ? styles.notifFabActive : ''}`}
                    onClick={() => setShowNotifications(prev => !prev)}
                    title="Настройка уведомлений"
                >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                         strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                    </svg>
                    <span className={styles.notifFabLabel}>Уведомления</span>
                </button>
            </div>
        </main>
    );
};

export default AdminPage;