import React, { useState, useEffect } from 'react';
import styles from './ManageLesson.module.css';
import { getAllCategories, getCoursesByCategoryId, getLessonsByCourse, migrateLesson, clearCache, getLessonById } from '../../../../helper';
import { filterAndSortCourses, filterCategoriesByRole } from '../../../../constants/courseFilters';
import { secureStorage } from '../../../../utils/xssProtection';

import WatchLesson from './LessonTypes/WatchLesson';
import ReadLesson from './LessonTypes/ReadLesson';
import SpeakLesson from './LessonTypes/SpeakLesson';
import MCQsLesson from './LessonTypes/MCQsLesson';
import MCQsQuestionModal from './LessonTypes/MCQsQuestionModal';
import SpeakQuestionModal from './LessonTypes/SpeakQuestionModal';
import MigrateLessonModal from '../../../../components/MigrateLessonModal/MigrateLessonModal';

const allLessonTypes = [
    'All', 'Watch', 'Watch End', 'Read', 'Listen & Speak', 'Watch & Speak', 'Watch & Audio', 'Watch & Image',
    'MCQs', 'Conversational Questions Bot', 'Conversational Monologue Bot', 'Conversational Agency Bot', 'Speaking Practice',
    'Feedback MCQs', 'Feedback Audio', 'Assessment MCQs', 'Assessment Watch & Speak'
];

const SelectField = ({ label, options, onChange, value, name, id }) => (
    <div className={styles.form_group}>
        <label className={styles.label} htmlFor={id}>{label}</label>
        <select className={styles.input_field} onChange={onChange} value={value} name={name} id={id}>
            {options.map(option => (
                <option className={styles.select_option} key={option.value} value={option.value}>{option.label}</option>
            ))}
        </select>
    </div>
);

