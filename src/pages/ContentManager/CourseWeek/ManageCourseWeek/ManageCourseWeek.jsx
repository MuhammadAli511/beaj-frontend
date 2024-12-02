import React, { useState, useEffect } from 'react';
import styles from './ManageCourseWeek.module.css';
import edit from '../../../../assets/images/edit.svg';
import deleteIcon from '../../../../assets/images/delete.svg';
import { getAllCourses, getAllCourseWeeks, deleteCourseWeek, updateCourseWeek } from '../../../../helper';




const EditCourseWeeksModal = ({ isOpen, onClose, courseWeek, onSave }) => {
    const [imagePreview, setImagePreview] = useState(courseWeek ? courseWeek.image : null);
    const [currentImage, setCurrentImage] = useState(null);
    const [weekNumber, setWeekNumber] = useState(courseWeek ? courseWeek.weekNumber : 0);
    const [description, setDescription] = useState(courseWeek ? courseWeek.description : '');
    const [courseId, setCourseId] = useState(courseWeek ? courseWeek.courseId : 0);
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        if (courseWeek) {
            setWeekNumber(courseWeek.weekNumber);
            setDescription(courseWeek.description);
            setCourseId(courseWeek.courseId);
            setImagePreview(courseWeek.image);
            setCurrentImage(null);
        }
    }, [courseWeek]);

    useEffect(() => {
        if (isOpen) {
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
        }
    }, [isOpen]);

    if (!isOpen) {
        return null;
    };

    const handleSave = () => {
        onSave(courseWeek.id, weekNumber, currentImage || courseWeek.image, description, courseId);
        onClose();
        resetImageState();
    };

    const handleCancel = () => {
        resetImageState();
        onClose();
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
            setCurrentImage(file);
        }
    };

    const resetImageState = () => {
        setImagePreview(courseWeek ? courseWeek.image : null);
        setCurrentImage(null);
    };


    return (
        <div className={styles.modal}>
            <div className={styles.modalContent}>
                <h2>Edit Course Week</h2>
                <div className={styles.form_group}>
                    <label className={styles.label} htmlFor="weekNumber">Week Number</label>
                    <input className={styles.input_field} value={weekNumber} type="number" onChange={e => setWeekNumber(e.target.value)} id="weekNumber" />
                </div>
                <div className={styles.form_group}>
                    <label className={styles.label} htmlFor="description">Description</label>
                    <textarea className={styles.input_field} value={description} onChange={e => setDescription(e.target.value)} id="description" />
                </div>
                <div className={styles.form_group}>
                    <label className={styles.label} htmlFor="courseId">Course</label>
                    <select className={styles.input_field} value={courseId} onChange={e => setCourseId(e.target.value)} id="courseId">
                        {courses.map((course) => (
                            <option key={course.CourseId} value={course.CourseId}>{course.CourseName}</option>
                        ))}
                    </select>
                </div>
                <div className={styles.form_group}>
                    <label className={styles.label} htmlFor="image">Add Course Week Image</label>
                    <input type="file" id="image" name="image" onChange={handleImageChange} />
                    {imagePreview && (
                        <div className={styles.image_preview}>
                            <img src={imagePreview} alt="Preview" className={styles.image} />
                        </div>
                    )}
                </div>
                <button className={styles.submit_button} onClick={handleSave}>Save Changes</button>
                <button className={styles.cancel_button} onClick={handleCancel}>Cancel</button>
            </div>
        </div>
    );
};


