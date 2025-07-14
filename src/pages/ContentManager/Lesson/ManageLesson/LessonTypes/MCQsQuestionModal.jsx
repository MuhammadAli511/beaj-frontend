import React, { useEffect, useState } from 'react';
import styles from './MCQsQuestionModal.module.css';

const MCQsQuestionModal = ({ lesson, onClose }) => {
    const sortedQuestions = [...lesson.multipleChoiceQuestions].sort((a, b) => a.dataValues.QuestionNumber - b.dataValues.QuestionNumber);
    const [enlargedImage, setEnlargedImage] = useState(null);

    useEffect(() => {
        const handleEscapeKey = (event) => {
            if (event.key === 'Escape') {
                if (enlargedImage) {
                    setEnlargedImage(null);
                } else {
                    onClose();
                }
            }
        };

        document.addEventListener('keydown', handleEscapeKey);

        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [onClose, enlargedImage]);

    const handleImageClick = (imageUrl) => {
        setEnlargedImage(imageUrl);
    };

    const closeImageModal = () => {
        setEnlargedImage(null);
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2>MCQs for Lesson {lesson.LessonId}</h2>
                    <button onClick={onClose} className={styles.closeButton}>Close</button>
                </div>
                <div className={`${styles.tableContainer} ${styles.tableContainer_scrollable}`}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.table_heading}>No.</th>
                                <th className={styles.table_heading}>Question</th>
                                <th className={styles.table_heading}>Question Image</th>
                                <th className={styles.table_heading}>Question Video</th>
                                <th className={styles.table_heading}>Options</th>
                                <th className={styles.table_heading}>Custom Answer Feedback Text</th>
                                <th className={styles.table_heading}>Custom Answer Feedback Image</th>
                                <th className={styles.table_heading}>Custom Answer Feedback Audio</th>
                            </tr>
                        </thead>
                        <tbody className={styles.table_body}>
                            {sortedQuestions.map((question) => (
                                <tr key={question.dataValues.Id} className={styles.table_row}>
                                    <td style={{ width: "5%" }}>{question.dataValues.QuestionNumber}</td>
                                    <td style={{ width: "20%" }}>{question.dataValues.QuestionText}</td>
                                    {question.dataValues.QuestionImageUrl && (
                                        <td style={{ width: "20%" }}>
                                            <img 
                                                src={question.dataValues.QuestionImageUrl} 
                                                alt="Question" 
                                                className={styles.questionImage} 
                                                onClick={() => handleImageClick(question.dataValues.QuestionImageUrl)}
                                                title="Click to enlarge"
                                            />
                                        </td>
                                    ) || (
                                        <td style={{ width: "20%" }}>
                                            <p style={{ color: "red" }}>No Image</p>
                                        </td>
                                    )}
                                    {question.dataValues.QuestionVideoUrl && (
                                        <td style={{ width: "20%" }}>
                                            <video controls className={styles.questionVideo}>
                                                <source src={question.dataValues.QuestionVideoUrl} type="video/mp4" />
                                            </video>
                                        </td>
                                    ) || (
                                        <td style={{ width: "20%" }}>
                                            <p style={{ color: "red" }}>No Video</p>
                                        </td>
                                    )}
                                    <td style={{ width: "20%" }} className={styles.scrollableCell}>
                                        {question.multipleChoiceQuestionAnswers?.map((answer, index) => {
                                            const answerText = answer.dataValues?.answerText || 
                                                             answer.dataValues?.AnswerText || 
                                                             answer.answerText || 
                                                             answer.AnswerText;
                                            const isCorrect = answer.dataValues?.IsCorrect || 
                                                            answer.dataValues?.isCorrect || 
                                                            answer.IsCorrect || 
                                                            answer.isCorrect;

                                            return (
                                                <div key={answer.Id || index} className={styles.answer}>
                                                    {answerText && (
                                                        <span style={{ 
                                                            fontWeight: isCorrect ? "bold" : "normal",
                                                            color: isCorrect ? "green" : "inherit"
                                                        }}>
                                                            {/* {index + 1}.  */}
                                                            {answerText}
                                                            {/* {isCorrect && " ✓"} */}
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
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
                                                {answer.CustomAnswerFeedbackImage && (
                                                    <img 
                                                        src={answer.CustomAnswerFeedbackImage} 
                                                        alt="Custom Answer Feedback" 
                                                        className={styles.answerImage} 
                                                        onClick={() => handleImageClick(answer.CustomAnswerFeedbackImage)}
                                                        title="Click to enlarge"
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </td>
                                    <td style={{ width: "15%" }}>
                                        {question.multipleChoiceQuestionAnswers.map((answer) => (
                                            <div key={answer.Id} className={styles.answer}>
                                                {answer.CustomAnswerFeedbackAudio && <audio src={answer.CustomAnswerFeedbackAudio} controls className={styles.answerAudio} />}
                                            </div>
                                        ))}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className={styles.modalFooter}>
                    <button onClick={onClose} className={styles.closeButton}>Close</button>
                </div>
            </div>
            
            {enlargedImage && (
                <div className={styles.imageModalOverlay} onClick={closeImageModal}>
                    <div className={styles.imageModalContent} onClick={(e) => e.stopPropagation()}>
                        <button className={styles.imageCloseButton} onClick={closeImageModal}>
                            Close
                        </button>
                        <img 
                            src={enlargedImage} 
                            alt="Enlarged view" 
                            className={styles.enlargedImage}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default MCQsQuestionModal;
