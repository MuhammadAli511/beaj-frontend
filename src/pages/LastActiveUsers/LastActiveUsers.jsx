import React, { useState, useEffect } from 'react';
import { Navbar, Sidebar } from "../../components";
import styles from './LastActiveUsers.module.css';
import { useSidebar } from '../../components/SidebarContext';
import { getLastActiveUsers } from '../../helper/index';
import Select from 'react-select';
import { TailSpin } from 'react-loader-spinner';

const LastActiveUsers = () => {
    const { isSidebarOpen } = useSidebar();
    const [userData, setUserData] = useState([]);
    const [days, setDays] = useState(5);
    const [cohorts, setCohorts] = useState(['All']);
    const [isLoading, setIsLoading] = useState(false);

    const daysOptions = Array.from({ length: 30 }, (_, i) => ({
        value: i + 1,
        label: `${i + 1} ${i + 1 === 1 ? 'day' : 'days'}`
    }));

    const cohortOptions = [
        { value: 'All', label: 'All' },
        { value: 'Pilot', label: 'Pilot' },
        ...Array.from({ length: 60 }, (_, i) => ({
            value: `Cohort ${i + 1}`,
            label: `Cohort ${i + 1}`
        }))
    ];
    
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const data = await getLastActiveUsers(days, cohorts);
                const sortedData = data.data.sort((a, b) => b.inactiveDays - a.inactiveDays);
                setUserData(sortedData);
            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [days, cohorts]);

    const handleDaysChange = (selectedOption) => {
        setDays(selectedOption.value);
    };

    const handleCohortsChange = (selectedOptions) => {
        if (selectedOptions.some(option => option.value === 'All')) {
            setCohorts(['All']);
        } else {
            setCohorts(selectedOptions.map(option => option.value));
        }
    };

    const downloadCSV = () => {
        if (userData.length === 0) return;
        
        // Define headers
        const headers = ['User ID', 'Phone Number', 'Name', 'Target Group', 'Cohort', 'Last Message Time', 'Inactive Days'];
        
        // Map data to CSV rows
        const dataRows = userData.map(user => [
            user.userId || '',
            user.profile_id || '',
            user.phoneNumber || '',
            user.name || '',
            user.targetGroup || '',
            user.cohort || '',
            user.lastMessageTimestamp || '',
            user.inactiveDays
        ]);
        
        // Combine headers and data
        const csvContent = [
            headers.join(','),
            ...dataRows.map(row => row.join(','))
        ].join('\n');
        
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `last_active_users_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className={styles.main_page}>
            <Navbar />
            {isSidebarOpen && <Sidebar />}
            <div className={styles.content}>
                <h1>Users' Last Activity</h1>
                <div className={styles.filters_container}>
                    <div className={styles.filter_group}>
                        <label className={styles.label}>Select Days</label>
                        <Select
                            className={styles.select}
                            options={daysOptions}
                            defaultValue={daysOptions.find(option => option.value === 5)}
                            onChange={handleDaysChange}
                            isSearchable={false}
                        />
                    </div>
                    <div className={styles.filter_group}>
                        <label className={styles.label}>Select Cohorts</label>
                        <Select
                            className={styles.select}
                            options={cohortOptions}
                            isMulti
                            defaultValue={[cohortOptions[0]]}
                            onChange={handleCohortsChange}
                            isSearchable={true}
                        />
                    </div>
                </div>
                <div className={styles.stats_container}>
                    <div className={styles.stat_box}>
                        <span className={styles.stat_label}>Total Users</span>
                        <span className={styles.stat_value}>{userData.length}</span>
                    </div>
                    <button 
                        className={styles.download_button}
                        onClick={downloadCSV}
                        disabled={userData.length === 0 || isLoading}
                    >
                        Download CSV
                    </button>
                </div>
                <div className={styles.table_container}>
                    {isLoading ? (
                        <div className={styles.loader_container}>
                            <TailSpin
                                height="80"
                                width="80"
                                color="#51BBCC"
                                ariaLabel="tail-spin-loading"
                                radius="1"
                                visible={true}
                            />
                        </div>
                    ) : (
                        <table className={styles.table}>
                            <thead className={styles.heading_row}>
                                <tr>
                                    <th className={styles.table_heading}>User ID</th>
                                    <th className={styles.table_heading}>Profile ID</th>
                                    <th className={styles.table_heading}>Phone Number</th>
                                    <th className={styles.table_heading}>Name</th>
                                    <th className={styles.table_heading}>Target Group</th>
                                    <th className={styles.table_heading}>Cohort</th>
                                    <th className={styles.table_heading}>Last Message Time</th>
                                    <th className={styles.table_heading}>Inactive Days</th>
                                </tr>
                            </thead>
                            <tbody className={styles.table_body}>
                                {userData.map((user, index) => (
                                    <tr key={index}>
                                        <td>{user.userId || ""}</td>
                                        <td>{user.profile_id || ""}</td>
                                        <td>{user.phoneNumber || ""}</td>
                                        <td>{user.name || ""}</td>
                                        <td>{user.targetGroup || ""}</td>
                                        <td>{user.cohort || ""}</td>
                                        <td>{user.lastMessageTimestamp || ""}</td>
                                        <td>{user.inactiveDays}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LastActiveUsers;
