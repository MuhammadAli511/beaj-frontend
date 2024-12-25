import React, { useState, useEffect, useRef } from 'react';
import { Navbar, Sidebar } from "../../components";
import styles from './WhatsappLogs.module.css';
import { getAllMetadata, getActivityLogsByPhoneNumber } from "../../helper";
import { useSidebar } from '../../components/SidebarContext';
import { TailSpin } from 'react-loader-spinner';

const PAGE_SIZE = 15;

const WhatsappLogs = () => {
    const { isSidebarOpen } = useSidebar();
    const [phoneNumbers, setPhoneNumbers] = useState([]);
    const [selectedPhoneNumber, setSelectedPhoneNumber] = useState(null);
    const [activityLogs, setActivityLogs] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [messagesLoading, setMessagesLoading] = useState(false);

    // Pagination
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // UI States
    const [selectedUserName, setSelectedUserName] = useState('');
    const [hoveredLog, setHoveredLog] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Refs
    const chatContainerRef = useRef(null);

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


    const fetchLogs = async (phoneNumber, currentPage) => {
        try {
            const logs = await getActivityLogsByPhoneNumber(
                phoneNumber,
                currentPage,
                PAGE_SIZE
            );
            return logs.data || [];
        } catch (error) {
            console.error("Error fetching activity logs:", error);
            return [];
        }
    };

    useEffect(() => {
        if (!selectedPhoneNumber) return;

        // Reset states before fetching new logs
        setMessagesLoading(true);
        setActivityLogs([]);
        setPage(1);
        setHasMore(true);

        const initializeLogs = async () => {
            try {
                const logs = await fetchLogs(selectedPhoneNumber, 1);
                // Because you're showing the most recent messages at the bottom,
                // you reverse to place oldest at top and newest at bottom
                setActivityLogs(logs.reverse());
                setHasMore(logs.length === PAGE_SIZE);

                // Set user name if available
                const user = phoneNumbers.find(
                    (u) => u.phoneNumber === selectedPhoneNumber
                );
                setSelectedUserName(user?.name || selectedPhoneNumber);

                setTimeout(() => {
                    if (chatContainerRef.current) {
                        chatContainerRef.current.scrollTop =
                            chatContainerRef.current.scrollHeight;
                    }
                }, 100);
            } catch (error) {
                console.error("Error fetching initial activity logs:", error);
            } finally {
                setMessagesLoading(false);
            }
        };

        initializeLogs();
    }, [selectedPhoneNumber, phoneNumbers]);


    const handleScroll = async () => {
        if (!chatContainerRef.current) return;
        const { scrollTop } = chatContainerRef.current;

        // If we are close to the very top and have more logs to fetch
        if (scrollTop <= 0 && hasMore && !isLoadingMore && !messagesLoading) {
            setIsLoadingMore(true);

            const oldScrollHeight = chatContainerRef.current.scrollHeight;

            const nextPage = page + 1;
            const olderLogs = await fetchLogs(selectedPhoneNumber, nextPage);

            setActivityLogs((prev) => {
                return [...olderLogs.reverse(), ...prev];
            });

            setPage(nextPage);
            setHasMore(olderLogs.length === PAGE_SIZE);

            const newScrollHeight = chatContainerRef.current.scrollHeight;
            const heightDiff = newScrollHeight - oldScrollHeight;

            chatContainerRef.current.scrollTop = heightDiff;

            setIsLoadingMore(false);
        }
    };

    const filteredPhoneNumbers = phoneNumbers.filter((user) => {
        const name = user.name?.toLowerCase() || '';
        const phone = user.phoneNumber || '';
        return name.includes(searchQuery.toLowerCase()) || phone.includes(searchQuery);
    });

    return (
        <div className={styles.main_page}>
            <Navbar />
            {isSidebarOpen && <Sidebar />}

            <div className={styles.content}>
                <div className={styles.logs_container}>
                    {/* Left panel for Contacts */}
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
                                            className={
                                                selectedPhoneNumber === user.phoneNumber
                                                    ? styles.active
                                                    : ''
                                            }
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
                            <div
                                className={styles.chat_container}
                                ref={chatContainerRef}
                                onScroll={handleScroll}
                            >
                                {isLoadingMore && (
                                    <div className={styles.loading_more}>
                                        <TailSpin color="#00BFFF" height={30} width={30} />
                                    </div>
                                )}

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
                                                <img
                                                    src={log.messageContent}
                                                    alt="User sent media"
                                                    className={styles.media_message}
                                                />
                                            )}
                                            {log.actionType === 'sticker' && (
                                                <img
                                                    src={log.messageContent}
                                                    alt="User sent sticker"
                                                    className={styles.media_message}
                                                />
                                            )}
                                            {log.actionType === 'audio' && (
                                                <audio controls>
                                                    <source
                                                        src={log.messageContent}
                                                        type="audio/mpeg"
                                                    />
                                                    Your browser does not support the audio element.
                                                </audio>
                                            )}
                                            {log.actionType === 'video' && (
                                                <video controls className={styles.media_message}>
                                                    <source
                                                        src={log.messageContent}
                                                        type="video/mp4"
                                                    />
                                                    Your browser does not support the video element.
                                                </video>
                                            )}
                                            {log.actionType === 'text' && (
                                                <p>{log.messageContent}</p>
                                            )}
                                            {log.actionType === 'template' && (
                                                <div className={styles.template_message}>
                                                    <p>{log.messageContent}</p>
                                                </div>
                                            )}

                                            {/* Timestamp & Info */}
                                            <div className={styles.message_footer}>
                                                <div
                                                    className={styles.info_icon}
                                                    onMouseEnter={() => setHoveredLog(log)}
                                                    onMouseLeave={() => setHoveredLog(null)}
                                                >
                                                    ℹ️
                                                    {hoveredLog === log && (
                                                        <div className={styles.tooltip}>
                                                            <p>
                                                                <strong>Course ID:</strong>{' '}
                                                                {log.courseId}
                                                            </p>
                                                            <p>
                                                                <strong>Lesson ID:</strong>{' '}
                                                                {log.lessonId}
                                                            </p>
                                                            <p>
                                                                <strong>Week Number:</strong>{' '}
                                                                {log.weekNumber}
                                                            </p>
                                                            <p>
                                                                <strong>Day Number:</strong>{' '}
                                                                {log.dayNumber}
                                                            </p>
                                                            <p>
                                                                <strong>Activity Type:</strong>{' '}
                                                                {log.activityType}
                                                            </p>
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
