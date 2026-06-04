import React, {useEffect, useRef, useState} from 'react';
import styles from './detailInfo.module.css';
import TopPosts from "../../components/topPosts/topPosts.jsx";
import {useNavigate, useParams} from "react-router-dom";
import {API_VERSION, BASE_URL, sendForDebug, verifyAndRefreshToken} from "../../../../utils/utils.js";
import * as echarts from 'echarts';

const DetailInfo = () => {
    const {slug} = useParams();
    const [groupData, setGroupData] = useState(null);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

    const [bestPostData, setBestPostData] = useState(null);

    const [dailyData, setDailyData] = useState(null);
    const [hourlyData, setHourlyData] = useState(null);

    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const subscribersDivRef = useRef(null);
    const subscribersChartRef = useRef(null);
    // const activityDivRef = useRef(null);
    // const activityChartRef = useRef(null);
    const deltaDivRef = useRef(null);
    const deltaChartRef = useRef(null);
    const histContainerRefs = [useRef(null), useRef(null), useRef(null)];
    const histChartInstances = useRef([]);
    const [histClickInfo, setHistClickInfo] = useState(null);
    const [histScales, setHistScales] = useState(['log', 'log', 'log']);
    const [isSaving, setIsSaving] = useState(false);
    const navigate = useNavigate();
    const stats = groupData?.abs_stats;

    const fetchGroupDetailData = async () => {
        let token = localStorage.getItem("access_token");
        if (!token) {
            if (!(await verifyAndRefreshToken())) {
                navigate("/login");
                return;
            }
            return;
        }
        token = localStorage.getItem("access_token");
        const res = await fetch(`${BASE_URL}/${API_VERSION}/social-entities/groups/${slug}/?exclude_fields=service_account_id,user,external_id,slug`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });
        if (res.ok) {
            return await res.json();
        }
        return await res.text();
    }

    const fetchGroupBestPosts = async (group_id) => {
        let token = localStorage.getItem("access_token");
        if (!token) {
            if (!(await verifyAndRefreshToken())) {
                navigate("/login");
                return;
            }
            return;
        }
        token = localStorage.getItem("access_token");
        const res = await fetch(`${BASE_URL}/${API_VERSION}/stats/${group_id}/best/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });
        if (res.ok) {
            return await res.json();
        }
    }

    const fetchSnapshotStatsData = async (group_id) => {
        let token = localStorage.getItem("access_token");
        if (!token) {
            if (!(await verifyAndRefreshToken())) {
                navigate("/login");
                return;
            }
            return;
        }
        token = localStorage.getItem("access_token");
        const res = await fetch(`${BASE_URL}/${API_VERSION}/stats/${group_id}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });
        if (res.ok) {
            return await res.json();
        }
    }

    const handleBarClick = async (post_id, range) => {
        if (post_id <= 0) return;

        setHistClickInfo({
            loading: true,
            group_name: groupData?.name || 'Название группы',
            group_url: groupData?.external_url || '#',
            pub_date: null,
            text: null,
            likes: null,
            comments: null,
            views: null,
            reposts: null,
            range,
            post_id,
        });

        let token = localStorage.getItem("access_token");
        if (!token) {
            if (!(await verifyAndRefreshToken())) {
                navigate("/login");
                return;
            }
        }
        token = localStorage.getItem("access_token");
        const res = await fetch(`${BASE_URL}/${API_VERSION}/social-entities/groups/${groupData.id}/get-post/?post_id=${post_id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        if (res.ok) {
            const data = await res.json();
            setHistClickInfo({ loading: false, ...data });
        } else {
            setHistClickInfo(prev => ({ ...prev, loading: false }));
        }
    }

    useEffect(() => {
        fetchGroupDetailData().then(
            async res => {
                // console.log(res)
                setGroupData(res);
                if (res.status === 'SUCCESS') {
                    const [bestPosts, snapshotStats] = await Promise.all([
                        fetchGroupBestPosts(res.id),
                        fetchSnapshotStatsData(res.id)
                    ]);
                    setBestPostData(bestPosts);
                    const daily = [];
                    const hourly = [];
                    for (let i = 0; i < snapshotStats.length; i++) {
                        if (snapshotStats[i].type === 'DAILY') {
                            daily.push(snapshotStats[i]);
                        } else {
                            hourly.push(snapshotStats[i]);
                        }
                    }
                    setDailyData(
                        [{'stats': {'participants_delta': 9}, 'timestamp': '2026-02-23T13:29:25.631'},
                            {'stats': {'participants_delta': 1}, 'timestamp': '2026-02-24T13:29:25.631'},
                            {'stats': {'participants_delta': 5}, 'timestamp': '2026-02-25T13:29:25.631'},
                            {'stats': {'participants_delta': 7}, 'timestamp': '2026-02-26T13:29:25.631'},
                            {'stats': {'participants_delta': 9}, 'timestamp': '2026-02-27T13:29:25.631'},
                            {'stats': {'participants_delta': 13}, 'timestamp': '2026-02-28T13:29:25.631'},
                            {'stats': {'participants_delta': -1}, 'timestamp': '2026-03-01T13:29:25.631'},
                            {'stats': {'participants_delta': 6}, 'timestamp': '2026-03-02T13:29:25.631'},
                            {'stats': {'participants_delta': 8}, 'timestamp': '2026-03-03T13:29:25.631'},
                            {'stats': {'participants_delta': 11}, 'timestamp': '2026-03-04T13:29:25.631'},
                            {'stats': {'participants_delta': 3}, 'timestamp': '2026-03-05T13:29:25.631'},
                            {'stats': {'participants_delta': 0}, 'timestamp': '2026-03-06T13:29:25.631'},
                            {'stats': {'participants_delta': 15}, 'timestamp': '2026-03-07T13:29:25.631'},
                            {'stats': {'participants_delta': 12}, 'timestamp': '2026-03-08T13:29:25.631'},
                            {'stats': {'participants_delta': 5}, 'timestamp': '2026-03-09T13:29:25.631'},
                            {'stats': {'participants_delta': 13}, 'timestamp': '2026-03-10T13:29:25.631'},
                            {'stats': {'participants_delta': 11}, 'timestamp': '2026-03-11T13:29:25.631'},
                            {'stats': {'participants_delta': 1}, 'timestamp': '2026-03-12T13:29:25.631'},
                            {'stats': {'participants_delta': 15}, 'timestamp': '2026-03-13T13:29:25.631'},
                            {'stats': {'participants_delta': 11}, 'timestamp': '2026-03-14T13:29:25.631'},
                            {'stats': {'participants_delta': 14}, 'timestamp': '2026-03-15T13:29:25.631'},
                            {'stats': {'participants_delta': 13}, 'timestamp': '2026-03-16T13:29:25.631'},
                            {'stats': {'participants_delta': 8}, 'timestamp': '2026-03-17T13:29:25.631'},
                            {'stats': {'participants_delta': 12}, 'timestamp': '2026-03-18T13:29:25.631'},
                            {'stats': {'participants_delta': 10}, 'timestamp': '2026-03-19T13:29:25.631'},
                            {'stats': {'participants_delta': 2}, 'timestamp': '2026-03-20T13:29:25.631'},
                            {'stats': {'participants_delta': 5}, 'timestamp': '2026-03-21T13:29:25.631'},
                            {'stats': {'participants_delta': 6}, 'timestamp': '2026-03-22T13:29:25.631'},
                            {'stats': {'participants_delta': 15}, 'timestamp': '2026-03-23T13:29:25.631'},
                            {'stats': {'participants_delta': 2}, 'timestamp': '2026-03-24T13:29:25.631'},
                            {'stats': {'participants_delta': 13}, 'timestamp': '2026-03-25T13:29:25.631'},
                            {'stats': {'participants_delta': 9}, 'timestamp': '2026-03-26T13:29:25.631'},
                            {'stats': {'participants_delta': 4}, 'timestamp': '2026-03-27T13:29:25.631'},
                            {'stats': {'participants_delta': 1}, 'timestamp': '2026-03-28T13:29:25.631'},
                            {'stats': {'participants_delta': 8}, 'timestamp': '2026-03-29T13:29:25.631'},
                            {'stats': {'participants_delta': 3}, 'timestamp': '2026-03-30T13:29:25.631'},
                            {'stats': {'participants_delta': 9}, 'timestamp': '2026-03-31T13:29:25.631'},
                            {'stats': {'participants_delta': 10}, 'timestamp': '2026-04-01T13:29:25.631'},
                            {'stats': {'participants_delta': 15}, 'timestamp': '2026-04-02T13:29:25.631'},
                            {'stats': {'participants_delta': 4}, 'timestamp': '2026-04-03T13:29:25.631'},
                            {'stats': {'participants_delta': 0}, 'timestamp': '2026-04-04T13:29:25.631'},
                            {'stats': {'participants_delta': 6}, 'timestamp': '2026-04-05T13:29:25.631'},
                            {'stats': {'participants_delta': 7}, 'timestamp': '2026-04-06T13:29:25.631'},
                            {'stats': {'participants_delta': 7}, 'timestamp': '2026-04-07T13:29:25.631'},
                            {'stats': {'participants_delta': 2}, 'timestamp': '2026-04-08T13:29:25.631'},
                            {'stats': {'participants_delta': 10}, 'timestamp': '2026-04-09T13:29:25.631'},
                            {'stats': {'participants_delta': 12}, 'timestamp': '2026-04-10T13:29:25.631'},
                            {'stats': {'participants_delta': 13}, 'timestamp': '2026-04-11T13:29:25.631'},
                            {'stats': {'participants_delta': 4}, 'timestamp': '2026-04-12T13:29:25.631'},
                            {'stats': {'participants_delta': 9}, 'timestamp': '2026-04-13T13:29:25.631'},
                            {'stats': {'participants_delta': 7}, 'timestamp': '2026-04-14T13:29:25.631'},
                            {'stats': {'participants_delta': 0}, 'timestamp': '2026-04-15T13:29:25.631'},
                            {'stats': {'participants_delta': -1}, 'timestamp': '2026-04-16T13:29:25.631'},
                            {'stats': {'participants_delta': -1}, 'timestamp': '2026-04-17T13:29:25.631'},
                            {'stats': {'participants_delta': 11}, 'timestamp': '2026-04-18T13:29:25.631'},
                            {'stats': {'participants_delta': 1}, 'timestamp': '2026-04-19T13:29:25.631'},
                            {'stats': {'participants_delta': 1}, 'timestamp': '2026-04-20T13:29:25.631'},
                            {'stats': {'participants_delta': -1}, 'timestamp': '2026-04-21T13:29:25.631'},
                            {'stats': {'participants_delta': 12}, 'timestamp': '2026-04-22T13:29:25.631'},
                            {'stats': {'participants_delta': 10}, 'timestamp': '2026-04-23T13:29:25.631'},
                            {'stats': {'participants_delta': 10}, 'timestamp': '2026-04-24T13:29:25.631'},
                            {'stats': {'participants_delta': 1}, 'timestamp': '2026-04-25T13:29:25.631'},
                            {'stats': {'participants_delta': 13}, 'timestamp': '2026-04-26T13:29:25.631'},
                            {'stats': {'participants_delta': 7}, 'timestamp': '2026-04-27T13:29:25.631'},
                            {'stats': {'participants_delta': 6}, 'timestamp': '2026-04-28T13:29:25.631'},
                            {'stats': {'participants_delta': 4}, 'timestamp': '2026-04-29T13:29:25.631'},
                            {'stats': {'participants_delta': 10}, 'timestamp': '2026-04-30T13:29:25.631'},
                            {'stats': {'participants_delta': 3}, 'timestamp': '2026-05-01T13:29:25.631'},
                            {'stats': {'participants_delta': 12}, 'timestamp': '2026-05-02T13:29:25.631'},
                            {'stats': {'participants_delta': 14}, 'timestamp': '2026-05-03T13:29:25.631'},
                            {'stats': {'participants_delta': 9}, 'timestamp': '2026-05-04T13:29:25.631'},
                            {'stats': {'participants_delta': 6}, 'timestamp': '2026-05-05T13:29:25.631'},
                            {'stats': {'participants_delta': 14}, 'timestamp': '2026-05-06T13:29:25.631'},
                            {'stats': {'participants_delta': 6}, 'timestamp': '2026-05-07T13:29:25.631'},
                            {'stats': {'participants_delta': 13}, 'timestamp': '2026-05-08T13:29:25.631'},
                            {'stats': {'participants_delta': 11}, 'timestamp': '2026-05-09T13:29:25.631'},
                            {'stats': {'participants_delta': 2}, 'timestamp': '2026-05-10T13:29:25.631'},
                            {'stats': {'participants_delta': 6}, 'timestamp': '2026-05-11T13:29:25.631'},
                            {'stats': {'participants_delta': 5}, 'timestamp': '2026-05-12T13:29:25.631'},
                            {'stats': {'participants_delta': -1}, 'timestamp': '2026-05-13T13:29:25.631'},
                            {'stats': {'participants_delta': 5}, 'timestamp': '2026-05-14T13:29:25.631'},
                            {'stats': {'participants_delta': 8}, 'timestamp': '2026-05-15T13:29:25.631'},
                            {'stats': {'participants_delta': 5}, 'timestamp': '2026-05-16T13:29:25.631'},
                            {'stats': {'participants_delta': 6}, 'timestamp': '2026-05-17T13:29:25.631'},
                            {'stats': {'participants_delta': 3}, 'timestamp': '2026-05-18T13:29:25.631'},
                            {'stats': {'participants_delta': 2}, 'timestamp': '2026-05-19T13:29:25.631'},
                            {'stats': {'participants_delta': 12}, 'timestamp': '2026-05-20T13:29:25.631'},
                            {'stats': {'participants_delta': 12}, 'timestamp': '2026-05-21T13:29:25.631'},
                            {'stats': {'participants_delta': 15}, 'timestamp': '2026-05-22T13:29:25.631'},
                            {'stats': {'participants_delta': 5}, 'timestamp': '2026-05-23T13:29:25.631'},
                            {'stats': {'participants_delta': 0}, 'timestamp': '2026-05-24T13:29:25.631'},
                            {'stats': {'participants_delta': 15}, 'timestamp': '2026-05-25T13:29:25.631'},
                            {'stats': {'participants_delta': 11}, 'timestamp': '2026-05-26T13:29:25.631'},
                            {'stats': {'participants_delta': 15}, 'timestamp': '2026-05-27T13:29:25.631'},
                            {'stats': {'participants_delta': 3}, 'timestamp': '2026-05-28T13:29:25.631'},
                            {'stats': {'participants_delta': 10}, 'timestamp': '2026-05-29T13:29:25.631'},
                            {'stats': {'participants_delta': 8}, 'timestamp': '2026-05-30T13:29:25.631'},
                            {'stats': {'participants_delta': 7}, 'timestamp': '2026-05-31T13:29:25.631'},
                            {'stats': {'participants_delta': 7}, 'timestamp': '2026-06-01T13:29:25.631'},
                            {'stats': {'participants_delta': 5}, 'timestamp': '2026-06-02T13:29:25.631'}]
                    );

                    setDailyData(daily);
                    setHourlyData(hourly);
                }
            }
        ).catch(async e => {
            console.error(e);
            await sendForDebug(e);
        });

    }, []);

    useEffect(() => {
        if (!dailyData || !dailyData.length || !stats || !subscribersDivRef.current) return;

        const labels = [];
        const data = [];

        let cumulative = stats.participants_count;
        data.unshift(cumulative);
        labels.unshift((new Date()).toLocaleDateString('ru-RU'))

        for (let i = dailyData.length - 1; i >= 0; i--) {
            const item = dailyData[i];
            const date = new Date(item.timestamp);
            date.setDate(date.getDate() - 1);
            labels.unshift(date.toLocaleDateString('ru-RU'));

            const delta = item.stats?.participants_delta || 0;
            cumulative -= delta;
            data.unshift(cumulative);
        }

        if (subscribersChartRef.current) subscribersChartRef.current.dispose();

        const dataMin = Math.min(...data);
        const dataMax = Math.max(...data);
        const padding = Math.max((dataMax - dataMin) * 0.1, 1).toFixed(0);
        const visiblePoints = 30;
        const totalPoints = labels.length;

        subscribersChartRef.current = echarts.init(subscribersDivRef.current);
        subscribersChartRef.current.setOption({
            tooltip: { trigger: 'axis' },
            grid: { left: 60, right: 20, top: 10, bottom: 70 },
            xAxis: {
                type: 'category',
                data: labels,
                name: 'Дата',
                nameLocation: 'center',
                nameGap: 30,
                nameTextStyle: { fontSize: 12, fontWeight: 500, color: '#666' },
                axisLine: { lineStyle: { color: '#ddd' } },
                axisLabel: { fontSize: 11 },
            },
            yAxis: {
                type: 'value',
                scale: true,
                min: dataMin - padding,
                name: 'Подписчики',
                nameLocation: 'center',
                nameGap: 45,
                nameTextStyle: { fontSize: 12, fontWeight: 500, color: '#666' },
                splitLine: { lineStyle: { color: '#e9ecef' } },
            },
            series: [{
                type: 'line',
                data,
                lineStyle: { color: '#2c5aa0', width: 2 },
            }],
            dataZoom: [
                { type: 'inside', xAxisIndex: 0, zoomOnMouseWheel: true, moveOnMouseMove: true, startValue: Math.max(0, totalPoints - visiblePoints),
                    endValue: totalPoints - 1,},
                { type: 'slider', xAxisIndex: 0, bottom: 8, height: 12, startValue: Math.max(0, totalPoints - visiblePoints),
                    endValue: totalPoints - 1, borderColor: '#ddd', fillerColor: 'rgba(44, 90, 160, 0.15)', handleStyle: { borderColor: '#2c5aa0' } },
            ],
        });

        return () => { if (subscribersChartRef.current) subscribersChartRef.current.dispose(); };
    }, [dailyData, stats]);

    useEffect(() => {
        if (!dailyData || !dailyData.length || !deltaDivRef.current) return;

        const labels = [];
        const deltas = [];
        for (let i = 0; i < dailyData.length; i++) {
            const item = dailyData[i];
            labels.push(new Date(item.timestamp).toLocaleDateString('ru-RU'));
            deltas.push(item.stats?.participants_delta ?? 0);
        }
        if (deltaChartRef.current) deltaChartRef.current.dispose();

        const visiblePoints = 30;
        const totalPoints = labels.length;
        deltaChartRef.current = echarts.init(deltaDivRef.current);
        deltaChartRef.current.setOption({
            tooltip: { trigger: 'axis' },
            grid: { left: 60, right: 20, top: 10, bottom: 70 },
            xAxis: {
                type: 'category',
                data: labels,
                name: 'Дата',
                nameLocation: 'center',
                nameGap: 30,
                nameTextStyle: { fontSize: 12, fontWeight: 500, color: '#666' },
                axisLine: { lineStyle: { color: '#ddd' } },
                axisLabel: { fontSize: 11 },
            },
            yAxis: {
                type: 'value',
                name: 'Прирост',
                nameLocation: 'center',
                nameGap: 45,
                nameTextStyle: { fontSize: 12, fontWeight: 500, color: '#666' },
                splitLine: { lineStyle: { color: '#e9ecef' } },
            },
            series: [{
                type: 'line',
                data: deltas,
                itemStyle: {
                    color: {
                        type: 'linear',
                        x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [
                            { offset: 0, color: '#27ae60' },
                            { offset: 1, color: '#2ecc71' },
                        ],
                    },
                    borderRadius: [2, 2, 0, 0],
                },
            }],
            dataZoom: [
                {
                    type: 'inside',
                    xAxisIndex: 0,
                    startValue: Math.max(0, totalPoints - visiblePoints),
                    endValue: totalPoints - 1,
                },
                {
                    type: 'slider',
                    xAxisIndex: 0,
                    bottom: 8,
                    height: 12,
                    startValue: Math.max(0, totalPoints - visiblePoints),
                    endValue: totalPoints - 1,
                    borderColor: '#ddd',
                    fillerColor: 'rgba(39, 174, 96, 0.15)',
                    handleStyle: { borderColor: '#27ae60' },
                },

            ],
        });

        return () => { if (deltaChartRef.current) deltaChartRef.current.dispose(); };
    }, [dailyData]);

    useEffect(() => {
        const agg = groupData?.aggregated_post_data;
        console.log(agg)
        if (!agg || groupData?.status !== 'SUCCESS') return;

        const datasets = [
            { key: 'aggregated_likes_counts', label: 'По лайкам', color: '#e74c3c' },
            { key: 'aggregated_reposts_counts', label: 'По репостам', color: '#3498db' },
            { key: 'aggregated_comments_counts', label: 'По комментариям', color: '#27ae60' },
        ];

        histChartInstances.current.forEach(inst => { if (inst) inst.dispose(); });
        histChartInstances.current = [];

        datasets.forEach((ds, idx) => {
            const dataMap = agg[ds.key];
            if (!dataMap || !Object.keys(dataMap).length || !histContainerRefs[idx].current) return;

            const entries = Object.entries(dataMap)
                .map(([k, v]) => ({k: parseInt(k), count: v.count, post_id: v.post_id}))
                .sort((a, b) => a.k - b.k);
            if (!entries.length) return;

            let prev = 0;
            const sourceData = entries.map(e => {
                const row = { range: `${prev}–${e.k}`, count: e.count, post_id: e.post_id };
                prev = e.k;
                return row;
            });

            const chart = echarts.init(histContainerRefs[idx].current);
            histChartInstances.current[idx] = chart;

            chart.setOption({
                tooltip: {
                    trigger: 'axis',
                    formatter: (params) => {
                        const p = params[0];
                        return `${p.axisValue}<br/>${p.seriesName}: ${p.value} постов`;
                    }
                },
                grid: {
                    left: 80,
                    right: 20,
                    top: 10,
                    bottom: 90,
                },
                xAxis: {
                    type: 'category',
                    data: sourceData.map(d => d.range),
                    name: 'Диапазон',
                    nameLocation: 'center',
                    nameGap: 35,
                    nameTextStyle: { fontSize: 12, fontWeight: 500, color: '#666' },
                    axisLabel: { rotate: 45, fontSize: 11 },
                    axisLine: { lineStyle: { color: '#ddd' } },
                },
                yAxis: {
                    type: histScales[idx],
                    min: histScales[idx] === 'log' ? 1 : 0,
                    name: 'Количество постов',
                    nameLocation: 'center',
                    nameGap: 45,
                    nameTextStyle: { fontSize: 12, fontWeight: 500, color: '#666' },
                    splitLine: { lineStyle: { color: '#e9ecef' } },
                },
                series: [{
                    type: 'bar',
                    name: ds.label,
                    data: sourceData.map(d => d.count),
                    itemStyle: { color: ds.color, borderRadius: [0, 0, 0, 0] },
                    barMaxWidth: 60,
                }],
                dataZoom: [
                    {
                        type: 'inside',
                        xAxisIndex: 0,
                        zoomOnMouseWheel: true,
                        moveOnMouseMove: true,
                    },
                    {
                        type: 'slider',
                        xAxisIndex: 0,
                        bottom: 8,
                        height: 12,
                        borderColor: '#ddd',
                        fillerColor: 'rgba(44, 90, 160, 0.15)',
                        handleStyle: { borderColor: '#2c5aa0' },
                    },
                ],
            });

            chart.on('click',  (params) => {
                const post_id = sourceData[params.dataIndex]?.post_id;
                const range = sourceData[params.dataIndex]?.range;
                if (post_id) handleBarClick(post_id, range).catch(console.error);
                // setHistClickInfo({
                //     label: ds.label,
                //     range: params.name,
                //     count: params.value,
                //     post_id,
                // });
            });
        });

        return () => {
            histChartInstances.current.forEach(inst => { if (inst) inst.dispose(); });
            histChartInstances.current = [];
        };
    }, [groupData, histScales]);

    // активность по часам - убрать
    // useEffect(() => {
    //     if (!hourlyData || !hourlyData.length || !activityDivRef.current) return;
    //
    //     const labels = hourlyData.map(item => {
    //         const date = new Date(item.timestamp);
    //         return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    //     });
    //
    //     const likesData = hourlyData.map(item => item.stats[0]?.likes_count || 0);
    //     const viewsData = hourlyData.map(item => item.stats[0]?.views_count || 0);
    //
    //     if (activityChartRef.current) activityChartRef.current.dispose();
    //     const visiblePoints = 30;
    //     const totalPoints = labels.length;
    //
    //     activityChartRef.current = echarts.init(activityDivRef.current);
    //     activityChartRef.current.setOption({
    //         tooltip: { trigger: 'axis' },
    //         legend: { data: ['Лайки', 'Просмотры'], top: 0 },
    //         grid: { left: 60, right: 20, top: 35, bottom: 40 },
    //         xAxis: {
    //             type: 'category',
    //             data: labels,
    //             name: 'Время',
    //             nameLocation: 'center',
    //             nameGap: 30,
    //             nameTextStyle: { fontSize: 12, fontWeight: 500, color: '#666' },
    //             axisLine: { lineStyle: { color: '#ddd' } },
    //             axisLabel: { fontSize: 11 },
    //         },
    //         yAxis: {
    //             type: 'value',
    //             min: 0,
    //             name: 'Количество',
    //             nameLocation: 'center',
    //             nameGap: 45,
    //             nameTextStyle: { fontSize: 12, fontWeight: 500, color: '#666' },
    //             splitLine: { lineStyle: { color: '#e9ecef' } },
    //         },
    //         series: [
    //             {
    //                 name: 'Лайки',
    //                 type: 'line',
    //                 data: likesData,
    //                 smooth: true,
    //                 symbol: 'circle',
    //                 symbolSize: 3,
    //                 lineStyle: { color: '#e74c3c', width: 2 },
    //                 areaStyle: { color: 'rgba(231, 76, 60, 0.1)' },
    //                 itemStyle: { color: '#e74c3c' },
    //             },
    //             {
    //                 name: 'Просмотры',
    //                 type: 'line',
    //                 data: viewsData,
    //                 smooth: true,
    //                 symbol: 'circle',
    //                 symbolSize: 3,
    //                 lineStyle: { color: '#3498db', width: 2 },
    //                 areaStyle: { color: 'rgba(52, 152, 219, 0.1)' },
    //                 itemStyle: { color: '#3498db' },
    //             },
    //         ],
    //         dataZoom: [
    //             { type: 'inside', xAxisIndex: 0, zoomOnMouseWheel: true, moveOnMouseMove: true, startValue: Math.max(0, totalPoints - visiblePoints),
    //                 endValue: totalPoints - 1, },
    //             { type: 'slider', xAxisIndex: 0, bottom: 8, height: 12, startValue: Math.max(0, totalPoints - visiblePoints),
    //                 endValue: totalPoints - 1, borderColor: '#ddd', fillerColor: 'rgba(52, 152, 219, 0.15)', handleStyle: { borderColor: '#3498db' } },
    //         ],
    //     });
    //
    //     return () => { if (activityChartRef.current) activityChartRef.current.dispose(); };
    // }, [hourlyData]);

    const handleDelete = async () => {
        let token = localStorage.getItem("access_token");
        if (!token) {
            if (!(await verifyAndRefreshToken())) {
                navigate("/login");
                return;
            }
            return;
        }
        token = localStorage.getItem("access_token");
        const res = await fetch(`${BASE_URL}/${API_VERSION}/social-entities/groups/${groupData.id}/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });
        if (res.status === 204) {
            setShowDeleteModal(false);
            navigate('/groups');
        }
    };

    if (!groupData) {
        return <div>Загрузка...</div>;
    }

    const addedAt = new Date(groupData.added_at);
    const addedDate = addedAt.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    const saveReport = async (reportType) => {
        setIsSaving(true);
        try {
            let token = localStorage.getItem("access_token");
            if (!token) {
                if (!(await verifyAndRefreshToken())) {
                    navigate("/login");
                    return;
                }
            }
            token = localStorage.getItem("access_token");
            const res = await fetch(`${BASE_URL}/${API_VERSION}/reports/group/${groupData.id}/?type=${reportType.toUpperCase()}`, {
                method: 'GET',
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            if (res.ok) {
                const data = await res.json();
                console.log(data);
                window.open(`${window.location.origin}/${data}`, '_blank');
            }
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <main className={styles.groupInfoContainer}>
            <section className={styles.groupHeader}>
                <div className={styles.groupLogo}>
                    <img
                        src={groupData.photo_url}
                        alt="Логотип группы"
                        className={styles.logoImg}
                        onError={(e) => console.log(e)}
                    />
                </div>
                <div className={styles.groupNamePlatform}>
                    <h1 className={styles.groupName}>{groupData.name}</h1>
                    <span className={styles.groupPlatform}>{groupData.platform.alias}</span>
                </div>
                <div className={styles.groupActions}>
                    <button
                        className={`${styles.actionBtn} ${styles.delete}`}
                        onClick={() => setShowDeleteModal(true)}
                    >
                        Удалить группу
                    </button>
                </div>
            </section>

            {/* Блок 2: общая информация */}
            <section className={styles.groupGeneralInfo}>
                <h2>Общая информация</h2>
                <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Описание:</span>
                    <div className={styles.infoValue}>
                        {groupData.description ? (
                            <>
                                {groupData.description.length > 150 && !isDescriptionExpanded
                                    ? `${groupData.description.slice(0, 150)}...`
                                    : groupData.description}
                                {groupData.description.length > 150 && (
                                    <button
                                        className={styles.expandBtn}
                                        onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                                    >
                                        {isDescriptionExpanded ? ' Свернуть' : ' Читать далее'}
                                    </button>
                                )}
                            </>
                        ) : (
                            <span className={styles.noData}>Описание отсутствует</span>
                        )}
                    </div>
                </div>
                <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Дата подключения к системе:</span>
                    <span className={styles.infoValue}>{addedDate}</span>
                </div>
            </section>

            {groupData.status === 'PENDING' && (
                <section className={styles.statusBlock}>
                    <div className={styles.statusTitle}>Информация ещё не собрана</div>
                    <div className={styles.statusSubtitle}>Статистика появится после первого сбора данных</div>
                </section>
            )}
            {groupData.status === 'COLLECTING' && (
                <section className={styles.statusBlock}>
                    <div className={styles.statusTitle}>Информация собирается</div>
                    <div className={styles.statusSubtitle}>Данные обрабатываются, скоро они появятся на странице</div>
                </section>
            )}
            {groupData.status === 'SUCCESS' && (
                <section className={styles.groupStats}>
                    <h2>Статистика</h2>
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <div className={styles.statValue}>{stats.posts_count}</div>
                            <div className={styles.statLabel}>Посты</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statValue}>{stats.participants_count}</div>
                            <div className={styles.statLabel}>Подписчики</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statValue}>{stats.likes_count}</div>
                            <div className={styles.statLabel}>Лайки</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statValue}>{stats.repost_count}</div>
                            <div className={styles.statLabel}>Репосты</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statValue}>{stats.comms_count}</div>
                            <div className={styles.statLabel}>Комментарии</div>
                        </div>
                    </div>
                </section>
            )}
            {groupData?.aggregated_post_data && (
                <section className={styles.groupCharts}>
                    <h2>Распределение постов</h2>
                    <div className={styles.histogramsGrid}>
                        {groupData.aggregated_post_data.aggregated_likes_counts && Object.keys(groupData.aggregated_post_data.aggregated_likes_counts).length > 0 && (
                            <div className={styles.chartCard}>
                                <div className={styles.chartCardHeader}>
                                    <h3>По лайкам</h3>
                                    <div className={styles.scaleGroup}>
                                        <span className={styles.scaleLabel}>тип шкалы</span>
                                        <div
                                            className={`${styles.scaleSwitch} ${histScales[0] === 'value' ? styles.scaleValue : styles.scaleLog}`}
                                            onClick={() => setHistScales(prev => { const n = [...prev]; n[0] = n[0] === 'log' ? 'value' : 'log'; return n; })}
                                        >
                                            <span className={styles.scaleOption}>Лог</span>
                                            <span className={styles.scaleOption}>Лин</span>
                                            <span className={styles.scaleActive}></span>
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.chartContainer}>
                                    <div ref={histContainerRefs[0]} style={{width:'100%',height:'100%'}}></div>
                                </div>
                            </div>
                        )}
                        {groupData.aggregated_post_data.aggregated_reposts_counts && Object.keys(groupData.aggregated_post_data.aggregated_reposts_counts).length > 0 && (
                            <div className={styles.chartCard}>
                                <div className={styles.chartCardHeader}>
                                    <h3>По репостам</h3>
                                    <div className={styles.scaleGroup}>
                                        <span className={styles.scaleLabel}>тип шкалы</span>
                                        <div
                                            className={`${styles.scaleSwitch} ${histScales[1] === 'value' ? styles.scaleValue : styles.scaleLog}`}
                                            onClick={() => setHistScales(prev => { const n = [...prev]; n[1] = n[1] === 'log' ? 'value' : 'log'; return n; })}
                                        >
                                            <span className={styles.scaleOption}>Лог</span>
                                            <span className={styles.scaleOption}>Лин</span>
                                            <span className={styles.scaleActive}></span>
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.chartContainer}>
                                    <div ref={histContainerRefs[1]} style={{width:'100%',height:'100%'}}></div>
                                </div>
                            </div>
                        )}
                        {groupData.aggregated_post_data.aggregated_comments_counts && Object.keys(groupData.aggregated_post_data.aggregated_comments_counts).length > 0 && (
                            <div className={styles.chartCard}>
                                <div className={styles.chartCardHeader}>
                                    <h3>По комментариям</h3>
                                    <div className={styles.scaleGroup}>
                                        <span className={styles.scaleLabel}>тип шкалы</span>
                                        <div
                                            className={`${styles.scaleSwitch} ${histScales[2] === 'value' ? styles.scaleValue : styles.scaleLog}`}
                                            onClick={() => setHistScales(prev => { const n = [...prev]; n[2] = n[2] === 'log' ? 'value' : 'log'; return n; })}
                                        >
                                            <span className={styles.scaleOption}>Лог</span>
                                            <span className={styles.scaleOption}>Лин</span>
                                            <span className={styles.scaleActive}></span>
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.chartContainer}>
                                    <div ref={histContainerRefs[2]} style={{width:'100%',height:'100%'}}></div>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {groupData.status === 'SUCCESS' && (
                <>
                    <TopPosts bestPosts={bestPostData}/>
                    <section className={styles.groupCharts}>
                        <h2>Графики</h2>
                        <div className={styles.chartsGrid}>
                            <div className={styles.chartCard}>
                                <h3>Рост подписчиков</h3>
                                {dailyData && dailyData.length ? (
                                    <div className={styles.chartContainer}>
                                        <div ref={subscribersDivRef} style={{width:'100%',height:'100%'}}></div>
                                    </div>
                                ) : (
                                    <div className={styles.noData}>Нет данных для графика</div>
                                )}
                            </div>
                            <div className={styles.chartCard}>
                                <h3>Прирост подписчиков (по дням)</h3>
                                {dailyData && dailyData.length ? (
                                    <div className={styles.chartContainer}>
                                        <div ref={deltaDivRef} style={{width:'100%',height:'100%'}}></div>
                                    </div>
                                ) : (
                                    <div className={styles.noData}>Нет данных для графика</div>
                                )}
                            </div>
                            {/*<div className={styles.chartCard}>*/}
                            {/*    <h3>Активность по часам (лайки и просмотры)</h3>*/}
                            {/*    {hourlyData && hourlyData.length ? (*/}
                            {/*        <div className={styles.chartContainer}>*/}
                            {/*            <div ref={activityDivRef} style={{width:'100%',height:'100%'}}></div>*/}
                            {/*        </div>*/}
                            {/*    ) : (*/}
                            {/*        <div className={styles.noData}>Нет данных для графика</div>*/}
                            {/*    )}*/}
                            {/*</div>*/}
                        </div>
                    </section>
                </>
            )}

            {/* Модальное окно удаления */}
            {showDeleteModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h3>Подтверждение удаления</h3>
                        <p>Вы уверены, что хотите удалить группу "{groupData.name}"?</p>
                        <div className={styles.modalActions}>
                            <button
                                className={`${styles.modalBtn} ${styles.modalBtnCancel}`}
                                onClick={() => setShowDeleteModal(false)}
                            >
                                Отмена
                            </button>
                            <button
                                className={`${styles.modalBtn} ${styles.modalBtnConfirm}`}
                                onClick={handleDelete}
                            >
                                Да
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Модальное окно информации о посте */}
            {histClickInfo && (
                <div className={styles.modalOverlay}>
                    <div className={styles.postModalContent}>
                        <div className={styles.postModalGroupRow}>
                            <a href={groupData.link || '#'} className={styles.postModalGroupLink} target="_blank" rel="noreferrer">
                                {groupData.name || 'Название группы'}
                            </a>
                        </div>

                        {histClickInfo.loading ? (
                            <div className={styles.postModalLoader}>
                                <div className={styles.spinner}></div>
                                <span>Загрузка...</span>
                            </div>
                        ) : (
                            <>
                                <div className={styles.postModalText}>
                                    {histClickInfo.text || 'Текст поста отсутствует'}
                                </div>
                                <div className={styles.postModalStats}>
                                    <span>Лайки: {histClickInfo.likes ?? 0}</span>
                                    <span className={styles.statSep}></span>
                                    <span>Комментарии: {histClickInfo.comments ?? 0}</span>
                                    <span className={styles.statSep}></span>
                                    <span>Просмотры: {histClickInfo.views ?? 0}</span>
                                    <span className={styles.statSep}></span>
                                    <span>Репосты: {histClickInfo.reposts ?? 0}</span>
                                </div>
                                <div className={styles.postModalDateRow}>
                                    <span className={styles.postModalDate}>
                                        Дата публикации: {histClickInfo.pub_date || ''}
                                    </span>
                                </div>
                            </>
                        )}

                        <div className={styles.modalActions}>
                            <button
                                className={`${styles.modalBtn} ${styles.modalBtnPrimary}`}
                                onClick={() => window.open(`${groupData.link}${histClickInfo.link}`, '_blank')}
                                disabled={histClickInfo.loading}
                            >
                                Открыть пост
                            </button>
                            <button
                                className={`${styles.modalBtn} ${styles.modalBtnCancel}`}
                                onClick={() => setHistClickInfo(null)}
                            >
                                Закрыть
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Кнопка сохранить */}
            <div className={styles.saveBtnContainer}>
                <button
                    className={`${styles.saveBtn} ${isSaving ? styles.saving : ''}`}
                    onClick={async () => await saveReport('xlsx')}
                    disabled={isSaving}
                >
                    {isSaving ? 'Загрузка...' : 'Сохранить в Excel'}
                </button>
                <button
                    className={`${styles.saveBtn} ${isSaving ? styles.saving : ''}`}
                    onClick={async () => await saveReport('pdf')}
                    disabled={isSaving}
                >
                    {isSaving ? 'Загрузка...' : 'Сохранить в PDF'}
                </button></div>
        </main>
    );
};

export default DetailInfo;