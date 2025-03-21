import React, { useState, useEffect } from 'react';
import styles from './CreateLesson.module.css';
import { getAllCategories, getCoursesByCategoryId, getCourseById, getAllActivityAliases } from '../../../../helper';
import { createAudioLesson, createVideoLesson, createReadLesson, createListenAndSpeakLesson, createMCQLesson, createWatchAndSpeakLesson, createConversationalBotLesson, createSpeakingPracticeLesson } from '../../../../utils/createLessonFunctions';

const SelectField = ({ label, options, onChange, value, name, id }) => (
    <div className={styles.form_group}>
        <label className={styles.label} htmlFor={id}>{label}</label>
        <select className={styles.input_field} onChange={onChange} value={value} name={name} id={id}>
            {options.map(option => (
                <option key={option.key} value={option.value}>{option.label}</option>
            ))}
        </select>
    </div>
);

const InputField = ({ label, type, onChange, value, name, id, fileInput = false, checked = false }) => (
    fileInput ? (
        <div className={styles.form_group}>
            <label className={styles.label} htmlFor={id}>{label}</label>
            <input type={type} onChange={onChange} name={name} id={id} />
        </div>) : (
        <div className={styles.form_group}>
            <label className={styles.label} htmlFor={id}>{label}</label>
            {type == 'textarea' ? (
                <textarea className={styles.text_area} onChange={onChange} value={value} name={name} id={id} />
            ) : (
                <input className={styles.input_field} type={type} onChange={onChange} value={value} name={name} id={id} checked={checked} />
            )}
        </div>
    )
);

