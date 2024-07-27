import React from 'react';
import styles from './SpeakQuestionModal.module.css';

const SpeakQuestionModal = ({ lesson, onClose, activity }) => {
    const sortedQuestions = [...lesson.speakActivityQuestionFiles].sort((a, b) => a.questionNumber - b.questionNumber);

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
                            {activity !== 'watchAndSpeak' && <th className={styles.table_heading}>Question</th>}
                            {activity !== 'watchAndSpeak' && <th className={styles.table_heading}>Answer</th>}
                            <th className={styles.table_heading}>{activity === 'watchAndSpeak' ? 'Video' : 'Audio'}</th>
                        </tr>
                    </thead>
                    <tbody className={styles.table_body}>
                        {sortedQuestions.map((question) => (
                            <tr key={question.id} className={styles.table_row}>
                                {activity === 'watchAndSpeak' ? (
                                    <>
                                        <td style={{ width: "5%" }}>{question.questionNumber}</td>
                                        <td style={{ width: "100%" }}>
                                            <video controls className={styles.video}>
                                                <source src={question.mediaFile} type="video/mp4" />
                                            </video>
                                        </td>
                                    </>

                                ) : (
                                    <>
                                        <td style={{ width: "5%" }}>{question.questionNumber}</td>
                                        <td style={{ width: "20%" }}>{question.question}</td>
                                        <td style={{ width: "35%" }}>{question.answer.join(', ')}</td>
                                        <td style={{ width: "100%" }}>
                                            <audio controls>
                                                <source src={question.mediaFile} type="audio/mp4" />
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
