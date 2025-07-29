import React, { useState } from 'react';
import { Navbar, Sidebar } from "../../components";
import styles from './AIServices.module.css';
import { useSidebar } from '../../components/SidebarContext';
import SpeechToText from './SpeechToText/SpeechToText';

const AIServices = () => {
    const { isSidebarOpen } = useSidebar();
    const [activeTab, setActiveTab] = useState('speech-to-text');

    const tabs = [
        { id: 'speech-to-text', name: 'Speech to Text', component: SpeechToText }
    ];

    const renderActiveComponent = () => {
        const activeTabData = tabs.find(tab => tab.id === activeTab);
        if (activeTabData) {
            const Component = activeTabData.component;
            return <Component />;
        }
        return null;
    };

    return (
        <div className={styles.main_page}>
            <Navbar />
            <Sidebar />
            <div className={`${styles.content} ${isSidebarOpen ? styles.sidebar_open : styles.sidebar_closed}`}>
                <div className={styles.header}>
                    <h1 className={styles.title}>AI Services</h1>
                    <p className={styles.subtitle}>Manage and utilize AI-powered services</p>
                </div>
                
                <div className={styles.tabs}>
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            className={`${styles.tab_button} ${activeTab === tab.id ? styles.active : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.name}
                        </button>
                    ))}
                </div>

                <div className={styles.tab_content}>
                    {renderActiveComponent()}
                </div>
            </div>
        </div>
    );
};

export default AIServices;