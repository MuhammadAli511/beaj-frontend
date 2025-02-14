import React, { useEffect, useState } from "react";
import { Navbar, Sidebar } from "../../components";
import styles from "./Dashboard.module.css";
import { useSidebar } from "../../components/SidebarContext";
import {
    getConstantById,
    getDashboardCardsFunnel,
    getAllFeedback,
    getAllCourses
} from "../../helper";
import { TailSpin } from 'react-loader-spinner';
import { Pie, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title
} from 'chart.js';

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title
);

const Dashboard = () => {
    const { isSidebarOpen } = useSidebar();
    const [botStatus, setBotStatus] = useState(null);
    const [funnelStats, setFunnelStats] = useState(null);
    const [cardStatsLoading, setCardStatsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [feedbackData, setFeedbackData] = useState(null);
    const [feedbackLoading, setFeedbackLoading] = useState(true);

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
        // Fetch Funnel Stats
        const fetchFunnelStats = async () => {
            try {
                setCardStatsLoading(true);
                const response = await getDashboardCardsFunnel();
                setFunnelStats(response.data);
            } catch (err) {
                console.error("Error fetching funnel stats:", err);
                setError("Failed to load funnel statistics.");
            } finally {
                setCardStatsLoading(false);
            }
        };

        fetchFunnelStats();
    }, []);

    useEffect(() => {
        // Fetch Feedback Data
        const fetchFeedbackData = async () => {
            try {
                setFeedbackLoading(true);
                const [feedbackResponse, coursesResponse] = await Promise.all([
                    getAllFeedback(),
                    getAllCourses()
                ]);

                // Process feedback stats for pie chart
                const feedbackStats = {
                    positive: feedbackResponse.data.filter(f => 
                        f.feedbackContent?.toLowerCase().includes('it was great 😁')
                    ).length,
                    negative: feedbackResponse.data.filter(f => 
                        f.feedbackContent?.toLowerCase().includes('it can be improved')
                    ).length
                };

                // Process feedback by course
                const courseMap = {};
                coursesResponse.data.forEach(course => {
                    courseMap[course.CourseId] = course.CourseName;
                });

                const feedbackByCourse = {};
                const feedbackByActivity = {};

                feedbackResponse.data.forEach(feedback => {
                    // Process course feedback
                    const courseName = courseMap[feedback.courseId] || `Course ${feedback.courseId}`;
                    if (!feedbackByCourse[courseName]) {
                        feedbackByCourse[courseName] = {
                            positive: 0,
                            negative: 0
                        };
                    }
                    
                    // Process activity feedback
                    const activityType = feedback.activityType || 'unknown';
                    if (!feedbackByActivity[activityType]) {
                        feedbackByActivity[activityType] = {
                            positive: 0,
                            negative: 0
                        };
                    }

                    if (feedback.feedbackContent?.toLowerCase().includes('it was great 😁')) {
                        feedbackByCourse[courseName].positive++;
                        feedbackByActivity[activityType].positive++;
                    }
                    if (feedback.feedbackContent?.toLowerCase().includes('it can be improved')) {
                        feedbackByCourse[courseName].negative++;
                        feedbackByActivity[activityType].negative++;
                    }
                });

                setFeedbackData({
                    overall: feedbackStats,
                    byCourse: feedbackByCourse,
                    byActivity: feedbackByActivity
                });
            } catch (err) {
                console.error("Error fetching feedback data:", err);
            } finally {
                setFeedbackLoading(false);
            }
        };

        fetchFeedbackData();
    }, []);

    const formatPercentage = (percentage) => {
        if (isNaN(percentage) || percentage === null || percentage === undefined) {
            return "0%";
        }
        if (percentage < 0) {
            return `+${Math.abs(percentage)}%`;
        } else {
            return `-${percentage}%`;
        }
    };

    const stats = [
        {
            label: "Link Clicked",
            value: funnelStats?.linkClicked?.count ?? 0,
            percentage: formatPercentage(funnelStats?.linkClicked?.percentage),
        },
        {
            label: "Trial Started",
            value: funnelStats?.freeDemoStarted?.count ?? 0,
            percentage: formatPercentage(funnelStats?.freeDemoStarted?.percentage),
        },
        {
            label: "Trial Completed",
            value: funnelStats?.freeDemoEnded?.count ?? 0,
            percentage: formatPercentage(funnelStats?.freeDemoEnded?.percentage),
        },
        {
            label: "Registration Completed",
            value: funnelStats?.registeredUsers?.count ?? 0,
            percentage: formatPercentage(funnelStats?.registeredUsers?.percentage),
        },
        {
            label: "Target Group Assigned",
            value: funnelStats?.selectedUsers?.count ?? 0,
            percentage: formatPercentage(funnelStats?.selectedUsers?.percentage),
        },
        {
            label: "Course Assigned",
            value: funnelStats?.purchasedUsers?.count ?? 0,
            percentage: formatPercentage(funnelStats?.purchasedUsers?.percentage),
        },
    ];

    const pieChartData = {
        labels: ['It was great 😁', 'It can be improved'],
        datasets: [
            {
                data: [
                    feedbackData?.overall?.positive || 0,
                    feedbackData?.overall?.negative || 0
                ],
                backgroundColor: ['#FFA500', '#51BBCC'],
                borderColor: ['#FFA500', '#51BBCC'],
                borderWidth: 1,
            },
        ],
    };
    
    console.log('Pie chart data:', pieChartData);

    const pieChartOptions = {
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 20,
                    font: {
                        size: 14
                    }
                }
            }
        },
        responsive: true,
        maintainAspectRatio: true,
        layout: {
            padding: 20
        }
    };

    const barChartData = {
        labels: Object.keys(feedbackData?.byCourse || {}),
        datasets: [
            {
                label: 'It was great 😁',
                data: Object.values(feedbackData?.byCourse || {}).map(d => d.positive),
                backgroundColor: '#FFA500',
                borderColor: '#FFA500',
                borderWidth: 1,
            },
            {
                label: 'It can be improved',
                data: Object.values(feedbackData?.byCourse || {}).map(d => d.negative),
                backgroundColor: '#51BBCC',
                borderColor: '#51BBCC',
                borderWidth: 1,
            }
        ]
    };

    const barChartOptions = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                align: 'start',
                labels: {
                    padding: 20,
                    font: {
                        size: 14
                    }
                }
            }
        },
        scales: {
            x: {
                stacked: false,
                grid: {
                    display: true,
                    drawBorder: true,
                },
                ticks: {
                    stepSize: 1000
                },
                title: {
                    display: true,
                    text: 'Count',
                    font: {
                        size: 14
                    },
                    padding: {
                        top: 10
                    }
                }
            },
            y: {
                stacked: false,
                grid: {
                    display: false
                },
                ticks: {
                    font: {
                        size: 14
                    }
                }
            }
        },
        layout: {
            padding: {
                left: 20,
                right: 20,
                top: 20,
                bottom: 20
            }
        }
    };

    const activityChartData = {
        labels: Object.keys(feedbackData?.byActivity || {}),
        datasets: [
            {
                label: 'It was great 😁',
                data: Object.values(feedbackData?.byActivity || {}).map(d => d.positive),
                backgroundColor: '#FFA500',
                borderColor: '#FFA500',
                borderWidth: 1,
            },
            {
                label: 'It can be improved',
                data: Object.values(feedbackData?.byActivity || {}).map(d => d.negative),
                backgroundColor: '#51BBCC',
                borderColor: '#51BBCC',
                borderWidth: 1,
            }
        ]
    };

    const activityChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                align: 'start',
                labels: {
                    padding: 20,
                    font: {
                        size: 14
                    }
                }
            },
            title: {
                display: true,
                text: 'Feedback vs. Activity Type',
                font: {
                    size: 16
                },
                padding: {
                    top: 10,
                    bottom: 30
                }
            }
        },
        scales: {
            x: {
                grid: {
                    display: true,
                    drawBorder: true,
                },
                ticks: {
                    font: {
                        size: 12
                    }
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    display: true
                },
                ticks: {
                    stepSize: 1,
                    font: {
                        size: 12
                    }
                },
                title: {
                    display: true,
                    text: 'Count',
                    font: {
                        size: 14
                    }
                }
            }
        },
        layout: {
            padding: {
                left: 20,
                right: 20,
                top: 20,
                bottom: 20
            }
        }
    };

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
                {/* Funnel Stats Cards */}
                <div className={styles.statsCards}>
                    {cardStatsLoading ? (
                        <div className={styles.loader}>
                            <TailSpin color="#51bbcc" height={50} width={50} />
                        </div>
                    ) : error ? (
                        <p className={styles.error}>{error}</p>
                    ) : (
                        stats.map((stat, index) => (
                            <div key={index} className={styles.card}>
                                <h3>{stat.label}</h3>
                                <p className={styles.value}>{stat.value}</p>
                                <p className={styles.percentage}>{stat.percentage}</p>
                            </div>
                        ))
                    )}
                </div>

                {/* User Feedback Section */}
                <div className={styles.feedbackSection}>
                    <h2>User Feedback</h2>
                    <div className={styles.chartsContainer}>
                        {feedbackLoading ? (
                            <div className={styles.loader}>
                                <TailSpin color="#51bbcc" height={50} width={50} />
                            </div>
                        ) : (
                            <>
                                <div className={styles.topChartsRow}>
                                    <div className={styles.pieChartContainer}>
                                        <Pie data={pieChartData} options={pieChartOptions} />
                                    </div>
                                    <div className={styles.barChartContainer}>
                                        <Bar data={barChartData} options={barChartOptions} />
                                    </div>
                                </div>
                                <div className={styles.activityChartContainer}>
                                    <Bar data={activityChartData} options={activityChartOptions} />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
