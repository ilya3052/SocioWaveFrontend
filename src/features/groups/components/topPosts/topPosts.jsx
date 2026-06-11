import React, {useState} from 'react';
import styles from './topPosts.module.css';
import Loader from "../../../../components/loader/Loader.jsx";

const PostCard = ({ label, post }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!post) return null;

    const text = post.text || '';
    const isLongText = text.length > 150;
    const displayText = isLongText && !isExpanded
        ? text.slice(0, 150) + '...'
        : text;

    return (
        <div className={styles.topPostCard}>
            <div className={styles.topPostLabel}>{label}</div>
            <div className={styles.postText}>
                {displayText}
                {isLongText && (
                    <button
                        className={styles.expandBtn}
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? ' Свернуть' : ' Читать далее'}
                    </button>
                )}
            </div>
            {post.link && (
                <a
                    href={post.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.postLink}
                >
                    Открыть пост
                </a>
            )}
            <div className={styles.postMetrics}>
                {post.metrics?.likes !== undefined && <span>Реакций: {post.metrics.likes}</span>}
                {post.metrics?.views !== undefined && <span className={styles.metricSeparator}>|</span>}
                {post.metrics?.views !== undefined && <span>Просмотров: {post.metrics.views}</span>}
                {post.metrics?.comments !== undefined && <span className={styles.metricSeparator}>|</span>}
                {post.metrics?.comments !== undefined && <span>Комментариев: {post.metrics.comments}</span>}
                {post.metrics?.reposts !== undefined && <span className={styles.metricSeparator}>|</span>}
                {post.metrics?.reposts !== undefined && <span>Репостов: {post.metrics.reposts}</span>}
            </div>
        </div>
    );
};

const TopPosts = ({bestPosts}) => {
    if (!bestPosts) {
        return <Loader text="Загрузка лучших постов..."/>;
    }
    if ('error' in bestPosts) {
        return <div>{bestPosts.error}</div>;
    }

    const updatedAt = new Date(bestPosts.last_updated_at);
    const updatedDate = updatedAt.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    const posts = [
        { label: 'Больше всего просмотров', post: bestPosts.most_viewed },
        { label: 'Больше всего лайков', post: bestPosts.most_liked },
        { label: 'Больше всего комментариев', post: bestPosts.most_commented },
        { label: 'Больше всего репостов', post: bestPosts.most_reposted },
    ];

    return (
        <section className={styles.groupTopPosts}>
            <h2>Лучшие посты за неделю</h2>
            <div className={styles.topPostsGrid}>
                {posts.map((item, index) => (
                    <PostCard key={index} label={item.label} post={item.post} />
                ))}
            </div>
            <p className={styles.updatedInfo}>Обновлено: {updatedDate}</p>
        </section>
    );
};

export default TopPosts;