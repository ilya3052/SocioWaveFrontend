const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_VERSION = import.meta.env.VITE_API_VERSION;
const REDIRECT_URL = import.meta.env.VITE_VK_REDIRECT;
const APP_ID = import.meta.env.VITE_VK_APP_ID;
const BOT_NAME = import.meta.env.VITE_TG_BOT_USERNAME;

const sendForDebug = async (debug_message) => {
    await fetch(`${BASE_URL}/${API_VERSION}/debug/`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            debug_message: debug_message,
        }),
    });
}

const _verifyToken = async (token) => {
    try {
        const response = await fetch(`${BASE_URL}/${API_VERSION}/auth/token/verify/`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({token}),
        });
        return response.ok;
    } catch (err) {
        await sendForDebug(`_verifyToken error: ${err.message}`);
        return false;
    }
};

const _refreshAccessToken = async (refreshToken) => {
    try {
        const response = await fetch(`${BASE_URL}/${API_VERSION}/auth/token/refresh/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${refreshToken}`,
            },
            body: JSON.stringify({refresh: refreshToken}),
        });

        if (!response.ok) {
            await sendForDebug(`_refreshAccessToken failed with status ${response.status}`);
            return null;
        }

        const data = await response.json();
        const newAccess = data.access;

        if (!newAccess) {
            await sendForDebug('_refreshAccessToken: no access token in response');
            return null;
        }

        return newAccess;
    } catch (err) {
        await sendForDebug(`_refreshAccessToken error: ${err.message}`);
        return null;
    }
};


const _clearAuthTokens = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
};


const verifyAndRefreshToken = async () => {
    try {
        const access = localStorage.getItem('access_token');
        const refresh = localStorage.getItem('refresh_token');

        if (!access || !refresh) {
            return false;
        }

        const accessIsValid = await _verifyToken(access);
        if (accessIsValid) {
            return true; // Access токен ещё валиден
        }

        const refreshIsValid = await _verifyToken(refresh);
        if (!refreshIsValid) {
            _clearAuthTokens();
            return false;
        }

        const newAccess = await _refreshAccessToken(refresh);
        if (!newAccess) {
            _clearAuthTokens();
            return false;
        }

        localStorage.setItem('access_token', newAccess);
        return true;

    } catch (err) {
        await sendForDebug(`verifyAndRefreshToken error: ${err.message}`);
        _clearAuthTokens();
        return false;
    }
};

const logout = async (navigate) => {
    const res = await fetch(`${BASE_URL}/${API_VERSION}/auth/token/blacklist/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({refresh: localStorage.getItem("refresh_token")}),
    });
    if (res.ok) {
        localStorage.clear();
    } else if (res.status === 400) {
        const err = await res.text();
        await sendForDebug(err);
    }
    navigate('/login');
}

const confirmEmail = async ({navigate, setEmailSent, setEmailError, notifEmail = null}) => {
    try {
        if (!(await verifyAndRefreshToken())) {
            navigate("/login");
            return;
        }
        const token = localStorage.getItem("access_token");
        let email_param = '';
        if (notifEmail) {
            email_param = `?email=${notifEmail}`;
        }
        const res = await fetch(`${BASE_URL}/${API_VERSION}/auth/email/send/${email_param}`, {
            method: "GET",
            headers: {'Authorization': `Bearer ${token}`,}
        });
        if (res.ok) {
            setEmailSent(true);
        } else {
            setEmailError(true);
        }
    } catch (err) {
        setEmailError(true);
    }
}

const handleTGBind = async ({navigate, toast}) => {
    try {
        if (!(await verifyAndRefreshToken())) {
            navigate("/login");
            return;
        }
        const access_token = localStorage.getItem("access_token");
        const refresh_token = localStorage.getItem("refresh_token");
        const response = await fetch(`${BASE_URL}/${API_VERSION}/auth/tg/token/short/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${access_token}`,
            },
            body: JSON.stringify({
                "access_token": access_token,
                "refresh_token": refresh_token,
            })
        });
        if (response.status === 201) {
            const short_token = (await response.json()).short_token;
            localStorage.setItem("short_tg_token", short_token);
            window.open(`https://t.me/socialpulsesandboxbot?start=${short_token}`, "_blank");
        } else if (response.status === 400) {
            const err = await response.text();
            toast.error(err);
            await sendForDebug(err);
        }
    } catch (err) {
        toast.error('Ошибка при привязке Telegram');
        await sendForDebug(err);
    }
}


export {sendForDebug, BASE_URL, API_VERSION, REDIRECT_URL, APP_ID, BOT_NAME, verifyAndRefreshToken, logout, confirmEmail, handleTGBind};
