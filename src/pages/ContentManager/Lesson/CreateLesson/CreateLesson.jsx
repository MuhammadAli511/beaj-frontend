import React, { useState, useEffect, useRef } from 'react';
import styles from './CreateLesson.module.css';
import { getAllCategories, getCoursesByCategoryId, getCourseById, getAllActivityAliases } from '../../../../helper';
import JoditEditor from 'jodit-react';
import { createAudioLesson, createVideoLesson, createReadLesson, createListenAndSpeakLesson, createMCQLesson } from '../../../../utils/createLessonFunctions';

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
            <input className={styles.input_field} type={type} onChange={onChange} value={value} name={name} id={id} checked={checked} />
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
    const editor = useRef(null);


    // Listen
    const [image, setImage] = useState(null);
    const [audio, setAudio] = useState(null);
    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };
    const handleAudioChange = (e) => {
        setAudio(e.target.files[0]);
    };


    // Watch
    const [video, setVideo] = useState(null);
    const handleVideoChange = (e) => {
        setVideo(e.target.files[0]);
    };


    // Read
    const [urduAudio, setUrduAudio] = useState(null);
    const handleUrduAudioChange = (e) => {
        setUrduAudio(e.target.files[0]);
    };


    // Listen and Speak
    const [questions, setQuestions] = useState([
        { questionText: '', audio: '', answers: [{ answerText: '' }] }
    ]);
    const handleQuestionChange = (index, event) => {
        const newQuestions = [...questions];
        if (event.target.type === 'file') {
            const file = event.target.files[0];
            newQuestions[index][event.target.name] = file;
            setQuestions(newQuestions);
        } else {
            const newQuestions = [...questions];
            newQuestions[index][event.target.name] = event.target.value;
            setQuestions(newQuestions);
        }
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
            questionType: 'text', questionText: '', questionAudio: null, questionImage: null,
            answers: Array(4).fill().map(() => ({ answerType: 'text', answerText: '', answerAudio: null, answerImage: null, isCorrect: false }))
        }
    ]);
    const handleMCQQuestionChange = (index, event) => {
        const newMcqs = [...mcqs];
        if (event.target.type === 'file') {
            const file = event.target.files[0];
            newMcqs[index][event.target.name] = file;
        } else {
            newMcqs[index][event.target.name] = event.target.value;
        }
        setMcqs(newMcqs);
    };
    const handleMCQAnswerChange = (qIndex, aIndex, event) => {
        const newMcqs = [...mcqs];
        if (event.target.type === 'file') {
            const file = event.target.files[0];
            newMcqs[qIndex].answers[aIndex][event.target.name] = file;
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
            questionType: 'text', questionText: '', questionAudio: null, questionImage: null,
            answers: Array(4).fill().map(() => ({ answerType: 'text', answerText: '', answerAudio: null, answerImage: null, isCorrect: false }))
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
                    setActivityAliases(aliasesResponse.data);
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

    const handleTextEditorChange = (newText) => {
        setLessonText(newText);
    };

    const handleDayChange = (e) => {
        setDay(e.target.value);
    };

    const handleWeekChange = (e) => {
        setWeek(e.target.value);
    };

    const handleCreateLesson = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (activityType === 'audio') {
                await createAudioLesson(course, sequenceNumber, alias, activityType, image, audio, lessonText, day, week);
            } else if (activityType === 'video') {
                await createVideoLesson(course, sequenceNumber, alias, activityType, video, lessonText, day, week);
            } else if (activityType === 'read') {
                await createReadLesson(course, sequenceNumber, alias, activityType, image, audio, urduAudio, lessonText, day, week);
            } else if (activityType === 'listenAndSpeak' || activityType === 'preListenAndSpeak' || activityType === 'postListenAndSpeak') {
                await createListenAndSpeakLesson(course, sequenceNumber, alias, activityType, questions, lessonText, day, week);
            } else if (activityType === 'mcqs' || activityType === 'preMCQs' || activityType === 'postMCQs') {
                await createMCQLesson(course, sequenceNumber, alias, activityType, mcqs, lessonText, day, week);
            }
        } catch (error) {
            alert(error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className={styles.content}>
            <h1 className={styles.heading}>Fill out your lesson details</h1>
            <form onSubmit={handleCreateLesson} className={styles.form}>
                <div className={styles.input_row}>
                    <SelectField label="Select Category" options={categories.map(category => ({ value: category.CourseCategoryId, label: category.CourseCategoryName }))} onChange={handleCategoryChange} value={category} name="category" id="category" />
                    <SelectField label="Select Course" options={courses.map(course => ({ value: course.CourseId, label: course.CourseName }))} onChange={handleCourseChange} value={course} name="course" id="course" />
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
                        { value: 'read', label: 'Read' },
                        { value: 'listenAndSpeak', label: 'Listen and Speak' },
                        { value: 'watchAndSpeak', label: 'Watch and Speak' },
                        { value: 'mcqs', label: 'MCQs' },
                        { value: 'preListenAndSpeak', label: 'Pre-test Part 1 (Listen Speak)' },
                        { value: 'preMCQs', label: 'Pre-test Part 2 (MCQs)' },
                        { value: 'postListenAndSpeak', label: 'Post-test Part 1 (Listen Speak)' },
                        { value: 'postMCQs', label: 'Post-test Part 2 (MCQs)' },
                        { value: 'placementtest', label: 'Placement Test' }
                    ]} onChange={handleActivityTypeChange} value={activityType} name="activity_type" id="activity_type" />
                </div>
                {activityType === 'audio' && (
                    <>
                        <div className={styles.input_row}>
                            <InputField label="Upload Image" type="file" onChange={handleImageChange} name="image" id="image" fileInput />
                            <InputField label="Upload Audio" type="file" onChange={handleAudioChange} name="audio" id="audio" fileInput />
                        </div>
                        <div className={styles.input_row}>
                            <div className={styles.form_group}>
                                <label className={styles.label} htmlFor="lesson_text">Lesson Text</label>
                                <JoditEditor ref={editor} value={lessonText} onChange={handleTextEditorChange} />
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
                                <label className={styles.label} htmlFor="lesson_text">Lesson Text</label>
                                <JoditEditor ref={editor} value={lessonText} onChange={handleTextEditorChange} />
                            </div>
                        </div>
                    </>
                )}
                {activityType === 'read' && (
                    <>
                        <div className={styles.input_row}>
                            <InputField label="Upload Image" type="file" onChange={handleImageChange} name="image" id="image" fileInput />
                            <InputField label="Upload Audio" type="file" onChange={handleAudioChange} name="audio" id="audio" fileInput />
                            <InputField label="Upload Urdu Audio" type="file" onChange={handleUrduAudioChange} name="urduAudio" id="urduAudio" fileInput />
                        </div>
                        <div className={styles.input_row}>
                            <div className={styles.form_group}>
                                <label className={styles.label} htmlFor="lesson_text">Lesson Text</label>
                                <JoditEditor ref={editor} value={lessonText} onChange={handleTextEditorChange} />
                            </div>
                        </div>
                    </>
                )}
                {(activityType === 'listenAndSpeak' || activityType === 'preListenAndSpeak' || activityType === 'postListenAndSpeak') && (
                    <>
                        <div className={styles.input_row}>
                            <div className={styles.form_group}>
                                <label className={styles.label} htmlFor="lesson_text">Lesson Text</label>
                                <JoditEditor ref={editor} value={lessonText} onChange={handleTextEditorChange} />
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
                {(activityType === 'mcqs' || activityType === 'preMCQs' || activityType === 'postMCQs') && (
                    <>
                        {mcqs.map((mcq, qIndex) => (
                            <div key={qIndex} className={styles.question_box}>
                                <div className={styles.input_row}>
                                    <SelectField label={`Question Type`} options={[
                                        { value: '-1', label: 'Select Question Type' },
                                        { value: 'Text', label: 'Text' },
                                        { value: 'Image', label: 'Image' },
                                        { value: 'Audio', label: 'Audio' },
                                        { value: 'Text+Audio', label: 'Text + Audio' },
                                        { value: 'Text+Image', label: 'Text + Image' },
                                        { value: 'Image+Audio', label: 'Image + Audio' },
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
                                            { value: 'Audio', label: 'Audio' },
                                            { value: 'Text+Audio', label: 'Text + Audio' },
                                            { value: 'Text+Image', label: 'Text + Image' },
                                            { value: 'Image+Audio', label: 'Image + Audio' },
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