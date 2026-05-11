import {API_VERSION, BASE_URL, sendForDebug} from './utils.js';


/**
 * Обработчик успешной авторизации через Telegram
 */
export const handleTelegramAuth = async (user, navigate, refetchUser) => {
    // user содержит:
    // id, first_name, last_name, username, photo_url, auth_date, hash
    const params = new URLSearchParams(user).toString();
    const res = await fetch(`${BASE_URL}/${API_VERSION}/auth/tg/callback/?${params}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (res.ok) {
        const data = await res.json();
        console.log(data);
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        console.log(typeof refetchUser);
        if (typeof refetchUser === 'function') {
            console.log('function')
            await refetchUser();
        }
        navigate('/profile');
    } else {
        const errText = await res.text();
        await sendForDebug(errText);
    }
};

/**
 * Создаёт callback функцию для обработчика Telegram авторизации
 */
export const createTGAuthHandler = (navigate, refetchUser) => {
    return async (user) => {
        await handleTelegramAuth(user, navigate, refetchUser);
    };
};

/**
 * Инициализирует Telegram виджет и настраивает обработчик успешной авторизации
 */
export const initializeTelegramWidget = (onAuthCallback) => {
    // Устанавливаем глобальный обработчик для Telegram виджета
    window.onTelegramAuth = onAuthCallback;

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.setAttribute('data-telegram-login', 'socialpulsesandboxbot');
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');

    const container = document.getElementById('tgAuth');
    if (container) {
        container.appendChild(script);
    }

    return () => {
        if (container && script.parentNode === container) {
            container.removeChild(script);
        }
    };
};
