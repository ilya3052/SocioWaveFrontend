import {useEffect, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {FiEye, FiEyeOff} from "react-icons/fi";

import styles from "./login.module.css";
import {sendForDebug} from '../../../../utils/utils.js';
import {createVKAuthSuccessHandler, initializeVKID} from "../../../../utils/OneTapVKAuth.jsx";
import {createTGAuthHandler, initializeTelegramWidget} from "../../../../utils/TGAuth.jsx";
import {useUser} from "../../../../context/UserContext.jsx";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_VERSION = import.meta.env.VITE_API_VERSION;

const LoginForm = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });

    const navigate = useNavigate();
    const {refetchUser} = useUser();

    const [authError, setAuthError] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        return initializeTelegramWidget(createTGAuthHandler(navigate, refetchUser));
    }, [navigate, refetchUser]);

    useEffect(() => {
        return initializeVKID(createVKAuthSuccessHandler(navigate, refetchUser), 'primary');
    }, [navigate, refetchUser]);

    const handleChange = (e) => {
        const {name, value} = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (authError) setAuthError(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await sendLoginRequest(formData);
    };

    const sendLoginRequest = async (data) => {
        const result = await fetch(`${BASE_URL}/${API_VERSION}/auth/token/`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {'Content-Type': 'application/json'}
        });

        if (result.status === 200) {
            const data = await result.json();

            localStorage.setItem('refresh_token', data.refresh);
            localStorage.setItem('access_token', data.access);

            // 🔥 КРИТИЧНО: синхронизируем пользователя
            await refetchUser();

            navigate('/', {replace: true});

        } else if (result.status === 400) {
            const err = await result.text();
            await sendForDebug(err);

        } else if (result.status === 401) {
            setAuthError(true);
            await sendForDebug(await result.text());
        }
    };

    return (
        <div className={styles.loginContainer}>
            <form onSubmit={(e) => handleSubmit(e)} className={styles.loginForm}>
                <h2>Вход</h2>

                <div className={styles.formGroup}>
                    <label htmlFor="username">Имя пользователя</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Введите username"
                        required
                        className={authError ? styles.inputError : ""}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="password">Пароль</label>

                    <div className={styles.passwordWrapper}>
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Введите пароль"
                            required
                            className={`${authError ? styles.inputError : ""} ${styles.passwordInput}`}
                            autoComplete="password"
                        />
                        <button
                            type="button"
                            className={styles.togglePassword}
                            onClick={() => setShowPassword(prev => !prev)}
                            tabIndex={-1}
                        >
                            {showPassword ? <FiEyeOff size={20}/> : <FiEye size={20}/>}
                        </button>
                    </div>

                    {authError && (
                        <div className={styles.errorMessage}>
                            Неверный логин или пароль
                        </div>
                    )}
                </div>

                <div className={styles.passwordActions}>
                    <Link to="/reset" className={styles.forgotPassword}>
                        Забыли пароль?
                    </Link>
                </div>
                <button type="submit" className={styles.loginBtn}>
                    Войти
                </button>
                <p className={styles.mutedText}>Или войдите через</p>
                <div className={styles.socialAuth}>
                    <div id="vkAuth" className={styles.authContainer}></div>
                    <div id="tgAuth" className={styles.authContainer}></div>
                </div>

                <p className={styles.registerLink}>
                    Еще не зарегистрированы? <a href="/registration">Присоединиться</a>
                </p>
            </form>
        </div>
    );

};

export default LoginForm;
