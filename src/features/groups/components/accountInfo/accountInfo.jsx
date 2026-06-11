import React, {useState} from 'react';
import styles from './accountInfo.module.css';
import {API_VERSION, BASE_URL, sendForDebug, verifyAndRefreshToken} from "../../../../utils/utils.js";
import {useNavigate} from "react-router-dom";

const AccountInfo = ({
                         platform,           // объект платформы { id, name, alias }
                         activePlatform,     // текущая активная платформа (строка, например 'tg')
                         userSocialData,      // объект с данными пользователя { tg_link, vk_link, ... }
                         loading,
                         serviceAccount,
                         setGroupData
                     }) => {

    const [groupLink, setGroupLink] = useState('');

    const navigate = useNavigate();

    if (loading) {
        return <div className={styles.loading}>Загрузка платформ...</div>;
    }
    if (!platform) return null;
    if (!serviceAccount) return null;
    const isActive = activePlatform === platform.alias;

    const linkField = platform.alias === 'TG' ? 'tg_link' :
        platform.alias === 'VK' ? 'vk_link' : null;

    const userLink = linkField ? userSocialData?.[linkField] : null;
    let screen_name;
    if (userLink) {
        screen_name = userLink.split('/').at(-1)
    }

    const isConnected = !!userLink;

    // Динамический плейсхолдер
    const placeholder = platform.alias === 'TG'
        ? 'Введите ссылку на канал Telegram...'
        : platform.alias === 'VK'
            ? 'Введите ссылку на группу ВКонтакте...'
            : 'Введите ссылку...';

    const fetchGroupData = async () => {
        try {
            if (!(await verifyAndRefreshToken())) {
                navigate("/login");
                return;
            }
            const token = localStorage.getItem("access_token");
            let user_id;
            if (platform.alias === 'TG') {
                user_id = localStorage.getItem("tg_id");
            } else if (platform.alias === 'VK') {
                user_id = localStorage.getItem("vk_id");
            }
            const res = await fetch(`${BASE_URL}/${API_VERSION}/social-entities/groups/check-access/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    groupLink: groupLink,
                    user_social_id: user_id,
                    serviceAccount: serviceAccount.id,
                    platform: platform.alias
                })
            });
            if (res.ok) {
                const data = await res.json();
                setGroupData({
                    id: data['group_id'],
                    name: data['group_name'],
                    groupLink: groupLink,
                    access: data['status']
                });
            } else if (res.status === 400) {
                const data = await res.json();
                if (data.msg.includes('target user is not a member')) {
                    alert('Добавьте сервисный аккаунт в группу и назначьте ему минимальные права администратора!')
                }
                setGroupData({msg: data['msg'], access: data['status']})
            } else if (res.status === 406 || res.status === 404) {
                const data = await res.json();
                setGroupData({
                    id: data['group_id'],
                    name: data['group_name'],
                    groupLink: groupLink,
                    access: data['status']
                });
            } else {
                const err = await res.text();
                await sendForDebug(err);
            }
        } catch (error) {
            console.error(error);
        }
        console.log(groupLink);
    }

    return (
        <div className={`${styles.accountInfo} ${isActive ? styles.active : ''}`}>
            <div className={styles.accountRow}>
                <div className={styles.accountType}>
                    <h3>Ваш аккаунт {platform.name}</h3>
                    <div className={styles.accountDetails}>
                        <a href={userLink} target='_blank' className={styles.accountName}>
                            {screen_name ? `@${screen_name}` : 'Не привязан'}
                        </a>
                        <span
                            className={`${styles.accountStatus} ${isConnected ? styles.connected : styles.notConnected}`}>
                            {isConnected ? 'Привязан' : 'Не привязан'}
                        </span>
                    </div>
                </div>

                <div className={styles.serviceAccount}>
                    <h3>Сервисный аккаунт</h3>
                    <div className={styles.accountDetails}>
                        <span className={styles.accountName}>{serviceAccount.name}</span>
                    </div>
                </div>
            </div>

            <div className={styles.groupLinkInput}>
                <input
                    type="text"
                    placeholder={placeholder}
                    className={styles.linkInput}
                    value={groupLink}                    // ← важно!
                    onChange={(e) => setGroupLink(e.target.value)}
                />
                {serviceAccount ? <button onClick={fetchGroupData} className={styles.requestDataBtn}>
                    Запросить данные
                </button> : 'Нет сервисного аккаунта для этой платформы, обратитесь к администратору'}
            </div>
        </div>
    );
};

export default AccountInfo;