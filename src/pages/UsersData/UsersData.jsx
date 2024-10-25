import React, { useState, useEffect } from 'react';
import { Navbar, Sidebar } from "../../components";
import styles from './UsersData.module.css';
import { useSidebar } from '../../components/SidebarContext';
import CSVDownloader from 'react-csv-downloader';
import { getAllMetadata } from '../../helper/index';

const UsersData = () => {
    const { isSidebarOpen } = useSidebar();
    const [userData, setUserData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getAllMetadata();
                const formattedData = data.data.map(user => ({
                    ...user,
                    phoneNumber: user.phoneNumber ? `${user.phoneNumber}` : "",
                    freeDemoStarted: user.freeDemoStarted ? new Date(user.freeDemoStarted).toLocaleString().replace(",", "") : "",
                    freeDemoEnded: user.freeDemoEnded ? new Date(user.freeDemoEnded).toLocaleString().replace(",", "") : "",
                    userClickedLink: user.userClickedLink ? new Date(user.userClickedLink).toLocaleString().replace(",", "") : "",
                    userRegistrationComplete: user.userRegistrationComplete ? new Date(user.userRegistrationComplete).toLocaleString().replace(",", "") : ""
                }));
                console.log("formattedData", formattedData);
                setUserData(formattedData);
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };
        fetchData();
    }, []);

    return (
        <div className={styles.main_page}>
            <Navbar />
            {isSidebarOpen && <Sidebar />}
            <div className={styles.content}>
                <h1>Users Data</h1>
                <div className={styles.stats_summary}>
                    <CSVDownloader
                        datas={userData}
                        columns={[
                            { id: 'phoneNumber', displayName: 'Phone Number' },
                            { id: 'name', displayName: 'Name' },
                            { id: 'city', displayName: 'City' },
                            { id: 'scholarshipvalue', displayName: 'Scholarship Value' },
                            { id: 'targetGroup', displayName: 'Target Group' },
                            { id: 'freeDemoStarted', displayName: 'Free Demo Started' },
                            { id: 'freeDemoEnded', displayName: 'Free Demo Ended' },
                            { id: 'userClickedLink', displayName: 'User Clicked Link' },
                            { id: 'userRegistrationComplete', displayName: 'User Registration Complete' },
                        ]}
                        filename="users_data.csv"
                        className={styles.download_button}
                        text="Download CSV"
                    />
                </div>
                <div className={styles.table_container}>
                    <table className={styles.table}>
                        <thead className={styles.heading_row}>
                            <tr>
                                <th className={styles.table_heading}>Phone Number</th>
                                <th className={styles.table_heading}>Name</th>
                                <th className={styles.table_heading}>City</th>
                                <th className={styles.table_heading}>Scholarship Value</th>
                                <th className={styles.table_heading}>Target Group</th>
                                <th className={styles.table_heading}>Free Demo Started</th>
                                <th className={styles.table_heading}>Free Demo Ended</th>
                                <th className={styles.table_heading}>User Clicked Link</th>
                                <th className={styles.table_heading}>User Registration Complete</th>
                            </tr>
                        </thead>
                        <tbody className={styles.table_body}>
                            {userData.map((user, index) => (
                                <tr key={index}>
                                    <td>{user.phoneNumber || ""}</td>
                                    <td>{user.name || ""}</td>
                                    <td>{user.city || ""}</td>
                                    <td>{user.scholarshipvalue || ""}</td>
                                    <td>{user.targetGroup || ""}</td>
                                    <td>{user.freeDemoStarted || ""}</td>
                                    <td>{user.freeDemoEnded || ""}</td>
                                    <td>{user.userClickedLink || ""}</td>
                                    <td>{user.userRegistrationComplete || ""}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UsersData;
