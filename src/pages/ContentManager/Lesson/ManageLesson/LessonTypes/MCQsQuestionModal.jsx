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
                            <th className={styles.table_heading}>No.</th>
                            <th className={styles.table_heading}>Question</th>
                            <th className={styles.table_heading}>Question Image</th>
                            <th className={styles.table_heading}>Question Video</th>
                            <th className={styles.table_heading}>Options</th>
                            <th className={styles.table_heading}>Custom Answer Feedback</th>
                        </tr>
                    </thead>
                    <tbody className={styles.table_body}>
                        {sortedQuestions.map((question) => (
                            <tr key={question.dataValues.Id} className={styles.table_row}>
                                <td style={{ width: "5%" }}>{question.dataValues.QuestionNumber}</td>
                                <td style={{ width: "20%" }}>{question.dataValues.QuestionText}</td>
                                {question.dataValues.QuestionImageUrl && (
                                    <td style={{ width: "20%", maxWidth: "200px" }}>
                                        <div style={{ width: "100%", textAlign: "center" }}>
                                            <img src={question.dataValues.QuestionImageUrl} alt="Question" className={styles.questionImage} />
                                        </div>
                                    </td>
                                )}
                                {question.dataValues.QuestionVideoUrl && (
                                    <td style={{ width: "20%", maxWidth: "200px" }}>
                                        <div style={{ width: "100%", textAlign: "center" }}>
                                            <video src={question.dataValues.QuestionVideoUrl} alt="Question" className={styles.questionVideo} />
                                        </div>
                                    </td>
                                )}
                                <td style={{ width: "20%" }}>
                                    {question.multipleChoiceQuestionAnswers.map((answer) => (
                                        <div key={answer.Id} className={styles.answer}>
                                            {answer.AnswerText && <span style={{ fontWeight: answer.IsCorrect ? "bold" : "normal" }}>{answer.AnswerText}</span>}
                                        </div>
                                    ))}
                                </td>
                                <td style={{ width: "15%" }}>
                                    {question.multipleChoiceQuestionAnswers.map((answer) => (
                                        <div key={answer.Id} className={styles.answer}>
                                            {answer.CustomAnswerFeedbackText && <span>{answer.CustomAnswerFeedbackText}</span>}
                                        </div>
                                    ))}
                                </td>
                                <td style={{ width: "15%" }}>
                                    {question.multipleChoiceQuestionAnswers.map((answer) => (
                                        <div key={answer.Id} className={styles.answer}>
                                            {answer.CustomAnswerFeedbackImage && <img src={answer.CustomAnswerFeedbackImage} alt="Custom Answer Feedback" className={styles.answerImage} />}
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
