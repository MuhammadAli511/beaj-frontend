import React, { useEffect, useState } from "react";
import { Navbar, Sidebar } from "../../components";
import styles from "./Dashboard.module.css";
import { useSidebar } from "../../components/SidebarContext";
import {
    getConstantById,
    getDashboardCardsFunnel
} from "../../helper";
import { TailSpin } from 'react-loader-spinner';

const Dashboard = () => {
    const { isSidebarOpen } = useSidebar();
    const [botStatus, setBotStatus] = useState(null);
    const [funnelStats, setFunnelStats] = useState(null);
    const [cardStatsLoading, setCardStatsLoading] = useState(true);
    const [error, setError] = useState(null);

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

    // Safely handle the stats and avoid errors if a field is missing
    const formatPercentage = (percentage) => {
        if (isNaN(percentage) || percentage === null || percentage === undefined) {
            return "0%";
        }
        return `${percentage}%`;
    };

    const stats = [
        {
            label: "Link clicked",
            value: funnelStats?.linkClicked?.count ?? 0,
            percentage: formatPercentage(funnelStats?.linkClicked?.percentage),
        },
        {
            label: "Started trial",
            value: funnelStats?.freeDemoStarted?.count ?? 0,
            percentage: formatPercentage(funnelStats?.freeDemoStarted?.percentage),
        },
        {
            label: "Completed trial",
            value: funnelStats?.freeDemoEnded?.count ?? 0,
            percentage: formatPercentage(funnelStats?.freeDemoEnded?.percentage),
        },
        {
            label: "Registered",
            value: funnelStats?.registeredUsers?.count ?? 0,
            percentage: formatPercentage(funnelStats?.registeredUsers?.percentage),
        },
        {
            label: "Selected",
            value: funnelStats?.selectedUsers?.count ?? 0,
            percentage: formatPercentage(funnelStats?.selectedUsers?.percentage),
        },
        {
            label: "Paid",
            value: funnelStats?.purchasedUsers?.count ?? 0,
            percentage: formatPercentage(funnelStats?.purchasedUsers?.percentage),
        },
    ];

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
                                <p className={styles.percentage}>{stat.percentage} drop</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
