import * as VKID from '@vkid/sdk';
import {API_VERSION, BASE_URL, sendForDebug} from './utils.js';

/**
 * Обмен code и deviceId на VK токены
 */

export const exchangeCode = async (code, deviceId) => {
    const tokens = await VKID.Auth.exchangeCode(code, deviceId);
    localStorage.setItem('vk_access_token', tokens.access_token);
    localStorage.setItem('vk_refresh_token', tokens.refresh_token);
    localStorage.setItem('vk_id_token', tokens.id_token);
    return tokens;
};

/**
 * Отправка обменённых токенов на бэкенд
 */
export const sendExchangedCodes = async (tokens) => {
    const res = await fetch(`${BASE_URL}/${API_VERSION}/auth/vk/callback/`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token ?? null,
            id_token: tokens.id_token ?? null,
            expires_in: tokens.expires_in,
        }),
    });

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Бэкенд: ${res.status} — ${errText}`);
    }

    return await res.json();

};

export const sendBindingCallback = async () => {
    const vk_token = localStorage.getItem('vk_access_token');
    const access_token = localStorage.getItem('access_token');
    const res = await fetch(`${BASE_URL}/${API_VERSION}/auth/vk/user/`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${access_token}`},
        body: JSON.stringify({
            vk_token: vk_token,
        }),
    });
    if (!res.ok) {
        const errText = await res.text();
        await sendForDebug(errText);
    }
}

/**
 * Инициализация VKID OneTap и настройка обработчика успешной авторизации
 */
export const initializeVKID = (onSuccess, type) => {
    VKID.Config.init({
        app: 54438538,
        redirectUrl: 'https://socialpulse.sandbox.com',
        source: VKID.ConfigSource.LOWCODE,
        responseMode: 'callback',
        scope: 'email phone',
    });

    const oneTap = new VKID.OneTap();
    const container = document.getElementById('vkAuth');

    let styles;
    let skin;

    if (type === "primary") {
        styles = {
            width: 240,
            height: 40,
        };
        skin = 'default';
    } else if (type === "secondary") {
        styles = {
            width: 40,
            height: 32
        }
        skin = 'secondary';
    }

    if (container) {
        oneTap.render({
            container: container,
            showAlternativeLogin: true,
            styles: styles,
            skin: skin,
        });
    }

    oneTap.on(VKID.OneTapInternalEvents.LOGIN_SUCCESS, onSuccess);

    return () => {
        oneTap.close();
    };
};

/**
 * Обработчик успешной авторизации через VK (используется как callback для initializeVKID)
 */
export const createVKAuthSuccessHandler = (navigate, refetchUser) => {
    return async (payload) => {
        const code = payload.code;
        const deviceId = payload.device_id;

        if (!code || !deviceId) {
            console.warn('Нет code или device_id');
            return;
        }
        try {
            const tokens = await exchangeCode(code, deviceId);
            const backendData = await sendExchangedCodes(tokens);

            const access_token = backendData.request.access_token;
            const refresh_token = backendData.request.refresh_token;
            const vk_id = backendData.request.vk_id;

            localStorage.setItem('access_token', access_token);
            localStorage.setItem('refresh_token', refresh_token);
            localStorage.setItem('vk_id', vk_id);
            if (typeof refetchUser === 'function') {
                await refetchUser();
            }
        } catch (error) {
            await sendForDebug(error);
            return;
        }
        if (typeof refetchUser === 'function') {
            await refetchUser();
        }
        navigate('/');
    };
};

export const createVKAuthBindingHandler = (navigate, refetchUser) => {
    return async (payload) => {
        const code = payload.code;
        const deviceId = payload.device_id;
        if (!code || !deviceId) {
            console.warn('Нет code или device_id');
            return;
        }
        try {
            const tokens = await exchangeCode(code, deviceId);
            await sendExchangedCodes(tokens);
            await sendBindingCallback();
            if (typeof refetchUser === 'function') {
                await refetchUser();
            }
        } catch (error) {
            await sendForDebug(error);
        }
    }
}
