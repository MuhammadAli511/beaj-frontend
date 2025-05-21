import React, { useState, useEffect } from "react";
import styles from "./TestLessonModal.module.css";
import Select from "react-select";

const TestLessonModal = ({ isOpen, onClose, lesson, onTest }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    // const [TestPhoneNumber, setTestPhoneNumber] = useState("");
    const [selectedOption, setSelectedOption] = useState(null);

    const options = [
        // { value: { phoneNumber: "+923225036358", profile_id: 8768 }, label: "+923225036358 (ID: 8768)" },
        { value: { phoneNumber: "+923012232148", profile_id: 4398 }, label: "+923012232148 (ID: 4398)" },
        { value: { phoneNumber: "+923151076203", profile_id: 1623 }, label: "+923151076203 (ID: 1623)" },
        // Add more users here...
    ];

    useEffect(() => {
        if (isOpen) {
            setIsLoading(false);
            setSelectedOption(null);
        }
    }, [isOpen]);

    const handleTest = async () => {

         if (!selectedOption) {
            alert("Please select a phone number - profile id.");
            return;
        }

        const { phoneNumber, profile_id } = selectedOption.value;
        setIsTesting(true);

        try {
            await onTest(profile_id, phoneNumber, lesson);
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
                            <label className={styles.label}>Select Phone Number - Profile Id</label>
                            <Select
                                options={options}
                                value={selectedOption}
                                onChange={setSelectedOption}
                                isSearchable
                                placeholder="Select Number..."
                            />
                            {/* <input
                                placeholder="+92XXXXXXXXXX"
                                className={styles.input_field}
                                type="text"
                                id="phoneNumber"
                                onChange={(e) => setTestPhoneNumber(e.target.value)}
                                value={TestPhoneNumber}
                            /> */}
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