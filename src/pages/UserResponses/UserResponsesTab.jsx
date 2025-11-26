import React, { useState, useEffect } from 'react';
import styles from './UserResponses.module.css';
import { getQuestionResponsesByActivityType, getAllCourses } from '../../helper/index';
import { TailSpin } from 'react-loader-spinner';
import Select from 'react-select';

const UserResponsesTab = () => {
    const [userResponses, setUserResponses] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [courses, setCourses] = useState({});
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);

    // Filters
    const [selectedWeek, setSelectedWeek] = useState(null);
    const [selectedDay, setSelectedDay] = useState(null);
    const [selectedActivityType, setSelectedActivityType] = useState(null);
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [selectedLessonId, setSelectedLessonId] = useState(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const responsesPerPage = 15;

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const coursesResponse = await getAllCourses();
                const courseMap = {};
                coursesResponse.data.forEach(course => {
                    courseMap[course.CourseId] = course.CourseName;
                });
                setCourses(courseMap);
                setSelectedActivityType(activityTypeOptions[0]);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const fetchResponses = async () => {
            if (!selectedActivityType || !selectedCourse) return;

            setIsLoading(true);
            try {
                const responsesResponse = await getQuestionResponsesByActivityType(selectedActivityType.value, selectedCourse.value);

                // Handle regular responses
                setUserResponses(responsesResponse.data.result);

                // Set default week/day if not already set and we have data
                if (responsesResponse.data.result.length > 0 && !selectedWeek && !selectedDay) {
                    const firstResponse = responsesResponse.data.result[0];
                    setSelectedWeek({ value: firstResponse.weekNumber, label: `Week ${firstResponse.weekNumber}` });
                    setSelectedDay({ value: firstResponse.dayNumber, label: `Day ${firstResponse.dayNumber}` });
                }
            } catch (error) {
                console.error("Error fetching responses:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchResponses();
    }, [selectedActivityType, selectedCourse]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedWeek, selectedDay, selectedActivityType, selectedCourse, selectedQuestion, selectedLessonId]);

    // Reset question and lessonId filters when activity type changes
    useEffect(() => {
        setSelectedQuestion(null);
        setSelectedLessonId(null);
    }, [selectedActivityType]);

    const weekOptions = Array.from({ length: 4 }, (_, i) => ({
        value: i + 1,
        label: `Week ${i + 1}`
    }));

    const dayOptions = Array.from({ length: 6 }, (_, i) => ({
        value: i + 1,
        label: `Day ${i + 1}`
    }));

    const activityTypeOptions = [
        { value: 'read', label: 'Read' },
        { value: 'listenAndSpeak', label: 'Listen and Speak' },
        { value: 'mcqs', label: 'MCQs' },
        { value: 'watchAndSpeak', label: 'Watch and Speak' },
        { value: 'watchAndAudio', label: 'Watch and Audio' },
        { value: 'watchAndImage', label: 'Watch and Image' },
        { value: 'conversationalQuestionsBot', label: 'Conversational Questions Bot' },
        { value: 'conversationalMonologueBot', label: 'Conversational Monologue Bot' },
        { value: 'conversationalAgencyBot', label: 'Conversational Agency Bot' },
        { value: 'speakingPractice', label: 'Speaking Practice' },
        { value: 'feedbackAudio', label: 'Feedback Audio' },
        { value: 'feedbackMcqs', label: 'Feedback MCQ' },
        { value: 'assessmentMcqs', label: 'Assessment MCQ' },
        { value: 'assessmentWatchAndSpeak', label: 'Assessment Watch and Speak' },
    ];

    // Generate question options for MCQ activities
    const questionOptions = React.useMemo(() => {
        if (!selectedActivityType || !['mcqs', 'feedbackMcqs', 'assessmentMcqs'].includes(selectedActivityType.value)) {
            return [];
        }

        const uniqueQuestions = [...new Set(
            userResponses
                .filter(response => response.question && response.question.trim())
                .map(response => response.question.trim())
        )].sort();

        return uniqueQuestions.map((question, index) => ({
            value: question,
            label: `Q${index + 1}: ${question.length > 50 ? question.substring(0, 50) + '...' : question}`
        }));
    }, [userResponses, selectedActivityType]);

    // Determine if question filter should be shown
    const shouldShowQuestionFilter = selectedActivityType && ['mcqs', 'feedbackMcqs', 'assessmentMcqs'].includes(selectedActivityType.value);

    // Generate lesson ID options
    const lessonIdOptions = React.useMemo(() => {
        const uniqueLessonIds = [...new Set(
            userResponses
                .filter(response => response.lessonId !== null && response.lessonId !== undefined)
                .map(response => response.lessonId)
        )].sort((a, b) => a - b);

        return uniqueLessonIds.map(lessonId => ({
            value: lessonId,
            label: `Lesson ${lessonId}`
        }));
    }, [userResponses]);

    const excludeCourses = ['Level 1 - Kids', 'Free Trial', 'FAST COURSE TESTING', 'Level 3 Testing'];

    const courseOptions = Object.entries(courses)
        .filter(([id, name]) => !excludeCourses.includes(name))
        .map(([id, name]) => ({
            value: Number(id),
            label: name
        }));

    const filteredResponses = userResponses.filter(response => {
        const searchMatch = (!searchQuery ||
            (response.phoneNumber && response.phoneNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (response.name && response.name.toLowerCase().includes(searchQuery.toLowerCase())));
        const weekMatch = !selectedWeek || response.weekNumber === selectedWeek.value;
        const dayMatch = !selectedDay || response.dayNumber === selectedDay.value;
        const activityMatch = !selectedActivityType || response.activityType === selectedActivityType.value;
        const courseMatch = !selectedCourse || Number(response.courseId) === selectedCourse.value;
        const questionMatch = !selectedQuestion || (response.question && response.question.trim() === selectedQuestion.value);
        const lessonIdMatch = !selectedLessonId || response.lessonId === selectedLessonId.value;
        return searchMatch && weekMatch && dayMatch && activityMatch && courseMatch && questionMatch && lessonIdMatch;
    }).sort((a, b) => {
        if (a.phoneNumber && b.phoneNumber) {
            const phoneComparison = a.phoneNumber.localeCompare(b.phoneNumber);
            if (phoneComparison !== 0) return phoneComparison;
        }

        const weekComparison = a.weekNumber - b.weekNumber;
        if (weekComparison !== 0) return weekComparison;

        const dayComparison = a.dayNumber - b.dayNumber;
        if (dayComparison !== 0) return dayComparison;

        return a.questionNumber - b.questionNumber;
    });

    const indexOfLastResponse = currentPage * responsesPerPage;
    const indexOfFirstResponse = indexOfLastResponse - responsesPerPage;
    const currentResponses = filteredResponses.slice(indexOfFirstResponse, indexOfLastResponse);

    const totalPages = Math.ceil(filteredResponses.length / responsesPerPage);

    const Pagination = () => {
        const getPageNumbers = () => {
            const pageNumbers = [];
            const maxPagesToShow = 5;
            let startPage = Math.max(1, currentPage - 2);
            let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
            if (totalPages - startPage < maxPagesToShow) {
                startPage = Math.max(1, totalPages - maxPagesToShow + 1);
            }
            for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i);
            }
            return pageNumbers;
        };

        return (
            <div className={styles.pagination}>
                <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={styles.pagination_button}
                >
                    Previous
                </button>
                {getPageNumbers().map(number => (
                    <button
                        key={number}
                        onClick={() => setCurrentPage(number)}
                        className={`${styles.pagination_button} ${currentPage === number ? styles.active : ''}`}
                    >
                        {number}
                    </button>
                ))}
                <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={styles.pagination_button}
                >
                    Next
                </button>
            </div>
        );
    };

    const handleImageClick = (imageSrc) => {
        setSelectedImage(imageSrc);
    };

    const handleCloseModal = () => {
        setSelectedImage(null);
    };

    const renderTableHeaders = () => {
        if (!selectedActivityType) return null;

        const commonHeaders = (
            <>
                <th className={styles.table_heading}>Profile ID</th>
                <th className={styles.table_heading}>Phone Number</th>
                <th className={styles.table_heading}>Name</th>
                <th className={styles.table_heading}>Course</th>
                <th className={styles.table_heading}>Week</th>
                <th className={styles.table_heading}>Day</th>
                <th className={styles.table_heading}>Lesson ID</th>
            </>
        );

        switch (selectedActivityType.value) {
            case 'conversationalAgencyBot':
                return (
                    <>
                        {commonHeaders}
                        <th className={styles.table_heading}>Question Number</th>
                        <th className={styles.table_heading}>Bot Question</th>
                        <th className={styles.table_heading}>User Response Text</th>
                        <th className={styles.table_heading}>User Audio</th>
                        <th className={styles.table_heading}>Bot Feedback Text</th>
                        <th className={styles.table_heading}>Bot Feedback Audio</th>
                    </>
                );

            case 'conversationalQuestionsBot':
                return (
                    <>
                        {commonHeaders}
                        <th className={styles.table_heading}>Question Number</th>
                        <th className={styles.table_heading}>Bot Question</th>
                        <th className={styles.table_heading}>User Answer Text</th>
                        <th className={styles.table_heading}>User Audio</th>
                        <th className={styles.table_heading}>Bot Feedback Text</th>
                        <th className={styles.table_heading}>Feedback Image</th>
                    </>
                );

            case 'conversationalMonologueBot':
                return (
                    <>
                        {commonHeaders}
                        <th className={styles.table_heading}>Prompt</th>
                        <th className={styles.table_heading}>User Speech Audio</th>
                        <th className={styles.table_heading}>Bot Feedback Text</th>
                        <th className={styles.table_heading}>Bot Feedback Audio</th>
                        <th className={styles.table_heading}>Fluency Score</th>
                    </>
                );

            case 'speakingPractice':
                return (
                    <>
                        {commonHeaders}
                        <th className={styles.table_heading}>Question Number</th>
                        <th className={styles.table_heading}>Question Audio/Text</th>
                        <th className={styles.table_heading}>User Audio</th>
                        <th className={styles.table_heading}>User Text Response</th>
                    </>
                );

            case 'watchAndSpeak':
                return (
                    <>
                        {commonHeaders}
                        <th className={styles.table_heading}>Question ID</th>
                        <th className={styles.table_heading}>Question Number</th>
                        <th className={styles.table_heading}>Question</th>
                        <th className={styles.table_heading}>Alias</th>
                        <th className={styles.table_heading}>User Transcript</th>
                        <th className={styles.table_heading}>User Audio</th>
                        <th className={styles.table_heading}>Image Feedback</th>
                        <th className={styles.table_heading}>Answer</th>
                    </>
                );

            case 'read':
            case 'listenAndSpeak':
            case 'mcqs':
            case 'watchAndAudio':
            case 'watchAndImage':
            case 'feedbackAudio':
            case 'feedbackMcqs':
                return (
                    <>
                        {commonHeaders}
                        <th className={styles.table_heading}>Question Number</th>
                        <th className={styles.table_heading}>Question</th>
                        <th className={styles.table_heading}>Answer</th>
                    </>
                );

            case 'assessmentMcqs':
                return (
                    <>
                        {commonHeaders}
                        <th className={styles.table_heading}>Question Number</th>
                        <th className={styles.table_heading}>Question</th>
                        <th className={styles.table_heading}>Answer</th>
                    </>
                );

            case 'assessmentWatchAndSpeak':
                return (
                    <>
                        {commonHeaders}
                        <th className={styles.table_heading}>Question Number</th>
                        <th className={styles.table_heading}>Media File</th>
                        <th className={styles.table_heading}>User Audio</th>
                        <th className={styles.table_heading}>Answer Text</th>
                        <th className={styles.table_heading}>Feedback Image</th>
                    </>
                );

            default:
                return commonHeaders;
        }
    };

    const renderTableRow = (response, index) => {
        const commonCells = (
            <>
                <td>{response.profileId}</td>
                <td>{response.phoneNumber}</td>
                <td>{response.name}</td>
                <td>{courses[response.courseId] || response.courseId}</td>
                <td>{response.weekNumber}</td>
                <td>{response.dayNumber}</td>
                <td>{response.lessonId}</td>
            </>
        );

        if (!selectedActivityType) return null;

        switch (selectedActivityType.value) {
            case 'speakingPractice':
                return (
                    <tr key={index}>
                        {commonCells}
                        <td>{response.questionNumber}</td>
                        <td>
                            {response.mediaFile ? (
                                <audio src={response.mediaFile} controls />
                            ) : (
                                response.question || '—'
                            )}
                        </td>
                        <td>
                            {Array.isArray(response.submittedUserAudio)
                                ? response.submittedUserAudio.map((audioUrl, i) => (
                                      <div key={i} style={{ marginBottom: '8px' }}>
                                          <audio src={audioUrl} controls />
                                      </div>
                                  ))
                                : response.submittedUserAudio ? (
                                      <audio src={response.submittedUserAudio} controls />
                                  ) : (
                                      '—'
                                  )}
                        </td>
                        <td>
                            {Array.isArray(response.submittedAnswerText)
                                ? response.submittedAnswerText.map((text, i) => (
                                      <div
                                          key={i}
                                          dangerouslySetInnerHTML={{
                                              __html: text
                                                  .replace(/\*([^*]+)\*/g, '<strong>$1</strong>')
                                                  .replace(/\\n/g, '<br />')
                                          }}
                                      />
                                  ))
                                : response.submittedAnswerText ? (
                                      <div
                                          dangerouslySetInnerHTML={{
                                              __html: response.submittedAnswerText
                                                  .replace(/\*([^*]+)\*/g, '<strong>$1</strong>')
                                                  .replace(/\\n/g, '<br />')
                                          }}
                                      />
                                  ) : (
                                      '—'
                                  )}
                        </td>
                    </tr>
                );

            case 'conversationalAgencyBot':
                return (
                    <tr key={index}>
                        {commonCells}
                        <td>{response.questionNumber}</td>
                        <td>
                            {response.question ? (
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: response.question
                                            .replace(/\*([^*]+)\*/g, '<strong>$1</strong>')
                                            .replace(/\\n/g, '<br />')
                                    }}
                                />
                            ) : (
                                '—'
                            )}
                        </td>
                        <td>
                            {Array.isArray(response.submittedAnswerText)
                                ? response.submittedAnswerText.map((text, i) => (
                                      <div key={i} style={{ marginBottom: '4px' }}>{text}</div>
                                  ))
                                : response.submittedAnswerText || '—'}
                        </td>
                        <td>
                            {Array.isArray(response.submittedUserAudio)
                                ? response.submittedUserAudio.map((url, i) => (
                                      <div key={i} style={{ marginBottom: '8px' }}>
                                          <audio src={url} controls />
                                      </div>
                                  ))
                                : response.submittedUserAudio ? (
                                      <audio src={response.submittedUserAudio} controls />
                                  ) : (
                                      '—'
                                  )}
                        </td>
                        <td>
                            {Array.isArray(response.submittedFeedbackText)
                                ? response.submittedFeedbackText.map((fb, i) => (
                                      <div key={i} style={{ marginBottom: '4px' }}>{fb}</div>
                                  ))
                                : response.submittedFeedbackText || '—'}
                        </td>
                        <td>
                            {Array.isArray(response.submittedFeedbackAudio)
                                ? response.submittedFeedbackAudio.map((url, i) => (
                                      <div key={i} style={{ marginBottom: '8px' }}>
                                          <audio src={url} controls />
                                      </div>
                                  ))
                                : response.submittedFeedbackAudio ? (
                                      <audio src={response.submittedFeedbackAudio} controls />
                                  ) : (
                                      '—'
                                  )}
                        </td>
                    </tr>
                );

            case 'conversationalQuestionsBot':
                return (
                    <tr key={index}>
                        {commonCells}
                        <td>{response.questionNumber}</td>
                        <td>
                            {response.question ? (
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: response.question
                                            .replace(/\*([^*]+)\*/g, '<strong>$1</strong>')
                                            .replace(/\\n/g, '<br />')
                                    }}
                                />
                            ) : (
                                '—'
                            )}
                        </td>
                        <td>
                            {Array.isArray(response.submittedAnswerText)
                                ? response.submittedAnswerText.map((t, i) => <div key={i} style={{ marginBottom: '4px' }}>{t}</div>)
                                : response.submittedAnswerText || '—'}
                        </td>
                        <td>
                            {Array.isArray(response.submittedUserAudio)
                                ? response.submittedUserAudio.map((a, i) => (
                                      <div key={i} style={{ marginBottom: '8px' }}>
                                          <audio src={a} controls />
                                      </div>
                                  ))
                                : response.submittedUserAudio ? (
                                      <audio src={response.submittedUserAudio} controls />
                                  ) : (
                                      '—'
                                  )}
                        </td>
                        <td>
                            {Array.isArray(response.submittedFeedbackText)
                                ? response.submittedFeedbackText.map((text, i) => (
                                      <div key={i} style={{ marginBottom: '4px' }}>{text}</div>
                                  ))
                                : response.submittedFeedbackText || '—'}
                        </td>
                        <td>
                            {Array.isArray(response.submittedFeedbackAudio)
                                ? response.submittedFeedbackAudio.map((img, i) => (
                                      <div
                                          key={i}
                                          onClick={() => handleImageClick(img)}
                                          className={styles.image_container}
                                      >
                                          <img
                                              src={img}
                                              alt={`Feedback ${i + 1}`}
                                              style={{ width: '250px', height: '250px', cursor: 'pointer' }}
                                          />
                                          <div className={styles.image_overlay}>View</div>
                                      </div>
                                  ))
                                : response.submittedFeedbackAudio ? (
                                      <div
                                          onClick={() => handleImageClick(response.submittedFeedbackAudio)}
                                          className={styles.image_container}
                                      >
                                          <img
                                              src={response.submittedFeedbackAudio}
                                              alt="Feedback"
                                              style={{ width: '250px', height: '250px', cursor: 'pointer' }}
                                          />
                                          <div className={styles.image_overlay}>View</div>
                                      </div>
                                  ) : (
                                      '—'
                                  )}
                        </td>
                    </tr>
                );

            case 'conversationalMonologueBot':
                return (
                    <tr key={index}>
                        {commonCells}
                        <td>{response.question || '—'}</td>
                        <td>
                            {Array.isArray(response.submittedUserAudio)
                                ? response.submittedUserAudio.map((a, i) => (
                                      <div key={i} style={{ marginBottom: '8px' }}>
                                          <audio src={a} controls />
                                      </div>
                                  ))
                                : response.submittedUserAudio ? (
                                      <audio src={response.submittedUserAudio} controls />
                                  ) : (
                                      '—'
                                  )}
                        </td>
                        <td>{response.submittedFeedbackText || '—'}</td>
                        <td>
                            {response.submittedFeedbackAudio ? (
                                <audio src={response.submittedFeedbackAudio} controls />
                            ) : (
                                '—'
                            )}
                        </td>
                        <td>{response.fluencyScore || '—'}</td>
                    </tr>
                );

            case 'watchAndSpeak':
                return (
                    <tr key={index}>
                        {commonCells}
                        <td>{response.questionId || '—'}</td>
                        <td>{response.questionNumber}</td>
                        <td>
                            {response.mediaFile ? (
                                <video src={response.mediaFile} controls style={{ width: '300px' }} />
                            ) : (
                                '—'
                            )}
                        </td>
                        <td>
                            {response.alias ? (
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: response.alias
                                            .replace(/\*([^*]+)\*/g, '<strong>$1</strong>')
                                            .replace(/\\n/g, '<br />')
                                    }}
                                />
                            ) : (
                                '—'
                            )}
                        </td>
                        <td>
                            {Array.isArray(response.submittedAnswerText)
                                ? response.submittedAnswerText.map((text, i) => (
                                      <div key={i} style={{ marginBottom: '4px' }}>{text}</div>
                                  ))
                                : response.submittedAnswerText || '—'}
                        </td>
                        <td>
                            {Array.isArray(response.submittedUserAudio)
                                ? response.submittedUserAudio.map((audioUrl, i) => (
                                      <div key={i} style={{ marginBottom: '8px' }}>
                                          <audio src={audioUrl} controls />
                                      </div>
                                  ))
                                : response.submittedUserAudio ? (
                                      <audio src={response.submittedUserAudio} controls />
                                  ) : (
                                      '—'
                                  )}
                        </td>
                        <td>
                            {Array.isArray(response.submittedFeedbackText)
                                ? response.submittedFeedbackText.map((imgUrl, i) => (
                                      <div
                                          key={i}
                                          onClick={() => handleImageClick(imgUrl)}
                                          className={styles.image_container}
                                          style={{ marginBottom: '8px' }}
                                      >
                                          <img
                                              src={imgUrl}
                                              alt={`Feedback ${i + 1}`}
                                              style={{ width: '250px', height: '250px', cursor: 'pointer' }}
                                          />
                                          <div className={styles.image_overlay}>View</div>
                                      </div>
                                  ))
                                : response.submittedFeedbackText ? (
                                      <div
                                          onClick={() => handleImageClick(response.submittedFeedbackText)}
                                          className={styles.image_container}
                                      >
                                          <img
                                              src={response.submittedFeedbackText}
                                              alt="Feedback"
                                              style={{ width: '250px', height: '250px', cursor: 'pointer' }}
                                          />
                                          <div className={styles.image_overlay}>View</div>
                                      </div>
                                  ) : (
                                      '—'
                                  )}
                        </td>
                        <td>
                            {Array.isArray(response.answer) ? (
                                response.answer.map((ans, i) => (
                                    <div key={i}>{ans}</div>
                                ))
                            ) : (
                                <div>{response.answer || '—'}</div>
                            )}
                        </td>
                    </tr>
                );

            case 'read':
            case 'listenAndSpeak':
            case 'mcqs':
            case 'watchAndAudio':
            case 'watchAndImage':
            case 'feedbackAudio':
            case 'feedbackMcqs':
                return (
                    <tr key={index}>
                        {commonCells}
                        <td>{response.questionNumber}</td>
                        <td>
                            {response.question && (
                                <div dangerouslySetInnerHTML={{
                                    __html: response.question
                                        .replace(/\*([^*]+)\*/g, '<strong>$1</strong>')
                                        .replace(/\\n/g, '<br />')
                                }} />
                            )}
                        </td>
                        <td>
                            {Array.isArray(response.answer) ? (
                                response.answer.map((ans, i) => (
                                    <div key={i}>{ans}</div>
                                ))
                            ) : (
                                <div>{response.answer}</div>
                            )}
                        </td>
                    </tr>
                );

            case 'assessmentMcqs':
                return (
                    <tr key={index}>
                        {commonCells}
                        <td>{response.questionNumber}</td>
                        <td>
                            {response.question && (
                                <div dangerouslySetInnerHTML={{
                                    __html: response.question
                                        .replace(/\*([^*]+)\*/g, '<strong>$1</strong>')
                                        .replace(/\\n/g, '<br />')
                                }} />
                            )}
                        </td>
                        <td>
                            {Array.isArray(response.answer) ? (
                                response.answer.map((ans, i) => (
                                    <div key={i}>{ans}</div>
                                ))
                            ) : (
                                <div>{response.answer}</div>
                            )}
                        </td>
                    </tr>
                );

            case 'assessmentWatchAndSpeak':
                return (
                    <tr key={index}>
                        {commonCells}
                        <td>{response.questionNumber}</td>
                        <td><audio src={response.mediaFile} controls /></td>
                        <td><audio src={response.submittedUserAudio} controls /></td>
                        <td className={styles.submittedAnswerText}>{response.submittedAnswerText}</td>
                        <td>
                            {response.submittedFeedbackText && (
                                <div
                                    className={styles.image_container}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleImageClick(response.submittedFeedbackText);
                                    }}
                                >
                                    <img
                                        style={{ width: '250px', height: '250px', cursor: 'pointer' }}
                                        src={response.submittedFeedbackText}
                                        alt="Bot Image"
                                    />
                                    <div className={styles.image_overlay}>View</div>
                                </div>
                            )}
                        </td>
                    </tr>
                );

            default:
                return (
                    <tr key={index}>
                        {commonCells}
                    </tr>
                );
        }
    };

    return (
        <>
            {/* Filters */}
            <div className={styles.filters_container}>
                <div className={styles.filter_group}>
                    <label className={styles.filter_label}>Search</label>
                    <input
                        type="text"
                        placeholder="Search by phone number or name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={styles.search_input}
                    />
                </div>
                <div className={styles.filter_group}>
                    <label className={styles.filter_label}>Course</label>
                    <Select
                        className={styles.select}
                        options={courseOptions}
                        value={selectedCourse}
                        onChange={setSelectedCourse}
                        isClearable
                        placeholder="Select Course"
                    />
                </div>
                <div className={styles.filter_group}>
                    <label className={styles.filter_label}>Activity Type</label>
                    <Select
                        className={styles.select}
                        options={activityTypeOptions}
                        value={selectedActivityType}
                        onChange={setSelectedActivityType}
                        placeholder="Select Activity Type"
                    />
                </div>
                <div className={styles.filter_group}>
                    <label className={styles.filter_label}>Week</label>
                    <Select
                        className={styles.select}
                        options={weekOptions}
                        value={selectedWeek}
                        onChange={setSelectedWeek}
                        isClearable
                        placeholder="Select Week"
                    />
                </div>
                <div className={styles.filter_group}>
                    <label className={styles.filter_label}>Day</label>
                    <Select
                        className={styles.select}
                        options={dayOptions}
                        value={selectedDay}
                        onChange={setSelectedDay}
                        isClearable
                        placeholder="Select Day"
                    />
                </div>
                {shouldShowQuestionFilter && (
                    <div className={styles.filter_group}>
                        <label className={styles.filter_label}>Question</label>
                        <Select
                            className={styles.select}
                            options={questionOptions}
                            value={selectedQuestion}
                            onChange={setSelectedQuestion}
                            isClearable
                            placeholder={questionOptions.length === 0 ? "No questions available" : "Select Question"}
                        />
                    </div>
                )}
                <div className={styles.filter_group}>
                    <label className={styles.filter_label}>Lesson ID</label>
                    <Select
                        className={styles.select}
                        options={lessonIdOptions}
                        value={selectedLessonId}
                        onChange={setSelectedLessonId}
                        isClearable
                        placeholder={lessonIdOptions.length === 0 ? "No lessons available" : "Select Lesson ID"}
                    />
                </div>
            </div>

            <div className={styles.table_container}>
                {isLoading ? (
                    <div className={styles.loader_container}>
                        <TailSpin
                            height="80"
                            width="80"
                            color="#51BBCC"
                            ariaLabel="tail-spin-loading"
                            radius="1"
                            visible={true}
                        />
                    </div>
                ) : (
                    <>
                        <table className={styles.table}>
                            <thead className={styles.heading_row}>
                                <tr>
                                    {renderTableHeaders()}
                                </tr>
                            </thead>
                            <tbody className={styles.table_body}>
                                {currentResponses.map((response, index) => renderTableRow(response, index))}
                            </tbody>
                        </table>
                        <Pagination />
                    </>
                )}
            </div>

            {selectedImage && (
                <div
                    className={styles.modal}
                    onClick={(e) => {
                        e.stopPropagation();
                        handleCloseModal();
                    }}
                >
                    <div
                        className={styles.modal_content}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={styles.modal_header}>
                            <button className={styles.closeButton} onClick={handleCloseModal}>Close</button>
                        </div>
                        <img src={selectedImage} alt="Enlarged Bot" />
                    </div>
                </div>
            )}
        </>
    );
};

export default UserResponsesTab;