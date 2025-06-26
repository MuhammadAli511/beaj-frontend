import React from 'react';
import styles from '../SpeakLesson.module.css';

const AssessmentWatchAndSpeakEdit = ({ 
    question, 
    index, 
    handleQuestionChange, 
    handleAnswerChange, 
    addNewAnswer, 
    removeAnswer,
    showDifficultyBadge = false,
    difficultyLevel = null
}) => {
    const difficultyClass = difficultyLevel === 'easy' ? styles.difficulty_easy :
        difficultyLevel === 'medium' ? styles.difficulty_medium :
        difficultyLevel === 'hard' ? styles.difficulty_hard : '';

    const badgeClass = difficultyLevel === 'easy' ? styles.badge_easy :
        difficultyLevel === 'medium' ? styles.badge_medium :
        difficultyLevel === 'hard' ? styles.badge_hard : '';

    return (
        <div>
            {/* Difficulty badge is handled by parent component, not here */}
            <label className={styles.answerEditLabel}>Question</label>
            <input
                className={styles.edit_input_field}
                type="text"
                value={question.question || ""}
                onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
            />
            <label className={styles.answerEditLabel}>Answers</label>
            {question.answer.map((ans, ansIndex) => (
                <div key={ansIndex} className={styles.answer_group}>
                    <input
                        className={styles.edit_input_field}
                        type="text"
                        value={ans}
                        onChange={(e) => handleAnswerChange(index, ansIndex, e.target.value)}
                    />
                    <button
                        className={styles.delete_button}
                        onClick={() => removeAnswer(index, ansIndex)}
                    >
                        Remove Answer
                    </button>
                </div>
            ))}
            <button
                className={styles.add_button}
                onClick={() => addNewAnswer(index)}
            >
                Add New Answer
            </button>
            <label className={styles.answerEditLabel}>Upload Media File (Video)</label>
            <input
                type="file"
                onChange={(e) => handleQuestionChange(index, 'mediaFile', e.target.files)}
            />
            <label className={styles.answerEditLabel}>Upload Media File (Image)</label>
            <input
                type="file"
                onChange={(e) => handleQuestionChange(index, 'mediaFileSecond', e.target.files)}
            />
            {question.mediaFile && (
                <div className={styles.mediaSection}>
                    <label className={styles.answerEditLabel}>Current Media File (Video):</label>
                    <video controls src={question.mediaFile} className={styles.videoSmall}></video>
                </div>
            )}
            {question.mediaFileSecond && (
                <div className={styles.mediaSection}>
                    <label className={styles.answerEditLabel}>Current Media File (Image):</label>
                    <img src={question.mediaFileSecond} className={styles.imageSmall}></img>
                </div>
            )}
        </div>
    );
};

export default AssessmentWatchAndSpeakEdit; 