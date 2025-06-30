import React, { useEffect, useState } from "react";
import { Navbar, Sidebar } from "../../components";
import styles from "./Dashboard.module.css";
import { useSidebar } from "../../components/SidebarContext";
import {
    getConstantById,
    getStudentCourseStats
} from "../../helper";
import { TailSpin } from 'react-loader-spinner';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const Dashboard = () => {
    const { isSidebarOpen } = useSidebar();
    const [botStatus, setBotStatus] = useState(null);
    const [courseStats, setCourseStats] = useState([]);
    const [courseStatsLoading, setCourseStatsLoading] = useState(true);
    const [courseStatsError, setCourseStatsError] = useState(null);

    useEffect(() => {
        // Fetch Bot Status
        const fetchBotStatus = async () => {
            try {
                const status = await getConstantById("BOT_STATUS");
                if (status.data.constantValue === "Active") {
                    setBotStatus(true);
                } else {
                    setBotStatus(false);
                }
            } catch (err) {
                console.error("Error fetching bot status:", err);
            }
        };

        fetchBotStatus();
    }, []);

    useEffect(() => {
        // Fetch Student Course Stats
        const fetchCourseStats = async () => {
            try {
                setCourseStatsLoading(true);
                const response = await getStudentCourseStats();
                setCourseStats(response.data || []);
            } catch (err) {
                console.error("Error fetching course stats:", err);
                setCourseStatsError("Failed to load course statistics.");
            } finally {
                setCourseStatsLoading(false);
            }
        };

        fetchCourseStats();
    }, []);

    const organizeStatsData = (stats) => {
        const organized = {
            overall: [],
            preAssessment: [],
            mainCourse: [],
            postAssessment: []
        };

        stats.forEach(stat => {
            const description = stat.description;
            if (description.includes('Total Users') || description.includes('Started Users')) {
                organized.overall.push(stat);
            } else if (description.includes('Pre-Assessment')) {
                organized.preAssessment.push(stat);
            } else if (description.includes('Main Course')) {
                organized.mainCourse.push(stat);
            } else if (description.includes('Post-Assessment')) {
                organized.postAssessment.push(stat);
            }
        });

        return organized;
    };

    const organizedStats = organizeStatsData(courseStats);

    // Create funnel data from SQL response
    const createFunnelData = (stats) => {
        const funnelLabels = [];
        const funnelCounts = [];

        stats.forEach(stat => {
            funnelLabels.push(stat.description);
            funnelCounts.push(stat.count);
        });

        return {
            labels: funnelLabels,
            datasets: [
                {
                    label: 'User Count',
                    data: funnelCounts,
                    borderColor: '#51BBCC',
                    backgroundColor: 'rgba(81, 187, 204, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    pointBackgroundColor: '#51BBCC',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    tension: 0.4
                }
            ]
        };
    };

    const funnelOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: true,
                text: 'Student Progress Journey',
                font: {
                    size: 16,
                    weight: 'bold'
                },
                color: '#2c3e50',
                padding: 15
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)'
                },
                ticks: {
                    color: '#666',
                    font: {
                        size: 11
                    }
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    color: '#666',
                    font: {
                        size: 10
                    },
                    maxRotation: 45
                }
            }
        },
        elements: {
            point: {
                hoverRadius: 7
            }
        }
    };

    const StatCard = ({ title, count, subtitle }) => (
        <div className={styles.statCard}>
            <h4 className={styles.statTitle}>{title}</h4>
            <div className={styles.statCount}>{count?.toLocaleString() || 0}</div>
            {subtitle && <div className={styles.statSubtitle}>{subtitle}</div>}
        </div>
    );

    const StatSection = ({ title, stats, color }) => (
        <div className={styles.statSection}>
            <h3 className={styles.sectionTitle} style={{ borderLeftColor: color }}>
                {title}
            </h3>
            <div className={styles.statsGrid}>
                {stats.map((stat, index) => {
                    const isCompleted = stat.description.includes('Completed');
                    const baseTitle = stat.description
                        .replace('Pre-Assessment ', '')
                        .replace('Main Course ', '')
                        .replace('Post-Assessment ', '');
                    
                    return (
                        <StatCard
                            key={index}
                            title={baseTitle}
                            count={stat.count}
                            subtitle={isCompleted ? 'Completed' : 'Started'}
                        />
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className={styles.main_page}>
            <Navbar />
            {isSidebarOpen && <Sidebar />}
            <div className={styles.content}>
                {/* Bot Status Indicator */}
                <div className={styles.header}>
                    <h4 className={styles.botStatusHeading}>Bot Status:</h4>
                    <div className={styles.botStatus}>
                        <span className={botStatus ? styles.greenDot : styles.redDot}></span>
                        {botStatus ? "Active" : "Not Active"}
                    </div>
                </div>

                {/* Student Course Statistics */}
                <div className={styles.courseStatsSection}>
                    <h2 className={styles.mainSectionTitle}>Student Course Statistics (Rollout 2)</h2>
                    
                    {courseStatsLoading ? (
                        <div className={styles.loader}>
                            <TailSpin color="#51bbcc" height={50} width={50} />
                        </div>
                    ) : courseStatsError ? (
                        <p className={styles.error}>{courseStatsError}</p>
                    ) : (
                        <div className={styles.statsContainer}>
                            {/* Overall Stats */}
                            {organizedStats.overall.length > 0 && (
                                <div className={styles.overallStats}>
                                    <h3 className={styles.overallTitle}>Overall Metrics</h3>
                                    <div className={styles.overallGrid}>
                                        {organizedStats.overall.map((stat, index) => (
                                            <div key={index} className={styles.overallCard}>
                                                <div className={styles.overallCount}>
                                                    {stat.count?.toLocaleString() || 0}
                                                </div>
                                                <div className={styles.overallLabel}>
                                                    {stat.description}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Pre-Assessment Stats */}
                            {organizedStats.preAssessment.length > 0 && (
                                <StatSection
                                    title="Pre-Assessment Progress"
                                    stats={organizedStats.preAssessment}
                                    color="#51BBCC"
                                />
                            )}

                            {/* Main Course Stats */}
                            {organizedStats.mainCourse.length > 0 && (
                                <StatSection
                                    title="Main Course Progress"
                                    stats={organizedStats.mainCourse}
                                    color="#4ECDC4"
                                />
                            )}

                            {/* Post-Assessment Stats */}
                            {organizedStats.postAssessment.length > 0 && (
                                <StatSection
                                    title="Post-Assessment Progress"
                                    stats={organizedStats.postAssessment}
                                    color="#45B7D1"
                                />
                            )}

                            {/* Conversion Funnel Chart at the end */}
                            {courseStats.length > 0 && (
                                <div className={styles.funnelChart}>
                                    <Line data={createFunnelData(courseStats)} options={funnelOptions} />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
