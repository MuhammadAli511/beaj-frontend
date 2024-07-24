import React, { useState, useEffect } from 'react';
import { Navbar, Sidebar } from "../../components";
import styles from './ChatbotStats.module.css';
import { getChatbotStats } from "../../helper";
import { useSidebar } from '../../components/SidebarContext';

const ChatbotStats = () => {
    const { isSidebarOpen } = useSidebar();
    const [chatbotStats, setChatbotStats] = useState([]);

    useEffect(() => {
        fetchChatbotStats();
    }, []);

    const fetchChatbotStats = () => {
        getChatbotStats()
            .then(response => setChatbotStats(response.data))
            .catch(error => console.error('Error fetching chatbot stats:', error));
    };

    return (
        <div className={styles.main_page}>
            <Navbar />
            {isSidebarOpen && <Sidebar />}
            <div className={styles.content}>
                <h1>Course Chatbot Stats</h1>
                <div className={styles.stats_summary}>
                    <p className={styles.stats_summary_text}>Total Users: {chatbotStats.length}</p>
                </div>
                <div className={styles.table_container}>
                    <table className={styles.table}>
                        <thead className={styles.heading_row}>
                            <tr>
                                <th className={styles.table_heading}>Phone Number</th>
                                <th className={styles.table_heading}>Week</th>
                                <th className={styles.table_heading}>Day</th>
                                <th className={styles.table_heading}>Question No.</th>
                                <th className={styles.table_heading}>Total Correct</th>
                                <th className={styles.table_heading}>Total Wrong</th>
                                <th className={styles.table_heading}>Total Questions</th>
                                <th className={styles.table_heading}>Average</th>
                                <th className={styles.table_heading}>Lessons Completed</th>
                                <th className={styles.table_heading}>Last Updated</th>
                            </tr>
                        </thead>
                        <tbody className={styles.table_body}>
                            {chatbotStats.map((user, index) => (
                                <tr key={index}>
                                    <td className={styles.table_cell}>{user.phone_number}</td>
                                    <td className={styles.table_cell}>{user.week}</td>
                                    <td className={styles.table_cell}>{user.day}</td>
                                    <td className={styles.table_cell}>{user.question_number}</td>
                                    <td className={styles.table_cell}>{user.totalCorrect}</td>
                                    <td className={styles.table_cell}>{user.totalWrong}</td>
                                    <td className={styles.table_cell}>{user.totalQuestions}</td>
                                    <td className={styles.table_cell}>{user.average}</td>
                                    <td className={styles.table_cell}>{user.lessonsCompleted}</td>
                                    <td className={styles.table_cell}>{new Date(user.last_updated).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default ChatbotStats;
