import React, { useState, useEffect } from 'react';
import styles from './ManageLesson.module.css';
import edit from '../../../../assets/images/edit.svg';
import deleteIcon from '../../../../assets/images/delete.svg';
import { getAllCourses, getAllCategories, getCoursesByCategoryId } from '../../../../helper';

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
                <option className={styles.select_option} key={option.key} value={option.value}>{option.label}</option>
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
            }
        };
        fetchCategoriesAndDefaultCourses();
    }, []);

    const handleCategoryChange = async (e) => {
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
    };

    const handleCourseChange = (e) => {
        setCourse(e.target.value);
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
            <div className={styles.lessonContent}>
                {activeTab === 'Watch' && <div>Watch Content</div>}
                {activeTab === 'Listen' && <div>Listen Content</div>}
                {activeTab === 'Read' && <div>Read Content</div>}
                {activeTab === 'Listen & Speak' && <div>Listen & Speak Content</div>}
                {activeTab === 'Watch & Speak' && <div>Watch & Speak Content</div>}
                {activeTab === 'MCQs' && <div>MCQs Content</div>}
                {activeTab === 'Pre Listen & Speak' && <div>Pre Listen & Speak Content</div>}
                {activeTab === 'Pre MCQs' && <div>Pre MCQs Content</div>}
                {activeTab === 'Post Listen & Speak' && <div>Post Listen & Speak Content</div>}
                {activeTab === 'Post MCQs' && <div>Post MCQs Content</div>}
                {activeTab === 'Placement Test' && <div>Placement Test Content</div>}
            </div>
        </div>
    )
};

export default ManageLesson;
