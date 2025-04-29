import React, { useState, useEffect, useRef } from 'react';
import { Navbar, Sidebar } from "../../components";
import styles from './WhatsappLogs.module.css';
import { getAllMetadata, getActivityLogsByPhoneNumber, getLastMessageTime } from "../../helper";
import { useSidebar } from '../../components/SidebarContext';
import { TailSpin } from 'react-loader-spinner';
import Select from 'react-select';

const PAGE_SIZE = 15;
const INACTIVE_DAYS_THRESHOLD = 3;

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
    const [selectedCohorts, setSelectedCohorts] = useState(['All']);
    const [inactivityData, setInactivityData] = useState({});

    // Refs
    const chatContainerRef = useRef(null);

    // Cohort options
    const cohortOptions = [
        { value: 'All', label: 'All' },
        { value: 'Pilot', label: 'Pilot' },
        ...Array.from({ length: 60 }, (_, i) => ({
            value: `Cohort ${i + 1}`,
            label: `Cohort ${i + 1}`
        }))
    ];

    const handleCohortsChange = (selectedOptions) => {
        if (selectedOptions.some(option => option.value === 'All')) {
            setSelectedCohorts(['All']);
        } else {
            setSelectedCohorts(selectedOptions.map(option => option.value));
        }
    };

    const processMessageContent = (content) => {
        // Handle null or undefined content
        if (!content) return { url: '', caption: '' };
        
        // If content is an array, use first element as URL and second as caption
        if (Array.isArray(content)) {
            return {
                url: content[0] || '',
                caption: content[1] || ''
            };
        }
        
        // If it's a string, handle the comma case
        if (typeof content === 'string') {
            // Remove trailing comma if it exists
            const trimmedContent = content.endsWith(',') ? content.slice(0, -1) : content;
            
            // Split by comma if it exists
            const parts = trimmedContent.split(',');
            if (parts.length > 1) {
                return {
                    url: parts[0].trim(),
                    caption: parts[1].trim()
                };
            }
            
            return {
                url: trimmedContent,
                caption: ''
            };
        }
        
        // For any other type, return empty values
        return { url: '', caption: '' };
    };

    useEffect(() => {
        const fetchData = async () => {
            setUsersLoading(true);
            try {
                const [metadataResponse, lastMessageTimeResponse] = await Promise.all([
                    getAllMetadata(),
                    getLastMessageTime() // Get last message time data for all users
                ]);

                if (metadataResponse.data && Array.isArray(metadataResponse.data)) {
                    // Create a map of phone numbers to last message time data
                    const lastMessageTimeMap = {};
                    lastMessageTimeResponse.data.forEach(user => {
                        const timestamp = user.timestamp;
                        const now = new Date();
                        const lastMessageDate = new Date(timestamp);
                        const diffTime = Math.abs(now - lastMessageDate);
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        
                        lastMessageTimeMap[user.phoneNumber] = {
                            lastMessageTimestamp: timestamp,
                            inactiveDays: diffDays
                        };
                    });
                    setInactivityData(lastMessageTimeMap);

                    // Combine metadata with last message time data
                    const usersWithActivity = metadataResponse.data.map(user => ({
                        ...user,
                        ...lastMessageTimeMap[user.phoneNumber]
                    }));
                    setPhoneNumbers(usersWithActivity);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setUsersLoading(false);
            }
        };
        fetchData();
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
        const userCohort = user.cohort || '';
        
        const matchesSearch = name.includes(searchQuery.toLowerCase()) || phone.includes(searchQuery);
        const matchesCohort = selectedCohorts.includes('All') || selectedCohorts.includes(userCohort);
        
        return matchesSearch && matchesCohort;
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
                        <div className={styles.filters}>
                            <input
                                type="text"
                                placeholder="Search by name or phone..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={styles.search_input}
                            />
                            <div className={styles.cohort_filter}>
                                <Select
                                    className={styles.select}
                                    options={cohortOptions}
                                    isMulti
                                    defaultValue={[cohortOptions[0]]}
                                    onChange={handleCohortsChange}
                                    placeholder="Select cohorts..."
                                    isSearchable={true}
                                />
                            </div>
                        </div>
                        {usersLoading ? (
                            <div className={styles.loader}>
                                <TailSpin color="#51bbcc" height={50} width={50} />
                            </div>
                        ) : (
                            <ul>
                                {filteredPhoneNumbers.length > 0 ? (
                                    filteredPhoneNumbers.map((user) => (
                                        <li
                                            key={user.profile_id}
                                            className={`${
                                                selectedPhoneNumber === user.phoneNumber
                                                    ? styles.active
                                                    : ''
                                            } ${styles.user_item}`}
                                            onClick={() => setSelectedPhoneNumber(user.phoneNumber)}
                                        >
                                            <div className={styles.user_info}>
                                                <span>{user.name || user.phoneNumber}</span>
                                                {user.inactiveDays >= INACTIVE_DAYS_THRESHOLD && (
                                                    <span className={styles.inactive_dot} title={`Inactive for ${user.inactiveDays} days`} />
                                                )}
                                            </div>
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
                                                <div className={styles.media_container}>
                                                    {(() => {
                                                        const { url, caption } = processMessageContent(log.messageContent);
                                                        return (
                                                            <>
                                                                <img
                                                                    src={url}
                                                                    alt={caption || "User sent media"}
                                                                    className={styles.media_message}
                                                                />
                                                                {caption && <p className={styles.media_caption}>{caption}</p>}
                                                            </>
                                                        );
                                                    })()}
                                                </div>
                                            )}
                                            {log.actionType === 'sticker' && (
                                                <img
                                                    src={processMessageContent(log.messageContent).url}
                                                    alt="User sent sticker"
                                                    className={styles.media_message}
                                                />
                                            )}
                                            {log.actionType === 'audio' && (
                                                <audio controls>
                                                    <source
                                                        src={processMessageContent(log.messageContent).url}
                                                        type="audio/mpeg"
                                                    />
                                                    Your browser does not support the audio element.
                                                </audio>
                                            )}
                                            {log.actionType === 'video' && (
                                                <div className={styles.media_container}>
                                                    {(() => {
                                                        const { url, caption } = processMessageContent(log.messageContent);
                                                        return (
                                                            <>
                                                                <video controls className={styles.media_message}>
                                                                    <source
                                                                        src={url}
                                                                        type="video/mp4"
                                                                    />
                                                                    Your browser does not support the video element.
                                                                </video>
                                                                {caption && <p className={styles.media_caption}>{caption}</p>}
                                                            </>
                                                        );
                                                    })()}
                                                </div>
                                            )}
                                            {log.actionType === 'text' && (
                                                <p>{processMessageContent(log.messageContent).url}</p>
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
