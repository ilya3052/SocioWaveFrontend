// TopPosts.jsx
import React from 'react';
import styles from './topPosts.module.css';

const TopPosts = () => {
    return (
        <section className={styles.groupTopPosts}>
            <h2>Лучшие посты</h2>
            <div className={styles.topPostsGrid}>
                <div className={styles.topPostCard}>
                    <div className={styles.topPostLabel}>Больше всего просмотров</div>
                    <div className={styles.topPostTitle}>Пример поста 1</div>
                    <div className={styles.topPostValue}>12 345 просмотров</div>
                </div>
                <div className={styles.topPostCard}>
                    <div className={styles.topPostLabel}>Больше всего лайков</div>
                    <div className={styles.topPostTitle}>Пример поста 2</div>
                    <div className={styles.topPostValue}>4 567 лайков</div>
                </div>
                <div className={styles.topPostCard}>
                    <div className={styles.topPostLabel}>Больше всего комментариев</div>
                    <div className={styles.topPostTitle}>Пример поста 3</div>
                    <div className={styles.topPostValue}>890 комментариев</div>
                </div>
                <div className={styles.topPostCard}>
                    <div className={styles.topPostLabel}>Больше всего репостов</div>
                    <div className={styles.topPostTitle}>Пример поста 4</div>
                    <div className={styles.topPostValue}>1 234 репоста</div>
                </div>
            </div>
        </section>
    );
};

export default TopPosts;