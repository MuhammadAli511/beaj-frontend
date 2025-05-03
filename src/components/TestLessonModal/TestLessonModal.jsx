import React, { useState } from "react";
import styles from "./TestLessonModal.module.css";

const TestLessonModal = ({ isOpen, onClose, lesson, onMigrate }) => {
    const [isLoading, setIsLoading] = useState(true);

    const handleTest = async () => {
        return;
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
