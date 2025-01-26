import React, { useEffect } from 'react';
import styles from './MCQsQuestionModal.module.css';

const MCQsQuestionModal = ({ lesson, onClose }) => {
    const sortedQuestions = [...lesson.multipleChoiceQuestions].sort((a, b) => a.dataValues.QuestionNumber - b.dataValues.QuestionNumber);

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
                    <h2>MCQs for Lesson {lesson.LessonId}</h2>
                    <button onClick={onClose} className={styles.closeButton}>Close</button>
                </div>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.table_heading}>Question Number</th>
                            <th className={styles.table_heading}>Question</th>
                            <th className={styles.table_heading}>Options</th>
                        </tr>
                    </thead>
                    <tbody className={styles.table_body}>
                        {sortedQuestions.map((question) => (
                            <tr key={question.dataValues.Id} className={styles.table_row}>
                                <td style={{ width: "5%" }}>{question.dataValues.QuestionNumber}</td>
                                <td style={{ width: "45%" }}>{question.dataValues.QuestionText}</td>
                                <td style={{ width: "50%" }}>
                                    {question.multipleChoiceQuestionAnswers.map((answer) => (
                                        <div key={answer.Id} className={styles.answer}>
                                            {answer.AnswerText && <span style={{ fontWeight: answer.IsCorrect ? "bold" : "normal" }}>{answer.AnswerText}</span>}
                                            {answer.AnswerImageUrl !== "null" && answer.AnswerImageUrl !== null && (
                                                <img src={answer.AnswerImageUrl} alt="Answer" className={styles.answerImage} />
                                            )}
                                            {answer.AnswerAudioUrl !== "null" && answer.AnswerImageUrl !== null && (
                                                <audio controls className={styles.answerAudio}>
                                                    <source src={answer.AnswerAudioUrl} type="audio/mp4" />
                                                </audio>
                                            )}
                                        </div>
                                    ))}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MCQsQuestionModal;
