import React, { useState, useEffect } from 'react';
import styles from './ManageLesson.module.css';
import { getAllCategories, getCoursesByCategoryId, getLessonsByCourse } from '../../../../helper';

import WatchLesson from './LessonTypes/WatchLesson';
import ReadLesson from './LessonTypes/ReadLesson';
import SpeakLesson from './LessonTypes/SpeakLesson';
import MCQsLesson from './LessonTypes/MCQsLesson';

const lessonTypes = [
    'All', 'Watch', 'Watch End', 'Read', 'Listen & Speak', 'Watch & Speak',
    'MCQs', 'Conversational Questions Bot', 'Conversational Monologue Bot', 'Conversational Agency Bot'
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

    const renderLessonContent = () => {
        switch (activeTab) {
            case 'All':
                return (
                    <div>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th className={styles.table_heading}>Week</th>
                                    <th className={styles.table_heading}>Day</th>
                                    <th className={styles.table_heading}>Sequence Number</th>
                                    <th className={styles.table_heading}>Activity</th>
                                    <th className={styles.table_heading}>Activity Alias</th>
                                    <th className={styles.table_heading}>Status</th>
                                </tr>
                            </thead>
                            <tbody className={styles.table_body}>
                                {lessons.map(lesson => (
                                    <tr key={lesson.LessonId}>
                                        <td>{lesson.weekNumber}</td>
                                        <td>{lesson.dayNumber}</td>
                                        <td>{lesson.SequenceNumber}</td>
                                        <td>{lesson.activity}</td>
                                        <td>{lesson.activityAlias}</td>
                                        <td>{lesson.status}</td>
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
            case 'MCQs':
                return <MCQsLesson category={category} course={course} activity='mcqs' />;
            case 'Conversational Questions Bot':
                return <SpeakLesson category={category} course={course} activity='conversationalQuestionsBot' />;
            case 'Conversational Monologue Bot':
                return <SpeakLesson category={category} course={course} activity='conversationalMonologueBot' />;
            case 'Conversational Agency Bot':
                return <SpeakLesson category={category} course={course} activity='conversationalAgencyBot' />;
            default:
                return null;
        }
    };

    return (
        <div className={styles.content}>
            <div className={styles.input_row}>
                <SelectField label="Select Category" options={categories.map(category => ({ value: category.CourseCategoryId, label: category.CourseCategoryName }))} onChange={handleCategoryChange} value={category} name="category" id="category" />
                <SelectField label="Select Course" options={courses.map(course => ({ value: course.CourseId, label: course.CourseName }))} onChange={handleCourseChange} value={course} name="course" id="course" />
            </div>
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
        </div>
    );
};

export default ManageLesson;
