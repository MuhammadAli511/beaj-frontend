import React, { useState, useEffect, useRef } from 'react';
import styles from './ManageCourse.module.css';
import edit from '../../../../assets/images/edit.svg';
import deleteIcon from '../../../../assets/images/delete.svg';
import { updateCourse, deleteCourse, getAllCourses, getAllCategories, duplicateCourse } from '../../../../helper';
import JoditEditor from 'jodit-react';



const EditCourseModal = ({ isOpen, onClose, course, onSave }) => {
    const [categories, setCategories] = useState([]);
    const [courseName, setCourseName] = useState(course ? course.CourseName : '');
    const [coursePrice, setCoursePrice] = useState(course ? course.CoursePrice : '');
    const [courseWeeks, setCourseWeeks] = useState(course ? course.CourseWeeks : '');
    const [courseCategory, setCourseCategory] = useState(course ? course.CourseCategoryId : '');
    const [courseStatus, setCourseStatus] = useState(course ? course.status : '');
    const [sequenceNumber, setSequenceNumber] = useState(course ? course.SequenceNumber : 0);
    const [courseDescription, setCourseDescription] = useState(course ? course.CourseDescription : '');
    const [courseStartDate, setCourseStartDate] = useState(course ? course.courseStartDate : '');
    const editor = useRef(null);

    useEffect(() => {
        if (course) {
            setCourseName(course.CourseName);
            setCoursePrice(course.CoursePrice);
            setCourseWeeks(course.CourseWeeks);
            setCourseCategory(course.CourseCategoryId);
            setCourseStatus(course.status);
            setSequenceNumber(course.SequenceNumber);
            setCourseDescription(course.CourseDescription);
            setCourseStartDate(course.courseStartDate);
        }
    }, [course]);

    useEffect(() => {
        if (isOpen) {
            const fetchCategories = async () => {
                try {
                    const response = await getAllCategories();
                    if (response.status === 200) {
                        setCategories(response.data);
                    } else {
                        alert(response.data.message);
                    }
                } catch (error) {
                    alert(error);
                }
            };
            fetchCategories();
        }
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    const handleSave = () => {
        onSave(course.CourseId, courseName, coursePrice, courseWeeks, courseCategory, courseStatus, sequenceNumber, courseDescription, courseStartDate);
        onClose();
    };

    const handleCancel = () => {
        onClose();
    };


    if (!isOpen) return null;

    return (
        <div className={styles.modal}>
            <div className={styles.modalContent}>
                <h1 className={styles.modal_heading}>Edit Course</h1>
                <div className={styles.input_row}>
                    <div className={styles.form_group}>
                        <label className={styles.label} htmlFor="courseName">Course Name</label>
                        <input className={styles.input_field} value={courseName} type="text" onChange={e => setCourseName(e.target.value)} id="courseName" />
                    </div>
                    <div className={styles.form_group}>
                        <label className={styles.label} htmlFor="sequenceNumber">Sequence Number:</label>
                        <input className={styles.input_field} type="number" value={sequenceNumber} onChange={e => setSequenceNumber(e.target.value)} id="sequenceNumber" />
                    </div>
                </div>
                <div className={styles.input_row}>
                    <div className={styles.form_group}>
                        <label className={styles.label} htmlFor="coursePrice">Course Price</label>
                        <input className={styles.input_field} type="number" value={coursePrice} onChange={e => setCoursePrice(e.target.value)} id="coursePrice" />
                    </div>
                    <div className={styles.form_group}>
                        <label className={styles.label} htmlFor="courseWeeks">Course Weeks</label>
                        <input className={styles.input_field} disabled={true} type="number" value={courseWeeks} onChange={e => setCourseWeeks(e.target.value)} id="courseWeeks" />
                    </div>
                </div>
                <div className={styles.input_row}>
                    <div className={styles.form_group}>
                        <label className={styles.label} htmlFor="courseCategory">Course Category</label>
                        <select className={styles.input_field} value={course.CourseCategoryId} onChange={e => setCourseCategory(e.target.value)} id="courseCategory">
                            {categories.map(category => (
                                <option key={category.CourseCategoryId} value={category.CourseCategoryId}>
                                    {category.CourseCategoryName}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.form_group}>
                        <label className={styles.label} htmlFor="courseDescription">Course Description</label>
                        <JoditEditor
                            ref={editor}
                            value={courseDescription}
                            tabIndex={1}
                            onBlur={newContent => setCourseDescription(newContent)}
                            onChange={newContent => setCourseDescription(newContent)}
                        />
                    </div>
                </div>
                <div className={styles.input_row}>
                    <div className={styles.form_group}>
                        {/* Start Dtae */}
                        <label className={styles.label} htmlFor="courseStartDate">Course Start Date</label>
                        <input className={styles.input_field} type="date" value={courseStartDate} onChange={e => setCourseStartDate(e.target.value)} id="courseStartDate" />
                    </div>
                </div>
                <button className={styles.submit_button} onClick={handleSave}>Save Changes</button>
                <button className={styles.cancel_button} onClick={handleCancel}>Cancel</button>
            </div>
        </div >
    );
};



const ManageCourse = () => {
    const [courses, setCourses] = useState([]);
    const [categoryNames, setCategoryNames] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [duplicationLoading, setDuplicationLoading] = useState({});

    const fetchCategoryNames = async () => {
        try {
            const response = await getAllCategories();
            if (response.status === 200) {
                const categoryNames = {};
                response.data.forEach(category => {
                    categoryNames[category.CourseCategoryId] = category.CourseCategoryName;
                });
                setCategoryNames(categoryNames);
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            alert(error);
        }
    };

    const fetchCourses = async () => {
        setIsLoading(true);
        try {
            const response = await getAllCourses();
            if (response.status === 200) {
                // if coursecategoryid is 66 or 68
                const filteredCourses = response.data.filter(course => course.CourseCategoryId === 66 || course.CourseCategoryId === 68);
                setCourses(filteredCourses);
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            alert(error);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const openEditModal = (course) => {
        setSelectedCourse(course);
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setSelectedCourse(null);
        setIsEditModalOpen(false);
    };

    const handleDeleteCourse = async (courseId) => {
        if (window.confirm('Are you sure you want to delete this course?')) {
            try {
                setIsLoading(true);
                const response = await deleteCourse(courseId);
                if (response.status === 200) {
                    alert('Course deleted successfully');
                    fetchCourses();
                } else {
                    alert(response.data.message);
                }
            } catch (error) {
                alert(error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleDuplicateCourse = async (courseId) => {
        if (window.confirm('Are you sure you want to duplicate this course?')) {
            try {
                setDuplicationLoading(prev => ({ ...prev, [courseId]: true }));
                const response = await duplicateCourse(courseId);
                if (response.status === 200) {
                    alert('Course duplicated successfully');
                    fetchCourses();
                } else {
                    alert(response.data.message);
                }
            } catch (error) {
                alert(error);
            } finally {
                setDuplicationLoading(prev => ({ ...prev, [courseId]: false }));
            }
        }
    };

    const saveCourseChanges = async (courseId, course_name, course_price, course_weeks, course_category, course_status, sequence_number, course_description, course_start_date) => {
        try {
            setIsLoading(true);
            const response = await updateCourse(courseId, course_name, course_price, course_weeks, course_category, course_status, sequence_number, course_description, course_start_date);
            if (response.status === 200) {
                alert('Course updated successfully');
                fetchCourses();
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
            <h1 className={styles.heading}>Manage your courses</h1>
            {/* loading */}
            {isLoading && <div>Fetching Data...</div>}
            {/* no data */}
            {!isLoading && courses.length === 0 && <p>No courses found</p>}
            {/* data */}
            {!isLoading && courses.length > 0 && (
                <table className={styles.table}>
                    <thead className={styles.heading_row}>
                        <tr>
                            <th className={styles.table_heading}>Sequence Number</th>
                            <th className={styles.table_heading}>Course Name</th>
                            <th className={styles.table_heading}>Course Price</th>
                            <th className={styles.table_heading}>Course Weeks</th>
                            <th className={styles.table_heading}>Course Category</th>
                            <th className={styles.table_heading}>Course Status</th>
                            <th className={styles.table_heading}>Course Start Date</th>
                            <th className={styles.table_heading}>Duplicate Course</th>
                            <th className={styles.table_heading}>Edit</th>
                            <th className={styles.table_heading}>Delete</th>
                        </tr>
                    </thead>
                    <tbody className={styles.table_body}>
                        {courses.map((course) => (
                            <tr key={course.CourseId} className={styles.table_row}>
                                <td className={styles.sequence_number}>{course.SequenceNumber}</td>
                                <td>{course.CourseName}</td>
                                <td>{course.CoursePrice}</td>
                                <td>{course.CourseWeeks}</td>
                                <td>{categoryNames[course.CourseCategoryId]}</td>
                                <td>{course.status}</td>
                                <td>{course.courseStartDate ? new Date(course.courseStartDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</td>
                                <td>
                                    <button
                                        className={styles.duplicateButton}
                                        onClick={() => handleDuplicateCourse(course.CourseId)}
                                        disabled={duplicationLoading[course.CourseId]}
                                    >
                                        {duplicationLoading[course.CourseId] ? <div className="loader"></div> : "Duplicate"}
                                    </button>
                                </td>
                                <td><img onClick={() => openEditModal(course)} className={styles.edit} src={edit} alt="edit" /></td>
                                <td><img onClick={() => handleDeleteCourse(course.CourseId)} className={styles.delete} src={deleteIcon} alt="delete" /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <EditCourseModal
                isOpen={isEditModalOpen}
                onClose={closeEditModal}
                course={selectedCourse}
                onSave={saveCourseChanges}
            />
        </div>
    )
};

export default ManageCourse;