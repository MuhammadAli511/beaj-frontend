import React, { useState, useEffect } from 'react';
import styles from './ManageLesson.module.css';
import { getAllCategories, getCoursesByCategoryId } from '../../../../helper';

import WatchLesson from './LessonTypes/WatchLesson';
import ListenLesson from './LessonTypes/ListenLesson';
import ReadLesson from './LessonTypes/ReadLesson';
import SpeakLesson from './LessonTypes/SpeakLesson';
import MCQsLesson from './LessonTypes/MCQsLesson';

const lessonTypes = [
    'Watch', 'Listen', 'Read', 'Listen & Speak', 'Watch & Speak',
    'MCQs', 'Pre Listen & Speak', 'Pre MCQs',
    'Post Listen & Speak', 'Post MCQs', 'Placement Test'
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
    const [activeTab, setActiveTab] = useState('Watch');

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

    const renderLessonContent = () => {
        switch (activeTab) {
            case 'Watch':
                return <WatchLesson category={category} course={course} />;
            case 'Listen':
                return <ListenLesson category={category} course={course} />;
            case 'Read':
                return <ReadLesson category={category} course={course} />;
            case 'Listen & Speak':
                return <SpeakLesson category={category} course={course} activity='listenAndSpeak' />;
            case 'Pre Listen & Speak':
                return <SpeakLesson category={category} course={course} activity='preListenAndSpeak' />;
            case 'Post Listen & Speak':
                return <SpeakLesson category={category} course={course} activity='postListenAndSpeak' />;
            case 'Watch & Speak':
                return <SpeakLesson category={category} course={course} activity='watchAndSpeak' />;
            case 'MCQs':
                return <MCQsLesson category={category} course={course} activity='mcqs' />;
            case 'Pre MCQs':
                return <MCQsLesson category={category} course={course} activity='preMCQs' />;
            case 'Post MCQs':
                return <MCQsLesson category={category} course={course} activity='postMCQs' />;
            case 'Placement Test':
                return <MCQsLesson category={category} course={course} activity='placementTest' />;
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
                    </button >
                ))}
            </div >
            {!isLoading && renderLessonContent()}
        </div >
    );
};

export default ManageLesson;
