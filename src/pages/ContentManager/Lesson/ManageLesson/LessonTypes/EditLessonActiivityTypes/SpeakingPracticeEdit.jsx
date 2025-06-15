import React from 'react';
import styles from '../SpeakLesson.module.css';

const SpeakingPracticeEdit = ({ 
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
        <div className={showDifficultyBadge ? `${styles.difficulty_question_box} ${difficultyClass}` : ''}>
            {showDifficultyBadge && difficultyLevel && (
                <div className={`${styles.difficulty_badge} ${badgeClass}`}>
                    {difficultyLevel}
                </div>
            )}
            <label className={styles.answerEditLabel}>Question Audio</label>
            <input
                type="file"
                accept="audio/*"
                onChange={(e) => handleQuestionChange(index, 'audio', e.target.files)}
            />
            {question.audio && (
                <div className={styles.mediaSection}>
                    <label className={styles.answerEditLabel}>Current Audio:</label>
                    <audio
                        controls
                        src={typeof question.audio === 'string' ?
                            question.audio :
                            (question.audio instanceof File ?
                                URL.createObjectURL(question.audio) :
                                question.audio)}
                        className={styles.audio}
                    ></audio>
                </div>
            )}
        </div>
    );
};

export default SpeakingPracticeEdit; 