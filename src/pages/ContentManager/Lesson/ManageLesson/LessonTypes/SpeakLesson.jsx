import React, { useState, useEffect } from 'react';
import {
    getLessonsByActivity,
    getLessonById,
    deleteLesson,
    getAllCourses,
    getAllActivityAliases,
    updateLesson,
    updateSpeakActivityQuestion
} from "../../../../../helper";
import edit from '../../../../../assets/images/edit.svg';
import deleteIcon from '../../../../../assets/images/delete.svg';
import styles from './SpeakLesson.module.css';
import SpeakQuestionModal from './SpeakQuestionModal';


const EditSpeakLessonModal = ({ isOpen, onClose, lesson, onSave }) => {
    const [isLoading, setIsLoading] = useState(true);
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
    }, [lesson]);

    const fetchLessonData = async () => {
        try {
            const lessonResponse = await getLessonById(lesson.LessonId);
            if (lessonResponse.status === 200) {
                setLessonData(lessonResponse.data);
                setQuestions(lessonResponse.data.speakActivityQuestionFiles);
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
            const response = await getAllActivityAliases();
            if (response.status === 200) {
                setActivityAliases(response.data);
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            alert(error);
        }
    };

    const fetchAllData = async () => {
        const promises = [
            fetchCourses(),
            fetchLessonData(),
            fetchActivityAliases(),
        ];
        await Promise.all(promises);
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

            // Filter and update only the questions that were changed
            const changedQuestions = questions.filter(question => question.isChanged);

            for (let question of changedQuestions) {
                const updateResponse = await updateSpeakActivityQuestion(
                    question.id,
                    question.question,
                    question.mediaFile,
                    question.answer.join(', '),
                    lesson.LessonId,
                    question.questionNumber
                );

                if (updateResponse.status !== 200) {
                    alert(updateResponse.data.message);
                    return;
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
            i === index ? { ...question, [field]: value, isChanged: true } : question
        );
        setQuestions(updatedQuestions);
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

                                {/* Edit Questions */}
                                {questions.map((question, index) => (
                                    <div key={question.id} className={styles.form_group}>
                                        <label className={styles.label}>Question {index + 1}</label>
                                        <input
                                            className={styles.input_field}
                                            type="text"
                                            value={question.question || ""}
                                            onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                                        />
                                        <label className={styles.label}>Answer</label>
                                        <input
                                            className={styles.input_field}
                                            type="text"
                                            value={question.answer.join(', ') || ""}
                                            onChange={(e) => handleQuestionChange(index, 'answer', e.target.value.split(','))}
                                        />
                                        <label className={styles.label}>Upload Media File</label>
                                        <input
                                            type="file"
                                            onChange={(e) => handleQuestionChange(index, 'mediaFile', e.target.files[0])}
                                        />
                                        {question.mediaFile && (
                                            <div>
                                                <label className={styles.label}>Current Media File:</label>
                                                <audio controls src={question.mediaFile} className={styles.audio}></audio>
                                            </div>
                                        )}
                                    </div>
                                ))}

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
    }, [category, course]);

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

    return (
        <div>
            <h1 className={styles.heading}>Manage your Listen And Speak lessons</h1>
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
                            <th className={styles.table_heading}>Sequence Number</th>
                            <th className={styles.table_heading}>Week Number</th>
                            <th className={styles.table_heading}>Day Number</th>
                            <th className={styles.table_heading}>Questions</th>
                            <th className={styles.table_heading}>Edit</th>
                            <th className={styles.table_heading}>Delete</th>
                        </tr>
                    </thead>
                    <tbody className={styles.table_body}>
                        {lessons.map((lesson) => (
                            <tr key={lesson.LessonId} className={styles.table_row}>
                                <td style={{ width: "15%" }}>{lesson.LessonId}</td>
                                <td style={{ width: "15%" }}>{lesson.SequenceNumber}</td>
                                <td style={{ width: "15%" }}>{lesson.weekNumber}</td>
                                <td style={{ width: "15%" }}>{lesson.dayNumber}</td>
                                <td style={{ width: "15%" }}>
                                    <button className={styles.submit_button} onClick={() => openSpeakQuestionModal(lesson)}>Show Questions</button>
                                </td>
                                <td style={{ width: "10%" }}>
                                    <img
                                        onClick={() => openEditSpeakLessonModal(lesson)}
                                        src={edit}
                                        alt="Edit"
                                    />
                                </td>
                                <td style={{ width: "10%" }}>
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
                />
            )}
        </div>
    );
};

export default SpeakLesson;
