import React, { useState, useEffect } from 'react';
import { Navbar, Sidebar } from "../../components";
import styles from './ChatbotStats.module.css';
import { getChatbotStats } from "../../helper";
import { useSidebar } from '../../components/SidebarContext';
import CSVDownloader from 'react-csv-downloader';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ChatbotStatsPDF from './ChatbotStatsPDF';

const ChatbotStats = () => {
    const { isSidebarOpen } = useSidebar();
    const [chatbotStats, setChatbotStats] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: 'totalCorrect', direction: 'ascending' });

    const totalQuestionsAttempted = chatbotStats.reduce((acc, user) => acc + user.totalQuestions, 0);
    const totalCorrectAnswers = chatbotStats.reduce((acc, user) => acc + user.totalCorrect, 0);
    const totalWrongAnswers = chatbotStats.reduce((acc, user) => acc + user.totalWrong, 0);
    const totalLessonsCompleted = chatbotStats.reduce((acc, user) => acc + user.lessonsCompleted, 0);

    useEffect(() => {
        fetchChatbotStats();
    }, []);

    const fetchChatbotStats = () => {
        getChatbotStats()
            .then(response => {
                setChatbotStats(response.data);
            })
            .catch(error => console.error('Error fetching chatbot stats:', error));
    };

    const sortedStats = [...chatbotStats].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
    });

    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key) => {
        if (sortConfig.key === key) {
            if (sortConfig.direction === 'ascending') {
                return <i className="fas fa-sort-up"></i>;
            } else {
                return <i className="fas fa-sort-down"></i>;
            }
        } else {
            return <i className="fas fa-sort"></i>;
        }
    };

    const columns = [
        { id: 'phone_number', displayName: 'Phone Number' },
        { id: 'week', displayName: 'Week' },
        { id: 'day', displayName: 'Day' },
        { id: 'question_number', displayName: 'Question No.' },
        { id: 'totalCorrect', displayName: 'Total Correct' },
        { id: 'totalWrong', displayName: 'Total Wrong' },
        { id: 'totalQuestions', displayName: 'Total Questions' },
        { id: 'average', displayName: 'Average' },
        { id: 'lessonsCompleted', displayName: 'Lessons Completed' },
        { id: 'last_updated', displayName: 'Last Updated' },
    ];

    const data = sortedStats.map(user => ({
        ...user,
        last_updated: new Date(user.last_updated).toLocaleString()
    }));

    const totals = {
        totalQuestionsAttempted,
        totalCorrectAnswers,
        totalWrongAnswers,
        totalLessonsCompleted
    };

    return (
        <div className={styles.main_page}>
            <Navbar />
            {isSidebarOpen && <Sidebar />}
            <div className={styles.content}>
                <h1>Course Chatbot Stats</h1>
                <div className={styles.stats_summary}>
                    <p className={styles.stats_summary_text}>Total Users: {chatbotStats.length}</p>
                    <p className={styles.stats_summary_text}>Questions Attempted: {totalQuestionsAttempted}</p>
                    <p className={styles.stats_summary_text}>Correct Answers: {totalCorrectAnswers}</p>
                    <p className={styles.stats_summary_text}>Wrong Answers: {totalWrongAnswers}</p>
                    <p className={styles.stats_summary_text}>Lessons Completed: {totalLessonsCompleted}</p>
                    <CSVDownloader
                        columns={columns}
                        datas={data}
                        filename="chatbot_stats"
                        className={styles.download_button}
                    >
                        Download CSV
                    </CSVDownloader>
                    <PDFDownloadLink
                        document={<ChatbotStatsPDF stats={sortedStats} totals={totals} />}
                        fileName="chatbot_stats.pdf"
                        className={styles.download_button}
                    >
                        {({ loading }) => (loading ? 'Loading document...' : 'Download PDF')}
                    </PDFDownloadLink>
                </div>
                <div className={styles.table_container}>
                    <table className={styles.table}>
                        <thead className={styles.heading_row}>
                            <tr>
                                <th className={styles.table_heading}>Phone Number</th>
                                <th className={styles.table_heading}>Week</th>
                                <th className={styles.table_heading}>Day</th>
                                <th className={styles.table_heading}>Question No.</th>
                                <th className={styles.table_heading} onClick={() => handleSort('totalCorrect')}>
                                    Total Correct {getSortIcon('totalCorrect')}
                                </th>
                                <th className={styles.table_heading} onClick={() => handleSort('totalWrong')}>
                                    Total Wrong {getSortIcon('totalWrong')}
                                </th>
                                <th className={styles.table_heading} onClick={() => handleSort('totalQuestions')}>
                                    Total Questions {getSortIcon('totalQuestions')}
                                </th>
                                <th className={styles.table_heading} onClick={() => handleSort('average')}>
                                    Average {getSortIcon('average')}
                                </th>
                                <th className={styles.table_heading} onClick={() => handleSort('lessonsCompleted')}>
                                    Lessons Completed {getSortIcon('lessonsCompleted')}
                                </th>
                                <th className={styles.table_heading} onClick={() => handleSort('last_updated')}>
                                    Last Updated {getSortIcon('last_updated')}
                                </th>
                            </tr>
                        </thead>
                        <tbody className={styles.table_body}>
                            {sortedStats.map((user, index) => (
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
