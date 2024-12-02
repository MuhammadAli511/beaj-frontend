import React, { useState, useEffect } from 'react';
import { Navbar, Sidebar } from "../../components";
import styles from './PurchaseCourse.module.css';
import {
    getAllMetadata,
    getMetadataByPhoneNumber,
    assignTargetGroup,
    getAllCoursesByPhoneNumber,
    getPurchasedCoursesByPhoneNumber,
    getUnpurchasedCoursesByPhoneNumber,
    getCompletedCourses,
    purchaseCourse
} from "../../helper";
import { useSidebar } from '../../components/SidebarContext';
import { TailSpin } from 'react-loader-spinner';

const PurchaseCourse = () => {
    const { isSidebarOpen } = useSidebar();
    const [phoneNumbers, setPhoneNumbers] = useState([]);
    const [selectedPhoneNumber, setSelectedPhoneNumber] = useState(null);
    const [loadingUsers, setLoadingUsers] = useState(false); // User list loading state
    const [loadingUserDetails, setLoadingUserDetails] = useState(false); // User details loading state
    const [loadingCourses, setLoadingCourses] = useState(false);
    const [selectedUserData, setSelectedUserData] = useState(null); // State to hold the selected user's metadata
    const [error, setError] = useState(null); // State to handle any errors
    const [targetGroup, setTargetGroup] = useState('');
    const [courses, setCourses] = useState([]);
    const [activeTab, setActiveTab] = useState('all'); // Track the active tab
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch user list on component mount
    useEffect(() => {
        const fetchPhoneNumbers = async () => {
            setLoadingUsers(true);
            try {
                const response = await getAllMetadata();
                if (response.data && Array.isArray(response.data)) {
                    const filteredUsers = response.data.filter(user => user.name !== null);
                    setPhoneNumbers(filteredUsers);
                } else {
                    console.error("Expected an array in response.data, got:", response);
                }
            } catch (error) {
                console.error("Error fetching metadata:", error);
            } finally {
                setLoadingUsers(false);
            }
        };
        fetchPhoneNumbers();
    }, []);

    // Fetch courses when the active tab or selected user changes
    useEffect(() => {
        const fetchCourses = async () => {
            if (!selectedPhoneNumber) return; // Fetch only if a user is selected
            setLoadingCourses(true);
            setError(null);

            try {
                let response;
                switch (activeTab) {
                    case 'purchased':
                        response = await getPurchasedCoursesByPhoneNumber(selectedPhoneNumber); // Fetch purchased courses
                        break;
                    case 'unpurchased':
                        response = await getUnpurchasedCoursesByPhoneNumber(selectedPhoneNumber); // Fetch unpurchased courses
                        break;
                    case 'completed':
                        response = await getCompletedCourses(selectedPhoneNumber); // Fetch completed courses
                        break;
                    case 'all':
                    default:
                        response = await getAllCoursesByPhoneNumber(selectedPhoneNumber); // Fetch all courses
                        break;
                }

                if (response.data) {
                    setCourses(response.data); // Set the courses data
                } else {
                    setError('No courses found');
                }
            } catch (error) {
                console.error("Error fetching courses:", error);
                setError('Failed to fetch courses.');
            } finally {
                setLoadingCourses(false);
            }
        };

        fetchCourses();
    }, [activeTab, selectedPhoneNumber]); // Re-fetch courses when tab or selected user changes

    const handleUserClick = async (phoneNumber) => {
        setSelectedPhoneNumber(phoneNumber);
        setLoadingUserDetails(true);
        setError(null); // Reset error state
        setSelectedUserData(null); // Clear previous data

        try {
            const response = await getMetadataByPhoneNumber(phoneNumber);
            if (response.data) {
                setSelectedUserData(response.data); // Update state with fetched metadata
                setTargetGroup(response.data.targetGroup || ''); // Set target group if available
            } else {
                setSelectedUserData(null);
                setError("No user data found for this phone number");
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
            setError("Failed to fetch user details");
        } finally {
            setLoadingUserDetails(false);
        }
    };

    // Handle assigning a target group
    const handleAssignTargetGroup = async () => {
        if (!targetGroup) {
            alert('Please select a target group.');
            return;
        }

        try {
            const response = await assignTargetGroup(selectedPhoneNumber, targetGroup);

            if (response.status === 200) {
                alert('Target group assigned successfully.');
                // Re-fetch the user data to reflect the updated target group
                const updatedUserResponse = await getMetadataByPhoneNumber(selectedPhoneNumber);
                if (updatedUserResponse.status === 200) {
                    setSelectedUserData(updatedUserResponse.data);
                } else {
                    alert('Failed to refresh user data.');
                }
            } else {
                alert('Failed to assign target group.');
            }
        } catch (error) {
            console.error("Error assigning target group:", error);
            alert('An error occurred while assigning target group.');
        }
    };

    // Handle course purchase
    const handlePurchase = async (courseId) => {
        setLoadingCourses(true);
        setError(null);

        try {
            const response = await purchaseCourse(selectedPhoneNumber, courseId); // Call the API to purchase the course
            if (response.status === 200) {
                alert('Course purchased successfully!');
                // Optionally refetch unpurchased courses to update the list
                const updatedCourses = await getUnpurchasedCoursesByPhoneNumber(selectedPhoneNumber);
                setCourses(updatedCourses.data);
            } else {
                alert('Failed to purchase course');
            }
        } catch (error) {
            console.error("Error purchasing course:", error);
            setError('Failed to purchase course.');
        } finally {
            setLoadingCourses(false);
        }
    };

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
                        <h3 className={styles.heading_color}>Users</h3>
                        <input
                            type="text"
                            placeholder="Search by name or phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={styles.search_input}
                        />
                        {loadingUsers ? (
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
                                            onClick={() => handleUserClick(user.phoneNumber)}
                                        >
                                            {user.name || user.phoneNumber}
                                        </li>
                                    ))
                                ) : (
                                    <p>No users found</p>
                                )}
                            </ul>
                        )}
                    </div>
                    <div className={styles.person_details_section}>
                        <div className={styles.person_container}>
                            {loadingUserDetails ? (
                                <div className={styles.loader}>
                                    <TailSpin color="#51bbcc" height={50} width={50} />
                                </div>
                            ) : error ? (
                                <p className={styles.error_message}>{error}</p>
                            ) : selectedUserData ? (
                                <div>
                                    <h1>{selectedUserData.name ? selectedUserData.name : "N/A"}</h1>
                                    <h2 className={styles.personal_details_heading}>Personal Details</h2>
                                    <p><strong>Name: </strong> {selectedUserData.name ? selectedUserData.name : "N/A"}</p>
                                    <p><strong>Phone Number: </strong> {selectedUserData.phoneNumber}</p>
                                    <p><strong>City, District: </strong> {selectedUserData.city ? selectedUserData.city : "N/A"}</p>

                                    <h2 className={styles.personal_details_heading}>Target Group</h2>
                                    {selectedUserData.targetGroup ? (
                                        <div>
                                            <p><strong>Assigned Target Group: </strong> {selectedUserData.targetGroup}</p>
                                            {selectedUserData.targetGroup === 'Control' ? (
                                                <div className={styles.target_group_section}>
                                                    <p>You can change the target group because it is set to "Control".</p>
                                                    <select
                                                        value={targetGroup}
                                                        onChange={(e) => setTargetGroup(e.target.value)}
                                                    >
                                                        <option value="">Select Target Group</option>
                                                        <option value="T1">T1</option>
                                                        <option value="T2">T2</option>
                                                    </select>
                                                    <button onClick={handleAssignTargetGroup}>
                                                        Assign Target Group
                                                    </button>
                                                </div>
                                            ) : (
                                                <p>You cannot change the target group because it is set to "{selectedUserData.targetGroup}".</p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className={styles.target_group_section}>
                                            <p>No target group assigned.</p>
                                            <select
                                                value={targetGroup}
                                                onChange={(e) => setTargetGroup(e.target.value)}
                                            >
                                                <option value="">Select Target Group</option>
                                                <option value="T1">T1</option>
                                                <option value="T2">T2</option>
                                                <option value="Control">Control</option>
                                            </select>
                                            <button onClick={handleAssignTargetGroup}>
                                                Assign Target Group
                                            </button>
                                        </div>
                                    )}

                                    {/* Tabs for Course Management */}
                                    <div className={styles.tabs}>
                                        <button
                                            className={activeTab === 'all' ? styles.active_tab : ''}
                                            onClick={() => setActiveTab('all')}
                                        >
                                            All Courses
                                        </button>
                                        <button
                                            className={activeTab === 'purchased' ? styles.active_tab : ''}
                                            onClick={() => setActiveTab('purchased')}
                                        >
                                            Purchased
                                        </button>
                                        <button
                                            className={activeTab === 'unpurchased' ? styles.active_tab : ''}
                                            onClick={() => setActiveTab('unpurchased')}
                                        >
                                            Unpurchased
                                        </button>
                                        <button
                                            className={activeTab === 'completed' ? styles.active_tab : ''}
                                            onClick={() => setActiveTab('completed')}
                                        >
                                            Completed
                                        </button>
                                    </div>

                                    {/* Course Listing */}
                                    <div className={styles.course_list}>
                                        {loadingCourses ? (
                                            <div className={styles.loader}>
                                                <TailSpin color="#51bbcc" height={50} width={50} />
                                            </div>
                                        ) : error ? (
                                            <p>{error}</p>
                                        ) : courses.length > 0 ? (
                                            courses.map((course) => (
                                                <div key={course.CourseId} className={styles.course_item}>
                                                    <h3>{course.CourseName}</h3>
                                                    <p>Status: {course.user_status}</p>
                                                    {activeTab === 'unpurchased' && (
                                                        <button
                                                            className={styles.purchase_button}
                                                            onClick={() => handlePurchase(course.CourseId)}
                                                        >
                                                            Purchase Course
                                                        </button>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <p>No courses found</p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <p>Select a user to see details</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PurchaseCourse;
