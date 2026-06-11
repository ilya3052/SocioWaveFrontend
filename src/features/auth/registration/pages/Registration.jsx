import {useEffect, useState} from "react";
import {useUser} from "../../../../context/UserContext.jsx";
import {sendForDebug} from '../../../../utils/utils.js';
import toast from 'react-hot-toast';
import styles from "./registration.module.css";
import {useNavigate} from "react-router-dom";
import {createVKAuthSuccessHandler, initializeVKID} from "../../../../utils/OneTapVKAuth.jsx";
import {createTGAuthHandler, initializeTelegramWidget} from "../../../../utils/TGAuth.jsx";
import {FiEye, FiEyeOff} from "react-icons/fi";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_VERSION = import.meta.env.VITE_API_VERSION;

const RegistrationForm = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password2: ''
    });
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();
    const {refetchUser} = useUser();

    const [usernameError, setUsernameError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        return initializeTelegramWidget(createTGAuthHandler(navigate, refetchUser));
    }, [navigate, refetchUser]);

    useEffect(() => {
        return initializeVKID(createVKAuthSuccessHandler(navigate, refetchUser));
    }, [navigate, refetchUser]);

    useEffect(() => {
        setUsernameError("");
    }, [formData.username]);

    useEffect(() => {
        if (!submitted) return;
        if (formData.password && formData.password2 && formData.password !== formData.password2) {
            setPasswordError("Пароли не совпадают");
        } else if (!formData.password || !formData.password2) {
            setPasswordError("Заполните оба поля пароля");
        } else {
            setPasswordError("");
        }
    }, [formData.password, formData.password2, submitted]);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const sendRegistrationRequest = async (data) => {
        try {
            const response = await fetch(`${BASE_URL}/${API_VERSION}/users/register/`, {
                method: "POST",
                body: JSON.stringify(data),
                headers: {"Content-Type": "application/json"},
            });

            if (response.status === 201) {
                const result = await response.json();
                localStorage.setItem("access_token", result.tokens.access);
                localStorage.setItem("refresh_token", result.tokens.refresh);
                toast.success('Регистрация прошла успешно');
                await refetchUser();
                navigate("/profile");
            } else if (response.status === 400) {
                const err = await response.json();
                if (err.username) {
                    setUsernameError("Пользователь с таким именем уже существует");
                }
                await sendForDebug(err);
            } else {
                toast.error("Ошибка сервера");
            }
        } catch (err) {
            toast.error("Не удалось подключиться к серверу");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitted(true);
        if (passwordError || usernameError) return;
        if (!formData.password || !formData.password2) return;

        await sendRegistrationRequest(formData);
    };

    return (
        <div className={styles.registrationContainer}>
            <form onSubmit={(e) => handleSubmit(e)} className={styles.registrationForm}>
                <h2>Регистрация</h2>

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
                        className={`${styles.formControl} ${
                            usernameError ? styles.inputError : ""
                        }`}
                    />
                    {usernameError && (
                        <div className={styles.errorMessage}>{usernameError}</div>
                    )}
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Введите email"
                        required
                        className={styles.formControl}
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
                            className={styles.formControl}
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
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="confirmPassword">Подтверждение пароля</label>
                    <input
                        type="password"
                        id="password2"
                        name="password2"
                        value={formData.password2}
                        onChange={handleChange}
                        placeholder="Подтвердите пароль"
                        required
                        className={`${styles.formControl} ${
                            passwordError ? styles.inputError : ""
                        }`}
                    />
                    {passwordError && (
                        <div className={styles.errorMessage}>{passwordError}</div>
                    )}
                </div>

                <button type="submit" className={styles.registerBtn}>
                    Зарегистрироваться
                </button>
                <p className={styles.mutedText}>Или зарегистрируйтесь через</p>
                <div className={styles.socialAuth}>
                    <div id="vkAuth" className={styles.authContainer}></div>
                    <div id="tgAuth" className={styles.authContainer}></div>
                </div>

                <p className={styles.loginLink}>
                    Уже зарегистрированы? <a href="/login">Войти</a>
                </p>
            </form>
        </div>
    );
}

export default RegistrationForm;