const ManageLesson = () => {
    const [categories, setCategories] = useState([]);
    const [courses, setCourses] = useState([]);
    const [category, setCategory] = useState('');
    const [course, setCourse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('All');
    const [lessons, setLessons] = useState([]);
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [isMigrateLessonModalOpen, setIsMigrateLessonModalOpen] = useState(false);
    const [isDuplicateLessonModalOpen, setIsDuplicateLessonModalOpen] = useState(false);
    const [isMCQModalOpen, setIsMCQModalOpen] = useState(false);
    const [isSpeakQuestionModalOpen, setIsSpeakQuestionModalOpen] = useState(false);
    const [fullLessonData, setFullLessonData] = useState(null);
    const [isLoadingModal, setIsLoadingModal] = useState(false);
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const isDevEnvironment = process.env.REACT_APP_ENVIRONMENT === "DEV";
    const [weeks, setWeeks] = useState([]);
    const [days, setDays] = useState([]);
    const [selectedWeek, setSelectedWeek] = useState('all');
    const [selectedDay, setSelectedDay] = useState('all');

    // Get user role from secure storage
    const userRole = secureStorage.getItem('role');

    // Filter lesson types based on role
    const getLessonTypes = () => {
        if (userRole === 'kid-lesson-creator' || userRole === 'teacher-lesson-creator') {
            return ['All']; // Only show 'All' tab for these roles
        }
        return allLessonTypes; // Show all tabs for other roles
    };

    useEffect(() => {
        const fetchCategoriesAndDefaultCourses = async () => {
            setIsLoading(true);
            try {
                const categoriesResponse = await getAllCategories();
                if (categoriesResponse.status === 200) {
                    // Filter categories based on user role
                    const filteredCategories = filterCategoriesByRole(categoriesResponse.data);
                    setCategories(filteredCategories);
                    if (filteredCategories.length > 0) {
                        const firstCategoryId = filteredCategories[0].CourseCategoryId;
                        setCategory(firstCategoryId);
                        const coursesResponse = await getCoursesByCategoryId(firstCategoryId);
                        if (coursesResponse.status === 200) {
                            const filteredAndSortedCourses = filterAndSortCourses(coursesResponse.data);
                            setCourses(filteredAndSortedCourses);
                            if (filteredAndSortedCourses.length > 0) {
                                const firstCourseId = filteredAndSortedCourses[0].CourseId;
                                setCourse(firstCourseId);
                            }
                        } else {
                            alert(coursesResponse.data.message);
                        }
                    }
                } else {
                    alert(categoriesResponse.data.message);
                }
            } catch (error) {
                alert(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCategoriesAndDefaultCourses();
    }, [userRole]);

    const handleCategoryChange = async (e) => {
        try {
            setIsLoading(true);
            const selectedCategory = e.target.value;
            setCategory(selectedCategory);
            const coursesResponse = await getCoursesByCategoryId(selectedCategory);
            if (coursesResponse.status === 200) {
                const filteredAndSortedCourses = filterAndSortCourses(coursesResponse.data);
                setCourses(filteredAndSortedCourses);
                if (filteredAndSortedCourses.length > 0) {
                    const firstCourseId = filteredAndSortedCourses[0].CourseId;
                    setCourse(firstCourseId);
                }
            } else {
                alert(coursesResponse.data.message);
            }
        } catch (error) {
            alert(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCourseChange = (e) => {
        setCourse(e.target.value);
    };

    const generateWeeks = (lessons) => {
        const uniqueWeeks = [...new Set(lessons.map(lesson => lesson.weekNumber))];
        return uniqueWeeks.sort((a, b) => a - b);
    };

    const generateDays = (lessons, weekNumber) => {
        const weekLessons = lessons.filter(lesson => lesson.weekNumber === parseInt(weekNumber));
        const uniqueDays = [...new Set(weekLessons.map(lesson => lesson.dayNumber))];
        return uniqueDays.sort((a, b) => a - b);
    };

    const fetchLessons = async (activityType) => {
        setIsLoading(true);
        try {
            const lessonsResponse = await getLessonsByCourse(course, activityType);
            if (lessonsResponse.status === 200) {
                const sortedLessons = lessonsResponse.data.sort((a, b) => {
                    if (a.weekNumber !== b.weekNumber) {
                        return a.weekNumber - b.weekNumber;
                    }
                    if (a.dayNumber !== b.dayNumber) {
                        return a.dayNumber - b.dayNumber;
                    }
                    return a.SequenceNumber - b.SequenceNumber;
                });

                setLessons(sortedLessons);
                const weekNumbers = generateWeeks(sortedLessons);
                setWeeks(weekNumbers);
                setSelectedWeek('all');
                setSelectedDay('all');
            } else {
                alert(lessonsResponse.data.message);
            }
        } catch (error) {
            alert(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (course) {
            fetchLessons(activeTab === 'All' ? '' : activeTab.toLowerCase());
        }
    }, [course, activeTab]);

    const openMigrateLessonModal = (lesson) => {
        setSelectedLesson(lesson);
        setIsMigrateLessonModalOpen(true);
    };

    const closeMigrateLessonModal = () => {
        setSelectedLesson(null);
        setIsMigrateLessonModalOpen(false);
    };

    const openDuplicateLessonModal = (lesson) => {
        setSelectedLesson(lesson);
        setIsDuplicateLessonModalOpen(true);
    };

    const closeDuplicateLessonModal = () => {
        setSelectedLesson(null);
        setIsDuplicateLessonModalOpen(false);
    };

    const openMCQModal = async (lesson) => {
        setIsLoadingModal(true);
        setSelectedLesson(lesson);
        try {
            const lessonResponse = await getLessonById(lesson.LessonId);
            if (lessonResponse.status === 200) {
                setFullLessonData(lessonResponse.data);
                setIsMCQModalOpen(true);
            } else {
                alert(lessonResponse.data.message);
            }
        } catch (error) {
            alert('Error loading lesson details: ' + error);
        } finally {
            setIsLoadingModal(false);
        }
    };

    const closeMCQModal = () => {
        setSelectedLesson(null);
        setFullLessonData(null);
        setIsMCQModalOpen(false);
    };

    const openSpeakQuestionModal = async (lesson) => {
        setIsLoadingModal(true);
        setSelectedLesson(lesson);
        try {
            const lessonResponse = await getLessonById(lesson.LessonId);
            if (lessonResponse.status === 200) {
                setFullLessonData(lessonResponse.data);
                setIsSpeakQuestionModalOpen(true);
            } else {
                alert(lessonResponse.data.message);
            }
        } catch (error) {
            alert('Error loading lesson details: ' + error);
        } finally {
            setIsLoadingModal(false);
        }
    };

    const closeSpeakQuestionModal = () => {
        setSelectedLesson(null);
        setFullLessonData(null);
        setIsSpeakQuestionModalOpen(false);
    };

    const openVideoModal = async (lesson) => {
        setIsLoadingModal(true);
        setSelectedLesson(lesson);
        try {
            const lessonResponse = await getLessonById(lesson.LessonId);
            if (lessonResponse.status === 200) {
                const fullData = lessonResponse.data;
                if (fullData.documentFiles && fullData.documentFiles[0]) {
                    setSelectedVideo(fullData.documentFiles[0]);
                    setIsVideoModalOpen(true);
                } else {
                    alert('No video found for this lesson.');
                }
            } else {
                alert(lessonResponse.data.message);
            }
        } catch (error) {
            alert('Error loading video: ' + error);
        } finally {
            setIsLoadingModal(false);
        }
    };

    const closeVideoModal = () => {
        setSelectedLesson(null);
        setSelectedVideo(null);
        setIsVideoModalOpen(false);
    };

    const handleMigrateLesson = async (lesson, selectedCourseId) => {
        try {
            const migrateResponse = await migrateLesson(lesson.LessonId, selectedCourseId);
            if (migrateResponse.status !== 200) {
                alert(migrateResponse.data.message);
            } else {
                alert("Lesson migrated successfully.");
                fetchLessons(activeTab === 'All' ? '' : activeTab.toLowerCase());
            }
        } catch (error) {
            alert(error);
        }
        closeMigrateLessonModal();
    };

    const handleDuplicateLesson = async (lesson, selectedCourseId) => {
        try {
            const duplicateResponse = await migrateLesson(lesson.LessonId, selectedCourseId);
            if (duplicateResponse.status !== 200) {
                alert(duplicateResponse.data.message);
            } else {
                alert("Lesson duplicated successfully.");
                fetchLessons(activeTab === 'All' ? '' : activeTab.toLowerCase());
            }
        } catch (error) {
            alert(error);
        }
        closeDuplicateLessonModal();
    };

    const handleWeekChange = (e) => {
        const weekNumber = e.target.value;
        setSelectedWeek(weekNumber);
        setSelectedDay('all');

        if (weekNumber === 'all') {
            // Get all unique days across all weeks
            const allDays = [...new Set(lessons.map(lesson => lesson.dayNumber))];
            setDays(allDays.sort((a, b) => a - b));
        } else {
            // Get days for specific week
            const dayNumbers = generateDays(lessons, weekNumber);
            setDays(dayNumbers);
        }
    };

    const handleDayChange = (e) => {
        setSelectedDay(e.target.value);
    };

    const handleClearCache = async () => {
        try {
            setIsLoading(true);
            const response = await clearCache();
            if (response.status === 200) {
                alert("Cache cleared successfully!");
            } else {
                alert(`Error clearing cache: ${response.data.message || 'Unknown error'}`);
            }
        } catch (error) {
            alert(`Error clearing cache: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const getFilteredLessons = () => {
        let filtered = [...lessons];

        if (selectedWeek !== 'all') {
            filtered = filtered.filter(lesson => lesson.weekNumber === parseInt(selectedWeek));
        }

        if (selectedDay !== 'all') {
            filtered = filtered.filter(lesson => lesson.dayNumber === parseInt(selectedDay));
        }

        return filtered;
    };

    const renderLessonContent = () => {
        switch (activeTab) {
            case 'All':
                return (
                    <div>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th className={styles.table_heading}>Lesson Id</th>
                                    <th className={styles.table_heading}>Week</th>
                                    <th className={styles.table_heading}>Day</th>
                                    <th className={styles.table_heading}>Sequence Number</th>
                                    <th className={styles.table_heading}>Activity</th>
                                    <th className={styles.table_heading}>Activity Alias</th>
                                    <th className={styles.table_heading}>Content</th>
                                    <th className={styles.table_heading}>Status</th>
                                    <th className={styles.table_heading}>Duplicate</th>
                                    {isDevEnvironment && <th className={styles.table_heading}>Migrate</th>}

                                </tr>
                            </thead>
                            <tbody className={styles.table_body}>
                                {getFilteredLessons().map(lesson => (
                                    <tr key={lesson.LessonId}>
                                        <td>{lesson.LessonId}</td>
                                        <td>{lesson.weekNumber}</td>
                                        <td>{lesson.dayNumber}</td>
                                        <td>{lesson.SequenceNumber}</td>
                                        <td>{lesson.activity}</td>
                                        <td>{lesson.activityAlias}</td>
                                        <td style={{ width: "15%" }}>
                                            {/* Activity-specific content display */}
                                            {(lesson.activity === 'video' || lesson.activity === 'videoEnd') && (
                                                <button
                                                    className={styles.submit_button}
                                                    onClick={() => openVideoModal(lesson)}
                                                    disabled={isLoadingModal}
                                                >
                                                    {isLoadingModal && selectedLesson?.LessonId === lesson.LessonId ? 'Loading...' : 'Show Video'}
                                                </button>
                                            )}
                                            {(lesson.activity === 'mcqs' || lesson.activity === 'feedbackMcqs' || lesson.activity === 'assessmentMcqs') && (
                                                <button
                                                    className={styles.submit_button}
                                                    onClick={() => openMCQModal(lesson)}
                                                    disabled={isLoadingModal}
                                                >
                                                    {isLoadingModal && selectedLesson?.LessonId === lesson.LessonId ? 'Loading...' : 'Show Questions'}
                                                </button>
                                            )}
                                            {(lesson.activity === 'listenAndSpeak' || lesson.activity === 'watchAndSpeak' || 
                                              lesson.activity === 'watchAndAudio' || lesson.activity === 'watchAndImage' ||
                                              lesson.activity === 'conversationalQuestionsBot' || lesson.activity === 'conversationalMonologueBot' ||
                                              lesson.activity === 'conversationalAgencyBot' || lesson.activity === 'speakingPractice' ||
                                              lesson.activity === 'feedbackAudio' || lesson.activity === 'assessmentWatchAndSpeak') && (
                                                <button
                                                    className={styles.submit_button}
                                                    onClick={() => openSpeakQuestionModal(lesson)}
                                                    disabled={isLoadingModal}
                                                >
                                                    {isLoadingModal && selectedLesson?.LessonId === lesson.LessonId ? 'Loading...' : 'Show Questions'}
                                                </button>
                                            )}
                                            {lesson.activity === 'read' && (
                                                <span style={{ color: '#666', fontStyle: 'italic' }}>Text Content</span>
                                            )}
                                            {!['video', 'videoEnd', 'mcqs', 'feedbackMcqs', 'assessmentMcqs', 'listenAndSpeak', 'watchAndSpeak', 
                                               'watchAndAudio', 'watchAndImage', 'conversationalQuestionsBot', 'conversationalMonologueBot',
                                               'conversationalAgencyBot', 'speakingPractice', 'feedbackAudio', 'assessmentWatchAndSpeak', 'read'].includes(lesson.activity) && (
                                                <span style={{ color: '#999' }}>-</span>
                                            )}
                                        </td>
                                        <td style={{ width: "10%" }}>
                                            <span className={lesson.status === "Active" ? styles.active : styles.inactive}>
                                                {lesson.status || "Not Available"}
                                            </span>
                                        </td>
                                        <td style={{ width: "10%" }}>
                                            <button
                                                className={styles.migrate_button}
                                                onClick={() => openDuplicateLessonModal(lesson)}
                                            >
                                                Duplicate
                                            </button>
                                        </td>
                                        {isDevEnvironment && (
                                            <td style={{ width: "10%" }}>
                                                <button
                                                    className={styles.migrate_button}
                                                    onClick={() => openMigrateLessonModal(lesson)}
                                                >
                                                    Migrate
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            case 'Watch':
                return <WatchLesson category={category} course={course} activity='video' />;
            case 'Watch End':
                return <WatchLesson category={category} course={course} activity='videoEnd' />;
            case 'Read':
                return <ReadLesson category={category} course={course} />;
            case 'Listen & Speak':
                return <SpeakLesson category={category} course={course} activity='listenAndSpeak' />;
            case 'Watch & Speak':
                return <SpeakLesson category={category} course={course} activity='watchAndSpeak' />;
            case 'Watch & Audio':
                return <SpeakLesson category={category} course={course} activity='watchAndAudio' />;
            case 'Watch & Image':
                return <SpeakLesson category={category} course={course} activity='watchAndImage' />;
            case 'MCQs':
                return <MCQsLesson category={category} course={course} activity='mcqs' />;
            case 'Conversational Questions Bot':
                return <SpeakLesson category={category} course={course} activity='conversationalQuestionsBot' />;
            case 'Conversational Monologue Bot':
                return <SpeakLesson category={category} course={course} activity='conversationalMonologueBot' />;
            case 'Conversational Agency Bot':
                return <SpeakLesson category={category} course={course} activity='conversationalAgencyBot' />;
            case 'Speaking Practice':
                return <SpeakLesson category={category} course={course} activity='speakingPractice' />;
            case 'Feedback MCQs':
                return <MCQsLesson category={category} course={course} activity='feedbackMcqs' />;
            case 'Feedback Audio':
                return <SpeakLesson category={category} course={course} activity='feedbackAudio' />;
            case 'Assessment MCQs':
                return <MCQsLesson category={category} course={course} activity='assessmentMcqs' />;
            case 'Assessment Watch & Speak':
                return <SpeakLesson category={category} course={course} activity='assessmentWatchAndSpeak' />;
            default:
                return null;
        }
    };

    return (
        <div className={styles.content}>
            <div className={styles.input_row}>
                <SelectField
                    label="Select Category"
                    options={categories
                        .map(category => ({
                            value: category.CourseCategoryId,
                            label: category.CourseCategoryName
                        }))}
                    onChange={handleCategoryChange}
                    value={category}
                    name="category"
                    id="category"
                />
                <SelectField
                    label="Select Course"
                    options={courses
                        .map(course => ({
                            value: course.CourseId,
                            label: course.CourseName
                        }))}
                    onChange={handleCourseChange}
                    value={course}
                    name="course"
                    id="course"
                />
            </div>
            {activeTab === 'All' && (
                <div className={styles.input_row}>
                    <SelectField
                        label="Select Week"
                        options={[
                            { value: 'all', label: 'All Weeks' },
                            ...weeks.map(week => ({
                                value: week,
                                label: `Week ${week}`
                            }))
                        ]}
                        onChange={handleWeekChange}
                        value={selectedWeek}
                        name="week"
                        id="week"
                    />
                    <SelectField
                        label="Select Day"
                        options={[
                            { value: 'all', label: 'All Days' },
                            ...days.map(day => ({
                                value: day,
                                label: `Day ${day}`
                            }))
                        ]}
                        onChange={handleDayChange}
                        value={selectedDay}
                        name="day"
                        id="day"
                    />
                </div>
            )}
            <div className={styles.clear_cache_section}>
                <button
                    className={styles.clear_cache_button}
                    onClick={handleClearCache}
                    disabled={isLoading}
                >
                    {isLoading ? 'Clearing...' : 'Clear Cache'}
                </button>
            </div>
            <div className={styles.tabs}>
                {getLessonTypes().map((type) => (
                    <button
                        key={type}
                        className={activeTab === type ? styles.active : ''}
                        onClick={() => setActiveTab(type)}
                    >
                        {type}
                    </button>
                ))}
            </div>
            {!isLoading && renderLessonContent()}
            <MigrateLessonModal
                isOpen={isMigrateLessonModalOpen}
                onClose={closeMigrateLessonModal}
                lesson={selectedLesson}
                onMigrate={handleMigrateLesson}
            />
            <MigrateLessonModal
                isOpen={isDuplicateLessonModalOpen}
                onClose={closeDuplicateLessonModal}
                lesson={selectedLesson}
                onMigrate={handleDuplicateLesson}
                modalTitle="Duplicate Lesson"
                buttonText="Duplicate"
            />
            {isMCQModalOpen && selectedLesson && fullLessonData && (
                <MCQsQuestionModal
                    lesson={fullLessonData}
                    onClose={closeMCQModal}
                    activity={selectedLesson.activity}
                />
            )}
            {isSpeakQuestionModalOpen && selectedLesson && fullLessonData && (
                <SpeakQuestionModal
                    lesson={fullLessonData}
                    onClose={closeSpeakQuestionModal}
                    activity={selectedLesson.activity}
                />
            )}
            {isVideoModalOpen && selectedVideo && selectedLesson && (
                <div className={styles.video_modal_overlay} onClick={closeVideoModal}>
                    <div className={styles.video_modal_content} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.video_modal_header}>
                            <h3 className={styles.video_modal_title}>Lesson {selectedLesson.LessonId} - {selectedLesson.activity}</h3>
                            <button className={styles.video_close_button} onClick={closeVideoModal}>
                                Close
                            </button>
                        </div>
                        <video controls className={styles.modal_video} autoPlay>
                            <source src={selectedVideo.video} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageLesson;
