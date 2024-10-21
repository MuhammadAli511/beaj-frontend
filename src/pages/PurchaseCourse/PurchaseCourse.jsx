import React, { useState, useEffect } from 'react';
import { Navbar, Sidebar } from "../../components";
import styles from './PurchaseCourse.module.css';
import { getAllMetadata } from "../../helper";
import { useSidebar } from '../../components/SidebarContext';

const PurchaseCourse = () => {
    const { isSidebarOpen } = useSidebar();
    const [phoneNumbers, setPhoneNumbers] = useState([]);
    const [selectedPhoneNumber, setSelectedPhoneNumber] = useState(null);
    const [loading, setLoading] = useState(false);

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


    return (
        <div className={styles.main_page}>
            <Navbar />
            {isSidebarOpen && <Sidebar />}
            <div className={styles.content}>
                <div className={styles.logs_container}>
                    <div className={styles.phone_list}>
                        <h3 className={styles.heading_color}>Users</h3>
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
                                <p>No users found</p>
                            )}
                        </ul>
                    </div>


                </div>
            </div>
        </div>
    );
};

export default PurchaseCourse;
