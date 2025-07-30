import React, { useState, useEffect } from 'react';
import styles from './UserResponses.module.css';
import { getAllFeedback, getAllCourses } from '../../helper/index';
import { TailSpin } from 'react-loader-spinner';
import Select from 'react-select';

const UserFeedbackTab = () => {
    const [userFeedback, setUserFeedback] = useState([]);
    const [courses, setCourses] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Filters
    const [selectedWeek, setSelectedWeek] = useState(null);
    const [selectedDay, setSelectedDay] = useState(null);
    const [selectedActivityType, setSelectedActivityType] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [feedbackResponse, coursesResponse] = await Promise.all([
                    getAllFeedback(),
                    getAllCourses()
                ]);

                const courseMap = {};
                coursesResponse.data.forEach(course => {
                    courseMap[course.CourseId] = course.CourseName;
                });
                setCourses(courseMap);

                // Sort feedback by timestamp in descending order
                const sortedFeedback = feedbackResponse.data.sort((a, b) => 
                    new Date(b.timestamp) - new Date(a.timestamp)
                );
                setUserFeedback(sortedFeedback);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

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
        { value: 'video', label: 'Watch' },
        { value: 'videoEnd', label: 'Watch End' },
        { value: 'listenAndSpeak', label: 'Listen & Speak' },
        { value: 'watchAndSpeak', label: 'Watch & Speak' },
        { value: 'watchAndAudio', label: 'Watch & Audio' },
        { value: 'watchAndImage', label: 'Watch & Image' },
        { value: 'mcqs', label: 'MCQs' },
        { value: 'conversationalQuestionsBot', label: 'Conversational Questions Bot' },
        { value: 'conversationalMonologueBot', label: 'Conversational Monologue Bot' },
        { value: 'conversationalAgencyBot', label: 'Conversational Agency Bot' },
        { value: 'speakingPractice', label: 'Speaking Practice' },
    ];

    // Filter the feedback data
    const filteredFeedback = userFeedback.filter(feedback => {
        // Phone number search
        const phoneNumberMatch = feedback.phoneNumber.toLowerCase()
            .includes(searchQuery.toLowerCase());

        // Week filter
        const weekMatch = !selectedWeek || feedback.weekNumber === selectedWeek.value;

        // Day filter
        const dayMatch = !selectedDay || feedback.dayNumber === selectedDay.value;

        // Activity type filter
        const activityMatch = !selectedActivityType || 
            feedback.activityType === selectedActivityType.value;

        return phoneNumberMatch && weekMatch && dayMatch && activityMatch;
    });

    return (
        <>
            {/* Search and Filters */}
            <div className={styles.filters_container}>
                <div className={styles.filter_group}>
                    <label className={styles.filter_label}>Search Phone Number</label>
                    <input
                        type="text"
                        placeholder="Search by phone number..."
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
                        isClearable
                        placeholder="Select Activity Type"
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
                    <table className={styles.table}>
                        <thead className={styles.heading_row}>
                            <tr>
                                <th className={styles.table_heading}>ID</th>
                                <th className={styles.table_heading}>Profile ID</th>
                                <th className={styles.table_heading}>Phone Number</th>
                                <th className={styles.table_heading}>Feedback</th>
                                <th className={styles.table_heading}>Course</th>
                                <th className={styles.table_heading}>Lesson ID</th>
                                <th className={styles.table_heading}>Week</th>
                                <th className={styles.table_heading}>Day</th>
                                <th className={styles.table_heading}>Activity Type</th>
                                <th className={styles.table_heading}>Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className={styles.table_body}>
                            {filteredFeedback.map((feedback) => (
                                <tr key={feedback.id}>
                                    <td>{feedback.id}</td>
                                    <td>{feedback.profile_id}</td>
                                    <td>{feedback.phoneNumber}</td>
                                    <td>{feedback.feedbackContent}</td>
                                    <td>{courses[feedback.courseId] || feedback.courseId}</td>
                                    <td>{feedback.lessonId}</td>
                                    <td>{feedback.weekNumber}</td>
                                    <td>{feedback.dayNumber}</td>
                                    <td>{feedback.activityType}</td>
                                    <td>{formatDate(feedback.timestamp)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </>
    );
};

export default UserFeedbackTab;