// DataForm.jsx
import React, {useState} from 'react';
import styles from './dataForm.module.css';
import {API_VERSION, BASE_URL, verifyAndRefreshToken} from "../../../../utils/utils.js";
import {useNavigate} from "react-router-dom";
import {IMaskInput} from "react-imask";


const DataForm = ({platform}) => {

    const isTg = platform.alias === 'TG';

    const [accountName, setAccountName] = useState('');
    const [phone, setPhone] = useState('');
    const [appID, setAppID] = useState('');

    const navigate = useNavigate();


    const sendAccountData = async () => {
        try {
            if (!(await verifyAndRefreshToken())) {
                navigate("/login");
                return;
            }
            const token = localStorage.getItem("access_token");
            let data;
            if (isTg) {
                data = {
                    "name": accountName,
                    "platform_id": platform.id,
                    data: {
                        "phone_number": phone.replace(/[+\-() ]/g, '')
                    }
                };
            } else {
                data = {
                    "name": accountName,
                    "platform_id": platform.id,
                    "app_id": appID,
                    data: {}
                };
            }
            const res = await fetch(`${BASE_URL}/${API_VERSION}/service-accounts/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            if (res.status === 201) {
                navigate('/admin_panel/service_accounts')
            }
        } catch (err) {
            console.log(err);
        }
    }

    return (
        <section className={`${styles.section}`}>
            <h2>Данные для {isTg ? 'Telegram' : 'ВКонтакте'}</h2>

            {/* Общее поле для всех платформ */}
            <div className={styles.formGroup}>
                <label className={styles.formLabel}>Имя аккаунта в системе</label>
                <input
                    type="text"
                    className={styles.formInput}
                    value={accountName}
                    placeholder="Введите имя аккаунта..."
                    onChange={(e) => setAccountName(e.target.value)}
                />
            </div>
            {isTg && (
                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Номер телефона для доступа к аккаунту</label>

                    <IMaskInput
                        mask="+{7} (000) 000-00-00"
                        value={phone}
                        placeholder="+7 (XXX) XXX-XX-XX"
                        lazy={true}
                        onAccept={(value) => setPhone(value)}
                        className={styles.formInput}
                    />
                </div>
            )}

            {/* Поля специфичные для VK */}
            {!isTg && (
                <>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>ID приложения</label>
                        <input
                            type="text"
                            className={styles.formInput}
                            value={appID}
                            placeholder="Введите ID приложения..."
                            onChange={(e) => setAppID(e.target.value)}
                        />
                    </div>

                </>
            )}
            <div className={styles.formActions}>
                <button
                    className={styles.addBtn}
                    onClick={sendAccountData}
                >
                    Добавить аккаунт
                </button>
            </div>
        </section>
    );
};

export default DataForm;