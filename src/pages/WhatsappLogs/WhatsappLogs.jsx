import React, { useState, useEffect } from 'react';
import { Navbar, Sidebar } from "../../components";
import styles from './WhatsappLogs.module.css';
import { getAllMetadata, getActivityLogsByPhoneNumber } from "../../helper";
import { useSidebar } from '../../components/SidebarContext';
import { TailSpin } from 'react-loader-spinner';

const WhatsappLogs = () => {
    const { isSidebarOpen } = useSidebar();
    const [phoneNumbers, setPhoneNumbers] = useState([]);
    const [selectedPhoneNumber, setSelectedPhoneNumber] = useState(null);
    const [activityLogs, setActivityLogs] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [selectedUserName, setSelectedUserName] = useState('');
    const [hoveredLog, setHoveredLog] = useState(null); // For tooltip hover
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchPhoneNumbers = async () => {
            setUsersLoading(true);
            try {
                const response = await getAllMetadata();
                if (response.data && Array.isArray(response.data)) {
                    setPhoneNumbers(response.data);
                } else {
                    console.error("Expected an array in response.data, got:", response);
                }
            } catch (error) {
                console.error("Error fetching metadata:", error);
            } finally {
                setUsersLoading(false);
            }
        };
        fetchPhoneNumbers();
    }, []);

    useEffect(() => {
        if (selectedPhoneNumber) {
            setMessagesLoading(true);
            const fetchLogs = async () => {
                try {
                    const logs = await getActivityLogsByPhoneNumber(selectedPhoneNumber);
                    setActivityLogs(logs.data);
                    const user = phoneNumbers.find((user) => user.phoneNumber === selectedPhoneNumber);
                    setSelectedUserName(user.name || selectedPhoneNumber);  // Display name or phone number
                } catch (error) {
                    console.error("Error fetching activity logs:", error);
                } finally {
                    setMessagesLoading(false);
                }
            };
            fetchLogs();
        }
    }, [selectedPhoneNumber, phoneNumbers]);

    const filteredPhoneNumbers = phoneNumbers.filter(user =>
        (user.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        user.phoneNumber.includes(searchQuery)
    );

    return (
        <div className={styles.main_page}>
            <Navbar />
            {isSidebarOpen && <Sidebar />}
            <div className={styles.content}>
                <div className={styles.logs_container}>
                    <div className={styles.phone_list}>
                        <h3 className={styles.heading_color}>Contacts</h3>
                        <input
                            type="text"
                            placeholder="Search by name or phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={styles.search_input}
                        />
                        {usersLoading ? (
                            <div className={styles.loader}>
                                <TailSpin color="#51bbcc" height={50} width={50} />
                            </div>
                        ) : (
                            <ul>
                                {filteredPhoneNumbers.length > 0 ? (
                                    filteredPhoneNumbers.map((user) => (
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
                        )}
                    </div>

                    {/* Right Panel for Activity Logs */}
                    <div className={styles.activity_logs}>
                        <h3>Messages with {selectedUserName || "Select a contact"}</h3>
                        {messagesLoading ? (
                            <div className={styles.loader}>
                                <TailSpin color="#00BFFF" height={50} width={50} />
                            </div>
                        ) : activityLogs.length > 0 ? (
                            <div className={styles.chat_container}>
                                {activityLogs.map((log) => (
                                    <div
                                        key={log.id}
                                        className={
                                            log.messageDirection === "outbound"
                                                ? styles.message_outbound
                                                : styles.message_inbound
                                        }
                                    >
                                        <div className={styles.message_content}>
                                            {/* Check if the message is media, text, or template */}
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
                                            {log.actionType === 'template' && (
                                                <div className={styles.template_message}>
                                                    <p>{log.messageContent}</p>
                                                </div>
                                            )}

                                            {/* Timestamp */}
                                            <div className={styles.message_footer}>
                                                <div
                                                    className={styles.info_icon}
                                                    onMouseEnter={() => setHoveredLog(log)}
                                                    onMouseLeave={() => setHoveredLog(null)}
                                                >
                                                    ℹ️
                                                    {hoveredLog === log && (
                                                        <div className={styles.tooltip}>
                                                            <p><strong>Course ID:</strong> {log.courseId}</p>
                                                            <p><strong>Lesson ID:</strong> {log.lessonId}</p>
                                                            <p><strong>Week Number:</strong> {log.weekNumber}</p>
                                                            <p><strong>Day Number:</strong> {log.dayNumber}</p>
                                                            <p><strong>Activity Type:</strong> {log.activityType}</p>
                                                        </div>
                                                    )}
                                                </div>

                                                <span className={styles.message_timestamp}>
                                                    {new Date(log.timestamp).toLocaleString()}
                                                </span>
                                            </div>
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
