import React, { useState, useEffect, useMemo } from 'react';
import { Navbar, Sidebar } from "../../components";
import styles from './UsersData.module.css';
import { useSidebar } from '../../components/SidebarContext';
import CSVDownloader from 'react-csv-downloader';
import { getAllMetadata, getStudentUserJourneyStats } from '../../helper/index';
import { TailSpin } from 'react-loader-spinner';
import Select from 'react-select';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const UsersData = () => {
    const { isSidebarOpen } = useSidebar();
    const [userData, setUserData] = useState([]);
    const [studentUserData, setStudentUserData] = useState([]);
    const [studentStats, setStudentStats] = useState({});
    const [messageStats, setMessageStats] = useState({});
    const [activityTypeStats, setActivityTypeStats] = useState({});
    const [activeTab, setActiveTab] = useState('student');
    const [isLoading, setIsLoading] = useState(false);
    const [phoneNumberSearch, setPhoneNumberSearch] = useState('');
    const [graphData, setGraphData] = useState([]);

    // Sorting state
    const [sortConfig, setSortConfig] = useState({
        key: null,
        direction: 'asc'
    });

    // Date filter state
    const [dateFilter, setDateFilter] = useState({
        from: '',
        to: '',
        column: null
    });

    // Activity Type and Acceptable Messages filters
    const [activityTypeFilter, setActivityTypeFilter] = useState(null);
    const [messageFilter, setMessageFilter] = useState(null);

    const dateColumnOptions = [
        { value: 'userClickedLink', label: 'Clicked Link' },
        { value: 'freeDemoStarted', label: 'Demo Started' },
        { value: 'freeDemoEnded', label: 'Demo Ended' },
        { value: 'userRegistrationComplete', label: 'Registration' }
    ];

    // Utility function to format array data nicely
    const formatArrayForDisplay = (arr) => {
        if (!arr || !Array.isArray(arr) || arr.length === 0) return '';
        return arr.join(', ');
    };

    // Helper function to escape commas
    const escapeCommas = (field) => {
        return field && field.includes(",") ? `"${field}"` : field;
    };

    // Generate options for activity type filter
    const activityTypeOptions = useMemo(() => {
        return Object.keys(activityTypeStats).map(type => ({
            value: type,
            label: type || 'Unknown'
        }));
    }, [activityTypeStats]);

    // Generate options for acceptable messages filter
    const messageOptions = useMemo(() => {
        return Object.values(messageStats).map(stat => ({
            value: JSON.stringify(stat.messages),
            label: formatArrayForDisplay(stat.messages)
        }));
    }, [messageStats]);

    // Handle sorting
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Sort data
    const sortedData = (data) => {
        if (!sortConfig.key) return data;

        return [...data].sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            if (aValue === bValue) return 0;
            if (aValue === undefined || aValue === null || aValue === "") return 1;
            if (bValue === undefined || bValue === null || bValue === "") return -1;

            // For numeric fields (trial starts), use numeric comparison
            if (sortConfig.key === 'level1_trial_starts' || sortConfig.key === 'level3_trial_starts') {
                return sortConfig.direction === 'asc' 
                    ? Number(aValue) - Number(bValue) 
                    : Number(bValue) - Number(aValue);
            }
            
            // For date/string fields, use string comparison
            const comparison = aValue.toString().localeCompare(bValue.toString());
            return sortConfig.direction === 'asc' ? comparison : -comparison;
        });
    };

    // Filter data by all filters
    const filterData = (data) => {
        let filteredData = data;
        
        // Apply phone number search filter
        if (phoneNumberSearch.trim() !== '') {
            filteredData = filteredData.filter(item => 
                item.phoneNumber && item.phoneNumber.includes(phoneNumberSearch.trim())
            );
        }
        
        // Apply date filter
        if (dateFilter.column && dateFilter.from && dateFilter.to) {
            filteredData = filteredData.filter(item => {
                const date = new Date(item[dateFilter.column]);
                const fromDate = new Date(dateFilter.from);
                const toDate = new Date(dateFilter.to);
                toDate.setHours(23, 59, 59, 999); // Set to end of day (11:59:59.999 PM)

                return date >= fromDate && date <= toDate;
            });
        }
        
        // Apply activity type filter
        if (activityTypeFilter) {
            filteredData = filteredData.filter(item => 
                item.activityType === activityTypeFilter.value
            );
        }
        
        // Apply acceptable messages filter
        if (messageFilter) {
            const selectedMessages = JSON.parse(messageFilter.value);
            filteredData = filteredData.filter(item => {
                // Compare the comma-separated string versions
                const itemMessages = item.acceptableMessages;
                return itemMessages === formatArrayForDisplay(selectedMessages);
            });
        }
        
        return filteredData;
    };

    // Get processed data
    const getProcessedData = (data) => {
        const filteredData = filterData(data);
        return sortedData(filteredData);
    };

    // Get total record count
    const getTotalRecords = (data) => {
        return data.length;
    };

    // Get filtered record count
    const getFilteredRecords = (data) => {
        return filterData(data).length;
    };

    // Clear all filters
    const clearFilters = () => {
        setDateFilter({
            from: '',
            to: '',
            column: null
        });
        setActivityTypeFilter(null);
        setMessageFilter(null);
        setPhoneNumberSearch('');
    };

    useEffect(() => {
        if (activeTab === 'teacher') {
            fetchTeacherData();
        } else {
            fetchStudentData();
        }
    }, [activeTab]);

    const fetchTeacherData = async () => {
        try {
            setIsLoading(true);
            const data = await getAllMetadata();
            const formattedData = data.data.map(user => ({
                ...user,
                userId: user.userId ? `${user.userId}` : "",
                phoneNumber: user.phoneNumber ? `${user.phoneNumber}` : "",
                name: escapeCommas(user.name),
                city: escapeCommas(user.city),
                targetGroup: user.targetGroup ? `${user.targetGroup}` : "",
                cohort: user.cohort ? `${user.cohort}` : "",
                isTeacher: user.isTeacher ? `${user.isTeacher}` : "",
                schoolName: user.schoolName ? `${user.schoolName}` : "",
                freeDemoStarted: user.freeDemoStarted ? new Date(user.freeDemoStarted).toLocaleString().replace(",", "") : "",
                freeDemoEnded: user.freeDemoEnded ? new Date(user.freeDemoEnded).toLocaleString().replace(",", "") : "",
                userClickedLink: user.userClickedLink ? new Date(user.userClickedLink).toLocaleString().replace(",", "") : "",
                userRegistrationComplete: user.userRegistrationComplete ? new Date(user.userRegistrationComplete).toLocaleString().replace(",", "") : ""
            }));
            setUserData(formattedData);
        } catch (error) {
            console.error("Error fetching teacher data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchStudentData = async () => {
        try {
            setIsLoading(true);
            // Default date filter set to a future date to include all data
            const response = await getStudentUserJourneyStats('2025-04-26 12:00:00');
            
            if (response.status === 200 && response.data) {
                // Format user data for table
                const formattedUserData = response.data.userData.map(user => {
                    // Determine current stage based on available data (for sorting)
                    let sortingStage;
                    let displayStage;
                    
                    if (user.userRegistrationComplete) {
                        sortingStage = "Registration Complete";
                        displayStage = "Registration Complete";
                    } else if (user.freeDemoEnded) {
                        sortingStage = "Demo Ended";
                        displayStage = "Demo Ended";
                    } else if (user.freeDemoStarted) {
                        sortingStage = "Demo Started";
                        // For Demo Started, use the engagement_type as the display stage
                        displayStage = user.engagement_type || "Demo Started";
                    } else if (user.userClickedLink) {
                        sortingStage = "Clicked Link";
                        displayStage = "Clicked Link";
                    } else {
                        sortingStage = "Unknown";
                        displayStage = "Unknown";
                    }

                    // Determine demo type from engagement_type
                    const currentStage = user.engagement_type || "";

                    // Determine persona based on city
                    const persona = !user.city || user.city.trim() === "" ? "Parent / Student" : "School Admin";
                    
                    return {
                        phoneNumber: user.phoneNumber || "",
                        city: escapeCommas(user.city || ""),
                        userClickedLink: user.userClickedLink ? new Date(user.userClickedLink).toLocaleString().replace(",", "") : "",
                        freeDemoStarted: user.freeDemoStarted ? new Date(user.freeDemoStarted).toLocaleString().replace(",", "") : "",
                        currentStage: currentStage,
                        freeDemoEnded: user.freeDemoEnded ? new Date(user.freeDemoEnded).toLocaleString().replace(",", "") : "",
                        userRegistrationComplete: user.userRegistrationComplete ? new Date(user.userRegistrationComplete).toLocaleString().replace(",", "") : "",
                        schoolName: escapeCommas(user.schoolName || ""),
                        persona: persona,
                        sortingStage: sortingStage,
                        level1_trial_starts: user.level1_trial_starts || 0,
                        level3_trial_starts: user.level3_trial_starts || 0,
                        activityType: user.activityType || "",
                        currentLessonId: user.currentLessonId || "",
                        currentLesson_sequence: user.currentLesson_sequence || "",
                        questionNumber: user.questionNumber || "",
                        acceptableMessages: user.acceptableMessages ? formatArrayForDisplay(user.acceptableMessages) : "",
                        last_message_content: user.last_message_content ? formatArrayForDisplay(user.last_message_content) : "",
                        last_message_timestamp: user.last_message_timestamp ? new Date(user.last_message_timestamp).toLocaleString().replace(",", "") : "",
                        source: user.source ? `${user.source}` : ""
                    };
                });
                
                // Sort by funnel stage using the sortingStage field
                const sortedUserData = formattedUserData.sort((a, b) => {
                    const stageOrder = {
                        "Clicked Link": 1,
                        "Demo Started": 2,
                        "Demo Ended": 3,
                        "Registration Complete": 4,
                        "Unknown": 5
                    };
                    
                    return stageOrder[a.sortingStage] - stageOrder[b.sortingStage];
                });
                
                setStudentUserData(sortedUserData);
                setStudentStats(response.data.stats || {});

                // Generate acceptableMessages statistics
                const messageStatsData = {};
                response.data.userData.forEach(user => {
                    if (user.acceptableMessages && user.acceptableMessages.length > 0) {
                        const messageKey = JSON.stringify(user.acceptableMessages);
                        if (!messageStatsData[messageKey]) {
                            messageStatsData[messageKey] = {
                                messages: user.acceptableMessages,
                                count: 0
                            };
                        }
                        messageStatsData[messageKey].count += 1;
                    }
                });
                setMessageStats(messageStatsData);

                // Generate activityType statistics
                const activityStatsData = {};
                response.data.userData.forEach(user => {
                    if (user.activityType) {
                        if (!activityStatsData[user.activityType]) {
                            activityStatsData[user.activityType] = 0;
                        }
                        activityStatsData[user.activityType] += 1;
                    }
                });
                setActivityTypeStats(activityStatsData);

                // Update graphData
                setGraphData(response.data.graphData);
            }
        } catch (error) {
            console.error("Error fetching student data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.main_page}>
            <Navbar />
            {isSidebarOpen && <Sidebar />}
            <div className={styles.content}>
                <h1>Users Data</h1>
                
                <div className={styles.tabs}>
                    <button 
                        className={`${styles.tab_button} ${activeTab === 'student' ? styles.active_tab : ''}`}
                        onClick={() => setActiveTab('student')}
                    >
                        Student Product
                    </button>
                    <button 
                        className={`${styles.tab_button} ${activeTab === 'teacher' ? styles.active_tab : ''}`}
                        onClick={() => setActiveTab('teacher')}
                    >
                        Teacher Product
                    </button>
                </div>

                {/* Date Filter Controls */}
                <div className={styles.filters_container}>
                    <div className={styles.filter_group}>
                        <label className={styles.filter_label}>Phone Number</label>
                        <input
                            type="text"
                            value={phoneNumberSearch}
                            onChange={(e) => setPhoneNumberSearch(e.target.value)}
                            placeholder="Search phone number"
                            className={styles.text_input}
                        />
                    </div>
                    <div className={styles.filter_group}>
                        <label className={styles.filter_label}>From Date</label>
                        <input
                            type="date"
                            value={dateFilter.from}
                            onChange={(e) => setDateFilter(prev => ({ ...prev, from: e.target.value }))}
                            className={styles.date_input}
                        />
                    </div>
                    <div className={styles.filter_group}>
                        <label className={styles.filter_label}>To Date</label>
                        <input
                            type="date"
                            value={dateFilter.to}
                            onChange={(e) => setDateFilter(prev => ({ ...prev, to: e.target.value }))}
                            className={styles.date_input}
                        />
                    </div>
                    <div className={styles.filter_group}>
                        <label className={styles.filter_label}>Filter Column</label>
                        <Select
                            className={styles.select}
                            options={dateColumnOptions}
                            value={dateColumnOptions.find(option => option.value === dateFilter.column)}
                            onChange={(option) => setDateFilter(prev => ({ ...prev, column: option?.value || null }))}
                            isClearable
                            placeholder="Select Column"
                        />
                    </div>
                    {activeTab === 'student' && (
                        <>
                            <div className={styles.filter_group}>
                                <label className={styles.filter_label}>Activity Type</label>
                                <Select
                                    className={styles.select}
                                    options={activityTypeOptions}
                                    value={activityTypeFilter}
                                    onChange={setActivityTypeFilter}
                                    isClearable
                                    placeholder="Select Activity Type"
                                />
                            </div>
                            <div className={styles.filter_group}>
                                <label className={styles.filter_label}>Acceptable Messages</label>
                                <Select
                                    className={styles.select}
                                    options={messageOptions}
                                    value={messageFilter}
                                    onChange={setMessageFilter}
                                    isClearable
                                    placeholder="Select Message Type"
                                />
                            </div>
                            <div className={styles.filter_group}>
                                <button 
                                    className={styles.clear_filters_button}
                                    onClick={clearFilters}
                                >
                                    Clear Filters
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Record Count Display */}
                <div className={styles.record_count_container}>
                    <div className={styles.record_count}>
                        {(dateFilter.column && dateFilter.from && dateFilter.to) || activityTypeFilter || messageFilter || phoneNumberSearch ? (
                            <>
                                Showing <span className={styles.filtered_count}>{getFilteredRecords(activeTab === 'teacher' ? userData : studentUserData)}</span>
                                <span className={styles.total_count}> of {getTotalRecords(activeTab === 'teacher' ? userData : studentUserData)} records</span>
                            </>
                        ) : (
                            <span className={styles.total_count}>Total records: {getTotalRecords(activeTab === 'teacher' ? userData : studentUserData)}</span>
                        )}
                    </div>
                </div>
                
                {activeTab === 'teacher' ? (
                    <>
                        <div className={styles.stats_summary}>
                            <CSVDownloader
                                datas={getProcessedData(userData)}
                                columns={[
                                    { id: 'userId', displayName: 'User ID' },
                                    { id: 'phoneNumber', displayName: 'Phone Number' },
                                    { id: 'name', displayName: 'Name' },
                                    { id: 'city', displayName: 'City' },
                                    { id: 'targetGroup', displayName: 'Target Group' },
                                    { id: 'cohort', displayName: 'Cohort' },
                                    { id: 'isTeacher', displayName: 'Is Teacher' },
                                    { id: 'schoolName', displayName: 'School Name' },
                                    { id: 'freeDemoStarted', displayName: 'Free Demo Started' },
                                    { id: 'freeDemoEnded', displayName: 'Free Demo Ended' },
                                    { id: 'userClickedLink', displayName: 'User Clicked Link' },
                                    { id: 'userRegistrationComplete', displayName: 'User Registration Complete' },
                                ]}
                                filename="teachers_data.csv"
                                className={styles.download_button}
                                text="Download CSV"
                            />
                        </div>
                        
                        {isLoading ? (
                            <div className={styles.loader_container}>
                                <TailSpin color="#51bbcc" height={50} width={50} />
                            </div>
                        ) : (
                            <div className={styles.table_container}>
                                <table className={styles.table}>
                                    <thead className={styles.heading_row}>
                                        <tr>
                                            <th className={styles.table_heading}>User ID</th>
                                            <th className={styles.table_heading}>Phone Number</th>
                                            <th className={styles.table_heading}>Name</th>
                                            <th className={styles.table_heading}>City</th>
                                            <th className={styles.table_heading}>Target Group</th>
                                            <th className={styles.table_heading}>Cohort</th>
                                            <th className={styles.table_heading}>Teacher</th>
                                            <th className={styles.table_heading}>School Name</th>
                                            <th 
                                                className={`${styles.table_heading} ${styles.sortable}`}
                                                onClick={() => handleSort('freeDemoStarted')}
                                            >
                                                Free Demo Started
                                                {sortConfig.key === 'freeDemoStarted' && (
                                                    <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                                )}
                                            </th>
                                            <th 
                                                className={`${styles.table_heading} ${styles.sortable}`}
                                                onClick={() => handleSort('freeDemoEnded')}
                                            >
                                                Free Demo Ended
                                                {sortConfig.key === 'freeDemoEnded' && (
                                                    <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                                )}
                                            </th>
                                            <th 
                                                className={`${styles.table_heading} ${styles.sortable}`}
                                                onClick={() => handleSort('userClickedLink')}
                                            >
                                                User Clicked Link
                                                {sortConfig.key === 'userClickedLink' && (
                                                    <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                                )}
                                            </th>
                                            <th 
                                                className={`${styles.table_heading} ${styles.sortable}`}
                                                onClick={() => handleSort('userRegistrationComplete')}
                                            >
                                                User Registration Complete
                                                {sortConfig.key === 'userRegistrationComplete' && (
                                                    <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                                )}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className={styles.table_body}>
                                        {getProcessedData(userData).map((user, index) => (
                                            <tr key={index}>
                                                <td>{user.userId || ""}</td>
                                                <td>{user.phoneNumber || ""}</td>
                                                <td>{user.name || ""}</td>
                                                <td>{user.city || ""}</td>
                                                <td>{user.targetGroup || ""}</td>
                                                <td>{user.cohort || ""}</td>
                                                <td>{user.isTeacher || ""}</td>
                                                <td>{user.schoolName || ""}</td>
                                                <td>{user.freeDemoStarted || ""}</td>
                                                <td>{user.freeDemoEnded || ""}</td>
                                                <td>{user.userClickedLink || ""}</td>
                                                <td>{user.userRegistrationComplete || ""}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        {/* Stats Cards */}
                        <div className={styles.stats_cards}>
                            {isLoading ? (
                                <div className={styles.loader_container}>
                                    <TailSpin color="#51bbcc" height={50} width={50} />
                                </div>
                            ) : (
                                // Define specific order for stats cards
                                ['Clicked Link', 'Demo Started', 'Demo Ended', 'Registration Completed'].map((stage, index, stagesArray) => {
                                    const data = studentStats[stage] || { count: 0, percentage: 0, dropPercentage: 0 };
                                    
                                    // Calculate correct conversion and drop rates based on actual counts
                                    let conversionRate = 100; // Default for first stage
                                    let dropRate = 0;
                                    
                                    if (index > 0) {
                                        const previousStage = stagesArray[index - 1];
                                        const previousCount = studentStats[previousStage]?.count || 0;
                                        
                                        if (previousCount > 0) {
                                            conversionRate = ((data.count / previousCount) * 100).toFixed(2);
                                            dropRate = (100 - conversionRate).toFixed(2);
                                        } else {
                                            conversionRate = "0.00";
                                            dropRate = "100.00";
                                        }
                                    }
                                    
                                    return (
                                        <div key={stage} className={styles.stat_card}>
                                            <h3>{stage}</h3>
                                            <p className={styles.card_value}>{data.count}</p>
                                            <div className={styles.card_metrics}>
                                                <p className={styles.conversion_rate}>
                                                    Conversion: {conversionRate}%
                                                </p>
                                                <p className={styles.drop_rate}>
                                                    Drop: {dropRate}%
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                        
                        {/* Conversion Graph */}
                        {!isLoading && graphData && graphData.length > 0 && (
                            <div className={styles.graph_container}>
                                <h3>Daily Conversion Rates</h3>
                                <div className={styles.chart_wrapper}>
                                    <Line
                                        data={{
                                            labels: graphData.map(item => item.date),
                                            datasets: [
                                                {
                                                    label: 'Clicked Count',
                                                    data: graphData.map(item => parseInt(item.clicked_count)),
                                                    borderColor: '#4285F4',
                                                    backgroundColor: 'rgba(66, 133, 244, 0.1)',
                                                    tension: 0.3,
                                                    yAxisID: 'y',
                                                },
                                                {
                                                    label: 'Registered Count',
                                                    data: graphData.map(item => parseInt(item.registered_count)),
                                                    borderColor: '#34A853',
                                                    backgroundColor: 'rgba(52, 168, 83, 0.1)',
                                                    tension: 0.3,
                                                    yAxisID: 'y',
                                                }
                                            ]
                                        }}
                                        options={{
                                            responsive: true,
                                            interaction: {
                                                mode: 'index',
                                                intersect: false,
                                            },
                                            maintainAspectRatio: false,
                                            scales: {
                                                y: {
                                                    beginAtZero: true,
                                                    title: {
                                                        display: true,
                                                        text: 'Count'
                                                    }
                                                },
                                                x: {
                                                    title: {
                                                        display: true,
                                                        text: 'Date'
                                                    }
                                                }
                                            },
                                            plugins: {
                                                tooltip: {
                                                    callbacks: {
                                                        afterBody: (context) => {
                                                            const dataIndex = context[0].dataIndex;
                                                            return `Conversion: ${graphData[dataIndex].conversion_percentage}%`;
                                                        }
                                                    }
                                                },
                                                legend: {
                                                    position: 'top',
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                        
                        {/* Message Statistics */}
                        {!isLoading && Object.keys(messageStats).length > 0 && (
                            <div className={styles.stats_section}>
                                <h3>Users by Acceptable Messages</h3>
                                <div className={styles.stats_grid}>
                                    {Object.values(messageStats).sort((a, b) => b.count - a.count).map((stat, index) => (
                                        <div key={index} className={styles.message_stat_card}>
                                            <div className={styles.message_display}>
                                                {stat.messages.map((msg, i) => (
                                                    <span key={i} className={styles.message_item}>
                                                        {msg}
                                                        {i < stat.messages.length - 1 && <span className={styles.message_separator}>or</span>}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className={styles.stat_count}>
                                                {stat.count} users
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Activity Type Statistics */}
                        {!isLoading && Object.keys(activityTypeStats).length > 0 && (
                            <div className={styles.stats_section}>
                                <h3>Users by Activity Type</h3>
                                <div className={styles.stats_grid}>
                                    {Object.entries(activityTypeStats).sort((a, b) => b[1] - a[1]).map(([type, count], index) => (
                                        <div key={index} className={styles.activity_stat_card}>
                                            <div className={styles.activity_badge}>
                                                {type || 'Unknown'}
                                            </div>
                                            <div className={styles.stat_count}>
                                                {count} users
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        <div className={styles.stats_summary}>
                            <CSVDownloader
                                datas={getProcessedData(studentUserData)}
                                columns={[
                                    { id: 'phoneNumber', displayName: 'Phone Number' },
                                    { id: 'city', displayName: 'City' },
                                    { id: 'userRegistrationComplete', displayName: 'Registration' },
                                    { id: 'schoolName', displayName: 'School' },
                                    { id: 'persona', displayName: 'Persona' },
                                    { id: 'source', displayName: 'Source' }
                                ]}
                                filename="students_data.csv"
                                className={styles.download_button}
                                text="Download CSV"
                            />
                        </div>
                        
                        {isLoading ? (
                            <div className={styles.loader_container}>
                                <TailSpin color="#51bbcc" height={50} width={50} />
                            </div>
                        ) : (
                            <div className={styles.table_container}>
                                <table className={styles.table}>
                                    <thead className={styles.heading_row}>
                                        <tr>
                                            <th className={styles.table_heading}>Phone Number</th>
                                            <th className={styles.table_heading}>City</th>
                                            <th 
                                                className={`${styles.table_heading} ${styles.sortable}`}
                                                onClick={() => handleSort('userClickedLink')}
                                            >
                                                Clicked Link
                                                {sortConfig.key === 'userClickedLink' && (
                                                    <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                                )}
                                            </th>
                                            <th 
                                                className={`${styles.table_heading} ${styles.sortable}`}
                                                onClick={() => handleSort('freeDemoStarted')}
                                            >
                                                Demo Started
                                                {sortConfig.key === 'freeDemoStarted' && (
                                                    <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                                )}
                                            </th>
                                            <th 
                                                className={`${styles.table_heading} ${styles.sortable}`}
                                                onClick={() => handleSort('freeDemoEnded')}
                                            >
                                                Demo Ended
                                                {sortConfig.key === 'freeDemoEnded' && (
                                                    <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                                )}
                                            </th>
                                            <th 
                                                className={`${styles.table_heading} ${styles.sortable}`}
                                                onClick={() => handleSort('userRegistrationComplete')}
                                            >
                                                Registration
                                                {sortConfig.key === 'userRegistrationComplete' && (
                                                    <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                                )}
                                            </th>
                                            <th className={styles.table_heading}>Source</th>
                                            <th className={styles.table_heading}>School</th>
                                            <th className={styles.table_heading}>Persona</th>
                                            <th className={styles.table_heading}>Current Stage</th>
                                            <th 
                                                className={`${styles.table_heading} ${styles.sortable}`}
                                                onClick={() => handleSort('level1_trial_starts')}
                                            >
                                                Level 1 Trials
                                                {sortConfig.key === 'level1_trial_starts' && (
                                                    <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                                )}
                                            </th>
                                            <th 
                                                className={`${styles.table_heading} ${styles.sortable}`}
                                                onClick={() => handleSort('level3_trial_starts')}
                                            >
                                                Level 3 Trials
                                                {sortConfig.key === 'level3_trial_starts' && (
                                                    <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                                )}
                                            </th>
                                            <th className={styles.table_heading}>Activity Type</th>
                                            <th className={styles.table_heading}>Current Lesson ID</th>
                                            <th className={styles.table_heading}>Lesson Sequence</th>
                                            <th className={styles.table_heading}>Question Number</th>
                                            <th className={styles.table_heading}>Acceptable Messages</th>
                                            <th className={styles.table_heading}>Last Message</th>
                                            <th 
                                                className={`${styles.table_heading} ${styles.sortable}`}
                                                onClick={() => handleSort('last_message_timestamp')}
                                            >
                                                Last Message Time
                                                {sortConfig.key === 'last_message_timestamp' && (
                                                    <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                                )}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className={styles.table_body}>
                                        {getProcessedData(studentUserData).map((user, index) => (
                                            <tr key={index} className={`${styles.table_row} ${styles[user.sortingStage.toLowerCase().replace(' ', '_')]}`}>
                                                <td className={styles.normal_text}>{user.phoneNumber}</td>
                                                <td className={styles.normal_text}>{user.city}</td>
                                                <td className={styles.normal_text}>{user.userClickedLink}</td>
                                                <td className={styles.normal_text}>{user.freeDemoStarted}</td>
                                                <td className={styles.normal_text}>{user.freeDemoEnded}</td>
                                                <td className={styles.normal_text}>{user.userRegistrationComplete}</td>
                                                <td className={styles.normal_text}>{user.source}</td>
                                                <td className={styles.normal_text}>{user.schoolName}</td>
                                                <td className={styles.normal_text}>{user.persona}</td>
                                                <td className={styles.normal_text}>{user.currentStage}</td>
                                                <td className={styles.normal_text}>{user.level1_trial_starts || 0}</td>
                                                <td className={styles.normal_text}>{user.level3_trial_starts || 0}</td>
                                                <td className={styles.normal_text}>{user.activityType || ''}</td>
                                                <td className={styles.normal_text}>{user.currentLessonId || ''}</td>
                                                <td className={styles.normal_text}>{user.currentLesson_sequence || ''}</td>
                                                <td className={styles.normal_text}>{user.questionNumber || ''}</td>
                                                <td className={styles.normal_text}>{user.acceptableMessages || ''}</td>
                                                <td className={styles.normal_text}>{user.last_message_content || ''}</td>
                                                <td className={styles.normal_text}>{user.last_message_timestamp || ''}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default UsersData;