const ManageCourseWeek = () => {
    const [courseWeeks, setCourseWeeks] = useState([]);
    const [courseNames, setCourseNames] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedCourseWeek, setSelectedCourseWeek] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const fetchCourseNames = async () => {
        try {
            const response = await getAllCourses();
            if (response.status === 200) {
                const courseNames = {};
                response.data.forEach((course) => {
                    courseNames[course.CourseId] = course.CourseName;
                });
                setCourseNames(courseNames);
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            alert(error);
        }
    };

    const fetchCourseWeeks = async () => {
        setIsLoading(true);
        try {
            const response = await getAllCourseWeeks();
            if (response.status === 200) {
                setCourseWeeks(response.data);

                // First fetch course names
                await fetchCourseNames();

                // Then sort the course weeks
                const sortedWeeks = [...response.data].sort((a, b) => {
                    // First compare by course name
                    const courseNameA = courseNames[a.courseId] || '';
                    const courseNameB = courseNames[b.courseId] || '';

                    if (courseNameA !== courseNameB) {
                        return courseNameA.localeCompare(courseNameB);
                    }

                    // If course names are same, sort by week number
                    return a.weekNumber - b.weekNumber;
                });

                setCourseWeeks(sortedWeeks);
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            alert(error);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchCourseWeeks();
    }, []);

    useEffect(() => {
        if (courseWeeks.length > 0 && Object.keys(courseNames).length > 0) {
            const sortedWeeks = [...courseWeeks].sort((a, b) => {
                const courseNameA = courseNames[a.courseId] || '';
                const courseNameB = courseNames[b.courseId] || '';

                if (courseNameA !== courseNameB) {
                    return courseNameA.localeCompare(courseNameB);
                }

                return a.weekNumber - b.weekNumber;
            });

            setCourseWeeks(sortedWeeks);
        }
    }, [courseNames, courseWeeks]);

    const openEditModal = (course) => {
        setSelectedCourseWeek(course);
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setSelectedCourseWeek(null);
        setIsEditModalOpen(false);
    };

    const handleDeleteCourseWeek = async (courseWeekId) => {
        if (window.confirm('Are you sure you want to delete this course week?')) {
            try {
                setIsLoading(true);
                const response = await deleteCourseWeek(courseWeekId);
                if (response.status === 200) {
                    alert('Course Week deleted successfully');
                    fetchCourseWeeks();
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

    const saveCourseWeekChanges = async (courseWeekId, weekNumber, image, description, courseId) => {
        try {
            setIsLoading(true);
            const response = await updateCourseWeek(courseWeekId, weekNumber, image, description, courseId);
            if (response.status === 200) {
                alert('Course Week updated successfully');
                fetchCourseWeeks();
                closeEditModal();
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
            <h1 className={styles.heading}>Manage your course weeks</h1>
            {/* loading */}
            {isLoading && <div>Fetching Data...</div>}
            {/* no data */}
            {!isLoading && courseWeeks.length === 0 && <p>No course weeks found</p>}
            {/* data */}
            {!isLoading && courseWeeks.length > 0 && (
                <table className={styles.table}>
                    <thead className={styles.heading_row}>
                        <tr>
                            <th className={`${styles.table_heading} ${styles.sequence_number}`} style={{ width: '10%' }}>Sequence Number</th>
                            <th className={`${styles.table_heading} ${styles.week_name}`} style={{ width: '20%' }}>Week Number</th>
                            <th className={`${styles.table_heading} ${styles.description}`} style={{ width: '32%' }}>Description</th>
                            <th className={`${styles.table_heading} ${styles.course_name}`} style={{ width: '32%' }}>Course Name</th>
                            <th className={`${styles.table_heading} ${styles.action_column}`} style={{ width: '3%' }}>Edit</th>
                            <th className={`${styles.table_heading} ${styles.action_column}`} style={{ width: '3%' }}>Delete</th>
                        </tr>
                    </thead>
                    <tbody className={styles.table_body}>
                        {courseWeeks.map((week) => (
                            <tr key={week.CourseWeekId} className={styles.table_row}>
                                <td style={{ width: '10%' }}>{week.id}</td>
                                <td style={{ width: '20%' }}>{week.weekNumber}</td>
                                <td style={{ width: '44%' }}>{week.description}</td>
                                <td style={{ width: '40%' }}>{courseNames[week.courseId]}</td>
                                <td style={{ width: '3%' }}>
                                    <img onClick={() => openEditModal(week)} className={styles.edit} src={edit} alt="edit" />
                                </td>
                                <td style={{ width: '3%' }}>
                                    <img onClick={() => handleDeleteCourseWeek(week.CourseWeekId)} className={styles.delete} src={deleteIcon} alt="delete" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <EditCourseWeeksModal
                isOpen={isEditModalOpen}
                onClose={closeEditModal}
                courseWeek={selectedCourseWeek}
                onSave={saveCourseWeekChanges}
            />
        </div>
    )
};

export default ManageCourseWeek;