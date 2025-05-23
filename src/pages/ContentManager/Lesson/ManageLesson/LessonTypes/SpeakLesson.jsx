import React, { useState, useEffect } from 'react';
import {
    getLessonsByActivity,
    getLessonById,
    deleteLesson,
    getAllCourses,
    getAllActivityAliases,
    updateLesson,
    updateSpeakActivityQuestion,
    deleteSpeakActivityQuestion,
    createSpeakActivityQuestion,
    migrateLesson,
    testLesson
} from "../../../../../helper";
import edit from '../../../../../assets/images/edit.svg';
import deleteIcon from '../../../../../assets/images/delete.svg';
import styles from './SpeakLesson.module.css';
import SpeakQuestionModal from './SpeakQuestionModal';
import MigrateLessonModal from "../../../../../components/MigrateLessonModal/MigrateLessonModal";
import TestLessonModal from "../../../../../components/TestLessonModal/TestLessonModal";


const EditSpeakLessonModal = ({ isOpen, onClose, lesson, onSave, activity }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [lessonData, setLessonData] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [courses, setCourses] = useState([]);
    const [activityAliases, setActivityAliases] = useState([]);

    useEffect(() => {
        if (lesson) {
            try {
                setIsLoading(true);
                fetchAllData();
            } catch (error) {
                alert(error);
            } finally {
                setIsLoading(false);
            }
        }
    }, [isOpen, lesson]);

    const fetchLessonData = async () => {
        try {
            const lessonResponse = await getLessonById(lesson.LessonId);
            if (lessonResponse.status === 200) {
                const fetchedQuestions = lessonResponse.data.speakActivityQuestionFiles || [];
                setLessonData(lessonResponse.data);
                setQuestions(fetchedQuestions.sort((a, b) => a.questionNumber - b.questionNumber));
            } else {
                alert(lessonResponse.data.message);
            }
        } catch (error) {
            alert(error);
        }
    };

    const fetchCourses = async () => {
        try {
            const response = await getAllCourses();
            if (response.status === 200) {
                setCourses(response.data);
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            alert(error);
        }
    };

    const fetchActivityAliases = async () => {
        try {
            const aliasesResponse = await getAllActivityAliases();
            if (aliasesResponse.status === 200) {
                const filteredAliases = aliasesResponse.data.sort((a, b) => a.Alias.localeCompare(b.Alias));
                setActivityAliases(filteredAliases);
            } else {
                alert(aliasesResponse.data.message);
            }
        } catch (error) {
            alert(error);
        }
    };

    const fetchAllData = async () => {
        await Promise.all([
            fetchCourses(),
            fetchLessonData(),
            fetchActivityAliases(),
        ]);
    };

    const handleCancel = () => {
        setLessonData(null);
        setCourses([]);
        setActivityAliases([]);
        onClose();
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);

            // Update the lesson attributes
            const updatedLessonData = {
                ...lessonData,
                CourseId: document.getElementById("course_id").value,
                SequenceNumber: document.getElementById("sequenceNumber").value,
                weekNumber: document.getElementById("weekNumber").value,
                dayNumber: document.getElementById("dayNumber").value,
                Alias: document.getElementById("activity_alias").value,
                status: document.getElementById("status").value
            };

            // Save the updated lesson data
            const updateLessonResponse = await updateLesson(
                updatedLessonData.LessonId,
                updatedLessonData.lessonType,
                updatedLessonData.dayNumber,
                updatedLessonData.activity,
                updatedLessonData.Alias,
                updatedLessonData.weekNumber,
                updatedLessonData.text,
                updatedLessonData.CourseId,
                updatedLessonData.SequenceNumber,
                updatedLessonData.status
            );

            if (updateLessonResponse.status !== 200) {
                alert(updateLessonResponse.data.message);
                return;
            }

            // Filter and handle changed questions
            const changedQuestions = questions.filter(question => question.isChanged);

            for (let question of changedQuestions) {
                const formattedAnswers = question.answer ? question.answer.map(ans => `"${ans.replace(/"/g, '\\"')}"`).join(',') : "";
                
                if (question.id) {
                    // Handle mediaFile/video/audio fields - only pass the File object if it's a new upload
                    // If it's a string (URL), pass the the link to keep the existing file not null
                    const mediaFile = question.mediaFile && typeof question.mediaFile !== 'string' ? question.mediaFile : question.mediaFile;
                    const mediaFileSecond = question.mediaFileSecond && typeof question.mediaFileSecond !== 'string' ? question.mediaFileSecond : question.mediaFileSecond;
                    const audio = question.audio && typeof question.audio !== 'string' ? question.audio : question.audio;
                    
                    // For speakingPractice activity, update with audio
                    if (updatedLessonData.activity === 'speakingPractice') {
                        const updateResponse = await updateSpeakActivityQuestion(
                            question.id,
                            question.question || "",
                            audio, // Pass audio as video parameter for speakingPractice
                            null, // No image
                            formattedAnswers,
                            lesson.LessonId,
                            question.questionNumber,
                            updatedLessonData.activity
                        );

                        if (updateResponse.status !== 200) {
                            alert(updateResponse.data.message);
                            return;
                        }
                    } else {
                        // For other activities, update with mediaFile/mediaFileSecond
                        const updateResponse = await updateSpeakActivityQuestion(
                            question.id,
                            question.question || "",
                            mediaFile,
                            mediaFileSecond,
                            formattedAnswers,
                            lesson.LessonId,
                            question.questionNumber,
                            updatedLessonData.activity
                        );

                        if (updateResponse.status !== 200) {
                            alert(updateResponse.data.message);
                            return;
                        }
                    }
                } else {
                    // Create new question logic - no changes needed here
                    // For speakingPractice activity
                    if (updatedLessonData.activity === 'speakingPractice') {
                        const createResponse = await createSpeakActivityQuestion(
                            question.question || "",
                            question.audio, // Use audio for speakingPractice
                            null, // No image
                            formattedAnswers,
                            lesson.LessonId,
                            question.questionNumber,
                            updatedLessonData.activity
                        );

                        if (createResponse.status !== 200) {
                            alert(createResponse.data.message);
                            return;
                        }
                    } else {
                        // For other activities
                        const createResponse = await createSpeakActivityQuestion(
                            question.question || "",
                            question.mediaFile,
                            question.mediaFileSecond,
                            formattedAnswers,
                            lesson.LessonId,
                            question.questionNumber,
                            updatedLessonData.activity
                        );

                        if (createResponse.status !== 200) {
                            alert(createResponse.data.message);
                            return;
                        }
                    }
                }
            }

            alert("Lesson and updated questions saved successfully!");
            onSave();
        } catch (error) {
            alert(error);
        } finally {
            setIsSaving(false);
            onClose();
        }
    };

    const handleQuestionChange = (index, field, value) => {
        const updatedQuestions = questions.map((question, i) =>
            i === index ? { 
                ...question, 
                [field]: field === 'audio' || field === 'mediaFile' || field === 'mediaFileSecond' ? 
                    (value && value.length > 0 ? value[0] : value) : value, 
                isChanged: true 
            } : question
        );
        setQuestions(updatedQuestions);
    };

    const handleAnswerChange = (questionIndex, answerIndex, value) => {
        const updatedQuestions = questions.map((question, i) => {
            if (i === questionIndex && question.answer) {
                const updatedAnswers = [...question.answer];
                updatedAnswers[answerIndex] = value;
                return { ...question, answer: updatedAnswers, isChanged: true };
            }
            return question;
        });
        setQuestions(updatedQuestions);
    };

    const addNewAnswer = (questionIndex) => {
        const updatedQuestions = questions.map((question, i) => {
            if (i === questionIndex) {
                return { ...question, answer: [...question.answer, ""], isChanged: true };
            }
            return question;
        });
        setQuestions(updatedQuestions);
    };

    const removeAnswer = (questionIndex, answerIndex) => {
        const updatedQuestions = questions.map((question, i) => {
            if (i === questionIndex) {
                const updatedAnswers = question.answer.filter((_, ai) => ai !== answerIndex);
                return { ...question, answer: updatedAnswers, isChanged: true };
            }
            return question;
        });
        setQuestions(updatedQuestions);
    };

    const handleDeleteQuestion = async (questionId, index) => {
        // If questionId is null, it means the question is new and hasn't been saved to the server yet
        if (!questionId) {
            // Remove the question locally without making an API call
            const updatedQuestions = questions.filter((_, i) => i !== index);
            setQuestions(updatedQuestions); // Update the state to remove the question from the UI
            return;
        }

        const isConfirmed = window.confirm("Are you sure you want to delete this question?");
        if (isConfirmed) {
            try {
                const deleteResponse = await deleteSpeakActivityQuestion(questionId);
                if (deleteResponse.status === 200) {
                    const updatedQuestions = questions.filter(q => q.id !== questionId);
                    setQuestions(updatedQuestions); // Update the state after deletion
                    alert("Question deleted successfully");
                } else {
                    alert(deleteResponse.data.message);
                }
            } catch (error) {
                alert(error);
            }
        }
    };

    const addNewQuestion = () => {
        let newQuestion = {
            id: null,
            questionNumber: questions.length + 1,
            isChanged: true,
        };
        if (['listenAndSpeak'].includes(activity)) {
            newQuestion = {
                ...newQuestion,
                question: '',
                mediaFile: null,
                answer: [''],
                mediaType: '',
            };
        } 
        else if (['feedbackAudio'].includes(activity)) {
            newQuestion = {
                    ...newQuestion,
                    question: '',
                    mediaFile: null,
                    answer: [], // Empty array for feedbackAudio
                    mediaType: 'audio',
            };
        }
        else if (activity === 'watchAndSpeak') {
            newQuestion = {
                ...newQuestion,
                question: '',
                mediaFile: null,
                mediaFileSecond: null,
                answer: [''],
            };
        } else if (activity === 'watchAndAudio') {
            newQuestion = {
                ...newQuestion,
                question: '',
                mediaFile: null,
                answer: [''],
            };
        } else if (activity === 'watchAndImage') {
            newQuestion = {
                ...newQuestion,
                question: '',
                mediaFile: null,
                answer: [''],
            };
        } else if (activity === 'conversationalQuestionsBot') {
            newQuestion = {
                ...newQuestion,
                question: '',
            };
        } else if (activity === 'conversationalMonologueBot') {
            newQuestion = {
                ...newQuestion,
                question: '',
            };
        } else if (activity === 'speakingPractice') {
            newQuestion = {
                ...newQuestion,
                audio: '',
            };
        }
        setQuestions([...questions, newQuestion]);
    };

    const sortedCourses = () => {
        if (!lessonData) return courses;
        const sorted = [...courses].sort((a, b) =>
            a.CourseId === lessonData.courseId
                ? -1
                : b.CourseId === lessonData.courseId
                    ? 1
                    : 0
        );
        return sorted;
    };

    const sortedActivityAliases = () => {
        if (!lessonData) return activityAliases;
        const sorted = [...activityAliases].sort((a, b) =>
            a.Alias === lessonData.activityAlias
                ? -1
                : b.Alias === lessonData.activityAlias
                    ? 1
                    : 0
        );
        return sorted;
    };

    return (
        <div>
            {isOpen && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <h2 className={styles.modal_heading}>Edit Speak Lesson</h2>
                        {isLoading && <div>Loading...</div>}
                        {!isLoading && lessonData && (
                            <div>
                                {/* Edit Lesson Attributes */}
                                <div className={styles.form_group}>
                                    <label className={styles.label} htmlFor="course_id">Select Course</label>
                                    <select
                                        className={styles.input_field}
                                        id="course_id"
                                        defaultValue={lessonData.courseId || "Not Available"}
                                    >
                                        {sortedCourses().map((course) => (
                                            <option key={course.CourseId} value={course.CourseId}>
                                                {course.CourseName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className={styles.form_group}>
                                    <label className={styles.label}>Sequence Number</label>
                                    <input
                                        className={styles.input_field}
                                        type="text"
                                        id="sequenceNumber"
                                        defaultValue={lessonData.SequenceNumber || "Not Available"}
                                    />
                                </div>
                                <div className={styles.form_group}>
                                    <label className={styles.label}>Week Number</label>
                                    <input
                                        className={styles.input_field}
                                        type="text"
                                        id="weekNumber"
                                        defaultValue={lessonData.weekNumber || "Not Available"}
                                    />
                                </div>
                                <div className={styles.form_group}>
                                    <label className={styles.label}>Day Number</label>
                                    <input
                                        className={styles.input_field}
                                        type="text"
                                        id="dayNumber"
                                        defaultValue={lessonData.dayNumber || "Not Available"}
                                    />
                                </div>
                                <div className={styles.form_group}>
                                    <label className={styles.label} htmlFor="activity_alias">Select Activity Alias</label>
                                    <select
                                        className={styles.input_field}
                                        id="activity_alias"
                                        defaultValue={lessonData.activityAlias || "Not Available"}
                                    >
                                        {sortedActivityAliases().map((activityAlias) => (
                                            <option key={activityAlias.id} value={activityAlias.Alias}>
                                                {activityAlias.Alias}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className={styles.form_group}>
                                    <label className={styles.label}>Status</label>
                                    <select
                                        className={styles.input_field}
                                        id="status"
                                        defaultValue={lessonData.status || "Not Available"}
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Not Active">Not Active</option>
                                    </select>
                                </div>

                                {questions.map((question, index) => (
                                    <div key={index} className={styles.question_box}>
                                        <label className={styles.answerEditLabel}>Question Number</label>
                                        <input
                                            className={styles.edit_input_field}
                                            type="number"
                                            value={question.questionNumber !== undefined ? question.questionNumber : ""}
                                            onChange={(e) => handleQuestionChange(index, 'questionNumber', e.target.value)}
                                        />

                                        {['listenAndSpeak', 'feedbackAudio'].includes(activity) && (
                                            <>
                                                <label className={styles.answerEditLabel}>Question</label>
                                                <input
                                                    className={styles.edit_input_field}
                                                    type="text"
                                                    value={question.question || ""}
                                                    onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                                                />
                                                {activity === 'listenAndSpeak' && (
            <>
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
                                                </>
                                                )}
                                                <label className={styles.answerEditLabel}>
                                                    {activity === 'feedbackAudio' ? 'Upload Audio File' : 'Upload Media File (Audio/Video)'}
                                                </label>
                                                <input
                                                    type="file"
                                                    accept={activity === 'feedbackAudio' ? "audio/*" : "audio/mp3,video/mp4"}
                                                    onChange={(e) => handleQuestionChange(index, 'mediaFile', e.target.files)}
                                                />
                                                {question.mediaFile && (
                                                <div className={styles.mediaSection}>
                                                    <label className={styles.answerEditLabel}>Current Media File:</label>
                                                    {activity === 'feedbackAudio' ? (
                                                        <audio controls src={question.mediaFile} className={styles.audio}></audio>
                                                    ) : (
                                                        question.mediaFile && typeof question.mediaFile === 'string' && question.mediaFile.endsWith('.mp4') ? (
                                                            <video controls src={question.mediaFile} className={styles.videoSmall}></video>
                                                        ) : (
                                                            <audio controls src={question.mediaFile} className={styles.audio}></audio>
                                                        )
                                                    )}
                                                </div>
                                            )}
                                            </>
                                        )}

                                        {activity === 'watchAndSpeak' && (
                                            <>
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
                                            </>
                                        )}

                                        {activity === 'watchAndAudio' && (
                                            <>
                                                <label className={styles.answerEditLabel}>Upload Media File (Video)</label>
                                                <input
                                                    type="file"
                                                    onChange={(e) => handleQuestionChange(index, 'mediaFile', e.target.files)}
                                                />
                                                {question.mediaFile && (
                                                    <div className={styles.mediaSection}>
                                                        <label className={styles.answerEditLabel}>Current Media File (Video):</label>
                                                        <video controls src={question.mediaFile} className={styles.videoSmall}></video>
                                                    </div>
                                                )}
                                            </>
                                        )}

                                        {activity === 'watchAndImage' && (
                                            <>
                                                <label className={styles.answerEditLabel}>Upload Media File (Video)</label>
                                                <input
                                                    type="file"
                                                    onChange={(e) => handleQuestionChange(index, 'mediaFile', e.target.files)}
                                                />
                                                {question.mediaFile && (
                                                    <div className={styles.mediaSection}>
                                                        <label className={styles.answerEditLabel}>Current Media File (Video):</label>
                                                        <video controls src={question.mediaFile} className={styles.videoSmall}></video>
                                                    </div>
                                                )}
                                            </>
                                        )}

                                        {activity === 'conversationalQuestionsBot' && (
                                            <>
                                                <label className={styles.answerEditLabel}>Question Text</label>
                                                <input className={styles.edit_input_field} type="text" value={question.question || ""} onChange={(e) => handleQuestionChange(index, 'question', e.target.value)} />
                                            </>
                                        )}

                                        {activity === 'conversationalMonologueBot' && (
                                            <>
                                                <label className={styles.answerEditLabel}>Question Text</label>
                                                <input className={styles.edit_input_field} type="text" value={question.questionText || ""} onChange={(e) => handleQuestionChange(index, 'questionText', e.target.value)} />
                                                <label className={styles.answerEditLabel}>Question Video</label>
                                                <input type="file" onChange={(e) => handleQuestionChange(index, 'mediaFile', e.target.files)} />
                                                {question.mediaFile && (
                                                    <div className={styles.mediaSection}>
                                                        <label className={styles.answerEditLabel}>Current Video:</label>
                                                        <video controls src={question.mediaFile} className={styles.videoSmall}></video>
                                                    </div>
                                                )}
                                            </>
                                        )}

                                        {activity === 'conversationalAgencyBot' && (
                                            <>
                                                <label className={styles.answerEditLabel}>Question Text</label>
                                                <input className={styles.edit_input_field} type="text" value={question.question || ""} onChange={(e) => handleQuestionChange(index, 'question', e.target.value)} />
                                            </>
                                        )}

                                        {activity === 'speakingPractice' && (
                                            <>
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
                                            </>
                                        )}

                                        <button
                                            className={styles.delete_button}
                                            onClick={() => handleDeleteQuestion(question.id, index)}
                                        >
                                            Delete Question
                                        </button>
                                    </div>
                                ))}

                                <button
                                    className={styles.add_question_button}
                                    onClick={addNewQuestion}
                                >
                                    Add New Question
                                </button>

                                <div className={styles.form_group_row}>
                                    <button
                                        className={styles.submit_button}
                                        onClick={handleSave}
                                        disabled={isSaving}
                                    >
                                        {isSaving ? <div className="loader"></div> : "Save Changes"}
                                    </button>
                                    <button
                                        className={styles.cancel_button}
                                        onClick={handleCancel}
                                        disabled={isSaving}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};




const SpeakLesson = ({ category, course, activity }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [lessons, setLessons] = useState([]);
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [isSpeakQuestionModalOpen, setIsSpeakQuestionModalOpen] = useState(false);
    const [isEditSpeakLessonModalOpen, setIsEditSpeakLessonModalOpen] = useState(false);
    const [isMigrateLessonModalOpen, setIsMigrateLessonModalOpen] = useState(false);
    const [isTestLessonModalOpen, setIsTestLessonModalOpen] = useState(false);
    const isDevEnvironment = process.env.REACT_APP_ENVIRONMENT == "DEV";

    const fetchLessons = async () => {
        try {
            setIsLoading(true);
            const lessonsResponse = await getLessonsByActivity(course, activity);
            if (lessonsResponse.status === 200) {
                setLessons(lessonsResponse.data);
            } else {
                alert(lessonsResponse.data.message);
            }
        } catch (error) {
            alert(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (category !== "" && course !== "") {
            fetchLessons();
        }
    }, [category, course, activity]);

    const openSpeakQuestionModal = (lesson) => {
        setSelectedLesson(lesson);
        setIsSpeakQuestionModalOpen(true);
    };

    const closeSpeakQuestionModal = () => {
        setSelectedLesson(null);
        setIsSpeakQuestionModalOpen(false);
    };

    const openEditSpeakLessonModal = (lesson) => {
        setSelectedLesson(lesson);
        setIsEditSpeakLessonModalOpen(true);
    };

    const closeEditSpeakLessonModal = () => {
        setSelectedLesson(null);
        setIsEditSpeakLessonModalOpen(false);
    };

    const openMigrateLessonModal = (lesson) => {
        setSelectedLesson(lesson);
        setIsMigrateLessonModalOpen(true);
    };

    const closeMigrateLessonModal = () => {
        setSelectedLesson(null);
        setIsMigrateLessonModalOpen(false);
    };

    const handleMigrateLesson = async (lesson, selectedCourseId) => {
        const migrateResponse = await migrateLesson(lesson.LessonId, selectedCourseId);
        if (migrateResponse.status !== 200) {
            alert(migrateResponse.data.message);
        } else {
            alert("Lesson migrated successfully.");
        }
        closeMigrateLessonModal();
        fetchLessons();
    };
    const openTestLessonModal = (lesson) => {
            setSelectedLesson(lesson);
            setIsTestLessonModalOpen(true);
        };
    
        const closeTestLessonModal = () => {
            setSelectedLesson(null);
            setIsTestLessonModalOpen(false);
        };
    
        const handleTestLesson = async (phoneNumber, selectedLesson) => {
            console.log(phoneNumber, selectedLesson);
            const testResponse = await testLesson(phoneNumber, selectedLesson);
            if (testResponse.status !== 200) {
                alert(testResponse.data.message);
            } else {
               alert(`Lesson test setup successfully.\nType : ${testResponse.data.result.message}`);
               closeTestLessonModal();
            }
        };

    const handleDeleteLesson = async (lessonId) => {
        const isConfirmed = window.confirm("Are you sure you want to delete this lesson?");
        if (isConfirmed) {
            try {
                const deleteResponse = await deleteLesson(lessonId);
                if (deleteResponse.status === 200) {
                    alert("Lesson deleted successfully");
                    fetchLessons();
                } else {
                    alert(deleteResponse.data.message);
                }
            } catch (error) {
                alert(error);
            }
        }
    };

    const activityMapper = {
        'watchAndAudio': 'Watch & Audio',
        'watchAndImage': 'Watch & Image',
        'watchAndSpeak': 'Watch & Speak',
        'listenAndSpeak': 'Listen & Speak',
        'conversationalQuestionsBot': 'Conversational Questions Bot',
        'conversationalMonologueBot': 'Conversational Monologue Bot',
        'conversationalAgencyBot': 'Conversational Agency Bot',
        'speakingPractice': 'Speaking Practice',
        'feedbackAudio' : 'Feedback Audio',
    };

    return (
        <div>
            <h1 className={styles.heading}>Manage your {activityMapper[activity]} lessons</h1>
            {/* loading */}
            {isLoading && <div>Fetching Data...</div>}
            {/* no data */}
            {!isLoading && lessons.length === 0 && <p>No lessons found</p>}
            {/* data */}
            {!isLoading && lessons.length > 0 && (
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.table_heading}>Lesson Id</th>
                            <th className={styles.table_heading}>Week Number</th>
                            <th className={styles.table_heading}>Day Number</th>
                            <th className={styles.table_heading}>Sequence Number</th>
                            <th className={styles.table_heading}>Questions</th>
                            <th className={styles.table_heading}>Status</th>
                            {isDevEnvironment && <th className={styles.table_heading}>Migrate</th>}
                            <th className={styles.table_heading}>Edit</th>
                            <th className={styles.table_heading}>Test</th>
                            <th className={styles.table_heading}>Delete</th>
                        </tr>
                    </thead>
                    <tbody className={styles.table_body}>
                        {lessons.map((lesson) => (
                            <tr key={lesson.LessonId} className={styles.table_row}>
                                <td style={{ width: "15%" }}>{lesson.LessonId}</td>
                                <td style={{ width: "15%" }}>{lesson.weekNumber}</td>
                                <td style={{ width: "15%" }}>{lesson.dayNumber}</td>
                                <td style={{ width: "15%" }}>{lesson.SequenceNumber}</td>
                                <td style={{ width: "15%" }}>
                                    <button className={styles.submit_button} onClick={() => openSpeakQuestionModal(lesson)}>Show Questions</button>
                                </td>
                                <td style={{ width: "10%" }}>
                                    <span className={lesson.status === "Active" ? styles.active : styles.inactive}>
                                        {lesson.status || "Not Available"}
                                    </span>
                                </td>
                                {isDevEnvironment && (
                                    <td style={{ width: "6.66%" }}>
                                        <button
                                            className={styles.migrate_button}
                                            onClick={() => openMigrateLessonModal(lesson)}
                                        >
                                            Migrate
                                        </button>
                                    </td>
                                )}
                                <td style={{ width: "6.66%" }}>
                                    <img
                                        onClick={() => openEditSpeakLessonModal(lesson)}
                                        src={edit}
                                        alt="Edit"
                                    />
                                </td>
                                <td style={{ width: "4%" }}>
                                        <button
                                            className={styles.test_button}
                                            onClick={() => openTestLessonModal(lesson)}
                                        >
                                            Test
                                        </button>
                                    </td>
                                <td style={{ width: "6.66%" }}>
                                    <img
                                        onClick={() => handleDeleteLesson(lesson.LessonId)}
                                        src={deleteIcon}
                                        alt="Delete"
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            {isSpeakQuestionModalOpen && selectedLesson && (
                <SpeakQuestionModal
                    lesson={selectedLesson}
                    onClose={closeSpeakQuestionModal}
                    activity={activity}
                />
            )}
            {isEditSpeakLessonModalOpen && selectedLesson && (
                <EditSpeakLessonModal
                    isOpen={isEditSpeakLessonModalOpen}
                    onClose={closeEditSpeakLessonModal}
                    lesson={selectedLesson}
                    onSave={fetchLessons}
                    activity={activity}
                />
            )}
            {isMigrateLessonModalOpen && selectedLesson && (
                <MigrateLessonModal
                    isOpen={isMigrateLessonModalOpen}
                    onClose={closeMigrateLessonModal}
                    lesson={selectedLesson}
                    onMigrate={handleMigrateLesson}
                />
            )}
             {isTestLessonModalOpen && selectedLesson && (
                            <TestLessonModal
                                isOpen={isTestLessonModalOpen}
                                onClose={closeTestLessonModal}
                                lesson={selectedLesson}
                                onTest={handleTestLesson}
                            />
                        )}
        </div>
    );
};

export default SpeakLesson;
