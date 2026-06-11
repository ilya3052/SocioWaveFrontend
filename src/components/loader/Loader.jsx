import React from 'react';
import styles from './loader.module.css';

const Loader = ({text = "Загрузка...", fullPage = false}) => {
    return (
        <div className={`${styles.loader} ${fullPage ? styles.fullPage : ''}`}>
            <div className={styles.spinner}/>
            {text && <span className={styles.text}>{text}</span>}
        </div>
    );
};

export default Loader;
