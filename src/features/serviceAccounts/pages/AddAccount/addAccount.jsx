// AddAccountPage.jsx
import React, {useEffect, useState} from 'react';
import styles from './addAccount.module.css';
import PlatformSelector from "../../../../components/platformSelector/platformSelector.jsx";
import DataForm from "../../components/DataForm/dataForm.jsx";
import {useNavigate} from "react-router-dom";
import {API_VERSION, BASE_URL} from "../../../../utils/utils.js";
import toast from "react-hot-toast";


const AddAccountPage = () => {
    const [platforms, setPlatforms] = useState([]);

    const [activePlatform, setActivePlatform] = useState(null);
    const [loadingPlatforms, setLoadingPlatforms] = useState(true);


    const navigate = useNavigate();

    const fetchPlatforms = async () => {
        try {
            const res = await fetch(`${BASE_URL}/${API_VERSION}/social-entities/platforms/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (res.ok) {
                const data = await res.json();
                setPlatforms(data);
            }
        } catch (err) {
            toast.error('Ошибка при загрузке платформ');
        } finally {
            setLoadingPlatforms(false);
        }
    }


    useEffect(() => {
        fetchPlatforms();
    }, [navigate])

    const platform = platforms.find(p => p.alias === activePlatform);

    return (
        <main className={styles.addAccountContainer}>
            <h1 className={styles.pageTitle}>Добавить сервисный аккаунт</h1>

            <PlatformSelector
                platforms={platforms}
                activePlatform={activePlatform}
                setActivePlatform={setActivePlatform}
                loading={loadingPlatforms}
            />

            {/* Динамический блок ввода данных в зависимости от платформы */}
            {activePlatform && <DataForm platform={platform}/>}

        </main>
    );
};

export default AddAccountPage;