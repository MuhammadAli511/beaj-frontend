import React, { useState, useEffect } from 'react';
import styles from './ManageLesson.module.css';
import { getAllCategories, getCoursesByCategoryId, getLessonsByCourse, migrateLesson } from '../../../../helper';

import WatchLesson from './LessonTypes/WatchLesson';
import ReadLesson from './LessonTypes/ReadLesson';
import SpeakLesson from './LessonTypes/SpeakLesson';
import MCQsLesson from './LessonTypes/MCQsLesson';
import MigrateLessonModal from '../../../../components/MigrateLessonModal/MigrateLessonModal';

const lessonTypes = [
    'All', 'Watch', 'Watch End', 'Read', 'Listen & Speak', 'Watch & Speak', 'Watch & Audio', 'Watch & Image',
    'MCQs', 'Conversational Questions Bot', 'Conversational Monologue Bot', 'Conversational Agency Bot', 'Speaking Practice'
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
    const isDevEnvironment = process.env.REACT_APP_ENVIRONMENT == "DEV";
    const [weeks, setWeeks] = useState([]);
    const [days, setDays] = useState([]);
    const [selectedWeek, setSelectedWeek] = useState('all');
    const [selectedDay, setSelectedDay] = useState('all');

    useEffect(() => {
        const fetchCategoriesAndDefaultCourses = async () => {
            setIsLoading(true);
            try {
                const categoriesResponse = await getAllCategories();
                if (categoriesResponse.status === 200) {
                    const categoriesData = categoriesResponse.data;
                    setCategories(categoriesData);
                    if (categoriesData.length > 0) {
                        const firstCategoryId = categoriesData[0].CourseCategoryId;
                        setCategory(firstCategoryId);
                        const coursesResponse = await getCoursesByCategoryId(firstCategoryId);
                        if (coursesResponse.status === 200) {
                            setCourses(coursesResponse.data);
                            if (coursesResponse.data.length > 0) {
                                const firstCourseId = coursesResponse.data[0].CourseId;
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
    }, []);

    const handleCategoryChange = async (e) => {
        try {
            setIsLoading(true);
            const selectedCategory = e.target.value;
            setCategory(selectedCategory);
            const coursesResponse = await getCoursesByCategoryId(selectedCategory);
            if (coursesResponse.status === 200) {
                setCourses(coursesResponse.data);
                if (coursesResponse.data.length > 0) {
                    const firstCourseId = coursesResponse.data[0].CourseId;
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
                                    <th className={styles.table_heading}>Status</th>
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
                                        <td style={{ width: "10%" }}>
                                            <span className={lesson.status === "Active" ? styles.active : styles.inactive}>
                                                {lesson.status || "Not Available"}
                                            </span>
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
            default:
                return null;
        }
    };

    return (
        <div className={styles.content}>
            <div className={styles.input_row}>
                <SelectField
                    label="Select Category"
                    options={categories.map(category => ({
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
                        .filter(course =>
                            !course.CourseName.includes('2024') &&
                            !course.CourseName.includes('Level 3 - T1 - January 27, 2025') &&
                            !course.CourseName.includes('Level 3 - T2 - January 27, 2025')
                        )
                        .sort((a, b) => {
                            // Extract level numbers if they exist
                            const levelA = a.CourseName.match(/Level (\d+)/);
                            const levelB = b.CourseName.match(/Level (\d+)/);

                            // If both have levels, sort by level number first
                            if (levelA && levelB) {
                                const levelDiff = parseInt(levelA[1]) - parseInt(levelB[1]);
                                if (levelDiff !== 0) return levelDiff;

                                // For same level, sort T1 before T2
                                const isT1A = a.CourseName.includes('T1');
                                const isT1B = b.CourseName.includes('T1');
                                if (isT1A && !isT1B) return -1;
                                if (!isT1A && isT1B) return 1;
                            }

                            // If only A has level, it comes first
                            if (levelA) return -1;
                            // If only B has level, it comes first 
                            if (levelB) return 1;
                            // If neither has level, maintain original order
                            return 0;
                        })
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
            <div className={styles.tabs}>
                {lessonTypes.map((type) => (
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
        </div>
    );
};

export default ManageLesson;
