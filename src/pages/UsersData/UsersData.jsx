import React, { useState, useEffect } from 'react';
import { Navbar, Sidebar } from "../../components";
import styles from './UsersData.module.css';
import { useSidebar } from '../../components/SidebarContext';
import CSVDownloader from 'react-csv-downloader';
import { getAllMetadata, getStudentUserJourneyStats } from '../../helper/index';
import { TailSpin } from 'react-loader-spinner';

const UsersData = () => {
    const { isSidebarOpen } = useSidebar();
    const [userData, setUserData] = useState([]);
    const [studentUserData, setStudentUserData] = useState([]);
    const [studentStats, setStudentStats] = useState({});
    const [activeTab, setActiveTab] = useState('student');
    const [isLoading, setIsLoading] = useState(false);

    const escapeCommas = (field) => {
        return field && field.includes(",") ? `"${field}"` : field;
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
                
                {activeTab === 'teacher' ? (
                    <>
                        <div className={styles.stats_summary}>
                            <CSVDownloader
                                datas={userData}
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
                                            <th className={styles.table_heading}>Free Demo Started</th>
                                            <th className={styles.table_heading}>Free Demo Ended</th>
                                            <th className={styles.table_heading}>User Clicked Link</th>
                                            <th className={styles.table_heading}>User Registration Complete</th>
                                        </tr>
                                    </thead>
                                    <tbody className={styles.table_body}>
                                        {userData.map((user, index) => (
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
                                Object.entries(studentStats).map(([stage, data], index) => (
                                    <div key={index} className={styles.stat_card}>
                                        <h3>{stage}</h3>
                                        <p className={styles.card_value}>{data.count}</p>
                                        <div className={styles.card_metrics}>
                                            <p className={styles.conversion_rate}>
                                                Conversion: {data.percentage}%
                                            </p>
                                            <p className={styles.drop_rate}>
                                                Drop: {data.dropPercentage}%
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        
                        <div className={styles.stats_summary}>
                            <CSVDownloader
                                datas={studentUserData}
                                columns={[
                                    { id: 'phoneNumber', displayName: 'Phone Number' },
                                    { id: 'city', displayName: 'City' },
                                    { id: 'userClickedLink', displayName: 'Clicked Link' },
                                    { id: 'freeDemoStarted', displayName: 'Demo Started' },
                                    { id: 'currentStage', displayName: 'Demo Type' },
                                    { id: 'freeDemoEnded', displayName: 'Demo Ended' },
                                    { id: 'userRegistrationComplete', displayName: 'Registration' },
                                    { id: 'schoolName', displayName: 'School' },
                                    { id: 'persona', displayName: 'Persona' }
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
                                            <th className={styles.table_heading}>Clicked Link</th>
                                            <th className={styles.table_heading}>Demo Started</th>
                                            <th className={styles.table_heading}>Demo Ended</th>
                                            <th className={styles.table_heading}>Registration</th>
                                            <th className={styles.table_heading}>School</th>
                                            <th className={styles.table_heading}>Persona</th>
                                            <th className={styles.table_heading}>Current Stage</th>
                                        </tr>
                                    </thead>
                                    <tbody className={styles.table_body}>
                                        {studentUserData.map((user, index) => (
                                            <tr key={index} className={`${styles.table_row} ${styles[user.sortingStage.toLowerCase().replace(' ', '_')]}`}>
                                                <td className={styles.normal_text}>{user.phoneNumber}</td>
                                                <td className={styles.normal_text}>{user.city}</td>
                                                <td className={styles.normal_text}>{user.userClickedLink}</td>
                                                <td className={styles.normal_text}>{user.freeDemoStarted}</td>
                                                <td className={styles.normal_text}>{user.freeDemoEnded}</td>
                                                <td className={styles.normal_text}>{user.userRegistrationComplete}</td>
                                                <td className={styles.normal_text}>{user.schoolName}</td>
                                                <td className={styles.normal_text}>{user.persona}</td>
                                                <td className={styles.normal_text}>{user.currentStage}</td>
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
