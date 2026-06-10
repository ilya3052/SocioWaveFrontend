import {useEffect, useState} from "react";
import {Link, useNavigate, useSearchParams} from "react-router-dom";
import styles from "./resetPassword.module.css";
import {API_VERSION, BASE_URL} from "../../../../utils/utils.js";
import {useUser} from "../../../../context/UserContext.jsx";

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const {refetchUser} = useUser();
    const token = searchParams.get("token");

    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(!!token);
    const [tokenValid, setTokenValid] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    useEffect(() => {
        if (!token) return;

        const confirmReset = async () => {
            try {
                const res = await fetch(`${BASE_URL}/${API_VERSION}/auth/password/reset/?token=${token}`, {
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                if (res.status === 200) {
                    setTokenValid(true);
                }
            } finally {
                setLoading(false);
            }
        };

        confirmReset();
    }, [token, navigate]);

    if (loading) {
        return (
            <div className={styles.resetContainer}>
                <div className={styles.loaderCard}>
                    <div className={styles.spinner}></div>
                    <span>Подтверждение сброса пароля...</span>
                </div>
            </div>
        );
    }

    if (tokenValid) {
        const handleSetPassword = async (e) => {
            e.preventDefault();
            const res = await fetch(`${BASE_URL}/${API_VERSION}/users/set-password/?token=${token}`, {
                method: "PATCH",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({new_password: newPassword, confirm_password: confirmPassword, token: token})
            });
            if (res.status === 200) {
                const data = await res.json();
                localStorage.setItem("access_token", data.access);
                localStorage.setItem("refresh_token", data.refresh);
                await refetchUser();
                navigate("/", {replace: true});
            }
        };

        return (
            <div className={styles.resetContainer}>
                <form onSubmit={handleSetPassword} className={styles.resetForm}>
                    <h2>Новый пароль</h2>

                    <div className={styles.formGroup}>
                        <label htmlFor="newPassword">Новый пароль</label>
                        <input
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Введите новый пароль"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="confirmPassword">Подтвердите пароль</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Повторите новый пароль"
                            required
                        />
                    </div>

                    <button type="submit" className={styles.resetBtn}>
                        Установить новый пароль
                    </button>
                </form>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await fetch(`${BASE_URL}/${API_VERSION}/auth/password/send-email/`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({email: email})
            })
        if (res.status === 200) {
            setSubmitted(true);
            return
        }
        setSubmitted(false)
    };

    return (
        <div className={styles.resetContainer}>
            <form onSubmit={handleSubmit} className={styles.resetForm}>
                <h2>Восстановление пароля</h2>

                <div className={styles.formGroup}>
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Введите email"
                        required
                    />
                </div>

                {!submitted ? (
                    <button type="submit" className={styles.resetBtn}>
                        Сбросить пароль
                    </button>
                ) : (
                    <div className={styles.successMessage}>
                        Письмо с инструкциями по восстановлению пароля отправлено на {email}
                    </div>
                )}

                <p className={styles.backLink}>
                    <Link to="/login">Вернуться к входу</Link>
                </p>
            </form>
        </div>
    );
};

export default ResetPassword;
