import React, { useEffect } from 'react';
import styles from './SpeakQuestionModal.module.css';

// Reusable component for custom feedback cells
const CustomFeedbackCells = ({ question }) => (
    <>
        <td style={{ width: "15%" }}>
            {question.customFeedbackText || 'N/A'}
        </td>
        <td style={{ width: "15%" }}>
            {question.customFeedbackImage ? (
                <img src={question.customFeedbackImage} alt="Custom Feedback" className={styles.image} />
            ) : 'N/A'}
        </td>
        <td style={{ width: "15%" }}>
            {question.customFeedbackAudio ? (
                <audio controls>
                    <source src={question.customFeedbackAudio} type="audio/mp3" />
                </audio>
            ) : 'N/A'}
        </td>
    </>
);

const SpeakQuestionModal = ({ lesson, onClose, activity }) => {
    const sortedQuestions = lesson?.speakActivityQuestionFiles 
        ? [...lesson.speakActivityQuestionFiles].sort((a, b) => {
            // Sort by question number first, then by difficulty level if present
            if (a.questionNumber !== b.questionNumber) {
                return a.questionNumber - b.questionNumber;
            }
            // If both have difficulty levels, sort by difficulty (easy, medium, hard)
            if (a.difficultyLevel && b.difficultyLevel) {
                const difficultyOrder = { 'easy': 1, 'medium': 2, 'hard': 3 };
                return (difficultyOrder[a.difficultyLevel] || 0) - (difficultyOrder[b.difficultyLevel] || 0);
            }
            return 0;
        })
        : lesson?.documentFiles 
            ? [...lesson.documentFiles].sort((a, b) => a.questionNumber - b.questionNumber)
            : [];
    
    // Check if any question has difficulty level to determine if we should show the difficulty column
    const hasDifficultyLevels = sortedQuestions.some(q => q.difficultyLevel);
    
    // Check if any question has custom feedback to determine if we should show feedback columns
    const hasCustomFeedback = sortedQuestions.some(q => 
        q.customFeedbackText || q.customFeedbackImage || q.customFeedbackAudio
    );

    useEffect(() => {
        const handleEscapeKey = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscapeKey);

        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [onClose]);

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2>Questions for Lesson {lesson.LessonId}</h2>
                    <button onClick={onClose} className={styles.closeButton}>Close</button>
                </div>
                <div className={`${styles.tableContainer} ${styles.tableContainer_scrollable}`}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.table_heading}>
                                    {hasDifficultyLevels ? 'Question Number & Difficulty' : 'Question Number'}
                                </th>
                                {activity === 'feedbackAudio' && (
                                    <>
                                        <th className={styles.table_heading}>Question</th>
                                        <th className={styles.table_heading}>Audio</th>
                                    </>
                                )}
                                {(activity === 'watchAndSpeak' || activity === 'assessmentWatchAndSpeak') && (
                                    <>
                                        <th className={styles.table_heading}>Question</th>
                                        <th className={styles.table_heading}>Answer</th>
                                        <th className={styles.table_heading}>Video</th>
                                        <th className={styles.table_heading}>Image</th>
                                    </>
                                )}
                                {activity === 'watchAndAudio' && (
                                    <>
                                        <th className={styles.table_heading}>Video</th>
                                    </>
                                )}
                                {activity === 'watchAndImage' && (
                                    <>
                                        <th className={styles.table_heading}>Video</th>
                                    </>
                                )}
                                {(activity === 'listenAndSpeak') && (
                                    <>
                                        <th className={styles.table_heading}>Question</th>
                                        <th className={styles.table_heading}>Answer</th>
                                        <th className={styles.table_heading}>Media</th>
                                    </>
                                )}
                                {activity === 'conversationalQuestionsBot' && (
                                    <th className={styles.table_heading}>Audio</th>
                                )}
                                {activity === 'conversationalMonologueBot' && (
                                    <>
                                        <th className={styles.table_heading}>Question Text</th>
                                        <th className={styles.table_heading}>Video</th>
                                    </>
                                )}
                                {activity === 'conversationalAgencyBot' && (
                                    <>
                                        <th className={styles.table_heading}>Prompt</th>
                                        <th className={styles.table_heading}>Audio</th>
                                    </>
                                )}
                                {activity === 'speakingPractice' && (
                                    <th className={styles.table_heading}>Audio</th>
                                )}
                                {hasCustomFeedback && (
                                    <>
                                        <th className={styles.table_heading}>Custom Text Feedback</th>
                                        <th className={styles.table_heading}>Custom Image Feedback</th>
                                        <th className={styles.table_heading}>Custom Audio Feedback</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody className={styles.table_body}>
                            {sortedQuestions.map((question) => (
                                <tr key={question.id} className={styles.table_row}>
                                    {activity === 'feedbackAudio' && (
                                        <>
                                            <td style={{ width: "5%" }}>
                                                {hasDifficultyLevels ? 
                                                    `${question.questionNumber} - ${question.difficultyLevel ? question.difficultyLevel.charAt(0).toUpperCase() + question.difficultyLevel.slice(1) : 'N/A'}` : 
                                                    question.questionNumber
                                                }
                                            </td>
                                            <td style={{ width: "20%" }}>{question.question}</td>
                                            <td style={{ width: "50%" }}>
                                                <audio controls>
                                                    <source src={question.mediaFile} type="audio/mp3" />
                                                </audio>
                                            </td>
                                            {hasCustomFeedback && (
                                                <CustomFeedbackCells question={question} />
                                            )}
                                        </>
                                    )}
                                    {(activity === 'watchAndSpeak' || activity === 'assessmentWatchAndSpeak') && (
                                        <>
                                            <td style={{ width: "5%" }}>
                                                {hasDifficultyLevels ? 
                                                    `${question.questionNumber} - ${question.difficultyLevel ? question.difficultyLevel.charAt(0).toUpperCase() + question.difficultyLevel.slice(1) : 'N/A'}` : 
                                                    question.questionNumber
                                                }
                                            </td>
                                            <td style={{ width: "20%" }}>{question.question}</td>
                                            <td style={{ width: "35%" }}>{question.answer.join(', ')}</td>
                                            <td style={{ width: "100%" }}>
                                                <video controls className={styles.video}>
                                                    <source src={question.mediaFile} type="video/mp4" />
                                                </video>
                                            </td>
                                            <td style={{ width: "20%" }}>
                                                {question.mediaFileSecond && (
                                                    <img src={question.mediaFileSecond} alt="Image" className={styles.image} />
                                                ) || (
                                                    <p>No Image</p>
                                                )}
                                            </td>
                                            {hasCustomFeedback && (
                                                <CustomFeedbackCells question={question} />
                                            )}
                                        </>
                                    )}
                                    {activity === 'watchAndAudio' && (
                                        <>
                                            <td style={{ width: "5%" }}>
                                                {hasDifficultyLevels ? 
                                                    `${question.questionNumber} - ${question.difficultyLevel ? question.difficultyLevel.charAt(0).toUpperCase() + question.difficultyLevel.slice(1) : 'N/A'}` : 
                                                    question.questionNumber
                                                }
                                            </td>
                                            <td style={{ width: "100%" }}>
                                                <video controls className={styles.video}>
                                                    <source src={question.mediaFile} type="video/mp4" />
                                                </video>
                                            </td>
                                            {hasCustomFeedback && (
                                                <CustomFeedbackCells question={question} />
                                            )}
                                        </>
                                    )}
                                    {activity === 'watchAndImage' && (
                                        <>
                                            <td style={{ width: "5%" }}>
                                                {hasDifficultyLevels ? 
                                                    `${question.questionNumber} - ${question.difficultyLevel ? question.difficultyLevel.charAt(0).toUpperCase() + question.difficultyLevel.slice(1) : 'N/A'}` : 
                                                    question.questionNumber
                                                }
                                            </td>
                                            <td style={{ width: "100%" }}>
                                                <video controls className={styles.video}>
                                                    <source src={question.mediaFile} type="video/mp4" />
                                                </video>
                                            </td>
                                            {hasCustomFeedback && (
                                                <CustomFeedbackCells question={question} />
                                            )}
                                        </>
                                    )}
                                    {(activity === 'listenAndSpeak') && (
                                        <>
                                            <td style={{ width: "5%" }}>
                                                {hasDifficultyLevels ? 
                                                    `${question.questionNumber} - ${question.difficultyLevel ? question.difficultyLevel.charAt(0).toUpperCase() + question.difficultyLevel.slice(1) : 'N/A'}` : 
                                                    question.questionNumber
                                                }
                                            </td>
                                            <td style={{ width: "20%" }}>{question.question}</td>
                                            <td style={{ width: "35%" }}>{question.answer.join(', ')}</td>
                                            <td style={{ width: "100%" }}>
                                                {question.mediaFile && (typeof question.mediaFile === 'string' && question.mediaFile.endsWith('.mp4')) ? (
                                                    <video controls className={styles.video}>
                                                        <source src={question.mediaFile} type="video/mp4" />
                                                    </video>
                                                ) : question.mediaFile ? (
                                                    <audio controls>
                                                        <source src={question.mediaFile} type="audio/mp3" />
                                                    </audio>
                                                ) : (
                                                    <p>No Media</p>
                                                )}
                                            </td>
                                            {hasCustomFeedback && (
                                                <CustomFeedbackCells question={question} />
                                            )}
                                        </>
                                    )}
                                    {activity == 'conversationalQuestionsBot' && (
                                        <>
                                            <td style={{ width: "5%" }}>
                                                {hasDifficultyLevels ? 
                                                    `${question.questionNumber} - ${question.difficultyLevel ? question.difficultyLevel.charAt(0).toUpperCase() + question.difficultyLevel.slice(1) : 'N/A'}` : 
                                                    question.questionNumber
                                                }
                                            </td>
                                            <td style={{ width: "100%" }}>
                                                <audio controls>
                                                    <source src={question.mediaFile} type="audio/mp3" />
                                                </audio>
                                            </td>
                                            {hasCustomFeedback && (
                                                <CustomFeedbackCells question={question} />
                                            )}
                                        </>
                                    )}
                                    {activity == 'conversationalMonologueBot' && (
                                        <>
                                            <td style={{ width: "5%" }}>
                                                {hasDifficultyLevels ? 
                                                    `${question.questionNumber} - ${question.difficultyLevel ? question.difficultyLevel.charAt(0).toUpperCase() + question.difficultyLevel.slice(1) : 'N/A'}` : 
                                                    question.questionNumber
                                                }
                                            </td>
                                            <td style={{ width: "50%" }}>{question.question}</td>
                                            <td style={{ width: "100%" }}>
                                                <video controls className={styles.video}>
                                                    <source src={question.mediaFile} type="video/mp4" />
                                                </video>
                                            </td>
                                            {hasCustomFeedback && (
                                                <CustomFeedbackCells question={question} />
                                            )}
                                        </>
                                    )}
                                    {activity === 'conversationalAgencyBot' && (
                                        <>
                                            <td style={{ width: "5%" }}>
                                                {hasDifficultyLevels ? 
                                                    `${question.questionNumber} - ${question.difficultyLevel ? question.difficultyLevel.charAt(0).toUpperCase() + question.difficultyLevel.slice(1) : 'N/A'}` : 
                                                    question.questionNumber
                                                }
                                            </td>
                                            <td style={{ width: "100%" }}>
                                                {question.question}
                                            </td>
                                            <td style={{ width: "100%" }}>
                                                <audio controls>
                                                    <source src={question.mediaFile} type="audio/mp3" />
                                                </audio>
                                            </td>
                                            {hasCustomFeedback && (
                                                <CustomFeedbackCells question={question} />
                                            )}
                                        </>
                                    )}
                                    {activity === 'speakingPractice' && (
                                        <>
                                            <td style={{ width: "5%" }}>
                                                {hasDifficultyLevels ? 
                                                    `${question.questionNumber} - ${question.difficultyLevel ? question.difficultyLevel.charAt(0).toUpperCase() + question.difficultyLevel.slice(1) : 'N/A'}` : 
                                                    question.questionNumber
                                                }
                                            </td>
                                            <td style={{ width: "100%" }}>
                                                <audio controls>
                                                    <source src={question.mediaFile} type="audio/mp3" />
                                                </audio>
                                            </td>
                                            {hasCustomFeedback && (
                                                <CustomFeedbackCells question={question} />
                                            )}
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SpeakQuestionModal;
