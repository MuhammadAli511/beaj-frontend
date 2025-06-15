import React from 'react';
import styles from '../SpeakLesson.module.css';

const FeedbackAudioEdit = ({ 
    question, 
    index, 
    handleQuestionChange 
}) => {
    return (
        <>
            <label className={styles.answerEditLabel}>Question</label>
            <input
                className={styles.edit_input_field}
                type="text"
                value={question.question || ""}
                onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
            />
            <label className={styles.answerEditLabel}>Upload Audio File</label>
            <input
                type="file"
                accept="audio/*"
                onChange={(e) => handleQuestionChange(index, 'mediaFile', e.target.files)}
            />
            {question.mediaFile && (
                <div className={styles.mediaSection}>
                    <label className={styles.answerEditLabel}>Current Audio File:</label>
                    <audio controls src={question.mediaFile} className={styles.audio}></audio>
                </div>
            )}
        </>
    );
};

export default FeedbackAudioEdit; 