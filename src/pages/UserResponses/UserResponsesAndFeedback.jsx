import React, { useState } from 'react';
import { Navbar, Sidebar } from "../../components";
import styles from './UserResponses.module.css';
import { useSidebar } from '../../components/SidebarContext';
import UserResponsesTab from './UserResponsesTab';
import UserFeedbackTab from './UserFeedbackTab';

const UserResponsesAndFeedback = () => {
    const { isSidebarOpen } = useSidebar();
    const [activeTab, setActiveTab] = useState('responses');

    return (
        <div className={styles.main_page}>
            <Navbar />
            {isSidebarOpen && <Sidebar />}
            <div className={styles.content}>
                <h1>User Responses</h1>
                
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab_button} ${activeTab === 'responses' ? styles.active_tab : ''}`}
                        onClick={() => setActiveTab('responses')}
                    >
                        User Responses
                    </button>
                    <button
                        className={`${styles.tab_button} ${activeTab === 'feedback' ? styles.active_tab : ''}`}
                        onClick={() => setActiveTab('feedback')}
                    >
                        User Feedback
                    </button>
                </div>

                {activeTab === 'responses' && <UserResponsesTab />}
                {activeTab === 'feedback' && <UserFeedbackTab />}
            </div>
        </div>
    );
};

export default UserResponsesAndFeedback;