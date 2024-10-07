import React, { useState, useEffect } from "react";
import {
    getLessonsByActivity,
    getLessonById,
    deleteLesson,
    getAllCourses,
    getAllActivityAliases,
    updateLesson,
    createMultipleChoiceQuestion,
    updateMultipleChoiceQuestion,
    deleteMultipleChoiceQuestion,
    createMultipleChoiceQuestionAnswer,
    updateMultipleChoiceQuestionAnswer,
    deleteMultipleChoiceQuestionAnswer,
    migrateLesson,
} from "../../../../../helper";
import edit from "../../../../../assets/images/edit.svg";
import deleteIcon from "../../../../../assets/images/delete.svg";
import styles from "./MCQsLesson.module.css";
import MCQsQuestionModal from "./MCQsQuestionModal";
import MigrateLessonModal from "../../../../../components/MigrateLessonModal/MigrateLessonModal";

const EditMCQLessonModal = ({ isOpen, onClose, lesson, onSave }) => {
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
    }, [isOpen, lesson]);

    const fetchLessonData = async () => {
        try {
            const lessonResponse = await getLessonById(lesson.LessonId);
            if (lessonResponse.status === 200) {
                const fetchedQuestions = lessonResponse.data.multipleChoiceQuestions || [];
                const mappedQuestions = fetchedQuestions.map((question) => ({
                    id: question.dataValues.Id,
                    questionType: question.dataValues.QuestionType,
                    questionText: question.dataValues.QuestionText || "",
                    questionImageUrl: question.dataValues.QuestionImageUrl,
                    questionAudioUrl: question.dataValues.QuestionAudioUrl,
                    questionNumber: question.dataValues.QuestionNumber,
                    optionsType: question.dataValues.OptionsType,
                    answers: question.multipleChoiceQuestionAnswers.map((answer) => ({
                        id: answer.Id,
                        answerText: answer.AnswerText || "",
                        answerImageUrl: answer.AnswerImageUrl,
                        answerAudioUrl: answer.AnswerAudioUrl,
                        isCorrect: answer.IsCorrect,
                        SequenceNumber: answer.SequenceNumber,
                    })),
                }));
                setLessonData(lessonResponse.data);
                setQuestions(mappedQuestions.sort((a, b) => a.questionNumber - b.questionNumber));
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

            // Save the updated lesson data
            const updateLessonResponse = await updateLesson(
                lessonData.LessonId,
                lessonData.lessonType,
                lessonData.dayNumber,
                lessonData.activity,
                lessonData.activityAlias,
                lessonData.weekNumber,
                lessonData.text,
                lessonData.courseId,
                lessonData.SequenceNumber,
                lessonData.status,
            );

            if (updateLessonResponse.status !== 200) {
                alert(updateLessonResponse.data.message);
                return;
            }

            // Update questions
            for (let question of questions) {
                if (question.isNew) {
                    // Create new question
                    const createQuestionResponse = await createMultipleChoiceQuestion(
                        question.file || null,
                        question.image || null,
                        question.questionType,
                        question.questionText,
                        question.questionNumber,
                        lessonData.LessonId,
                        question.optionsType
                    );

                    if (createQuestionResponse.status !== 200) {
                        alert(createQuestionResponse.data.message);
                        return;
                    }
                    console.log("Create Question Response", createQuestionResponse);

                    // Handle answers for new question
                    const questionId = createQuestionResponse.data.mcq.Id;
                    for (let answer of question.answers) {
                        const createAnswerResponse = await createMultipleChoiceQuestionAnswer(
                            answer.answerText,
                            answer.file || null,
                            answer.image || null,
                            answer.isCorrect,
                            questionId,
                            answer.SequenceNumber
                        );

                        if (createAnswerResponse.status !== 200) {
                            alert(createAnswerResponse.data.message);
                            return;
                        }
                    }
                } else if (question.isChanged) {
                    // Update existing question
                    const updateQuestionResponse = await updateMultipleChoiceQuestion(
                        question.id,
                        question.file || null,
                        question.image || null,
                        question.questionType,
                        question.questionText,
                        question.questionNumber,
                        lessonData.LessonId,
                        question.optionsType
                    );

                    if (updateQuestionResponse.status !== 200) {
                        alert(updateQuestionResponse.data.message);
                        return;
                    }

                    // Handle answers for updated question
                    for (let answer of question.answers) {
                        if (answer.isNew) {
                            const createAnswerResponse = await createMultipleChoiceQuestionAnswer(
                                answer.answerText,
                                answer.file || null,
                                answer.image || null,
                                answer.isCorrect,
                                question.id,
                                answer.SequenceNumber
                            );

                            if (createAnswerResponse.status !== 200) {
                                alert(createAnswerResponse.data.message);
                                return;
                            }
                        } else if (answer.isChanged) {
                            const updateAnswerResponse = await updateMultipleChoiceQuestionAnswer(
                                answer.id,
                                answer.answerText,
                                answer.file || null,
                                answer.image || null,
                                answer.isCorrect,
                                question.id,
                                answer.SequenceNumber
                            );

                            if (updateAnswerResponse.status !== 200) {
                                alert(updateAnswerResponse.data.message);
                                return;
                            }
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
            i === index ? { ...question, [field]: value, isChanged: true } : question
        );
        setQuestions(updatedQuestions);
    };

    const handleAnswerChange = (questionIndex, answerIndex, field, value) => {
        const updatedQuestions = questions.map((question, i) => {
            if (i === questionIndex) {
                const updatedAnswers = question.answers.map((answer, ai) =>
                    ai === answerIndex ? { ...answer, [field]: value, isChanged: true } : answer
                );
                return { ...question, answers: updatedAnswers, isChanged: true };
            }
            return question;
        });
        setQuestions(updatedQuestions);
    };

    const addNewQuestion = () => {
        setQuestions((prevQuestions) => {
            const newQuestionNumber = prevQuestions.length + 1;
            return [
                ...prevQuestions,
                {
                    id: null,
                    questionType: "Text",
                    questionText: "",
                    questionImageUrl: null,
                    questionAudioUrl: null,
                    questionNumber: newQuestionNumber,
                    optionsType: "Text",
                    answers: [{
                        id: null,
                        answerText: "",
                        answerImageUrl: null,
                        answerAudioUrl: null,
                        isCorrect: false,
                        SequenceNumber: 1,
                        isNew: true,
                    }],
                    isNew: true,
                },
            ];
        });
    };


    const removeQuestion = (index) => {
        const questionToRemove = questions[index];
        if (questionToRemove.id) {
            deleteMultipleChoiceQuestion(questionToRemove.id).then(response => {
                if (response.status === 200) {
                    setQuestions(questions.filter((_, i) => i !== index));
                } else {
                    alert(response.data.message);
                }
            });
        } else {
            setQuestions(questions.filter((_, i) => i !== index));
        }
    };

    const addNewAnswer = (questionIndex) => {
        setQuestions((prevQuestions) => {
            return prevQuestions.map((question, i) => {
                if (i === questionIndex) {
                    const newAnswer = {
                        id: null,
                        answerText: "",
                        answerImageUrl: null,
                        answerAudioUrl: null,
                        isCorrect: false,
                        SequenceNumber: question.answers.length + 1,
                        isNew: true,
                    };
                    const updatedAnswers = [...question.answers, newAnswer];

                    // Reassign SequenceNumbers
                    const reassignedAnswers = updatedAnswers.map((answer, index) => ({
                        ...answer,
                        SequenceNumber: index + 1,
                    }));

                    return {
                        ...question,
                        answers: reassignedAnswers,
                        isChanged: true,
                    };
                }
                return question;
            });
        });
    };

    const removeAnswer = (questionIndex, answerIndex) => {
        setQuestions((prevQuestions) => {
            return prevQuestions.map((question, i) => {
                if (i === questionIndex) {
                    const updatedAnswers = question.answers.filter((_, ai) => ai !== answerIndex);

                    // Reassign SequenceNumbers
                    const reassignedAnswers = updatedAnswers.map((answer, index) => ({
                        ...answer,
                        SequenceNumber: index + 1,
                        isChanged: true,
                    }));

                    return {
                        ...question,
                        answers: reassignedAnswers,
                        isChanged: true,
                    };
                }
                return question;
            });
        });
    };


    const sortedCourses = () => {
        if (!lessonData) return courses;
        return [...courses].sort((a, b) =>
            a.CourseId === lessonData.courseId
                ? -1
                : b.CourseId === lessonData.courseId
                    ? 1
                    : 0
        );
    };

    const sortedActivityAliases = () => {
        if (!lessonData) return activityAliases;
        return [...activityAliases].sort((a, b) =>
            a.Alias === lessonData.activityAlias
                ? -1
                : b.Alias === lessonData.activityAlias
                    ? 1
                    : 0
        );
    };

    const renderQuestionInputs = (question, qIndex) => {
        switch (question.questionType) {
            case "Text":
                return (
                    <div className={styles.form_group}>
                        <label className={styles.label}>Question Text</label>
                        <input
                            className={styles.input_field}
                            type="text"
                            value={question.questionText}
                            onChange={(e) => handleQuestionChange(qIndex, "questionText", e.target.value)}
                        />
                    </div>
                );
            case "Image":
                return (
                    <div className={styles.form_group}>
                        <label className={styles.label}>Upload Question Image</label>
                        <input
                            className={styles.input_field}
                            type="file"
                            onChange={(e) => handleQuestionChange(qIndex, "questionImageUrl", e.target.files[0])}
                        />
                        {question.questionImageUrl && (
                            <img src={question.questionImageUrl} alt="Question" className={styles.image} />
                        )}
                    </div>
                );
            case "Audio":
                return (
                    <div className={styles.form_group}>
                        <label className={styles.label}>Upload Question Audio</label>
                        <input
                            className={styles.input_field}
                            type="file"
                            onChange={(e) => handleQuestionChange(qIndex, "questionAudioUrl", e.target.files[0])}
                        />
                        {question.questionAudioUrl && (
                            <audio controls src={question.questionAudioUrl} className={styles.audio} />
                        )}
                    </div>
                );
            case "Text+Audio":
                return (
                    <div className={styles.form_group}>
                        <label className={styles.label}>Question Text</label>
                        <input
                            className={styles.input_field}
                            type="text"
                            value={question.questionText}
                            onChange={(e) => handleQuestionChange(qIndex, "questionText", e.target.value)}
                        />
                        <label className={styles.label}>Upload Question Audio</label>
                        <input
                            className={styles.input_field}
                            type="file"
                            onChange={(e) => handleQuestionChange(qIndex, "questionAudioUrl", e.target.files[0])}
                        />
                        {question.questionAudioUrl && (
                            <audio controls src={question.questionAudioUrl} className={styles.audio} />
                        )}
                    </div>
                );
            case "Text+Image":
                return (
                    <div className={styles.form_group}>
                        <label className={styles.label}>Question Text</label>
                        <input
                            className={styles.input_field}
                            type="text"
                            value={question.questionText}
                            onChange={(e) => handleQuestionChange(qIndex, "questionText", e.target.value)}
                        />
                        <label className={styles.label}>Upload Question Image</label>
                        <input
                            className={styles.input_field}
                            type="file"
                            onChange={(e) => handleQuestionChange(qIndex, "questionImageUrl", e.target.files[0])}
                        />
                        {question.questionImageUrl && (
                            <img src={question.questionImageUrl} alt="Question" className={styles.image} />
                        )}
                    </div>
                );
            case "Image+Audio":
                return (
                    <div className={styles.form_group}>
                        <label className={styles.label}>Upload Question Image</label>
                        <input
                            className={styles.input_field}
                            type="file"
                            onChange={(e) => handleQuestionChange(qIndex, "questionImageUrl", e.target.files[0])}
                        />
                        {question.questionImageUrl && (
                            <img src={question.questionImageUrl} alt="Question" className={styles.image} />
                        )}
                        <label className={styles.label}>Upload Question Audio</label>
                        <input
                            className={styles.input_field}
                            type="file"
                            onChange={(e) => handleQuestionChange(qIndex, "questionAudioUrl", e.target.files[0])}
                        />
                        {question.questionAudioUrl && (
                            <audio controls src={question.questionAudioUrl} className={styles.audio} />
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div>
            {isOpen && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <h2 className={styles.modal_heading}>Edit MCQ Lesson</h2>
                        {isLoading && <div>Loading...</div>}
                        {!isLoading && lessonData && (
                            <div>
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
                                        id="SequenceNumber"
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
                                {questions.map((question, qIndex) => (
                                    <div key={qIndex} className={styles.question_box}>
                                        <div className={styles.input_row}>
                                            <label className={styles.label}>Question Num</label>
                                            <input
                                                className={styles.input_field}
                                                type="number"
                                                value={question.questionNumber}
                                                onChange={(e) => handleQuestionChange(qIndex, "questionNumber", e.target.value)}
                                            />
                                        </div>
                                        <div className={styles.input_row}>
                                            <label className={styles.label}>Question Type</label>
                                            <select
                                                className={styles.input_field}
                                                value={question.questionType}
                                                onChange={(e) => handleQuestionChange(qIndex, "questionType", e.target.value)}
                                            >
                                                <option value="Text">Text</option>
                                                <option value="Image">Image</option>
                                                <option value="Audio">Audio</option>
                                                <option value="Text+Audio">Text + Audio</option>
                                                <option value="Text+Image">Text + Image</option>
                                                <option value="Image+Audio">Image + Audio</option>
                                            </select>

                                        </div>

                                        <button className={styles.remove_button} onClick={() => removeQuestion(qIndex)}>Remove Question</button>

                                        {renderQuestionInputs(question, qIndex)}

                                        {question.answers.map((answer, aIndex) => (
                                            <div key={aIndex} className={styles.answer_group}>
                                                <div className={styles.input_row}>
                                                    <label className={styles.label}>Answer</label>
                                                    <input
                                                        className={styles.input_field}
                                                        type="text"
                                                        value={answer.answerText}
                                                        onChange={(e) => handleAnswerChange(qIndex, aIndex, "answerText", e.target.value)}
                                                    />
                                                </div>
                                                <div className={styles.input_row_correct}>
                                                    <label className={styles.label}>Correct</label>
                                                    <input
                                                        className={styles.input_field}
                                                        type="checkbox"
                                                        checked={answer.isCorrect}
                                                        onChange={(e) => handleAnswerChange(qIndex, aIndex, "isCorrect", e.target.checked)}
                                                    />
                                                    {question.answers.length > 1 && (
                                                        <button
                                                            className={styles.remove_button}
                                                            onClick={() => removeAnswer(qIndex, aIndex)}
                                                        >
                                                            Remove Answer
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {question.answers.length < 4 && (
                                            <button className={styles.add_button} onClick={() => addNewAnswer(qIndex)}>Add Answer</button>
                                        )}
                                    </div>
                                ))}
                                <button className={styles.add_button} onClick={addNewQuestion}>Add New Question</button>

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

const MCQsLesson = ({ category, course, activity }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [lessons, setLessons] = useState([]);
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [isMCQModalOpen, setIsMCQModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isMigrateLessonModalOpen, setIsMigrateLessonModalOpen] = useState(false);
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

    const openMCQModal = (lesson) => {
        setSelectedLesson(lesson);
        setIsMCQModalOpen(true);
    };

    const closeMCQModal = () => {
        setSelectedLesson(null);
        setIsMCQModalOpen(false);
    };

    const openEditModal = (lesson) => {
        setSelectedLesson(lesson);
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setSelectedLesson(null);
        setIsEditModalOpen(false);
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
            console.log(migrateResponse.data);
            alert("Lesson migrated successfully.");
        }
        closeMigrateLessonModal();
        fetchLessons();
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
        'mcqs': 'Multiple Choice Questions',
        'postMCQs': 'Post Multiple Choice Questions',
        'preMCQs': 'Pre Multiple Choice Questions',
        'placementTest': 'Placement Test',
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
                            <th className={styles.table_heading}>Sequence Number</th>
                            <th className={styles.table_heading}>Week Number</th>
                            <th className={styles.table_heading}>Day Number</th>
                            <th className={styles.table_heading}>Questions</th>
                            <th className={styles.table_heading}>Status</th>
                            {isDevEnvironment && <th className={styles.table_heading}>Migrate</th>}
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
                                    <button
                                        className={styles.submit_button}
                                        onClick={() => openMCQModal(lesson)}
                                    >
                                        Show Questions
                                    </button>
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
                                        onClick={() => openEditModal(lesson)}
                                        src={edit}
                                        alt="Edit"
                                    />
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
            {isMCQModalOpen && selectedLesson && (
                <MCQsQuestionModal
                    lesson={selectedLesson}
                    onClose={closeMCQModal}
                    activity={activity}
                />
            )}
            {isEditModalOpen && selectedLesson && (
                <EditMCQLessonModal
                    isOpen={isEditModalOpen}
                    onClose={closeEditModal}
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
        </div>
    );
};

export default MCQsLesson;
