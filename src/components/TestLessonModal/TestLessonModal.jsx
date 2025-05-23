import React, { useState, useEffect } from "react";
import styles from "./TestLessonModal.module.css";

const TestLessonModal = ({ isOpen, onClose, lesson, onTest }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [TestPhoneNumber, setTestPhoneNumber] = useState("");

    useEffect(() => {
        if (isOpen) {
            setIsLoading(false);
            setTestPhoneNumber("");
        }
    }, [isOpen]);

    const handleTest = async () => {

         const phoneRegex = /^\+92\d{10}$/;

        if (!TestPhoneNumber) {
            alert("Please enter a phone number.");
            return;
        }

        if (!phoneRegex.test(TestPhoneNumber)) {
            alert("Invalid phone number.\nFormat should be: +923XXXXXXXXX (10 digits after +92)");
            return;
        }

        setIsTesting(true);

        try {
            await onTest(TestPhoneNumber, lesson);
        } catch (error) {
            alert("Testing failed.");
        } finally {
            setIsTesting(false);
        }
    };

    return (
        <div>
            {isOpen && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <h2 className={styles.modal_heading}>Test Lesson</h2>
                        <div className={styles.form_group}>
                            <label className={styles.label}>Enter Phone Number</label>
                            <input
                                placeholder="+92XXXXXXXXXX"
                                className={styles.input_field}
                                type="text"
                                id="phoneNumber"
                                onChange={(e) => setTestPhoneNumber(e.target.value)}
                                value={TestPhoneNumber}
                            />
                        </div>
                        <div className={styles.form_group_row}>
                            <button
                                className={styles.submit_button}
                                onClick={handleTest}
                                disabled={isTesting}
                            >
                                {isTesting ? <div className="loader"></div> : "Test"}
                            </button>
                            <button 
                                className={styles.cancel_button} 
                                onClick={onClose}
                                disabled={isTesting}
                            >
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