const CreateLesson = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [courses, setCourses] = useState([]);
    const [courseWeeks, setCourseWeeks] = useState([]);
    const [activityAliases, setActivityAliases] = useState([]);
    const [category, setCategory] = useState('');
    const [course, setCourse] = useState('');
    const [sequenceNumber, setSequenceNumber] = useState('');
    const [alias, setAlias] = useState('');
    const [activityType, setActivityType] = useState('');
    const [lessonText, setLessonText] = useState('');
    const [day, setDay] = useState('1');
    const [week, setWeek] = useState('1');
    const [status, setStatus] = useState('Active');
    const [showAllCourses, setShowAllCourses] = useState(false);

    // Listen
    const [image, setImage] = useState(null);
    const [audio, setAudio] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'image/jpeg' && file.size <= 4 * 1024 * 1024) {
            setImage(file);
        } else {
            alert('Please upload a JPG image not larger than 4MB.');
        }
    };

    const handleAudioChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'audio/mpeg' && file.size <= 16 * 1024 * 1024) {
            setAudio(file);
        } else {
            alert('Please upload an MP3 audio not larger than 16MB.');
        }
    };

    // Watch
    const [video, setVideo] = useState(null);

    const handleVideoChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'video/mp4' && file.size <= 16 * 1024 * 1024) {
            setVideo(file);
        } else {
            alert('Please upload an MP4 video not larger than 16MB.');
        }
    };

    // Watch and Speak
    const [wsQuestions, setWsQuestions] = useState([
        { questionText: '', video: '', answers: [{ answerText: '' }] }
    ]);

    const handleWsQuestionChange = (index, event) => {
        const newWsQuestions = [...wsQuestions];
        if (event.target.type === 'file') {
            const file = event.target.files[0];
            if (file && file.type === 'video/mp4' && file.size <= 16 * 1024 * 1024) {
                newWsQuestions[index][event.target.name] = file;
            } else {
                alert('Please upload an MP4 video not larger than 16MB.');
            }
        } else {
            newWsQuestions[index][event.target.name] = event.target.value;
        }
        setWsQuestions(newWsQuestions);
    };

    const handleWsAnswerChange = (questionIndex, answerIndex, event) => {
        const newWsQuestions = [...wsQuestions];
        newWsQuestions[questionIndex].answers[answerIndex][event.target.name] = event.target.value;
        setWsQuestions(newWsQuestions);
    };

    const addWsAnswer = (questionIndex, event) => {
        event.preventDefault();
        const newWsQuestions = [...wsQuestions];
        newWsQuestions[questionIndex].answers.push({ answerText: '' });
        setWsQuestions(newWsQuestions);
    };

    const addWsQuestion = (event) => {
        event.preventDefault();
        setWsQuestions([...wsQuestions, { questionText: '', video: '', answers: [{ answerText: '' }] }]);
    };

    const removeWsQuestion = (index, event) => {
        event.preventDefault();
        if (wsQuestions.length > 1) {
            const newWsQuestions = [...wsQuestions];
            newWsQuestions.splice(index, 1);
            setWsQuestions(newWsQuestions);
        }
    };

    const removeWsAnswer = (questionIndex, answerIndex, event) => {
        event.preventDefault();
        if (wsQuestions[questionIndex].answers.length > 1) {
            const newWsQuestions = [...wsQuestions];
            newWsQuestions[questionIndex].answers.splice(answerIndex, 1);
            setWsQuestions(newWsQuestions);
        }
    };

    // Conversational Questions Bot
    const [botQuestions, setBotQuestions] = useState([{ questionText: '' }]);

    const handleBotQuestionChange = (index, event) => {
        const newBotQuestions = [...botQuestions];
        newBotQuestions[index][event.target.name] = event.target.value;
        setBotQuestions(newBotQuestions);
    };

    const addBotQuestion = (event) => {
        event.preventDefault();
        setBotQuestions([...botQuestions, { questionText: '' }]);
    };

    const removeBotQuestion = (index, event) => {
        event.preventDefault();
        if (botQuestions.length > 1) {
            const newBotQuestions = [...botQuestions];
            newBotQuestions.splice(index, 1);
            setBotQuestions(newBotQuestions);
        }
    };

    // Conversational Monologue Bot (will contain videos only)
    const [monologueQuestions, setMonologueQuestions] = useState([{ questionText: '', video: '' }]);

    const handleMonologueQuestionChange = (index, event) => {
        const newMonologueQuestions = [...monologueQuestions];
        if (event.target.type === 'file') {
            const file = event.target.files[0];
            if (file && file.type === 'video/mp4' && file.size <= 16 * 1024 * 1024) {
                newMonologueQuestions[index][event.target.name] = file;
            } else {
                alert('Please upload an MP4 video not larger than 16MB.');
            }
        } else {
            newMonologueQuestions[index][event.target.name] = event.target.value;
        }
        setMonologueQuestions(newMonologueQuestions);
    };

    const addMonologueQuestion = (event) => {
        event.preventDefault();
        setMonologueQuestions([...monologueQuestions, { questionText: '', video: '' }]);
    };

    const removeMonologueQuestion = (index, event) => {
        event.preventDefault();
        if (monologueQuestions.length > 1) {
            const newMonologueQuestions = [...monologueQuestions];
            newMonologueQuestions.splice(index, 1);
            setMonologueQuestions(newMonologueQuestions);
        }
    };


    // Speaking Practice Questions
    const [speakingPracticeQuestions, setSpeakingPracticeQuestions] = useState([
        { audio: '' }
    ]);

    const handleSpeakingPracticeQuestionChange = (index, event) => {
        const newQuestions = [...speakingPracticeQuestions];
        if (event.target.type === 'file') {
            const file = event.target.files[0];
            if (file && file.type === 'audio/mpeg' && file.size <= 16 * 1024 * 1024) {
                newQuestions[index][event.target.name] = file;
            } else {
                alert('Please upload an MP3 audio not larger than 16MB.');
            }
        } else {
            newQuestions[index][event.target.name] = event.target.value;
        }
        setSpeakingPracticeQuestions(newQuestions);
    };

    const addSpeakingPracticeQuestion = (event) => {
        event.preventDefault();
        setSpeakingPracticeQuestions([...speakingPracticeQuestions, { audio: '' }]);
    };

    const removeSpeakingPracticeQuestion = (index, event) => {
        event.preventDefault();
        if (speakingPracticeQuestions.length > 1) {
            const newSpeakingPracticeQuestions = [...speakingPracticeQuestions];
            newSpeakingPracticeQuestions.splice(index, 1);
            setSpeakingPracticeQuestions(newSpeakingPracticeQuestions);
        }
    };

    // Listen and Speak
    const [questions, setQuestions] = useState([
        { questionText: '', audio: '', answers: [{ answerText: '' }] }
    ]);

    const handleQuestionChange = (index, event) => {
        const newQuestions = [...questions];
        if (event.target.type === 'file') {
            const file = event.target.files[0];
            if (file && file.type === 'audio/mpeg' && file.size <= 16 * 1024 * 1024) {
                newQuestions[index][event.target.name] = file;
            } else {
                alert('Please upload an MP3 audio not larger than 16MB.');
            }
        } else {
            newQuestions[index][event.target.name] = event.target.value;
        }
        setQuestions(newQuestions);
    };

    const handleAnswerChange = (questionIndex, answerIndex, event) => {
        const newQuestions = [...questions];
        newQuestions[questionIndex].answers[answerIndex][event.target.name] = event.target.value;
        setQuestions(newQuestions);
    };

    const addAnswer = (questionIndex, event) => {
        event.preventDefault();
        const newQuestions = [...questions];
        newQuestions[questionIndex].answers.push({ answerText: '' });
        setQuestions(newQuestions);
    };

    const addQuestion = (event) => {
        event.preventDefault();
        setQuestions([...questions, { questionText: '', audio: '', answers: [{ answerText: '' }] }]);
    };

    const removeQuestion = (index, event) => {
        event.preventDefault();
        if (questions.length > 1) {
            const newQuestions = [...questions];
            newQuestions.splice(index, 1);
            setQuestions(newQuestions);
        }
    };

    const removeAnswer = (questionIndex, answerIndex, event) => {
        event.preventDefault();
        if (questions[questionIndex].answers.length > 1) {
            const newQuestions = [...questions];
            newQuestions[questionIndex].answers.splice(answerIndex, 1);
            setQuestions(newQuestions);
        }
    };

    // MCQs
    const [mcqs, setMcqs] = useState([
        {
            questionType: 'text', questionText: '', questionAudio: null, questionImage: null, questionVideo: null,
            answers: Array(4).fill().map(() => ({ answerType: 'text', answerText: '', answerAudio: null, answerImage: null, isCorrect: false, customAnswerFeedbackText: '', customAnswerFeedbackImage: '' }))
        }
    ]);

    const handleMCQQuestionChange = (index, event) => {
        const newMcqs = [...mcqs];
        if (event.target.type === 'file') {
            const file = event.target.files[0];
            if ((event.target.name === 'questionImage' && file && file.type === 'image/jpeg' && file.size <= 4 * 1024 * 1024) ||
                (event.target.name === 'questionAudio' && file && file.type === 'audio/mpeg' && file.size <= 16 * 1024 * 1024) ||
                (event.target.name === 'questionVideo' && file && file.type === 'video/mp4' && file.size <= 16 * 1024 * 1024)) {
                newMcqs[index][event.target.name] = file;
            } else {
                alert('Please upload a valid file with correct format and size.');
            }
        } else {
            newMcqs[index][event.target.name] = event.target.value;
        }
        setMcqs(newMcqs);
    };

    const handleMCQAnswerChange = (qIndex, aIndex, event) => {
        const newMcqs = [...mcqs];
        if (event.target.type === 'file') {
            const file = event.target.files[0];
            if ((event.target.name === 'answerImage' && file && file.type === 'image/jpeg' && file.size <= 4 * 1024 * 1024) ||
                (event.target.name === 'answerAudio' && file && file.type === 'audio/mpeg' && file.size <= 16 * 1024 * 1024)) {
                newMcqs[qIndex].answers[aIndex][event.target.name] = file;
            } else {
                alert('Please upload a valid file with correct format and size.');
            }
        } else if (event.target.type === 'checkbox') {
            newMcqs[qIndex].answers[aIndex].isCorrect = event.target.checked;
        } else if (event.target.name === 'answerType') {
            newMcqs[qIndex].answers.forEach(answer => {
                answer[event.target.name] = event.target.value;
            });
        } else {
            newMcqs[qIndex].answers[aIndex][event.target.name] = event.target.value;
        }
        setMcqs(newMcqs);
    };

    const addMCQQuestion = (event) => {
        event.preventDefault();
        setMcqs([...mcqs, {
            questionType: 'text', questionText: '', questionAudio: null, questionImage: null, questionVideo: null,
            answers: Array(4).fill().map(() => ({ answerType: 'text', answerText: '', answerAudio: null, answerImage: null, isCorrect: false, customAnswerFeedbackText: '', customAnswerFeedbackImage: '' }))
        }]);
    };

    const removeMCQQuestion = (index, event) => {
        event.preventDefault();
        if (mcqs.length > 1) {
            const newMcqs = [...mcqs];
            newMcqs.splice(index, 1);
            setMcqs(newMcqs);
        }
    };

    useEffect(() => {
        const fetchCategoriesAndDefaultCourses = async () => {
            try {
                const [categoriesResponse, aliasesResponse] = await Promise.all([
                    getAllCategories(),
                    getAllActivityAliases()
                ]);
                if (categoriesResponse.status === 200 && aliasesResponse.status === 200) {
                    const filteredAliases = aliasesResponse.data.sort((a, b) => a.Alias.localeCompare(b.Alias));
                    setActivityAliases(filteredAliases);
                    const firstAlias = aliasesResponse.data[0].Alias;
                    setAlias(firstAlias);
                    const categoriesData = categoriesResponse.data;
                    setCategories(categoriesData);
                    if (categoriesData.length > 0) {
                        const firstCategoryId = categoriesData[0].CourseCategoryId;
                        setCategory(firstCategoryId);
                        const coursesResponse = await getCoursesByCategoryId(firstCategoryId);
                        if (coursesResponse.status === 200) {
                            setCourses(coursesResponse.data);
                            if (coursesResponse.data.length > 0) {
                                const firstCourseId = coursesResponse.data[0].CourseId;
                                setCourse(firstCourseId);
                                const courseResponse = await getCourseById(firstCourseId);
                                if (courseResponse.status === 200) {
                                    const courseData = courseResponse.data;
                                    setCourseWeeks(courseData.CourseWeeks);
                                } else {
                                    alert(courseResponse.data.message);
                                }
                            }
                        } else {
                            alert(coursesResponse.data.message);
                        }
                    }
                } else {
                    alert(categoriesResponse.data.message);
                }
            } catch (error) {
                alert(error);
            }
        };
        fetchCategoriesAndDefaultCourses();
    }, []);

    const handleCategoryChange = async (e) => {
        setCategory(e.target.value);
        const categoryId = e.target.value;
        try {
            const response = await getCoursesByCategoryId(categoryId);
            if (response.status === 200) {
                setCourses(response.data);
                if (response.data.length > 0) {
                    const firstCourseId = response.data[0].CourseId;
                    setCourse(firstCourseId);
                    const courseResponse = await getCourseById(firstCourseId);
                    if (courseResponse.status === 200) {
                        const courseData = courseResponse.data;
                        setCourseWeeks(courseData.CourseWeeks);
                    } else {
                        alert(courseResponse.data.message);
                    }
                }
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            alert(error);
        }
    };

    const handleCourseChange = async (e) => {
        setCourse(e.target.value);
        const courseId = e.target.value;
        try {
            const response = await getCourseById(courseId);
            if (response.status === 200) {
                setCourseWeeks(response.data.CourseWeeks);
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            alert(error);
        }
    };

    const handleSequenceNumberChange = (e) => {
        setSequenceNumber(e.target.value);
    };

    const handleAliasChange = (e) => {
        setAlias(e.target.value);
    };

    const handleActivityTypeChange = (e) => {
        setActivityType(e.target.value);
    };

    const handleTextEditorChange = (e) => {
        setLessonText(e.target.value);
    };

    const handleDayChange = (e) => {
        setDay(e.target.value);
    };

    const handleWeekChange = (e) => {
        setWeek(e.target.value);
    };

    const handleStatusChange = (e) => {
        setStatus(e.target.value);
    };

    const handleShowAllCoursesChange = (e) => {
        setShowAllCourses(e.target.checked);
    };

    const handleCreateLesson = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (activityType === 'audio') {
                await createAudioLesson(course, sequenceNumber, alias, activityType, image, audio, lessonText, day, week, status);
            } else if (activityType === 'video') {
                await createVideoLesson(course, sequenceNumber, alias, activityType, video, lessonText, day, week, status);
            } else if (activityType === 'videoEnd') {
                await createVideoLesson(course, sequenceNumber, alias, activityType, video, lessonText, day, week, status);
            } else if (activityType === 'read') {
                await createReadLesson(course, sequenceNumber, alias, activityType, video, lessonText, day, week, status);
            } else if (activityType === 'listenAndSpeak' || activityType === 'preListenAndSpeak' || activityType === 'postListenAndSpeak') {
                await createListenAndSpeakLesson(course, sequenceNumber, alias, activityType, questions, lessonText, day, week, status);
            } else if (activityType === 'mcqs' || activityType === 'preMCQs' || activityType === 'postMCQs') {
                await createMCQLesson(course, sequenceNumber, alias, activityType, mcqs, lessonText, day, week, status);
            } else if (activityType === 'watchAndSpeak') {
                await createWatchAndSpeakLesson(course, sequenceNumber, alias, activityType, wsQuestions, lessonText, day, week, status);
            } else if (activityType === 'watchAndAudio') {
                await createWatchAndSpeakLesson(course, sequenceNumber, alias, activityType, wsQuestions, lessonText, day, week, status);
            } else if (activityType === 'watchAndImage') {
                await createWatchAndSpeakLesson(course, sequenceNumber, alias, activityType, wsQuestions, lessonText, day, week, status);
            } else if (activityType === 'conversationalQuestionsBot') {
                await createConversationalBotLesson(course, sequenceNumber, alias, activityType, botQuestions, lessonText, day, week, status);
            } else if (activityType === 'conversationalMonologueBot') {
                await createConversationalBotLesson(course, sequenceNumber, alias, activityType, monologueQuestions, lessonText, day, week, status);
            } else if (activityType === 'conversationalAgencyBot') {
                await createConversationalBotLesson(course, sequenceNumber, alias, activityType, botQuestions, lessonText, day, week, status);
            } else if (activityType === 'speakingPractice') {
                await createSpeakingPracticeLesson(course, sequenceNumber, alias, activityType, speakingPracticeQuestions, lessonText, day, week, status);
            }
        } catch (error) {
            alert(error);
        } finally {
            setIsLoading(false);
            setSequenceNumber('');
            setActivityType('');
            setLessonText('');
            setDay('1');
            setWeek('1');
            setStatus('Active');
            setImage(null);
            setAudio(null);
            setVideo(null);
            setQuestions([{ questionText: '', audio: '', answers: [{ answerText: '' }] }]);
            setWsQuestions([{ questionText: '', video: '', answers: [{ answerText: '' }] }]);
            setMcqs([{
                questionType: 'text', questionText: '', questionAudio: null, questionImage: null, questionVideo: null,
                answers: Array(4).fill().map(() => ({ answerType: 'text', answerText: '', answerAudio: null, answerImage: null, isCorrect: false, customAnswerFeedbackText: '', customAnswerFeedbackImage: '' }))
            }]);
            setBotQuestions([{ questionText: '' }]);
            setMonologueQuestions([{ video: '' }]);
        }
    }

    return (
        <div className={styles.content}>
            <h1 className={styles.heading}>Fill out your lesson details</h1>
            <form onSubmit={handleCreateLesson} className={styles.form}>
                <div className={styles.input_row}>
                    <SelectField label="Select Category" options={categories.map(category => ({ value: category.CourseCategoryId, label: category.CourseCategoryName }))} onChange={handleCategoryChange} value={category} name="category" id="category" />
                    <div className={styles.form_group}>
                        <SelectField
                            label="Select Course"
                            options={courses
                                .filter(course =>
                                    !course.CourseName.includes('2024') &&
                                    !course.CourseName.includes('Level 3 - T1 - January 27, 2025') &&
                                    !course.CourseName.includes('Level 3 - T2 - January 27, 2025')
                                )
                                .sort((a, b) => {
                                    // Extract level numbers if they exist
                                    const levelA = a.CourseName.match(/Level (\d+)/);
                                    const levelB = b.CourseName.match(/Level (\d+)/);

                                    // If both have levels, sort by level number first
                                    if (levelA && levelB) {
                                        const levelDiff = parseInt(levelA[1]) - parseInt(levelB[1]);
                                        if (levelDiff !== 0) return levelDiff;

                                        // For same level, sort T1 before T2
                                        const isT1A = a.CourseName.includes('T1');
                                        const isT1B = b.CourseName.includes('T1');
                                        if (isT1A && !isT1B) return -1;
                                        if (!isT1A && isT1B) return 1;
                                    }

                                    // If only A has level, it comes first
                                    if (levelA) return -1;
                                    // If only B has level, it comes first 
                                    if (levelB) return 1;
                                    // If neither has level, maintain original order
                                    return 0;
                                })
                                .map(course => ({
                                    value: course.CourseId,
                                    label: course.CourseName
                                }))}
                            onChange={handleCourseChange}
                            value={course}
                            name="course"
                            id="course"
                        />
                        <div className={styles.show_all_courses}>
                            <input
                                type="checkbox"
                                id="showAllCourses"
                                checked={showAllCourses}
                                onChange={handleShowAllCoursesChange}
                            />
                            <label htmlFor="showAllCourses">Show All Courses</label>
                        </div>
                    </div>
                </div>
                <div className={styles.input_row}>
                    <InputField label="Lesson Sequence Number" type="text" value={sequenceNumber} onChange={handleSequenceNumberChange} name="lesson_sequence" id="lesson_sequence" />
                    <SelectField label="Select Activity Alias" options={activityAliases.map(alias => ({ key: alias.id, value: alias.Alias, label: alias.Alias }))} onChange={handleAliasChange} value={alias} name="activity_alias" id="activity_alias" />
                </div>
                <div className={styles.input_row}>
                    <SelectField label="Select Week Number" options={Array.from({ length: courseWeeks }, (_, i) => i + 1).map(week => ({ value: week, label: week }))} onChange={handleWeekChange} value={week} name="week_number" id="week_number" />
                    <SelectField label="Select Day" options={Array.from({ length: 6 }, (_, i) => i + 1).map(day => ({ value: day, label: day }))} onChange={handleDayChange} value={day} name="day" id="day" />
                </div>
                <div className={styles.input_row}>
                    <SelectField label="Select Activity Type" options={[
                        { value: '-1', label: 'Select Activity Type' },
                        { value: 'audio', label: 'Listen' },
                        { value: 'video', label: 'Watch' },
                        { value: 'videoEnd', label: 'Watch End' },
                        { value: 'read', label: 'Read' },
                        { value: 'listenAndSpeak', label: 'Listen and Speak' },
                        { value: 'watchAndSpeak', label: 'Watch and Speak' },
                        { value: 'watchAndAudio', label: 'Watch and Audio' },
                        { value: 'watchAndImage', label: 'Watch and Image' },
                        { value: 'mcqs', label: 'MCQs' },
                        { value: 'conversationalQuestionsBot', label: 'Conversational Questions Bot' },
                        { value: 'conversationalMonologueBot', label: 'Conversational Monologue Bot' },
                        { value: 'conversationalAgencyBot', label: 'Conversational Agency Bot' },
                        { value: 'speakingPractice', label: 'Speaking Practice' },
                    ]} onChange={handleActivityTypeChange} value={activityType} name="activity_type" id="activity_type" />
                    <SelectField label="Status" options={[
                        { value: 'Active', label: 'Active' },
                        { value: 'Inactive', label: 'Inactive' }
                    ]} onChange={handleStatusChange} value={status} name="status" id="status" />
                </div>
                {activityType === 'audio' && (
                    <>
                        <div className={styles.input_row}>
                            <InputField label="Upload Image" type="file" onChange={handleImageChange} name="image" id="image" fileInput />
                            <InputField label="Upload Audio" type="file" onChange={handleAudioChange} name="audio" id="audio" fileInput />
                        </div>
                        <div className={styles.input_row}>
                            <div className={styles.form_group}>
                                <InputField label="Lesson Text" type="textarea" value={lessonText} onChange={handleTextEditorChange} name="lesson_text" id="lesson_text" />
                            </div>
                        </div>
                    </>
                )}
                {activityType === 'video' && (
                    <>
                        <div className={styles.input_row}>
                            <InputField label="Upload Video" type="file" onChange={handleVideoChange} name="video" id="video" fileInput />
                        </div>
                        <div className={styles.input_row}>
                            <div className={styles.form_group}>
                                <InputField label="Lesson Text" type="textarea" value={lessonText} onChange={handleTextEditorChange} name="lesson_text" id="lesson_text" />
                            </div>
                        </div>
                    </>
                )}
                {activityType === 'videoEnd' && (
                    <>
                        <div className={styles.input_row}>
                            <InputField label="Upload Video" type="file" onChange={handleVideoChange} name="video" id="video" fileInput />
                        </div>
                        <div className={styles.input_row}>
                            <div className={styles.form_group}>
                                <InputField label="Lesson Text" type="textarea" value={lessonText} onChange={handleTextEditorChange} name="lesson_text" id="lesson_text" />
                            </div>
                        </div>
                    </>
                )}
                {activityType === 'read' && (
                    <>
                        <div className={styles.input_row}>
                            <InputField label="Upload Video" type="file" onChange={handleVideoChange} name="video" id="video" fileInput />
                        </div>
                        <div className={styles.input_row}>
                            <div className={styles.form_group}>
                            <InputField label="Lesson Text" type="textarea" value={lessonText} onChange={handleTextEditorChange} name="lesson_text" id="lesson_text" />
                            </div>
                        </div>
                    </>
                )}
                {(activityType === 'listenAndSpeak' || activityType === 'preListenAndSpeak' || activityType === 'postListenAndSpeak') && (
                    <>
                        <div className={styles.input_row}>
                            <div className={styles.form_group}>
                            <InputField label="Lesson Text" type="textarea" value={lessonText} onChange={handleTextEditorChange} name="lesson_text" id="lesson_text" />
                            </div>
                        </div>
                        {questions.map((question, qIndex) => (
                            <div key={qIndex} className={styles.question_box}>
                                <div className={styles.input_row}>
                                    <InputField label={`Question ${qIndex + 1}`} type="text" onChange={e => handleQuestionChange(qIndex, e)} value={question.questionText} name="questionText" id={`questionText-${qIndex}`} />
                                    <InputField label="Upload Audio" type="file" onChange={e => handleQuestionChange(qIndex, e)} name="audio" id={`audio-${qIndex}`} fileInput />
                                    {questions.length > 1 && <button className={styles.remove_button} onClick={(e) => removeQuestion(qIndex, e)}>Remove Question</button>}
                                </div>
                                {question.answers.map((answer, aIndex) => (
                                    <div key={aIndex} className={styles.input_row}>
                                        <InputField label={`Answer ${aIndex + 1}`} type="text" onChange={e => handleAnswerChange(qIndex, aIndex, e)} value={answer.answerText} name="answerText" id={`answerText-${qIndex}-${aIndex}`} />
                                        {question.answers.length > 1 && <button className={styles.remove_button} onClick={(e) => removeAnswer(qIndex, aIndex, e)}>Remove Answer</button>}
                                    </div>
                                ))}
                                <button className={styles.add_button} onClick={(e) => addAnswer(qIndex, e)}>Add Another Answer</button>
                            </div>
                        ))}
                        <button className={styles.add_button} onClick={(e) => addQuestion(e)}>Add Another Question</button>
                    </>
                )}
                {activityType === 'conversationalQuestionsBot' && (
                    <>
                        <div className={styles.input_row}>
                            <div className={styles.form_group}>
                            <InputField label="Lesson Text" type="textarea" value={lessonText} onChange={handleTextEditorChange} name="lesson_text" id="lesson_text" />
                            </div>
                        </div>
                        {botQuestions.map((question, qIndex) => (
                            <div key={qIndex} className={styles.question_box}>
                                <div className={styles.input_row}>
                                    <InputField label={`Question ${qIndex + 1}`} type="text" onChange={e => handleBotQuestionChange(qIndex, e)} value={question.questionText} name="questionText" id={`questionText-${qIndex}`} />
                                    {botQuestions.length > 1 && <button className={styles.remove_button} onClick={(e) => removeBotQuestion(qIndex, e)}>Remove Question</button>}
                                </div>
                            </div>
                        ))}
                        <button className={styles.add_button} onClick={(e) => addBotQuestion(e)}>Add Another Question</button>
                    </>
                )}
                {activityType === 'conversationalMonologueBot' && (
                    <>
                        <div className={styles.input_row}>
                            <div className={styles.form_group}>
                            <InputField label="Lesson Text" type="textarea" value={lessonText} onChange={handleTextEditorChange} name="lesson_text" id="lesson_text" />
                            </div>
                        </div>
                        {monologueQuestions.map((question, qIndex) => (
                            <div key={qIndex} className={styles.question_box}>
                                <div className={styles.input_row}>
                                    <InputField label={`Question Text`} type="text" onChange={e => handleMonologueQuestionChange(qIndex, e)} value={question.questionText} name="questionText" id={`questionText-${qIndex}`} />
                                    <InputField label={`Upload Video`} type="file" onChange={e => handleMonologueQuestionChange(qIndex, e)} name="video" id={`video-${qIndex}`} fileInput />
                                    {monologueQuestions.length > 1 && <button className={styles.remove_button} onClick={(e) => removeMonologueQuestion(qIndex, e)}>Remove Question</button>}
                                </div>
                            </div>
                        ))}
                        <button className={styles.add_button} onClick={(e) => addMonologueQuestion(e)}>Add Another Question</button>
                    </>
                )}
                {activityType === 'speakingPractice' && (
                    <>
                        <div className={styles.input_row}>
                            <div className={styles.form_group}>
                            <InputField label="Lesson Text" type="textarea" value={lessonText} onChange={handleTextEditorChange} name="lesson_text" id="lesson_text" />
                            </div>
                        </div>
                        {speakingPracticeQuestions.map((question, qIndex) => (
                            <div key={qIndex} className={styles.question_box}>
                                <div className={styles.input_row}>
                                    <InputField label={`Question ${qIndex + 1}`} type="file" onChange={e => handleSpeakingPracticeQuestionChange(qIndex, e)} name="audio" id={`audio-${qIndex}`} fileInput />
                                    {speakingPracticeQuestions.length > 1 && <button className={styles.remove_button} onClick={(e) => removeSpeakingPracticeQuestion(qIndex, e)}>Remove Question</button>}
                                </div>
                            </div>
                        ))}
                        <button className={styles.add_button} onClick={(e) => addSpeakingPracticeQuestion(e)}>Add Another Question</button>
                    </>
                )}
                {activityType === 'conversationalAgencyBot' && (
                    <>
                        <div className={styles.input_row}>
                            <div className={styles.form_group}>
                            <InputField label="Lesson Text" type="textarea" value={lessonText} onChange={handleTextEditorChange} name="lesson_text" id="lesson_text" />
                            </div>
                        </div>
                        {botQuestions.map((question, qIndex) => (
                            <div key={qIndex} className={styles.question_box}>
                                <div className={styles.input_row}>
                                    <InputField label={`Question ${qIndex + 1}`} type="textarea" onChange={e => handleBotQuestionChange(qIndex, e)} value={question.questionText} name="questionText" id={`questionText-${qIndex}`} />
                                    {botQuestions.length > 1 && <button className={styles.remove_button} onClick={(e) => removeBotQuestion(qIndex, e)}>Remove Question</button>}
                                </div>
                            </div>
                        ))}
                        <button className={styles.add_button} onClick={(e) => addBotQuestion(e)}>Add Another Question</button>
                    </>
                )}
                {activityType === 'watchAndSpeak' && (
                    <>
                        <div className={styles.input_row}>
                            <div className={styles.form_group}>
                            <InputField label="Lesson Text" type="textarea" value={lessonText} onChange={handleTextEditorChange} name="lesson_text" id="lesson_text" />
                            </div>
                        </div>
                        {wsQuestions.map((question, qIndex) => (
                            <div key={qIndex} className={styles.question_box}>
                                <div className={styles.input_row}>
                                    <InputField label={`Question ${qIndex + 1}`} type="text" onChange={e => handleWsQuestionChange(qIndex, e)} value={question.questionText} name="questionText" id={`questionText-${qIndex}`} />
                                    <InputField label="Upload Video" type="file" onChange={e => handleWsQuestionChange(qIndex, e)} name="video" id={`video-${qIndex}`} fileInput />
                                    {wsQuestions.length > 1 && <button className={styles.remove_button} onClick={(e) => removeWsQuestion(qIndex, e)}>Remove Question</button>}
                                </div>
                                {question.answers.map((answer, aIndex) => (
                                    <div key={aIndex} className={styles.input_row}>
                                        <InputField label={`Answer ${aIndex + 1}`} type="text" onChange={e => handleWsAnswerChange(qIndex, aIndex, e)} value={answer.answerText} name="answerText" id={`answerText-${qIndex}-${aIndex}`} />
                                        {question.answers.length > 1 && <button className={styles.remove_button} onClick={(e) => removeWsAnswer(qIndex, aIndex, e)}>Remove Answer</button>}
                                    </div>
                                ))}
                                <button className={styles.add_button} onClick={(e) => addWsAnswer(qIndex, e)}>Add Another Answer</button>
                            </div>
                        ))}
                        <button className={styles.add_button} onClick={(e) => addWsQuestion(e)}>Add Another Question</button>
                    </>
                )}
                {activityType === 'watchAndAudio' && (
                    <>
                        <div className={styles.input_row}>
                            <div className={styles.form_group}>
                            <InputField label="Lesson Text" type="textarea" value={lessonText} onChange={handleTextEditorChange} name="lesson_text" id="lesson_text" />
                            </div>
                        </div>
                        {wsQuestions.map((question, qIndex) => (
                            <div key={qIndex} className={styles.question_box}>
                                <div className={styles.input_row}>
                                    <InputField label="Upload Video" type="file" onChange={e => handleWsQuestionChange(qIndex, e)} name="video" id={`video-${qIndex}`} fileInput />
                                    {wsQuestions.length > 1 && <button className={styles.remove_button} onClick={(e) => removeWsQuestion(qIndex, e)}>Remove Question</button>}
                                </div>
                            </div>
                        ))}
                        <button className={styles.add_button} onClick={(e) => addWsQuestion(e)}>Add Another Question</button>
                    </>
                )}
                {activityType === 'watchAndImage' && (
                    <>
                        <div className={styles.input_row}>
                            <div className={styles.form_group}>
                            <InputField label="Lesson Text" type="textarea" value={lessonText} onChange={handleTextEditorChange} name="lesson_text" id="lesson_text" />
                            </div>
                        </div>
                        {wsQuestions.map((question, qIndex) => (
                            <div key={qIndex} className={styles.question_box}>
                                <div className={styles.input_row}>
                                    <InputField label="Upload Video" type="file" onChange={e => handleWsQuestionChange(qIndex, e)} name="video" id={`video-${qIndex}`} fileInput />
                                    {wsQuestions.length > 1 && <button className={styles.remove_button} onClick={(e) => removeWsQuestion(qIndex, e)}>Remove Question</button>}
                                </div>
                            </div>
                        ))}
                        <button className={styles.add_button} onClick={(e) => addWsQuestion(e)}>Add Another Question</button>
                    </>
                )}
                {(activityType === 'mcqs' || activityType === 'preMCQs' || activityType === 'postMCQs') && (
                    <>
                        {mcqs.map((mcq, qIndex) => (
                            <div key={qIndex} className={styles.question_box}>
                                <div className={styles.input_row}>
                                    <SelectField label={`Question Type`} options={[
                                        { value: '-1', label: 'Select Question Type' },
                                        { value: 'Text', label: 'Text' },
                                        { value: 'Image', label: 'Image' },
                                        { value: 'Text+Image', label: 'Text + Image' },
                                        { value: 'Video', label: 'Video' },
                                        { value: 'Text+Video', label: 'Text + Video' },
                                    ]} onChange={(e) => handleMCQQuestionChange(qIndex, e)} value={mcq.questionType} name="questionType" id={`questionType-${qIndex}`} />
                                    {mcq.questionType.includes('Text') && (
                                        <InputField label={`Question Text`} type="text" onChange={(e) => handleMCQQuestionChange(qIndex, e)} value={mcq.questionText} name="questionText" id={`questionText-${qIndex}`} />
                                    )}
                                    {mcq.questionType.includes('Image') && (
                                        <InputField label={`Upload Question Image`} type="file" onChange={(e) => handleMCQQuestionChange(qIndex, e)} name="questionImage" id={`questionImage-${qIndex}`} fileInput />
                                    )}
                                    {mcq.questionType.includes('Audio') && (
                                        <InputField label={`Upload Question Audio`} type="file" onChange={(e) => handleMCQQuestionChange(qIndex, e)} name="questionAudio" id={`questionAudio-${qIndex}`} fileInput />
                                    )}
                                    {mcqs.length > 1 && <button className={styles.remove_button} onClick={(e) => removeMCQQuestion(qIndex, e)}>Remove Question</button>}
                                </div>
                                {mcq.answers.map((answer, aIndex) => (
                                    <div key={aIndex} className={styles.input_row}>
                                        <SelectField label={`Answer Type`} options={[
                                            { value: '-1', label: 'Select Answer Type' },
                                            { value: 'Text', label: 'Text' },
                                            { value: 'Image', label: 'Image' },
                                            { value: 'Text+Image', label: 'Text + Image' },
                                            { value: 'Video', label: 'Video' },
                                            { value: 'Text+Video', label: 'Text + Video' },
                                        ]} onChange={(e) => handleMCQAnswerChange(qIndex, aIndex, e)} value={answer.answerType} name="answerType" id={`answerType-${qIndex}-${aIndex}`} />
                                        {answer.answerType.includes('Text') && (
                                            <InputField label={`Answer Text`} type="text" onChange={(e) => handleMCQAnswerChange(qIndex, aIndex, e)} value={answer.answerText} name="answerText" id={`answerText-${qIndex}-${aIndex}`} />
                                        )}
                                        {answer.answerType.includes('Image') && (
                                            <InputField label={`Upload Answer Image`} type="file" onChange={(e) => handleMCQAnswerChange(qIndex, aIndex, e)} name="answerImage" id={`answerImage-${qIndex}-${aIndex}`} fileInput />
                                        )}
                                        {answer.answerType.includes('Audio') && (
                                            <InputField label={`Upload Answer Audio`} type="file" onChange={(e) => handleMCQAnswerChange(qIndex, aIndex, e)} name="answerAudio" id={`answerAudio-${qIndex}-${aIndex}`} fileInput />
                                        )}
                                        {answer.answerType.includes('Video') && (
                                            <InputField label={`Upload Answer Video`} type="file" onChange={(e) => handleMCQAnswerChange(qIndex, aIndex, e)} name="answerVideo" id={`answerVideo-${qIndex}-${aIndex}`} fileInput />
                                        )}
                                        <InputField label={`Correct`} type="checkbox" onChange={(e) => handleMCQAnswerChange(qIndex, aIndex, e)} checked={answer.isCorrect} name="isCorrect" id={`isCorrect-${qIndex}-${aIndex}`} />
                                    </div>
                                ))}
                            </div>
                        ))}
                        <button className={styles.add_button} onClick={(e) => addMCQQuestion(e)}>Add Another Question</button>
                    </>
                )}
                <button type="submit" className={styles.submit_button}>{isLoading ? <div className="loader"></div> : "Create Lesson"}</button>
            </form>
        </div>
    );
};

export default CreateLesson;
