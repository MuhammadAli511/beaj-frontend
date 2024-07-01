import React, { useEffect, useState } from 'react';
import styles from './CreateCourseWeek.module.css';
import { createCourseWeek, getAllCourses } from '../../../../helper';


const CreateCourseWeek = () => {
    const [imagePreview, setImagePreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [courses, setCourses] = useState([]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await getAllCourses();
                if (response.status === 200) {
                    setCourses(response.data);
                } else {
                    alert(response.data.message);
                }
            } catch (error) {
                alert(error);
            }
        };
        fetchCourses();
    }, []);


    const handleCreateCourseWeek = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            const response = await createCourseWeek(e.target.week_number.value, e.target.category_image.files[0], e.target.week_description.value, e.target.course_id.value);
            if (response.status === 200) {
                alert('Course Week created successfully');
                e.target.reset();
                setImagePreview(null);
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
            <h1 className={styles.heading}>Fill out your course week details</h1>
            <form onSubmit={handleCreateCourseWeek} className={styles.form}>
                <div className={styles.input_row}>
                    <div className={styles.form_group}>
                        <label className={styles.label} htmlFor="week_number">Week Number</label>
                        <input className={styles.input_field} type="number" id="week_number" name="week_number" />
                    </div>
                    <div className={styles.form_group}>
                        <label className={styles.label} htmlFor="week_description">Week Description</label>
                        <textarea className={styles.input_field} id="week_description" name="week_description" />
                    </div>
                </div>
                <div className={styles.input_row}>
                    <div className={styles.form_group}>
                        <label className={styles.label} htmlFor="course_id">Select Course</label>
                        <select className={styles.input_field} id="course_id" name="course_id">
                            {courses.map(course => (
                                <option key={course.CourseId} value={course.CourseId}>{course.CourseName}</option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.form_group}>
                        <label className={styles.label} htmlFor="category_image">Add Course Week Image</label>
                        <input type="file" id="category_image" name="category_image" onChange={handleImageChange} />
                        {imagePreview && (
                            <div className={styles.image_preview}>
                                <img src={imagePreview} alt="Preview" className={styles.image} />
                            </div>
                        )}
                    </div>
                </div>
                <button type="submit" className={styles.submit_button}>{isLoading ? <div className="loader"></div> : "Save Course Week"}</button>
            </form>
        </div>
    )
};

export default CreateCourseWeek;