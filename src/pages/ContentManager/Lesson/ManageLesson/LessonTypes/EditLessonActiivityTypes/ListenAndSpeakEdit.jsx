import React from 'react';
import styles from '../SpeakLesson.module.css';

const ListenAndSpeakEdit = ({ 
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

    // Determine the current media type based on existing file
    const getCurrentMediaType = () => {
        if (question.mediaType) {
            return question.mediaType;
        }
        // If no mediaType is set, detect from existing file
        if (question.mediaFile && typeof question.mediaFile === 'string') {
            return question.mediaFile.endsWith('.mp4') ? 'video' : 'audio';
        }
        // Default to audio
        return 'audio';
    };

    const currentMediaType = getCurrentMediaType();

    return (
        <div className={showDifficultyBadge ? `${styles.difficulty_question_box} ${difficultyClass}` : ''}>
            {showDifficultyBadge && difficultyLevel && (
                <div className={`${styles.difficulty_badge} ${badgeClass}`}>
                    {difficultyLevel}
                </div>
            )}
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

            {/* Media Type Toggle */}
            <div className={styles.media_toggle_container}>
                <label className={styles.answerEditLabel}>Media Type</label>
                <div className={styles.toggle_buttons}>
                    <button
                        type="button"
                        className={`${styles.toggle_button} ${currentMediaType === 'audio' ? styles.active : ''}`}
                        onClick={() => handleQuestionChange(index, 'mediaType', 'audio')}
                    >
                        Audio
                    </button>
                    <button
                        type="button"
                        className={`${styles.toggle_button} ${currentMediaType === 'video' ? styles.active : ''}`}
                        onClick={() => handleQuestionChange(index, 'mediaType', 'video')}
                    >
                        Video
                    </button>
                </div>

                {(currentMediaType === 'video') ? (
                    <>
                        <label className={styles.answerEditLabel}>Upload Video File</label>
                        <input
                            type="file"
                            accept="video/*"
                            onChange={(e) => handleQuestionChange(index, 'mediaFile', e.target.files)}
                        />
                    </>
                ) : (
                    <>
                        <label className={styles.answerEditLabel}>Upload Audio File</label>
                        <input
                            type="file"
                            accept="audio/*"
                            onChange={(e) => handleQuestionChange(index, 'mediaFile', e.target.files)}
                        />
                    </>
                )}
            </div>

            {question.mediaFile && (
                <div className={styles.mediaSection}>
                    <label className={styles.answerEditLabel}>Current Media File:</label>
                    {question.mediaFile && typeof question.mediaFile === 'string' && question.mediaFile.endsWith('.mp4') ? (
                        <video controls className={styles.video}>
                            <source src={question.mediaFile} type="video/mp4" />
                        </video>
                    ) : (
                        <audio controls src={question.mediaFile} className={styles.audio}></audio>
                    )}
                </div>
            )}

            {/* Custom Feedback Section for listenAndSpeak */}
            <div className={styles.custom_feedback_section}>
                <h5 className={styles.feedback_title}>Custom Feedback</h5>

                <div className={styles.form_group}>
                    <div className={styles.checkbox_wrapper}>
                        <div className={styles.custom_checkbox_container}>
                            <input
                                className={styles.custom_checkbox}
                                type="checkbox"
                                onChange={(e) => handleQuestionChange(index, 'enableCustomFeedbackText', e.target.checked)}
                                checked={question.enableCustomFeedbackText || false}
                                name="enableCustomFeedbackText"
                                id={`enableCustomFeedbackText-${index}`}
                            />
                            <label className={styles.checkbox_label} htmlFor={`enableCustomFeedbackText-${index}`}>
                                <span className={styles.checkmark}></span>
                                <span className={styles.label_text}>Enable Text Feedback</span>
                            </label>
                        </div>
                    </div>
                    {question.enableCustomFeedbackText && (
                        <input
                            className={styles.edit_input_field}
                            type="text"
                            placeholder="Custom feedback text"
                            value={question.customFeedbackText || ""}
                            onChange={(e) => handleQuestionChange(index, 'customFeedbackText', e.target.value)}
                        />
                    )}
                </div>

                <div className={styles.form_group}>
                    <div className={styles.checkbox_wrapper}>
                        <div className={styles.custom_checkbox_container}>
                            <input
                                className={styles.custom_checkbox}
                                type="checkbox"
                                onChange={(e) => handleQuestionChange(index, 'enableCustomFeedbackImage', e.target.checked)}
                                checked={question.enableCustomFeedbackImage || false}
                                name="enableCustomFeedbackImage"
                                id={`enableCustomFeedbackImage-${index}`}
                            />
                            <label className={styles.checkbox_label} htmlFor={`enableCustomFeedbackImage-${index}`}>
                                <span className={styles.checkmark}></span>
                                <span className={styles.label_text}>Enable Image Feedback</span>
                            </label>
                        </div>
                    </div>
                    {question.enableCustomFeedbackImage && (
                        <>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleQuestionChange(index, 'customFeedbackImage', e.target.files)}
                            />
                            {question.customFeedbackImage && (
                                <div className={styles.mediaSection}>
                                    <label className={styles.answerEditLabel}>Current Feedback Image:</label>
                                    <img
                                        src={typeof question.customFeedbackImage === 'string' ?
                                            question.customFeedbackImage :
                                            (question.customFeedbackImage instanceof File ?
                                                URL.createObjectURL(question.customFeedbackImage) :
                                                question.customFeedbackImage)}
                                        className={styles.imageSmall}
                                        alt="Feedback"
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className={styles.form_group}>
                    <div className={styles.checkbox_wrapper}>
                        <div className={styles.custom_checkbox_container}>
                            <input
                                className={styles.custom_checkbox}
                                type="checkbox"
                                onChange={(e) => handleQuestionChange(index, 'enableCustomFeedbackAudio', e.target.checked)}
                                checked={question.enableCustomFeedbackAudio || false}
                                name="enableCustomFeedbackAudio"
                                id={`enableCustomFeedbackAudio-${index}`}
                            />
                            <label className={styles.checkbox_label} htmlFor={`enableCustomFeedbackAudio-${index}`}>
                                <span className={styles.checkmark}></span>
                                <span className={styles.label_text}>Enable Audio Feedback</span>
                            </label>
                        </div>
                    </div>
                    {question.enableCustomFeedbackAudio && (
                        <>
                            <input
                                type="file"
                                accept="audio/*"
                                onChange={(e) => handleQuestionChange(index, 'customFeedbackAudio', e.target.files)}
                            />
                            {question.customFeedbackAudio && (
                                <div className={styles.mediaSection}>
                                    <label className={styles.answerEditLabel}>Current Feedback Audio:</label>
                                    <audio
                                        controls
                                        src={typeof question.customFeedbackAudio === 'string' ?
                                            question.customFeedbackAudio :
                                            (question.customFeedbackAudio instanceof File ?
                                                URL.createObjectURL(question.customFeedbackAudio) :
                                                question.customFeedbackAudio)}
                                        className={styles.audio}
                                    ></audio>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ListenAndSpeakEdit; 