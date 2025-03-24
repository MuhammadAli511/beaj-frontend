import React, { useEffect } from 'react';
import styles from './SpeakQuestionModal.module.css';

const SpeakQuestionModal = ({ lesson, onClose, activity }) => {
    const sortedQuestions = [...lesson.speakActivityQuestionFiles].sort((a, b) => a.questionNumber - b.questionNumber);

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
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.table_heading}>Question Number</th>
                            {activity === 'watchAndSpeak' && (
                                <>
                                    <th className={styles.table_heading}>Question</th>
                                    <th className={styles.table_heading}>Answer</th>
                                    <th className={styles.table_heading}>Video</th>
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
                        </tr>
                    </thead>
                    <tbody className={styles.table_body}>
                        {sortedQuestions.map((question) => (
                            <tr key={question.id} className={styles.table_row}>
                                {activity === 'watchAndSpeak' && (
                                    <>
                                        <td style={{ width: "5%" }}>{question.questionNumber}</td>
                                        <td style={{ width: "20%" }}>{question.question}</td>
                                        <td style={{ width: "35%" }}>{question.answer.join(', ')}</td>
                                        <td style={{ width: "100%" }}>
                                            <video controls className={styles.video}>
                                                <source src={question.mediaFile} type="video/mp4" />
                                            </video>
                                        </td>
                                    </>
                                )}
                                {activity === 'watchAndAudio' && (
                                    <>
                                        <td style={{ width: "5%" }}>{question.questionNumber}</td>
                                        <td style={{ width: "100%" }}>
                                            <video controls className={styles.video}>
                                                <source src={question.mediaFile} type="video/mp4" />
                                            </video>
                                        </td>
                                    </>
                                )}
                                {activity === 'watchAndImage' && (
                                    <>
                                        <td style={{ width: "5%" }}>{question.questionNumber}</td>
                                        <td style={{ width: "100%" }}>
                                            <video controls className={styles.video}>
                                                <source src={question.mediaFile} type="video/mp4" />
                                            </video>
                                        </td>
                                    </>
                                )}
                                {(activity == 'listenAndSpeak') && (
                                    <>
                                        <td style={{ width: "5%" }}>{question.questionNumber}</td>
                                        <td style={{ width: "20%" }}>{question.question}</td>
                                        <td style={{ width: "35%" }}>{question.answer.join(', ')}</td>
                                        <td style={{ width: "100%" }}>
                                            {question.mediaFile && question.mediaFile.endsWith('.mp4') ? (
                                                <video controls className={styles.video}>
                                                    <source src={question.mediaFile} type="video/mp4" />
                                                </video>
                                            ) : (
                                                <audio controls>
                                                    <source src={question.mediaFile} type="audio/mp3" />
                                                </audio>
                                            )}
                                        </td>
                                    </>
                                )}
                                {activity == 'conversationalQuestionsBot' && (
                                    <>
                                        <td style={{ width: "5%" }}>{question.questionNumber}</td>
                                        <td style={{ width: "100%" }}>
                                            <audio controls>
                                                <source src={question.mediaFile} type="audio/mp3" />
                                            </audio>
                                        </td>
                                    </>
                                )}
                                {activity == 'conversationalMonologueBot' && (
                                    <>
                                        <td style={{ width: "5%" }}>{question.questionNumber}</td>
                                        <td style={{ width: "50%" }}>{question.question}</td>
                                        <td style={{ width: "100%" }}>
                                            <video controls className={styles.video}>
                                                <source src={question.mediaFile} type="video/mp4" />
                                            </video>
                                        </td>
                                    </>
                                )}
                                {activity == 'conversationalAgencyBot' && (
                                    <>
                                        <td style={{ width: "5%" }}>{question.questionNumber}</td>
                                        <td style={{ width: "100%" }}>
                                            {question.question}
                                        </td>
                                        <td style={{ width: "100%" }}>
                                            <audio controls>
                                                <source src={question.mediaFile} type="audio/mp3" />
                                            </audio>
                                        </td>
                                    </>
                                )}
                                {activity === 'speakingPractice' && (
                                    <>
                                        <td style={{ width: "5%" }}>{question.questionNumber}</td>
                                        <td style={{ width: "100%" }}>
                                            <audio controls>
                                                <source src={question.mediaFile} type="audio/mp3" />
                                            </audio>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div >
        </div >
    );
};

export default SpeakQuestionModal;
