import styles from './personal.module.css';
import {useEffect, useState} from "react";
import {
    API_VERSION,
    BASE_URL,
    confirmEmail, handleTGBind,
    logout,
    sendForDebug,
    verifyAndRefreshToken
} from "../../../../utils/utils.js";
import {useNavigate} from "react-router-dom";
import {createVKAuthBindingHandler, initializeVKID} from "../../../../utils/OneTapVKAuth.jsx";
import {useUser} from "../../../../context/UserContext.jsx";
import toast from "react-hot-toast";


const PersonalTab = () => {

    const INITIAL_PASSWORD_FORM_STATE = {
        old_password: "",
        new_password: "",
        confirm_password: "",
    };

    const INITIAL_PERSONAL_FORM_STATE = {
        first_name: "",
        last_name: "",
        username: "",
        email: "",
        tg_id: "",
        tg_link: "",
        vk_id: "",
        vk_link: ""
    }

    const DATA_TO_EDIT = {
        first_name: "",
        last_name: "",
        username: "",
        email: "",
    }

    const [hasPassword, setHasPassword] = useState(false);

    const [personalData, setPersonalData] = useState(INITIAL_PERSONAL_FORM_STATE);

    const [editData, setEditData] = useState(DATA_TO_EDIT);

    // Режим редактирования
    const [isEditing, setIsEditing] = useState(false);

    // Синхронизируем editData при изменении исходных данных (на случай перезагрузки)
    useEffect(() => {
        setEditData(personalData);
    }, [personalData]);

    const [passwordData, setPasswordData] = useState(INITIAL_PASSWORD_FORM_STATE);
    const [newPasswordError, setNewPasswordError] = useState(false);     // для отображения ошибок
    const [newPasswordErrorData, setNewPasswordErrorData] = useState([])

    const [isPasswordLoading, setIsPasswordLoading] = useState(false);

    const [isEmailConfirmed, setIsEmailConfirmed] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [emailError, setEmailError] = useState(false);

    const navigate = useNavigate();
    const {user, refetchUser, loading: userLoading} = useUser();

    useEffect(() => {
        return initializeVKID(createVKAuthBindingHandler(navigate, refetchUser), 'secondary');
    }, [navigate, refetchUser]);

    useEffect(() => {
        if (userLoading) return;

        if (!user) {
            navigate("/login");
            return;
        }

        setPersonalData({
            first_name: user.first_name || "",
            last_name: user.last_name || "",
            username: user.username || "",
            email: user.email || "",
            tg_id: user.tg_id || "",
            tg_link: user.tg_link || "",
            vk_id: user.vk_id || "",
            vk_link: user.vk_link || ""
        });

        if (user.vk_id) {
            localStorage.setItem('vk_id', user.vk_id);
        }
        if (user.tg_id) {
            localStorage.setItem('tg_id', user.tg_id);
        }
        setIsEmailConfirmed(user.is_email_confirmed || false);

    }, [user, userLoading, navigate]);

    useEffect(() => {
        if (userLoading) return;
        if (!user) return;

        const fetchPasswordStatus = async () => {
            try {
                if (!(await verifyAndRefreshToken())) {
                    navigate("/login");
                    return;
                }
                const token = localStorage.getItem("access_token");

                const response = await fetch(`${BASE_URL}/${API_VERSION}/users/me/`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setHasPassword(data.has_password);

                    if (data.tokens?.access_vk_token) {
                        localStorage.setItem('vk_access_token', data.tokens.access_vk_token);
                        localStorage.setItem('vk_refresh_token', data.tokens.refresh_vk_token);
                        localStorage.setItem('vk_id_token', data.tokens.id_vk_token);
                    }
                }
            } catch (err) {
                await sendForDebug("Failed to fetch password status: " + err.message);
            }
        };

        fetchPasswordStatus();
    }, [user, userLoading]);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setEditData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handlePasswordChangeInput = (e) => {
        const {name, value} = e.target;
        setPasswordData((prev) => ({
            ...prev,
            [name]: value,
        }));
        setNewPasswordErrorData([]); // сбрасываем ошибку при вводе
    };

    const sendEditedData = async (type) => {
        let url;
        let dataToEdit;
        switch (type) {
            case "personal":
                url = `${BASE_URL}/${API_VERSION}/users/me/`;
                dataToEdit = {
                    first_name: editData.first_name,
                    last_name: editData.last_name,
                    username: editData.username,
                    email: editData.email,
                };
                break;
            case "change-password":
                url = `${BASE_URL}/${API_VERSION}/users/change-password/`;
                dataToEdit = passwordData;
                break;
            case "set-password":
                url = `${BASE_URL}/${API_VERSION}/users/set-password/`;
                dataToEdit = passwordData;
                break;

        }
        if (!(await verifyAndRefreshToken())) {
            navigate("/login");
            return;
        }
        const token = localStorage.getItem("access_token");
        return await fetch(url, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(dataToEdit),
        });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await sendEditedData("personal");
            switch (res.status) {
                case 200:
                    setPersonalData(editData);
                    setIsEditing(false);
                    toast.success('Личные данные сохранены');
                    break;
                case 400:
                    toast.error(await res.text());
                    break;
                case 401: {
                    if (!(await verifyAndRefreshToken())) {
                        await logout(navigate);
                        return;
                    }
                    const retryRes = await sendEditedData("personal");
                    if (retryRes.status === 200) {
                        setPersonalData(editData);
                        setIsEditing(false);
                        toast.success('Личные данные сохранены');
                    } else {
                        throw new Error(`Ошибка после обновления токена: ${retryRes.status}`);
                    }
                    break;
                }
            }
        } catch (err) {
            toast.error("Не удалось сохранить изменения");
        }
    };

    const handlePasswordError = async (errors) => {
        if ("non_field_errors" in errors) {
            setNewPasswordError(true);
            setNewPasswordErrorData(errors.non_field_errors);
        } else if ("wrong_old_password" in errors) {
            setNewPasswordError(true);
            setNewPasswordErrorData(errors.wrong_old_password);
        } else if ("confirm_password" in errors) {
            setNewPasswordError(true);
            setNewPasswordErrorData(errors.confirm_password);
        } else if ("new_password" in errors) {
            setNewPasswordError(true);
            setNewPasswordErrorData(errors.new_password);
        }

    }

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setIsPasswordLoading(true);
        try {
            const res = await sendEditedData(hasPassword ? "change-password" : "set-password");
            switch (res.status) {
                case 200: {
                    setPasswordData(INITIAL_PASSWORD_FORM_STATE);
                    const tokens = (await res.json()).data
                    localStorage.setItem("access_token", tokens.access);
                    localStorage.setItem("refresh_token", tokens.refresh);
                    setHasPassword(true);
                    toast.success(hasPassword ? 'Пароль изменён' : 'Пароль установлен');
                    break;
                }
                case 400:
                    await handlePasswordError(await res.json());
                    break;
            }
        } catch (err) {
            toast.error('Ошибка при смене пароля');
        } finally {
            setIsPasswordLoading(false);
        }
    }

    const handleCancel = () => {
        setEditData(personalData); // откатываем изменения
        setIsEditing(false);
    };


    const handleUnbind = async (platform) => {
        try {
            if (!(await verifyAndRefreshToken())) {
                navigate("/login");
                return;
            }
            const token = localStorage.getItem("access_token");
            let data;
            if (platform === 'TG') {
                data = {
                    tg_id: null,
                    tg_link: null
                }
            }
            else if (platform === 'VK') {
                data = {
                    vk_id: null,
                    vk_link: null
                }
            }
            const res = await fetch(`${BASE_URL}/${API_VERSION}/users/unbind-social/?platform=${platform}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                if (platform === 'TG') {
                    setPersonalData(prev => ({...prev, tg_id: '', tg_link: ''}));
                    localStorage.removeItem('tg_id');
                } else if (platform === 'VK') {
                    setPersonalData(prev => ({...prev, vk_id: '', vk_link: ''}));
                    localStorage.removeItem('vk_id');
                    localStorage.removeItem('vk_access_token');
                    localStorage.removeItem('vk_refresh_token');
                    localStorage.removeItem('vk_id_token');
                }
                toast.success(`${platform} успешно отвязан`);
            } else {
                const err = await res.text();
                toast.error(err);
            }
        } catch (err) {
            toast.error('Ошибка при отвязке');
        }
    }



    return (
        <div className={styles.tabContent}>
            <div className={styles.profileBlock}>
                <div className={styles.blockHeader}>
                    <h3>Личные данные</h3>
                    {!isEditing ? (
                        <button
                            type="button"
                            className={styles.editBtn}
                            onClick={() => setIsEditing(true)}
                        >
                            Редактировать
                        </button>
                    ) : (
                        <div className={styles.editActions}>
                            <button
                                type="button"
                                className={styles.cancelBtn}
                                onClick={handleCancel}
                            >
                                Отмена
                            </button>
                            <button
                                type="submit"
                                form="personalForm"
                                className={styles.saveBtn}
                            >
                                Сохранить
                            </button>
                        </div>
                    )}
                </div>

                <form
                    id="personalForm"
                    onSubmit={handleSubmit}
                    className={styles.personalInfo}
                >
                    <div className={styles.formRow}>
                        <label>Имя</label>
                        {isEditing ? (
                            <input
                                type="text"
                                name="first_name"
                                value={editData.first_name}
                                onChange={handleChange}
                                autoFocus
                            />
                        ) : (
                            <span className={styles.viewValue}>{personalData.first_name || "—"}</span>
                        )}
                    </div>

                    <div className={styles.formRow}>
                        <label>Фамилия</label>
                        {isEditing ? (
                            <input
                                type="text"
                                name="last_name"
                                value={editData.last_name}
                                onChange={handleChange}
                            />
                        ) : (
                            <span className={styles.viewValue}>{personalData.last_name || "—"}</span>
                        )}
                    </div>

                    <div className={styles.formRow}>
                        <label>Юзернейм</label>
                        {isEditing ? (
                            <input
                                type="text"
                                name="username"
                                value={editData.username}
                                onChange={handleChange}
                            />
                        ) : (
                            <span className={styles.viewValue}>{personalData.username || "—"}</span>
                        )}
                    </div>

                    <div className={styles.formRow}>
                        <label>Email</label>
                        {isEditing ? (
                            <input
                                type="email"
                                name="email"
                                value={editData.email}
                                onChange={handleChange}
                            />
                        ) : (
                            <span className={styles.viewValue}>{personalData.email || "—"}</span>
                        )}
                        {!isEditing && personalData.email && !isEmailConfirmed && (
                            emailSent ? (
                                <span className={styles.emailSent}>Письмо отправлено</span>
                            ) : emailError ? (
                                <span className={styles.emailError}>Ошибка отправки</span>
                            ) : (
                                <button
                                    onClick={confirmEmail}
                                    className={styles.confirmEmail}
                                    type="button"
                                >
                                    Подтвердить почту
                                </button>
                            )
                        )}
                    </div>
                </form>

                <div className={styles.platformStatus}>
                    <div className={styles.platformRow}>
                        <strong>TG:</strong>
                        <span>{personalData.tg_link || "Не привязано"}</span>
                        {!personalData.tg_link ? (
                            <button onClick={() => {
                                handleTGBind({navigate, toast})
                            }
                            } className={styles.linkPlatform}>Привязать</button>
                        ) : (
                            <button onClick={() => handleUnbind('TG')} className={styles.unlinkPlatform}>Отвязать</button>
                        )}
                    </div>
                    <div className={styles.platformRow}>
                        <strong>VK:</strong>
                        <span>{personalData.vk_link || "Не привязано"}</span>
                        {!personalData.vk_link ? (
                            <div id="vkAuth"></div>
                        ) : (
                            <button onClick={() => handleUnbind('VK')} className={styles.unlinkPlatform}>Отвязать</button>
                        )}
                    </div>
                </div>
            </div>

            {/* Блок смены пароля остаётся без изменений */}
            <div className={styles.profileBlock}>
                <h3>{hasPassword ? 'Смена' : 'Установка'} пароля</h3>

                <form onSubmit={handlePasswordSubmit} className={styles.passwordForm}>
                    {hasPassword && (
                        <div className={styles.formRow}>
                            <label>Старый пароль</label>
                            <input
                                type="password"
                                name="old_password"
                                value={passwordData.old_password}
                                onChange={handlePasswordChangeInput}
                                autoComplete="current-password"
                                required={hasPassword} // Делаем поле обязательным только когда оно есть
                            />
                        </div>
                    )}

                    <div className={styles.formRow}>
                        <label>Новый пароль</label>
                        <input
                            type="password"
                            name="new_password"
                            value={passwordData.new_password}
                            onChange={handlePasswordChangeInput}
                            autoComplete="new-password"
                            required
                        />
                    </div>

                    <div className={styles.formRow}>
                        <label>Подтверждение нового пароля</label>
                        <input
                            type="password"
                            name="confirm_password"
                            value={passwordData.confirm_password}
                            onChange={handlePasswordChangeInput}
                            autoComplete="new-password"
                            required
                        />
                    </div>

                    {newPasswordError && (
                        <p className={styles.passwordErrors}>{newPasswordErrorData.map((elem) => (
                            <span>{elem}</span>
                        ))}</p>
                    )}

                    <button
                        type="submit"
                        className={styles.passwordSaveBtn}
                        disabled={isPasswordLoading}
                    >
                        {!hasPassword ? "Установить пароль" : "Сменить пароль"}
                    </button>
                </form>
                {!hasPassword && (
                    <p className={styles.passwordInfo}>
                        У вас ещё нет пароля, так как вы вошли через социальную сеть.
                        Установите пароль, чтобы входить по username и паролю.
                    </p>
                )}
            </div>
        </div>
    );
};

export default PersonalTab;