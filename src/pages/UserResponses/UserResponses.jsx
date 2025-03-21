import React, { useState, useEffect } from 'react';
import { Navbar, Sidebar } from "../../components";
import styles from './UserResponses.module.css';
import { useSidebar } from '../../components/SidebarContext';
import { getQuestionResponsesByActivityType, getAllCourses } from '../../helper/index';
import { TailSpin } from 'react-loader-spinner';
import Select from 'react-select';

const UserResponses = () => {
    const { isSidebarOpen } = useSidebar();
    const [userResponses, setUserResponses] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [courses, setCourses] = useState({});
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);

    // Filters
    const [selectedWeek, setSelectedWeek] = useState(null);
    const [selectedDay, setSelectedDay] = useState(null);
    const [selectedActivityType, setSelectedActivityType] = useState(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const responsesPerPage = 15;

    // Initial data fetch
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Get courses data
                const coursesResponse = await getAllCourses();

                // Create course mapping
                const courseMap = {};
                coursesResponse.data.forEach(course => {
                    courseMap[course.CourseId] = course.CourseName;
                });
                setCourses(courseMap);

                // Set default activity type
                setSelectedActivityType(activityTypeOptions[0]);

            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // Fetch responses when activity type changes
    useEffect(() => {
        const fetchResponses = async () => {
            if (!selectedActivityType) return;

            setIsLoading(true);
            try {
                const responsesResponse = await getQuestionResponsesByActivityType(selectedActivityType.value);
                setUserResponses(responsesResponse.data);

                // Set default values if there are responses
                if (responsesResponse.data.length > 0) {
                    const firstResponse = responsesResponse.data[0];
                    setSelectedWeek({ value: firstResponse.weekNumber, label: `Week ${firstResponse.weekNumber}` });
                    setSelectedDay({ value: firstResponse.dayNumber, label: `Day ${firstResponse.dayNumber}` });
                    setSelectedCourse({ value: Number(firstResponse.courseId), label: courses[firstResponse.courseId] });
                }
            } catch (error) {
                console.error("Error fetching responses:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchResponses();
    }, [selectedActivityType, courses]);

    // Add this useEffect after other useEffects
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedWeek, selectedDay, selectedActivityType, selectedCourse]);

    // Format timestamp to a readable date
    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleString();
    };

    // Filter options
    const weekOptions = Array.from({ length: 4 }, (_, i) => ({
        value: i + 1,
        label: `Week ${i + 1}`
    }));

    const dayOptions = Array.from({ length: 6 }, (_, i) => ({
        value: i + 1,
        label: `Day ${i + 1}`
    }));

    const activityTypeOptions = [
        { value: 'conversationalAgencyBot', label: 'Conversational Agency Bot' },
        { value: 'conversationalQuestionsBot', label: 'Conversational Questions Bot' },
        { value: 'conversationalMonologueBot', label: 'Conversational Monologue Bot' },
        // { value: 'listenAndSpeak', label: 'Listen & Speak' },
        // { value: 'watchAndSpeak', label: 'Watch & Speak' },
        // { value: 'mcqs', label: 'MCQs' },
    ];

    // Exclude Courses
    const excludeCourses = ['Level 1 - Kids', 'Free Trial', 'FAST COURSE TESTING', 'Level 3 Testing'];

    // Add courseOptions
    const courseOptions = Object.entries(courses)
        .filter(([id, name]) => !excludeCourses.includes(name))
        .map(([id, name]) => ({
            value: Number(id),
            label: name
        }));

    // Filter the responses data
    const filteredResponses = userResponses.filter(response => {
        // Phone number or name search
        const searchMatch = (!searchQuery || 
            (response.phoneNumber && response.phoneNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (response.name && response.name.toLowerCase().includes(searchQuery.toLowerCase())));

        // Week filter
        const weekMatch = !selectedWeek || response.weekNumber === selectedWeek.value;

        // Day filter
        const dayMatch = !selectedDay || response.dayNumber === selectedDay.value;

        // Activity type filter
        const activityMatch = !selectedActivityType ||
            response.activityType === selectedActivityType.value;

        // Course filter - both values should now be numbers
        const courseMatch = !selectedCourse ||
            Number(response.courseId) === selectedCourse.value;

        return searchMatch && weekMatch && dayMatch && activityMatch && courseMatch;
    }).sort((a, b) => {
        // Sort by phone number first
        if (a.phoneNumber && b.phoneNumber) {
            const phoneComparison = a.phoneNumber.localeCompare(b.phoneNumber);
            if (phoneComparison !== 0) return phoneComparison;
        }

        // Then by week
        const weekComparison = a.weekNumber - b.weekNumber;
        if (weekComparison !== 0) return weekComparison;

        // Then by day
        const dayComparison = a.dayNumber - b.dayNumber;
        if (dayComparison !== 0) return dayComparison;

        // Finally by question number
        return a.questionNumber - b.questionNumber;
    });

    // Add helper function to determine if activity is monologue
    const isMonologueActivity = () => {
        return selectedActivityType?.value === 'conversationalMonologueBot';
    };

    // Get current responses
    const indexOfLastResponse = currentPage * responsesPerPage;
    const indexOfFirstResponse = indexOfLastResponse - responsesPerPage;
    const currentResponses = filteredResponses.slice(indexOfFirstResponse, indexOfLastResponse);

    // Calculate total pages
    const totalPages = Math.ceil(filteredResponses.length / responsesPerPage);

    // Add pagination controls component
    const Pagination = () => {
        // Generate array of page numbers to show
        const getPageNumbers = () => {
            const pageNumbers = [];
            const maxPagesToShow = 5; // Show up to 5 page numbers at a time

            let startPage = Math.max(1, currentPage - 2);
            let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

            // Adjust startPage if we're near the end
            if (totalPages - startPage < maxPagesToShow) {
                startPage = Math.max(1, totalPages - maxPagesToShow + 1);
            }

            for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i);
            }

            return pageNumbers;
        };

        return (
            <div className={styles.pagination}>
                {/* First page button */}
                <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className={styles.pagination_button}
                >
                    1
                </button>

                {/* Show ellipsis if there are earlier pages */}
                {getPageNumbers()[0] > 2 && <span>...</span>}

                {/* Page numbers */}
                {getPageNumbers().map(number => (
                    number !== 1 && number !== totalPages && (
                        <button
                            key={number}
                            onClick={() => setCurrentPage(number)}
                            className={`${styles.pagination_button} ${currentPage === number ? styles.active : ''}`}
                        >
                            {number}
                        </button>
                    )
                ))}

                {/* Show ellipsis if there are more pages */}
                {getPageNumbers()[getPageNumbers().length - 1] < totalPages - 1 && <span>...</span>}

                {/* Last page button */}
                {totalPages > 1 && (
                    <button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className={styles.pagination_button}
                    >
                        {totalPages}
                    </button>
                )}

                <span className={styles.page_info}>
                    ({filteredResponses.length} total responses)
                </span>
            </div>
        );
    };

    // Add this function to handle image click
    const handleImageClick = (imageUrl) => {
        setSelectedImage(imageUrl);
    };

    // Add this function to close the modal
    const handleCloseModal = () => {
        setSelectedImage(null);
    };

    return (
        <div className={styles.main_page}>
            <Navbar />
            {isSidebarOpen && <Sidebar />}
            <div className={styles.content}>
                <h1>User Responses</h1>

                {/* Search and Filters */}
                <div className={styles.filters_container}>
                    <div className={styles.filter_group}>
                        <label className={styles.filter_label}>Search number or name</label>
                        <input
                            type="text"
                            placeholder="Search by phone number or name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={styles.search_input}
                        />
                    </div>
                    <div className={styles.filter_group}>
                        <label className={styles.filter_label}>Week</label>
                        <Select
                            className={styles.select}
                            options={weekOptions}
                            value={selectedWeek}
                            onChange={setSelectedWeek}
                            isClearable
                            placeholder="Select Week"
                        />
                    </div>
                    <div className={styles.filter_group}>
                        <label className={styles.filter_label}>Day</label>
                        <Select
                            className={styles.select}
                            options={dayOptions}
                            value={selectedDay}
                            onChange={setSelectedDay}
                            isClearable
                            placeholder="Select Day"
                        />
                    </div>
                    <div className={styles.filter_group}>
                        <label className={styles.filter_label}>Activity Type</label>
                        <Select
                            className={styles.select}
                            options={activityTypeOptions}
                            value={selectedActivityType}
                            onChange={setSelectedActivityType}
                            isClearable={false}
                            placeholder="Select Activity Type"
                        />
                    </div>
                    <div className={styles.filter_group}>
                        <label className={styles.filter_label}>Course</label>
                        <Select
                            className={styles.select}
                            options={courseOptions}
                            value={selectedCourse}
                            onChange={setSelectedCourse}
                            isClearable
                            placeholder="Select Course"
                        />
                    </div>
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
                        <>
                            <table className={styles.table}>
                                <thead className={styles.heading_row}>
                                    <tr>
                                        <th className={styles.table_heading}>ID</th>
                                        <th className={styles.table_heading}>Phone</th>
                                        <th className={styles.table_heading}>Name</th>
                                        <th className={styles.table_heading}>Course Name</th>
                                        <th className={styles.table_heading}>Week</th>
                                        <th className={styles.table_heading}>Day</th>
                                        <th className={styles.table_heading}>Num</th>
                                        <th className={styles.table_heading}>Question</th>
                                        <th className={styles.table_heading}>User Audio</th>
                                        <th className={styles.table_heading}>User Transcript</th>
                                        <th className={styles.table_heading}>Bot Audio</th>
                                        {isMonologueActivity() && (
                                            <th className={styles.table_heading}>Bot Image</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className={styles.table_body}>
                                    {currentResponses.map((response, index) => (
                                        <tr key={response.id || index}>
                                            <td>{response.id || 'N/A'}</td>
                                            <td>{response.phoneNumber || 'N/A'}</td>
                                            <td>{response.name}</td>
                                            <td>{response.courseName}</td>
                                            <td>{response.weekNumber}</td>
                                            <td>{response.dayNumber}</td>
                                            <td>{response.questionNumber}</td>
                                            <td>
                                                {isMonologueActivity() ? (
                                                    <></>
                                                ) : response.mediaFile ? (
                                                    <audio src={response.mediaFile} controls />
                                                ) : (
                                                    response.question
                                                )}
                                            </td>
                                            <td>
                                                <audio src={response.submittedUserAudio} controls />
                                            </td>
                                            <td>{response.submittedAnswerText}</td>
                                            <td>
                                                <audio src={response.submittedFeedbackAudio} controls />
                                            </td>
                                            {isMonologueActivity() && (
                                                <td>
                                                    <div
                                                        className={styles.image_container}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleImageClick(response.submittedFeedbackText);
                                                        }}
                                                    >
                                                        <img
                                                            style={{ width: '250px', height: '250px', cursor: 'pointer' }}
                                                            src={response.submittedFeedbackText}
                                                            alt="Bot Image"
                                                        />
                                                        <div className={styles.image_overlay}>View</div>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <Pagination />
                        </>
                    )}
                </div>
            </div>
            {selectedImage && (
                <div
                    className={styles.modal}
                    onClick={(e) => {
                        e.stopPropagation();
                        handleCloseModal();
                    }}
                >
                    <div
                        className={styles.modal_content}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img src={selectedImage} alt="Enlarged Bot Image" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserResponses;
