import React, { useState, useEffect } from "react";
import styles from "./TestLessonModal.module.css";
import { toast } from 'react-toastify';
import { handleError } from "../../utils/errorHandler";

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
            toast.error("Please enter a phone number.");
            return;
        }

        if (!phoneRegex.test(TestPhoneNumber)) {
            toast.error("Invalid phone number. Format should be: +923XXXXXXXXX (10 digits after +92)");
            return;
        }

        setIsTesting(true);

        try {
            await onTest(TestPhoneNumber, lesson);
            toast.success("Lesson test initiated successfully!");
        } catch (error) {
            handleError(error, 'Test Lesson');
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