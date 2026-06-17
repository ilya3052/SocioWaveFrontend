import {Pie} from 'react-chartjs-2';
import {ArcElement, Chart as ChartJS, Legend, Tooltip} from 'chart.js';
import styles from './chart.module.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const PlatformChart = ({groupStats}) => {
    const vkCount = Number(groupStats?.vk_count) || 0;
    const tgCount = Number(groupStats?.tg_count) || 0;
    const total = vkCount + tgCount;

    const getPercentage = (value) => {
        if (total === 0) return 0;
        return (value / total) * 100;
    };

    const vkPercent = getPercentage(vkCount);
    const tgPercent = getPercentage(tgCount);

    const chartData = {
        labels: ['VK', 'Telegram'],
        datasets: [
            {
                data: [vkCount, tgCount],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(34, 139, 230, 0.8)',
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(34, 139, 230, 1)',
                ],
                borderWidth: 1,
                hoverOffset: 4,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const label = context.label;
                        const value = context.raw;

                        const percent = total === 0
                            ? 0
                            : (value / total) * 100;

                        return `${label}: ${value} шт. (${percent.toFixed(1)}%)`;
                    }
                }
            }
        },
        cutout: '0%',
    };

    return (
        <div className={styles.chartCard}>
            <h3>Распределение по платформам</h3>

            <div className={styles.chartPlaceholder}>
                <div className={styles.pieChart}>
                    <Pie data={chartData} options={chartOptions}/>
                </div>

                <div className={styles.chartLegend}>
                    <div className={styles.legendItem}>
                        <span className={`${styles.legendColor} ${styles.vkColor}`}></span>
                        <span className={styles.legendText}>
                            VK — {vkCount} шт. ({vkPercent.toFixed(1)}%)
                        </span>
                    </div>

                    <div className={styles.legendItem}>
                        <span className={`${styles.legendColor} ${styles.tgColor}`}></span>
                        <span className={styles.legendText}>
                            Telegram — {tgCount} шт. ({tgPercent.toFixed(1)}%)
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlatformChart;