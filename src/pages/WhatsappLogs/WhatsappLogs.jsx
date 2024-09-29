import React, { useState, useEffect } from 'react';
import { Navbar, Sidebar } from "../../components";
import styles from './WhatsappLogs.module.css';
import { getAllMetadata, getActivityLogsByPhoneNumber } from "../../helper";
import { useSidebar } from '../../components/SidebarContext';

const WhatsappLogs = () => {
    const { isSidebarOpen } = useSidebar();
    const [phoneNumbers, setPhoneNumbers] = useState([]);
    const [selectedPhoneNumber, setSelectedPhoneNumber] = useState(null);
    const [activityLogs, setActivityLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedUserName, setSelectedUserName] = useState('');

    useEffect(() => {
        const fetchPhoneNumbers = async () => {
            try {
                const response = await getAllMetadata();
                if (response.data && Array.isArray(response.data)) {
                    setPhoneNumbers(response.data);
                } else {
                    console.error("Expected an array in response.data, got:", response);
                }
            } catch (error) {
                console.error("Error fetching metadata:", error);
            }
        };
        fetchPhoneNumbers();
    }, []);

    useEffect(() => {
        if (selectedPhoneNumber) {
            setLoading(true);
            const fetchLogs = async () => {
                try {
                    const logs = await getActivityLogsByPhoneNumber(selectedPhoneNumber);
                    setActivityLogs(logs.data);
                    const user = phoneNumbers.find((user) => user.phoneNumber === selectedPhoneNumber);
                    setSelectedUserName(user.name || selectedPhoneNumber);  // Display name or phone number
                } catch (error) {
                    console.error("Error fetching activity logs:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchLogs();
        }
    }, [selectedPhoneNumber, phoneNumbers]);

    return (
        <div className={styles.main_page}>
            <Navbar />
            {isSidebarOpen && <Sidebar />}
            <div className={styles.content}>
                <div className={styles.logs_container}>
                    <div className={styles.phone_list}>
                        <h3 className={styles.heading_color}>Contacts</h3>
                        <ul>
                            {phoneNumbers.length > 0 ? (
                                phoneNumbers.map((user) => (
                                    <li
                                        key={user.phoneNumber}
                                        className={selectedPhoneNumber === user.phoneNumber ? styles.active : ''}
                                        onClick={() => setSelectedPhoneNumber(user.phoneNumber)}
                                    >
                                        {user.name || user.phoneNumber}
                                    </li>
                                ))
                            ) : (
                                <p>No contacts found</p>
                            )}
                        </ul>
                    </div>

                    {/* Right Panel for Activity Logs */}
                    <div className={styles.activity_logs}>
                        <h3>Messages with {selectedUserName || "Select a contact"}</h3>
                        {loading ? (
                            <p>Loading messages...</p>
                        ) : activityLogs.length > 0 ? (
                            <div className={styles.chat_container}>
                                {activityLogs.map((log) => (
                                    <div
                                        key={log.id}
                                        className={
                                            log.messageDirection == "outbound"
                                                ? styles.message_outbound
                                                : styles.message_inbound
                                        }
                                    >
                                        <div className={styles.message_content}>
                                            {/* Check if the message is media or text */}
                                            {log.actionType === 'image' && (
                                                <img src={log.messageContent} alt="User sent media" className={styles.media_message} />
                                            )}
                                            {log.actionType === 'audio' && (
                                                <audio controls>
                                                    <source src={log.messageContent} type="audio/mpeg" />
                                                    Your browser does not support the audio element.
                                                </audio>
                                            )}
                                            {log.actionType === 'video' && (
                                                <video controls className={styles.media_message}>
                                                    <source src={log.messageContent} type="video/mp4" />
                                                    Your browser does not support the video element.
                                                </video>
                                            )}
                                            {log.actionType === 'text' && <p>{log.messageContent}</p>}

                                            <span className={styles.message_timestamp}>
                                                {new Date(log.timestamp).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No messages available for this contact</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WhatsappLogs;
