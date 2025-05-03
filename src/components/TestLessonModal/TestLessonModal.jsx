import React, { useState, useEffect } from "react";
import { getAllCoursesfromProduction } from "../../helper";
import styles from "./TestLessonModal.module.css";

const TestLessonModal = ({ isOpen, onClose, lesson, onMigrate }) => {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isMigrating, setIsMigrating] = useState(false);

    useEffect(() => {
        const fetchCoursesFromProduction = async () => {
            // try {
            //     const response = await getAllCoursesfromProduction();
            //     if (response.status === 200) {
            //         setCourses(response.data);
            //     } else {
            //         alert(response.data.message);
            //     }
            // } catch (error) {
            //     alert("Failed to fetch courses from production database.");
            // } finally {
            //     setIsLoading(false);
            // }
        };

        if (isOpen) {
            setIsLoading(true);
            fetchCoursesFromProduction();
        }
    }, [isOpen]);

    const handleTest = async () => {
        if (!selectedCourse) {
            alert("Please enter number to test.");
            return;
        }

        setIsMigrating(true);

        try {
            await onMigrate(lesson, selectedCourse); // Assuming onTest returns a promise
        } catch (error) {
            alert("Test failed.");
        } finally {
            setIsMigrating(false);
        }
    };

    return (
        <div>
            {isOpen && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <h2 className={styles.modal_heading}>Test Lesson</h2>
                        {isLoading ? (
                            <div>Loading...</div>
                        ) : (
                            
                            <div className={styles.form_group}>
                               
                                    <label className={styles.label}>Phone Number</label>
                                    <input
                                        placeholder="+92XXXXXXXXXX"
                                        className={styles.input_field}
                                        type="text"
                                        id="dayNumber"
                                        // defaultValue={ "Not Available"}
                                    />
                            </div>
                        )}
                        <div className={styles.form_group_row}>
                            <button
                                className={styles.submit_button}
                                onClick={handleTest}
                                disabled={isLoading || isMigrating}
                            >
                                {isMigrating ? <div className="loader"></div> : "Migrate"}
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

export default TestLessonModal;
