import {createContext, useContext, useEffect, useState} from "react";
import {API_VERSION, BASE_URL, verifyAndRefreshToken} from "../utils/utils.js";

export const UserContext = createContext(null);

export const useUser = () => useContext(UserContext);

export const UserProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchUser = async () => {
        if (isRefreshing) return;

        setLoading(true);
        const getUserData = async (token) => {
            return await fetch(`${BASE_URL}/${API_VERSION}/users/me/`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });
        }
        try {
            let token = localStorage.getItem("access_token");

            if (!token) {
                setUser(null);
                setLoading(false);
                return;
            }

            let res = await getUserData(token);

            if (res.status === 401) {
                if (isRefreshing) {
                    return;
                }
                setIsRefreshing(true);
                const refreshed = await verifyAndRefreshToken();
                setIsRefreshing(false);

                if (!refreshed) {
                    setUser(null);
                    setLoading(false);
                    return;
                }
                token = localStorage.getItem("access_token");
                res = await getUserData(token);
            }

            const data = await res.json();
            setUser(data.data);

        } catch (e) {
            console.error("Failed to fetch user:", e);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    return (
        <UserContext.Provider value={{user, loading, refetchUser: fetchUser, setUser}}>
            {children}
        </UserContext.Provider>
    );
};