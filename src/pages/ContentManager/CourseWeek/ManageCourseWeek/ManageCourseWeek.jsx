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
    }

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

    if (!isOpen) return null;

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
                await fetchCourseNames();
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
                            <th className={styles.table_heading}>Id</th>
                            <th className={styles.table_heading}>Week Number</th>
                            <th className={styles.table_heading}>Description</th>
                            <th className={styles.table_heading}>Course Name</th>
                            <th className={styles.table_heading}>Edit</th>
                            <th className={styles.table_heading}>Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {courseWeeks.map((courseWeek) => (
                            <tr key={courseWeek.id}>
                                <td className={styles.table_data}>{courseWeek.id}</td>
                                <td className={styles.table_data}>{courseWeek.weekNumber}</td>
                                <td className={styles.table_data}>{courseWeek.description}</td>
                                <td className={styles.table_data}>{courseNames[courseWeek.courseId]}</td>
                                <td className={styles.table_data}>
                                    <button onClick={() => openEditModal(courseWeek)}>
                                        <img src={edit} alt="edit" />
                                    </button>
                                </td>
                                <td className={styles.table_data}>
                                    <button onClick={() => handleDeleteCourseWeek(courseWeek.id)}>
                                        <img src={deleteIcon} alt="delete" />
                                    </button>
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