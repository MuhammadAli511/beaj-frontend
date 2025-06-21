import React, { useState, useEffect } from "react";
import { getAllCoursesfromProduction } from "../../helper";
import styles from "./MigrateLessonModal.module.css";

const MigrateLessonModal = ({ isOpen, onClose, lesson, onMigrate, modalTitle = "Migrate Lesson", buttonText = "Migrate" }) => {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isMigrating, setIsMigrating] = useState(false);

    useEffect(() => {
        const fetchCoursesFromProduction = async () => {
            try {
                const response = await getAllCoursesfromProduction();
                if (response.status === 200) {
                    setCourses(response.data);
                } else {
                    alert(response.data.message);
                }
            } catch (error) {
                alert("Failed to fetch courses from production database.");
            } finally {
                setIsLoading(false);
            }
        };

        if (isOpen) {
            setIsLoading(true);
            fetchCoursesFromProduction();
        }
    }, [isOpen]);

    const handleMigrate = async () => {
        if (!selectedCourse) {
            alert("Please select a course to migrate.");
            return;
        }

        setIsMigrating(true);

        try {
            await onMigrate(lesson, selectedCourse); // Assuming onMigrate returns a promise
        } catch (error) {
            alert("Migration failed.");
        } finally {
            setIsMigrating(false);
        }
    };

    return (
        <div>
            {isOpen && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <h2 className={styles.modal_heading}>{modalTitle}</h2>
                        {isLoading ? (
                            <div>Loading courses...</div>
                        ) : (
                            <div className={styles.form_group}>
                                <label className={styles.label} htmlFor="course_select">
                                    Select Course
                                </label>
                                <select
                                    className={styles.input_field}
                                    id="course_select"
                                    value={selectedCourse}
                                    onChange={(e) => setSelectedCourse(e.target.value)}
                                >
                                    <option value="">Select a Course</option>
                                    {courses.map((course) => (
                                        <option key={course.CourseId} value={course.CourseId}>
                                            {course.CourseName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div className={styles.form_group_row}>
                            <button
                                className={styles.submit_button}
                                onClick={handleMigrate}
                                disabled={isLoading || isMigrating}
                            >
                                {isMigrating ? <div className="loader"></div> : buttonText}
                            </button>
                            <button className={styles.cancel_button} onClick={onClose}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MigrateLessonModal;
