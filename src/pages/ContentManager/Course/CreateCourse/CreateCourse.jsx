import React, { useState, useEffect } from 'react';
import styles from './CreateCourse.module.css';
import { getAllCategories, createCourse } from '../../../../helper';


const CreateCourse = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [categories, setCategories] = useState([]);


    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await getAllCategories();
                if (response.status === 200) {
                    // Filter categories to only include those with "Chatbot" in their name
                    const filteredCategories = response.data.filter(category => 
                        category.CourseCategoryName.includes("Chatbot")
                    );
                    setCategories(filteredCategories);
                } else {
                    alert(response.data.message);
                }
            } catch (error) {
                alert(error);
            }
        };
        fetchCategories();
    }, []);

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            const course_name = e.target.course_name.value;
            const course_price = e.target.course_price.value;
            const course_weeks = e.target.course_weeks.value;
            const course_category = e.target.course_category.value;
            const course_status = course_price == '0' ? 'free' : 'paid';
            const sequence_number = e.target.sequence_number.value;
            const course_description = '';
            const course_start_date = e.target.course_start_date.value;
            const response = await createCourse(course_name, course_price, course_weeks, course_category, course_status, sequence_number, course_description, course_start_date);
            if (response.status === 200) {
                alert('Course created successfully');
                e.target.reset();
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            alert(error);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className={styles.content}>
            <h1 className={styles.heading}>Fill out your course details</h1>
            <form onSubmit={handleCreateCourse} className={styles.form}>
                <div className={styles.input_row}>
                    <div className={styles.form_group}>
                        <label className={styles.label} htmlFor="course_name">Course Name</label>
                        <input className={styles.input_field} type="text" id="course_name" name="course_name" />
                    </div>
                    <div className={styles.form_group}>
                        <label className={styles.label} htmlFor="sequence_number">Sequence Number</label>
                        <input className={styles.input_field} type="number" id="sequence_number" name="sequence_number" />
                    </div>
                </div>
                <div className={styles.input_row}>
                    <div className={styles.form_group}>
                        <label className={styles.label} htmlFor="course_price">Course Price</label>
                        <input className={styles.input_field} type="number" id="course_price" name="course_price" />
                    </div>
                    <div className={styles.form_group}>
                        <label className={styles.label} htmlFor="course_weeks">Course Weeks</label>
                        <input className={styles.input_field} type="number" id="course_weeks" name="course_weeks" />
                    </div>
                </div>
                <div className={styles.input_row}>
                    <div className={styles.form_group}>
                        <label className={styles.label} htmlFor="course_category">Select Category</label>
                        <select className={styles.input_field} name="course_category" id="course_category">
                            {categories
                                .map(category => (
                                    <option key={category.CourseCategoryId} value={category.CourseCategoryId}>{category.CourseCategoryName}</option>
                                ))
                            }
                        </select>
                    </div>
                    <div className={styles.form_group}>
                        <label className={styles.label} htmlFor="course_start_date">Course Start Date</label>
                        <input className={styles.input_field} type="date" id="course_start_date" name="course_start_date" />
                    </div>
                </div>

                <button type="submit" className={styles.submit_button}>{isLoading ? <div className="loader"></div> : "Save Course"}</button>
            </form >
        </div >
    )
};

export default CreateCourse;