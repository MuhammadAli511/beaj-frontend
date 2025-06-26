import React from 'react';
import styles from '../SpeakLesson.module.css';

const ConversationalMonologueBotEdit = ({ 
    question, 
    index, 
    handleQuestionChange,
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
            <label className={styles.answerEditLabel}>Question Text</label>
            <input 
                className={styles.edit_input_field} 
                type="text" 
                value={question.questionText || ""} 
                onChange={(e) => handleQuestionChange(index, 'questionText', e.target.value)} 
            />
            <label className={styles.answerEditLabel}>Question Video</label>
            <input 
                type="file" 
                onChange={(e) => handleQuestionChange(index, 'mediaFile', e.target.files)} 
            />
            {question.mediaFile && (
                <div className={styles.mediaSection}>
                    <label className={styles.answerEditLabel}>Current Video:</label>
                    <video controls src={question.mediaFile} className={styles.videoSmall}></video>
                </div>
            )}
        </div>
    );
};

export default ConversationalMonologueBotEdit; 