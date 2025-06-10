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
    getMultipleChoiceQuestionById,
    testLesson,
} from "../../../../../helper";
import edit from "../../../../../assets/images/edit.svg";
import deleteIcon from "../../../../../assets/images/delete.svg";
import styles from "./MCQsLesson.module.css";
import MCQsQuestionModal from "./MCQsQuestionModal";
import MigrateLessonModal from "../../../../../components/MigrateLessonModal/MigrateLessonModal";
import TestLessonModal from "../../../../../components/TestLessonModal/TestLessonModal";

const EditMCQLessonModal = ({ isOpen, onClose, lesson, onSave, activity }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [lessonData, setLessonData] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [courses, setCourses] = useState([]);
    const [activityAliases, setActivityAliases] = useState([]);
    const [enableTextInstruction, setEnableTextInstruction] = useState(false);
    const [enableAudioInstruction, setEnableAudioInstruction] = useState(false);
    const [textInstruction, setTextInstruction] = useState('');
    const [audioInstruction, setAudioInstruction] = useState(null);

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
                const mappedQuestions = fetchedQuestions.map((question) => {
                    // Determine the feedback type based on existing data
                    let determinedFeedbackType = question.dataValues.CustomFeedbackType || "text";

                    // If no explicit type is stored, determine based on actual data
                    if (!question.dataValues.CustomFeedbackType) {
                        // Check each answer to find any with feedback
                        let hasTextFeedback = false;
                        let hasImageFeedback = false;
                        let hasAudioFeedback = false;

                        // Loop through all answers to find any with feedback
                        question.multipleChoiceQuestionAnswers.forEach(answer => {
                            if (answer.CustomAnswerFeedbackText) hasTextFeedback = true;
                            if (answer.CustomAnswerFeedbackImage) hasImageFeedback = true;
                            if (answer.CustomAnswerFeedbackAudio) hasAudioFeedback = true;
                        });

                        // Determine the most comprehensive feedback type
                        if (hasTextFeedback && hasImageFeedback) {
                            determinedFeedbackType = "text+image";
                        } else if (hasTextFeedback && hasAudioFeedback) {
                            determinedFeedbackType = "text+audio";
                        } else if (hasTextFeedback) {
                            determinedFeedbackType = "text";
                        } else if (hasImageFeedback) {
                            determinedFeedbackType = "image";
                        } else if (hasAudioFeedback) {
                            determinedFeedbackType = "audio";
                        }
                    }

                    return {
                        id: question.dataValues.Id,
                        questionType: question.dataValues.QuestionType,
                        questionText: question.dataValues.QuestionText || "",
                        questionImageUrl: question.dataValues.QuestionImageUrl,
                        questionAudioUrl: question.dataValues.QuestionAudioUrl,
                        questionVideoUrl: question.dataValues.QuestionVideoUrl,
                        questionNumber: question.dataValues.QuestionNumber,
                        optionsType: question.dataValues.OptionsType,
                        customFeedbackType: determinedFeedbackType,
                        showCustomFeedback: Boolean(
                            question.dataValues.CustomFeedbackType ||
                            question.multipleChoiceQuestionAnswers.some(a =>
                                a.CustomAnswerFeedbackText ||
                                a.CustomAnswerFeedbackImage ||
                                a.CustomAnswerFeedbackAudio
                            )
                        ),
                        answers: question.multipleChoiceQuestionAnswers.map((answer) => ({
                            id: answer.Id,
                            answerText: answer.AnswerText || "",
                            answerImageUrl: answer.AnswerImageUrl,
                            answerAudioUrl: answer.AnswerAudioUrl,
                            isCorrect: answer.IsCorrect,
                            SequenceNumber: answer.SequenceNumber,
                            customAnswerFeedbackText: answer.CustomAnswerFeedbackText || "",
                            customAnswerFeedbackImage: answer.CustomAnswerFeedbackImage || "",
                            customAnswerFeedbackAudio: answer.CustomAnswerFeedbackAudio || "",
                        })),
                    };
                });
                setLessonData(lessonResponse.data);
                setQuestions(mappedQuestions.sort((a, b) => a.questionNumber - b.questionNumber));
                // Set instruction states based on lesson data
                if (lessonResponse.data.textInstruction) {
                    setEnableTextInstruction(true);
                    setTextInstruction(lessonResponse.data.textInstruction);
                }
                if (lessonResponse.data.audioInstructionUrl) {
                    setEnableAudioInstruction(true);
                }
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
        setEnableTextInstruction(false);
        setEnableAudioInstruction(false);
        setTextInstruction('');
        setAudioInstruction(null);
        onClose();
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);

            const updatedLessonData = {
                ...lessonData,
                courseId: document.getElementById("course_id").value,
                SequenceNumber: document.getElementById("SequenceNumber").value,
                weekNumber: document.getElementById("weekNumber").value,
                dayNumber: document.getElementById("dayNumber").value,
                activityAlias: document.getElementById("activity_alias").value,
                status: document.getElementById("status").value,
                textInstruction: enableTextInstruction ? textInstruction : null,
                audioInstruction: enableAudioInstruction ? audioInstruction : null,
            };

            // Save the updated lesson data
            const updateLessonResponse = await updateLesson(
                updatedLessonData.LessonId,
                updatedLessonData.lessonType,
                updatedLessonData.dayNumber,
                updatedLessonData.activity,
                updatedLessonData.activityAlias,
                updatedLessonData.weekNumber,
                updatedLessonData.text,
                updatedLessonData.courseId,
                updatedLessonData.SequenceNumber,
                lessonData.status,
                updatedLessonData.textInstruction,
                updatedLessonData.audioInstruction
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
                        question.questionImageFile || question.image || null,
                        question.questionVideoFile || question.video || null,
                        question.questionType,
                        question.questionText,
                        question.questionNumber,
                        lessonData.LessonId,
                        question.optionsType,
                        question.customFeedbackType,
                    );

                    if (createQuestionResponse.status !== 200) {
                        alert(createQuestionResponse.data.message);
                        return;
                    }

                    // Handle answers for new question
                    const questionId = createQuestionResponse.data.mcq.Id;
                    for (let answer of question.answers) {
                        const createAnswerResponse = await createMultipleChoiceQuestionAnswer(
                            answer.answerText,
                            answer.file || answer.answerImageUrl || null,
                            answer.image || answer.answerAudioUrl || null,
                            answer.isCorrect,
                            questionId,
                            answer.SequenceNumber,
                            question.showCustomFeedback && question.customFeedbackType.includes("text") ? answer.customAnswerFeedbackText || "" : null,
                            question.showCustomFeedback && question.customFeedbackType.includes("image") ? (answer.customAnswerFeedbackImage || answer.customAnswerFeedbackImagePreview || answer.customAnswerFeedbackImageUrl || null) : null,
                            question.showCustomFeedback && question.customFeedbackType.includes("audio") ? (answer.customAnswerFeedbackAudio || answer.customAnswerFeedbackAudioPreview || answer.customAnswerFeedbackAudioUrl || null) : null
                        );

                        if (createAnswerResponse.status !== 200) {
                            alert(createAnswerResponse.data.message);
                            return;
                        }
                    }
                } else if (question.isChanged) {
                    // Update existing question
                    // First get the current question data to preserve fields we're not updating
                    const existingQuestion = await getMultipleChoiceQuestionById(question.id);

                    const updateQuestionResponse = await updateMultipleChoiceQuestion(
                        question.id,
                        question.file || null,
                        question.questionImageFile || question.questionImageUrl || (existingQuestion?.data?.QuestionImageUrl || null),
                        question.questionVideoFile || question.questionVideoUrl || (existingQuestion?.data?.QuestionVideoUrl || null),
                        question.questionType,
                        question.questionText,
                        question.questionNumber,
                        lessonData.LessonId,
                        question.optionsType,
                        question.customFeedbackType,
                    );

                    if (updateQuestionResponse.status !== 200) {
                        alert(updateQuestionResponse.data.message);
                        return;
                    }

                    // Handle answers for updated question
                    for (let answer of question.answers) {
                        if (answer.isNew && !answer.isDeleted) {
                            const createAnswerResponse = await createMultipleChoiceQuestionAnswer(
                                answer.answerText,
                                answer.file || answer.answerImageUrl || null,
                                answer.image || answer.answerAudioUrl || null,
                                answer.isCorrect,
                                question.id,
                                answer.SequenceNumber,
                                question.showCustomFeedback && question.customFeedbackType.includes("text") ? answer.customAnswerFeedbackText || "" : null,
                                question.showCustomFeedback && question.customFeedbackType.includes("image") ? (answer.customAnswerFeedbackImage || answer.customAnswerFeedbackImagePreview || answer.customAnswerFeedbackImageUrl || null) : null,
                                question.showCustomFeedback && question.customFeedbackType.includes("audio") ? (answer.customAnswerFeedbackAudio || answer.customAnswerFeedbackAudioPreview || answer.customAnswerFeedbackAudioUrl || null) : null
                            );

                            if (createAnswerResponse.status !== 200) {
                                alert(createAnswerResponse.data.message);
                                return;
                            }
                        } else if (answer.isChanged && !answer.isDeleted) {
                            const updateAnswerResponse = await updateMultipleChoiceQuestionAnswer(
                                answer.id,
                                answer.answerText,
                                answer.file || answer.answerImageUrl || null,
                                answer.image || answer.answerAudioUrl || null,
                                answer.isCorrect,
                                question.id,
                                answer.SequenceNumber,
                                question.showCustomFeedback && question.customFeedbackType.includes("text") ? answer.customAnswerFeedbackText || "" : null,
                                question.showCustomFeedback && question.customFeedbackType.includes("image") ? (answer.customAnswerFeedbackImage || answer.customAnswerFeedbackImagePreview || answer.customAnswerFeedbackImageUrl || null) : null,
                                question.showCustomFeedback && question.customFeedbackType.includes("audio") ? (answer.customAnswerFeedbackAudio || answer.customAnswerFeedbackAudioPreview || answer.customAnswerFeedbackAudioUrl || null) : null
                            );

                            if (updateAnswerResponse.status !== 200) {
                                alert(updateAnswerResponse.data.message);
                                return;
                            }
                        } else if (!answer.isNew && answer.isDeleted) {
                            const deleteAnswerResponse = await deleteMultipleChoiceQuestionAnswer(answer.id);
                            if (deleteAnswerResponse.status !== 200) {
                                alert(deleteAnswerResponse.data.message);
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
        const updatedQuestions = questions.map((question, i) => {
            if (i === index) {
                const updatedQuestion = { ...question, [field]: value, isChanged: true };

                // When changing question type, clear irrelevant media fields
                if (field === "questionType") {
                    // Clear video fields if switching to a type that doesn't use video
                    if (!value.includes("Video")) {
                        updatedQuestion.questionVideoFile = null;
                        updatedQuestion.questionVideoPreview = null;
                        updatedQuestion.questionVideoUrl = null;
                    }

                    // Clear image fields if switching to a type that doesn't use image
                    if (!value.includes("Image")) {
                        updatedQuestion.questionImageFile = null;
                        updatedQuestion.questionImagePreview = null;
                        updatedQuestion.questionImageUrl = null;
                    }
                }

                return updatedQuestion;
            }
            return question;
        });
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
            if (activity === 'feedbackMcqs') {
                return [
                    ...prevQuestions,
                    {
                        id: null,
                        questionType: "Text",
                        questionText: "",
                        questionNumber: newQuestionNumber,
                        optionsType: "Text",
                        answers: Array(3).fill(null).map((_, index) => ({
                            id: null,
                            answerText: "",
                            SequenceNumber: index + 1,
                            isNew: true,
                            isCorrect: false,
                        })),
                        isNew: true
                    },
                ];
            }
            return [
                ...prevQuestions,
                {
                    id: null,
                    questionType: "Text",
                    questionText: "",
                    questionImageUrl: null,
                    questionAudioUrl: null,
                    questionVideoUrl: null,
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
                        customAnswerFeedbackText: "",
                        customAnswerFeedbackImage: "",
                        customAnswerFeedbackAudio: "",
                    }],
                    isNew: true,
                    showCustomFeedback: false,
                    customFeedbackType: "text",
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
                    const updatedAnswers = question.answers.map((answer, ai) =>
                        ai === answerIndex ? { ...answer, isDeleted: true, isChanged: true } : answer
                    );

                    // Reassign SequenceNumbers for non-deleted answers
                    const reassignedAnswers = updatedAnswers.map((answer, index) => {
                        if (!answer.isDeleted) {
                            return { ...answer, SequenceNumber: index + 1 };
                        }
                        return answer;
                    });

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
        if (activity === 'feedbackMcqs') {
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
        }
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
                            accept="image/*"
                            onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                    const file = e.target.files[0];

                                    // Create a preview URL
                                    const url = URL.createObjectURL(file);

                                    // Update the question with the file and preview
                                    const updatedQuestion = {
                                        ...questions[qIndex],
                                        questionImageFile: file,
                                        questionImagePreview: url,
                                        isChanged: true,
                                        // Clear video fields as we're using image now
                                        questionVideoFile: null,
                                        questionVideoPreview: null,
                                        questionVideoUrl: null
                                    };

                                    setQuestions(questions.map((q, i) =>
                                        i === qIndex ? updatedQuestion : q
                                    ));
                                }
                            }}
                        />
                        <div className={styles.media_preview_container}>
                            {question.questionImagePreview ? (
                                // Show preview of newly selected file
                                <div className={styles.image_preview}>
                                    <h4 className={styles.preview_header}>Image Preview</h4>
                                    <img src={question.questionImagePreview} alt="Question" className={styles.image} />
                                </div>
                            ) : question.questionImageUrl ? (
                                // Show existing image from database
                                <div className={styles.image_preview}>
                                    <h4 className={styles.preview_header}>Current Image</h4>
                                    <img src={question.questionImageUrl} alt="Question" className={styles.image} />
                                </div>
                            ) : null}
                        </div>
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
                            accept="image/*"
                            onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                    const file = e.target.files[0];

                                    // Create a preview URL
                                    const url = URL.createObjectURL(file);

                                    // Update the question with the file and preview
                                    const updatedQuestion = {
                                        ...questions[qIndex],
                                        questionImageFile: file,
                                        questionImagePreview: url,
                                        isChanged: true,
                                        // Clear video fields as we're using image now
                                        questionVideoFile: null,
                                        questionVideoPreview: null,
                                        questionVideoUrl: null
                                    };

                                    setQuestions(questions.map((q, i) =>
                                        i === qIndex ? updatedQuestion : q
                                    ));
                                }
                            }}
                        />
                        <div className={styles.media_preview_container}>
                            {question.questionImagePreview ? (
                                // Show preview of newly selected file
                                <div className={styles.image_preview}>
                                    <h4 className={styles.preview_header}>Image Preview</h4>
                                    <img src={question.questionImagePreview} alt="Question" className={styles.image} />
                                </div>
                            ) : question.questionImageUrl ? (
                                // Show existing image from database
                                <div className={styles.image_preview}>
                                    <h4 className={styles.preview_header}>Current Image</h4>
                                    <img src={question.questionImageUrl} alt="Question" className={styles.image} />
                                </div>
                            ) : null}
                        </div>
                    </div>
                );
            case "Video":
                return (
                    <div className={styles.form_group}>
                        <label className={styles.label}>Upload Question Video</label>
                        <input
                            className={styles.input_field}
                            type="file"
                            accept="video/*"
                            onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                    const file = e.target.files[0];

                                    // Create a preview URL
                                    const url = URL.createObjectURL(file);

                                    // Update the question with the file and preview
                                    const updatedQuestion = {
                                        ...questions[qIndex],
                                        questionVideoFile: file,
                                        questionVideoPreview: url,
                                        isChanged: true,
                                        // Clear image fields as we're using video now
                                        questionImageFile: null,
                                        questionImagePreview: null,
                                        questionImageUrl: null
                                    };

                                    setQuestions(questions.map((q, i) =>
                                        i === qIndex ? updatedQuestion : q
                                    ));
                                }
                            }}
                        />
                        <div className={styles.media_preview_container}>
                            {question.questionVideoPreview ? (
                                // Show preview of newly selected file
                                <div className={styles.video_preview}>
                                    <h4 className={styles.preview_header}>Video Preview</h4>
                                    <video src={question.questionVideoPreview} controls className={styles.video} />
                                </div>
                            ) : question.questionVideoUrl ? (
                                // Show existing video from database
                                <div className={styles.video_preview}>
                                    <h4 className={styles.preview_header}>Current Video</h4>
                                    <video src={question.questionVideoUrl} controls className={styles.video} />
                                </div>
                            ) : null}
                        </div>
                    </div>
                );
            case "Text+Video":
                return (
                    <div className={styles.form_group}>
                        <label className={styles.label}>Question Text</label>
                        <input
                            className={styles.input_field}
                            type="text"
                            value={question.questionText}
                            onChange={(e) => handleQuestionChange(qIndex, "questionText", e.target.value)}
                        />
                        <label className={styles.label}>Upload Question Video</label>
                        <input
                            className={styles.input_field}
                            type="file"
                            accept="video/*"
                            onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                    const file = e.target.files[0];

                                    // Create a preview URL
                                    const url = URL.createObjectURL(file);

                                    // Update the question with the file and preview
                                    const updatedQuestion = {
                                        ...questions[qIndex],
                                        questionVideoFile: file,
                                        questionVideoPreview: url,
                                        isChanged: true,
                                        // Clear image fields as we're using video now
                                        questionImageFile: null,
                                        questionImagePreview: null,
                                        questionImageUrl: null
                                    };

                                    setQuestions(questions.map((q, i) =>
                                        i === qIndex ? updatedQuestion : q
                                    ));
                                }
                            }}
                        />
                        <div className={styles.media_preview_container}>
                            {question.questionVideoPreview ? (
                                // Show preview of newly selected file
                                <div className={styles.video_preview}>
                                    <h4 className={styles.preview_header}>Video Preview</h4>
                                    <video src={question.questionVideoPreview} controls className={styles.video} />
                                </div>
                            ) : question.questionVideoUrl ? (
                                // Show existing video from database
                                <div className={styles.video_preview}>
                                    <h4 className={styles.preview_header}>Current Video</h4>
                                    <video src={question.questionVideoUrl} controls className={styles.video} />
                                </div>
                            ) : null}
                        </div>
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

                                {/* Text Instruction */}
                                <div className={styles.form_group}>
                                    <div className={styles.checkbox_wrapper}>
                                        <div className={styles.custom_checkbox_container}>
                                            <input
                                                className={styles.custom_checkbox}
                                                type="checkbox"
                                                checked={enableTextInstruction}
                                                onChange={(e) => setEnableTextInstruction(e.target.checked)}
                                                id="enableTextInstruction"
                                            />
                                            <label className={styles.checkbox_label} htmlFor="enableTextInstruction">
                                                <span className={styles.checkmark}></span>
                                                <span className={styles.label_text}>Text Instruction</span>
                                            </label>
                                        </div>
                                    </div>
                                    {enableTextInstruction && (
                                        <textarea
                                            className={styles.input_field}
                                            placeholder="Enter text instruction..."
                                            value={textInstruction}
                                            onChange={(e) => setTextInstruction(e.target.value)}
                                            rows={3}
                                            style={{ marginTop: "10px" }}
                                        />
                                    )}
                                </div>

                                {/* Audio Instruction */}
                                <div className={styles.form_group}>
                                    <div className={styles.checkbox_wrapper}>
                                        <div className={styles.custom_checkbox_container}>
                                            <input
                                                className={styles.custom_checkbox}
                                                type="checkbox"
                                                checked={enableAudioInstruction}
                                                onChange={(e) => {
                                                    setEnableAudioInstruction(e.target.checked);
                                                    if (!e.target.checked) {
                                                        setAudioInstruction(null);
                                                    }
                                                }}
                                                id="enableAudioInstruction"
                                            />
                                            <label className={styles.checkbox_label} htmlFor="enableAudioInstruction">
                                                <span className={styles.checkmark}></span>
                                                <span className={styles.label_text}>Audio Instruction</span>
                                            </label>
                                        </div>
                                    </div>
                                    {enableAudioInstruction && (
                                        <div>
                                            {lessonData.audioInstructionUrl && (
                                                <div style={{ marginBottom: "10px" }}>
                                                    <label className={styles.label}>Current Audio:</label>
                                                    <audio controls style={{ display: "block", marginTop: "5px" }}>
                                                        <source src={lessonData.audioInstructionUrl} type="audio/mpeg" />
                                                        Your browser does not support the audio element.
                                                    </audio>
                                                </div>
                                            )}
                                            <input
                                                className={styles.input_field}
                                                type="file"
                                                accept=".mp3,audio/mpeg"
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        if (file.size > 16 * 1024 * 1024) {
                                                            alert("File size should be less than 16MB");
                                                            e.target.value = "";
                                                            return;
                                                        }
                                                        if (!file.type.includes("audio/mpeg") && !file.name.endsWith(".mp3")) {
                                                            alert("Please select an MP3 file");
                                                            e.target.value = "";
                                                            return;
                                                        }
                                                        setAudioInstruction(file);
                                                    }
                                                }}
                                                style={{ marginTop: "10px" }}
                                            />
                                            <small style={{ color: "#666", fontSize: "12px" }}>
                                                Upload MP3 file (max 16MB)
                                            </small>
                                        </div>
                                    )}
                                </div>

                                {/* Edit Questions */}
                                {questions.map((question, qIndex) => (
                                    <div key={qIndex} className={styles.question_box}>
                                        <div className={styles.question_header}>
                                            <h3 className={styles.question_title}>Question {question.questionNumber}</h3>
                                            <button className={styles.remove_button} onClick={() => removeQuestion(qIndex)}>Remove Question</button>
                                        </div>

                                        <div className={styles.question_section}>
                                            <div className={styles.input_row}>
                                                <label className={styles.label}>Question Number</label>
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
                                                    {activity === 'mcqs' && (
                                                        <>
                                                            <option value="Image">Image</option>
                                                            <option value="Video">Video</option>
                                                            <option value="Text+Image">Text + Image</option>
                                                            <option value="Text+Video">Text + Video</option>
                                                        </>
                                                    )}
                                                </select>
                                            </div>

                                            <div className={styles.question_content}>
                                                {renderQuestionInputs(question, qIndex)}
                                            </div>
                                            {activity === 'mcqs' && (
                                                <div className={styles.custom_feedback_toggle}>
                                                    <div className={styles.checkbox_wrapper}>
                                                        <div className={styles.custom_checkbox_container}>
                                                            <input
                                                                className={styles.custom_checkbox}
                                                                type="checkbox"
                                                                checked={question.showCustomFeedback || false}
                                                                onChange={(e) => handleQuestionChange(qIndex, "showCustomFeedback", e.target.checked)}
                                                                id={`showCustomFeedback-${qIndex}`}
                                                            />
                                                            <label className={styles.checkbox_label} htmlFor={`showCustomFeedback-${qIndex}`}>
                                                                <span className={styles.checkmark}></span>
                                                                <span className={styles.label_text}>Enable Custom Feedback</span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {activity === 'mcqs' && question.showCustomFeedback && (
                                                <div className={styles.feedback_type_selector}>
                                                    <h5 className={styles.feedback_type_title}>Select Feedback Type</h5>
                                                    <div className={styles.radio_group}>
                                                        <label className={styles.radio_label}>
                                                            <input
                                                                type="radio"
                                                                name={`feedbackType-${qIndex}`}
                                                                value="text"
                                                                checked={question.customFeedbackType === "text"}
                                                                onChange={() => handleQuestionChange(qIndex, "customFeedbackType", "text")}
                                                            />
                                                            <span>Only Text</span>
                                                        </label>
                                                        <label className={styles.radio_label}>
                                                            <input
                                                                type="radio"
                                                                name={`feedbackType-${qIndex}`}
                                                                value="image"
                                                                checked={question.customFeedbackType === "image"}
                                                                onChange={() => handleQuestionChange(qIndex, "customFeedbackType", "image")}
                                                            />
                                                            <span>Only Image</span>
                                                        </label>
                                                        <label className={styles.radio_label}>
                                                            <input
                                                                type="radio"
                                                                name={`feedbackType-${qIndex}`}
                                                                value="audio"
                                                                checked={question.customFeedbackType === "audio"}
                                                                onChange={() => handleQuestionChange(qIndex, "customFeedbackType", "audio")}
                                                            />
                                                            <span>Only Audio</span>
                                                        </label>
                                                        <label className={styles.radio_label}>
                                                            <input
                                                                type="radio"
                                                                name={`feedbackType-${qIndex}`}
                                                                value="text+image"
                                                                checked={question.customFeedbackType === "text+image"}
                                                                onChange={() => handleQuestionChange(qIndex, "customFeedbackType", "text+image")}
                                                            />
                                                            <span>Text + Image</span>
                                                        </label>
                                                        <label className={styles.radio_label}>
                                                            <input
                                                                type="radio"
                                                                name={`feedbackType-${qIndex}`}
                                                                value="text+audio"
                                                                checked={question.customFeedbackType === "text+audio"}
                                                                onChange={() => handleQuestionChange(qIndex, "customFeedbackType", "text+audio")}
                                                            />
                                                            <span>Text + Audio</span>
                                                        </label>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className={styles.answers_section}>
                                            <h4 className={styles.answers_title}>Answer Options</h4>

                                            <div className={styles.answers_container}>
                                                {question.answers
                                                    .filter((answer) => !answer.isDeleted)
                                                    .map((answer, aIndex) => (
                                                        <div key={aIndex} className={styles.answer_box}>
                                                            <div className={styles.answer_header}>
                                                                <span className={styles.answer_number}>Answer {aIndex + 1}</span>
                                                                {activity === 'mcqs' && (
                                                                    <div className={styles.correct_checkbox}>
                                                                        <div className={styles.checkbox_wrapper}>
                                                                            <div className={styles.custom_checkbox_container}>
                                                                                <input
                                                                                    className={styles.custom_checkbox}
                                                                                    type="checkbox"
                                                                                    checked={answer.isCorrect}
                                                                                    onChange={(e) => handleAnswerChange(qIndex, aIndex, "isCorrect", e.target.checked)}
                                                                                    id={`isCorrect-${qIndex}-${aIndex}`}
                                                                                />
                                                                                <label className={styles.checkbox_label} htmlFor={`isCorrect-${qIndex}-${aIndex}`}>
                                                                                    <span className={styles.checkmark}></span>
                                                                                    <span className={styles.label_text}>Correct</span>
                                                                                </label>
                                                                            </div>

                                                                        </div>


                                                                        {question.answers.length > 1 && (
                                                                            <button
                                                                                className={styles.remove_button}
                                                                                onClick={() => removeAnswer(qIndex, aIndex)}
                                                                            >
                                                                                Remove Answer
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className={styles.answer_content}>
                                                                <div className={styles.input_row}>
                                                                    <label className={styles.label}>Answer Text</label>
                                                                    <input
                                                                        className={styles.input_field}
                                                                        type="text"
                                                                        value={answer.answerText}
                                                                        onChange={(e) => handleAnswerChange(qIndex, aIndex, "answerText", e.target.value)}
                                                                    />
                                                                </div>

                                                                {activity === 'mcqs' && question.showCustomFeedback && (
                                                                    <div className={styles.feedback_section}>
                                                                        <h5 className={styles.feedback_title}>Custom Feedback</h5>

                                                                        {(question.customFeedbackType === "text" ||
                                                                            question.customFeedbackType === "text+image" ||
                                                                            question.customFeedbackType === "text+audio") && (
                                                                                <div className={styles.input_row}>
                                                                                    <label className={styles.label}>Feedback Text</label>
                                                                                    <input
                                                                                        className={styles.input_field}
                                                                                        type="text"
                                                                                        value={answer.customAnswerFeedbackText || ""}
                                                                                        onChange={(e) => handleAnswerChange(qIndex, aIndex, "customAnswerFeedbackText", e.target.value)}
                                                                                    />
                                                                                </div>
                                                                            )}

                                                                        {(question.customFeedbackType === "image" ||
                                                                            question.customFeedbackType === "text+image") && (
                                                                                <div className={styles.feedback_media_container}>
                                                                                    <label className={styles.label}>Feedback Image</label>
                                                                                    <input
                                                                                        className={styles.input_field}
                                                                                        type="file"
                                                                                        accept="image/*"
                                                                                        onChange={(e) => {
                                                                                            if (e.target.files && e.target.files[0]) {
                                                                                                const file = e.target.files[0];

                                                                                                // Create a preview URL for the selected file
                                                                                                const url = URL.createObjectURL(file);

                                                                                                // Update multiple properties at once to ensure UI updates properly
                                                                                                const updatedAnswer = {
                                                                                                    ...question.answers[aIndex],
                                                                                                    customAnswerFeedbackImage: file,
                                                                                                    customAnswerFeedbackImagePreview: url,
                                                                                                    customAnswerFeedbackImageFilename: file.name,
                                                                                                    isChanged: true
                                                                                                };

                                                                                                const updatedAnswers = question.answers.map((ans, idx) =>
                                                                                                    idx === aIndex ? updatedAnswer : ans
                                                                                                );

                                                                                                const updatedQuestion = {
                                                                                                    ...question,
                                                                                                    answers: updatedAnswers,
                                                                                                    isChanged: true
                                                                                                };

                                                                                                const updatedQuestions = questions.map((q, idx) =>
                                                                                                    idx === qIndex ? updatedQuestion : q
                                                                                                );

                                                                                                setQuestions(updatedQuestions);
                                                                                            }
                                                                                        }}
                                                                                    />
                                                                                    <div className={styles.audio_preview_container}>
                                                                                        <h4 className={styles.preview_header}>
                                                                                            Image Preview
                                                                                        </h4>
                                                                                        <div className={styles.image_preview}>
                                                                                            {answer.customAnswerFeedbackImagePreview ? (
                                                                                                // Show preview of newly selected file
                                                                                                <img
                                                                                                    src={answer.customAnswerFeedbackImagePreview}
                                                                                                    alt="Feedback Preview"
                                                                                                    className={styles.image}
                                                                                                />
                                                                                            ) : answer.customAnswerFeedbackImage && typeof answer.customAnswerFeedbackImage === 'string' ? (
                                                                                                // Show existing image from database
                                                                                                <img
                                                                                                    src={answer.customAnswerFeedbackImage}
                                                                                                    alt="Feedback"
                                                                                                    className={styles.image}
                                                                                                />
                                                                                            ) : answer.customAnswerFeedbackImage ? (
                                                                                                // For newly added file but no preview yet
                                                                                                <div className={styles.file_selected_message}>
                                                                                                    Image file selected and will be uploaded when you save
                                                                                                </div>
                                                                                            ) : (
                                                                                                <div className={styles.no_preview}>No image selected</div>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            )}

                                                                        {(question.customFeedbackType === "audio" ||
                                                                            question.customFeedbackType === "text+audio") && (
                                                                                <div className={styles.feedback_media_container}>
                                                                                    <label className={styles.label}>Feedback Audio</label>
                                                                                    <input
                                                                                        className={styles.input_field}
                                                                                        type="file"
                                                                                        accept="audio/*"
                                                                                        onChange={(e) => {
                                                                                            if (e.target.files && e.target.files[0]) {
                                                                                                const file = e.target.files[0];

                                                                                                // Create a preview URL for the selected file
                                                                                                const url = URL.createObjectURL(file);

                                                                                                // Update multiple properties at once to ensure UI updates properly
                                                                                                const updatedAnswer = {
                                                                                                    ...question.answers[aIndex],
                                                                                                    customAnswerFeedbackAudio: file,
                                                                                                    customAnswerFeedbackAudioPreview: url,
                                                                                                    customAnswerFeedbackAudioFilename: file.name,
                                                                                                    isChanged: true
                                                                                                };

                                                                                                const updatedAnswers = question.answers.map((ans, idx) =>
                                                                                                    idx === aIndex ? updatedAnswer : ans
                                                                                                );

                                                                                                const updatedQuestion = {
                                                                                                    ...question,
                                                                                                    answers: updatedAnswers,
                                                                                                    isChanged: true
                                                                                                };

                                                                                                const updatedQuestions = questions.map((q, idx) =>
                                                                                                    idx === qIndex ? updatedQuestion : q
                                                                                                );

                                                                                                setQuestions(updatedQuestions);
                                                                                            }
                                                                                        }}
                                                                                    />
                                                                                    <div className={styles.audio_preview_container}>
                                                                                        <h4 className={styles.preview_header}>
                                                                                            Audio Preview
                                                                                        </h4>
                                                                                        <div className={styles.audio_preview}>
                                                                                            {answer.customAnswerFeedbackAudioPreview ? (
                                                                                                // Show preview of newly selected file
                                                                                                <audio
                                                                                                    src={answer.customAnswerFeedbackAudioPreview}
                                                                                                    controls
                                                                                                    preload="auto"
                                                                                                    className={styles.audio_player}
                                                                                                />
                                                                                            ) : answer.customAnswerFeedbackAudio && typeof answer.customAnswerFeedbackAudio === 'string' ? (
                                                                                                // Show existing audio from database
                                                                                                <audio
                                                                                                    src={answer.customAnswerFeedbackAudio}
                                                                                                    controls
                                                                                                    preload="auto"
                                                                                                    className={styles.audio_player}
                                                                                                />
                                                                                            ) : answer.customAnswerFeedbackAudio ? (
                                                                                                // For newly added file, create a URL and display it
                                                                                                <div className={styles.file_selected_message}>
                                                                                                    Audio file selected and will be uploaded when you save
                                                                                                </div>
                                                                                            ) : (
                                                                                                <div className={styles.no_preview}>No audio selected</div>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>

                                            {activity === 'mcqs' && question.answers.length < 4 && (
                                                <button className={styles.add_button} onClick={() => addNewAnswer(qIndex)}>Add Answer</button>
                                            )}
                                        </div>
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

    const openTestLessonModal = (lesson) => {
        setSelectedLesson(lesson);
        setIsTestLessonModalOpen(true);
    };

    const closeTestLessonModal = () => {
        setSelectedLesson(null);
        setIsTestLessonModalOpen(false);
    };

    const handleTestLesson = async (phoneNumber, selectedLesson) => {
        const testResponse = await testLesson(phoneNumber, selectedLesson);
        if (testResponse.status !== 200) {
            alert(testResponse.data.message);
        } else {
            alert(`Lesson test setup successfully.\nType : ${testResponse.data.result.message}`);
            closeTestLessonModal();
        }
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
        'feedbackMcqs': 'Feedback MCQs',
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

export default MCQsLesson;

