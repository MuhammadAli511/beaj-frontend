import React, { useState, useEffect } from 'react';
import { Navbar, Sidebar } from "../../components";
import styles from './UserResponses.module.css';
import { useSidebar } from '../../components/SidebarContext';
import { getQuestionResponsesByActivityType, getAllCourses } from '../../helper/index';
import { TailSpin } from 'react-loader-spinner';
import Select from 'react-select';

const UserResponses = () => {
    const { isSidebarOpen } = useSidebar();
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
    }, [searchQuery, selectedWeek, selectedDay, selectedActivityType, selectedCourse]);

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
        return searchMatch && weekMatch && dayMatch && activityMatch && courseMatch;
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
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className={styles.pagination_button}
                >
                    1
                </button>

                {getPageNumbers()[0] > 2 && <span>...</span>}

                {getPageNumbers().map(number => (
                    number !== 1 && number !== totalPages && (
                        <button
                            key={number}
                            onClick={() => setCurrentPage(number)}
                            className={`${styles.pagination_button} ${currentPage === number ? styles.active : ''}`}
                        >
                            {number}
                        </button>
                    )
                ))}

                {getPageNumbers()[getPageNumbers().length - 1] < totalPages - 1 && <span>...</span>}

                {totalPages > 1 && (
                    <button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className={styles.pagination_button}
                    >
                        {totalPages}
                    </button>
                )}

                <span className={styles.page_info}>
                    ({filteredResponses.length} total responses)
                </span>
            </div>
        );
    };

    const handleImageClick = (imageUrl) => {
        setSelectedImage(imageUrl);
    };

    const handleCloseModal = () => {
        setSelectedImage(null);
    };

    useEffect(() => {
        const handleEscapeKey = (event) => {
            if (event.key === 'Escape' && selectedImage) {
                handleCloseModal();
            }
        };

        document.addEventListener('keydown', handleEscapeKey);

        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [selectedImage]);

    return (
        <div className={styles.main_page}>
            <Navbar />
            {isSidebarOpen && <Sidebar />}
            <div className={styles.content}>
                <h1>User Responses</h1>

                {/* Search and Filters */}
                <div className={styles.filters_container}>
                    <div className={styles.filter_group}>
                        <label className={styles.filter_label}>Search number or name</label>
                        <input
                            type="text"
                            placeholder="Search by phone number or name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={styles.search_input}
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
                    <div className={styles.filter_group}>
                        <label className={styles.filter_label}>Activity Type</label>
                        <Select
                            className={styles.select}
                            options={activityTypeOptions}
                            value={selectedActivityType}
                            onChange={setSelectedActivityType}
                            isClearable={false}
                            placeholder="Select Activity Type"
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
                                        <th className={styles.table_heading}>Phone</th>
                                        {selectedActivityType && selectedActivityType.value === 'read' && (
                                            <>
                                                <th className={styles.table_heading}>Num</th>
                                                <th className={styles.table_heading}>Question</th>
                                                <th className={styles.table_heading}>User Audio</th>
                                                <th className={styles.table_heading}>User Transcript</th>
                                            </>
                                        )}
                                        {selectedActivityType && selectedActivityType.value === 'listenAndSpeak' && (
                                            <>
                                                <th className={styles.table_heading}>Num</th>
                                                <th className={styles.table_heading}>Question</th>
                                                <th className={styles.table_heading}>User Audio</th>
                                                <th className={styles.table_heading}>User Transcript</th>
                                            </>
                                        )}
                                        {selectedActivityType && selectedActivityType.value === 'mcqs' && (
                                            <>
                                                <th className={styles.table_heading}>Num</th>
                                                <th className={styles.table_heading}>Question</th>
                                                <th className={styles.table_heading}>User Answer</th>
                                            </>
                                        )}
                                        {selectedActivityType && selectedActivityType.value === 'watchAndSpeak' && (
                                            <>
                                                <th className={styles.table_heading}>Num</th>
                                                <th className={styles.table_heading}>Question</th>
                                                <th className={styles.table_heading}>User Audio</th>
                                                <th className={styles.table_heading}>User Transcript</th>
                                                <th className={styles.table_heading}>Bot Image</th>
                                            </>
                                        )}
                                        {selectedActivityType && selectedActivityType.value === 'watchAndAudio' && (
                                            <>
                                                <th className={styles.table_heading}>Num</th>
                                                <th className={styles.table_heading}>Question</th>
                                                <th className={styles.table_heading}>User Audio</th>
                                            </>
                                        )}
                                        {selectedActivityType && selectedActivityType.value === 'watchAndImage' && (
                                            <>
                                                <th className={styles.table_heading}>Num</th>
                                                <th className={styles.table_heading}>Question</th>
                                                <th className={styles.table_heading}>User Image</th>
                                            </>
                                        )}
                                        {selectedActivityType && selectedActivityType.value === 'conversationalQuestionsBot' && (
                                            <>
                                                <th className={styles.table_heading}>Num</th>
                                                <th className={styles.table_heading}>Question</th>
                                                <th className={styles.table_heading}>User Audio</th>
                                                <th className={styles.table_heading}>User Transcript</th>
                                                <th className={styles.table_heading}>Bot Audio</th>
                                            </>
                                        )}
                                        {selectedActivityType && selectedActivityType.value === 'conversationalAgencyBot' && (
                                            <>
                                                <th className={styles.table_heading}>Num</th>
                                                <th className={styles.table_heading}>Question</th>
                                                <th className={styles.table_heading}>User Audio</th>
                                                <th className={styles.table_heading}>User Transcript</th>
                                                <th className={styles.table_heading}>Bot Audio</th>
                                            </>
                                        )}
                                        {selectedActivityType && selectedActivityType.value === 'conversationalMonologueBot' && (
                                            <>
                                                <th className={styles.table_heading}>Num</th>
                                                <th className={styles.table_heading}>Question</th>
                                                <th className={styles.table_heading}>User Audio</th>
                                                <th className={styles.table_heading}>User Transcript</th>
                                                <th className={styles.table_heading}>Bot Audio</th>
                                                <th className={styles.table_heading}>Bot Image</th>
                                            </>
                                        )}
                                        {selectedActivityType && selectedActivityType.value === 'speakingPractice' && (
                                            <>
                                                <th className={styles.table_heading}>Num</th>
                                                <th className={styles.table_heading}>Question</th>
                                                <th className={styles.table_heading}>User Audio</th>
                                                <th className={styles.table_heading}>User Transcript</th>
                                                <th className={styles.table_heading}>Bot Audio</th>
                                                <th className={styles.table_heading}>Bot Image</th>
                                            </>
                                        )}
                                        {selectedActivityType && selectedActivityType.value === 'feedbackAudio' && (
                                            <>
                                                <th className={styles.table_heading}>Question</th>
                                                <th className={styles.table_heading}>User Audio</th>
                                            </>
                                        )}
                                        {selectedActivityType && selectedActivityType.value === 'feedbackMcqs' && (
                                            <>
                                                <th className={styles.table_heading}>Num</th>
                                                <th className={styles.table_heading}>Question</th>
                                                <th className={styles.table_heading}>User Answer</th>
                                            </>
                                        )}
                                        {selectedActivityType && selectedActivityType.value === 'assessmentMcqs' && (
                                            <>
                                                <th className={styles.table_heading}>Num</th>
                                                <th className={styles.table_heading}>Question</th>
                                                <th className={styles.table_heading}>User Answer</th>
                                            </>
                                        )}
                                        {selectedActivityType && selectedActivityType.value === 'assessmentWatchAndSpeak' && (
                                            <>
                                                <th className={styles.table_heading}>Num</th>
                                                <th className={styles.table_heading}>Question</th>
                                                <th className={styles.table_heading}>User Audio</th>
                                                <th className={styles.table_heading}>User Transcript</th>
                                                <th className={styles.table_heading}>Bot Image</th>
                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className={styles.table_body}>
                                    {currentResponses.map((response, index) => (
                                        <tr key={response.id || index}>
                                            <td>{response.phoneNumber}</td>
                                            {response.activityType === 'read' && (
                                                <>
                                                    <td>{response.questionNumber}</td>
                                                    <td className={styles.submittedAnswerText}>{response.text || response.question}</td>
                                                    <td><audio src={response.submittedUserAudio} controls /></td>
                                                    <td className={styles.submittedAnswerText}>{response.submittedAnswerText}</td>
                                                </>
                                            )}
                                            {response.activityType === 'listenAndSpeak' && (
                                                <>
                                                    <td>{response.questionNumber}</td>
                                                    <td><audio src={response.mediaFile} controls /></td>
                                                    <td><audio src={response.submittedUserAudio} controls /></td>
                                                    <td className={styles.submittedAnswerText}>{response.submittedAnswerText}</td>
                                                </>
                                            )}
                                            {response.activityType === 'mcqs' && (
                                                <>
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
                                                </>
                                            )}
                                            {response.activityType === 'watchAndSpeak' && (
                                                <>
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
                                                </>
                                            )}
                                            {response.activityType === 'watchAndAudio' && (
                                                <>
                                                    <td>{response.questionNumber}</td>
                                                    <td><audio src={response.mediaFile} controls /></td>
                                                    <td><audio src={response.submittedUserAudio} controls /></td>
                                                </>
                                            )}
                                            {response.activityType === 'watchAndImage' && (
                                                <>
                                                    <td>{response.questionNumber}</td>
                                                    <td><audio src={response.mediaFile} controls /></td>
                                                    <td>
                                                        {response.submittedUserAudio && (
                                                            <div
                                                                className={styles.image_container}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleImageClick(response.submittedUserAudio);
                                                                }}
                                                            >
                                                                <img
                                                                    style={{ width: '250px', height: '250px', cursor: 'pointer' }}
                                                                    src={response.submittedUserAudio}
                                                                    alt="User Image"
                                                                />
                                                                <div className={styles.image_overlay}>View</div>
                                                            </div>
                                                        )}
                                                    </td>
                                                </>
                                            )}
                                            {response.activityType === 'conversationalQuestionsBot' && (
                                                <>
                                                    <td>{response.questionNumber}</td>
                                                    <td><audio src={response.mediaFile} controls /></td>
                                                    <td><audio src={response.submittedUserAudio} controls /></td>
                                                    <td className={styles.submittedAnswerText}>{response.submittedAnswerText}</td>
                                                    <td><audio src={response.submittedFeedbackAudio} controls /></td>
                                                </>
                                            )}
                                            {response.activityType === 'conversationalAgencyBot' && (
                                                <>
                                                    <td>{response.questionNumber}</td>
                                                    <td><audio src={response.mediaFile} controls /></td>
                                                    <td><audio src={response.submittedUserAudio} controls /></td>
                                                    <td className={styles.submittedAnswerText}>{response.submittedAnswerText}</td>
                                                    <td><audio src={response.submittedFeedbackAudio} controls /></td>
                                                </>
                                            )}
                                            {response.activityType === 'conversationalMonologueBot' && (
                                                <>
                                                    <td>{response.questionNumber}</td>
                                                    <td><audio src={response.mediaFile} controls /></td>
                                                    <td><audio src={response.submittedUserAudio} controls /></td>
                                                    <td className={styles.submittedAnswerText}>{response.submittedAnswerText}</td>
                                                    <td><audio src={response.submittedFeedbackAudio} controls /></td>
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
                                                </>
                                            )}
                                            {response.activityType === 'speakingPractice' && (
                                                <>
                                                    <td>{response.questionNumber}</td>
                                                    <td><audio src={response.mediaFile} controls /></td>
                                                    <td><audio src={response.submittedUserAudio} controls /></td>
                                                    <td className={styles.submittedAnswerText}>{response.submittedAnswerText}</td>
                                                    <td><audio src={response.submittedFeedbackAudio} controls /></td>
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
                                                </>
                                            )}
                                            {response.activityType === 'feedbackAudio' && (
                                                <>
                                                    <td><audio src={response.mediaFile} controls /></td>
                                                    <td>
                                                        {Array.isArray(response.submittedUserAudio) && response.submittedUserAudio.length > 0 ? (
                                                            <audio src={response.submittedUserAudio[0]} controls />
                                                        ) : (
                                                            <audio src={response.submittedUserAudio} controls />
                                                        )}
                                                    </td>
                                                </>
                                            )}
                                            {response.activityType === 'feedbackMcqs' && (
                                                <>
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
                                                </>
                                            )}
                                            {response.activityType === 'assessmentMcqs' && (
                                                <>
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
                                                </>
                                            )}
                                            {response.activityType === 'assessmentWatchAndSpeak' && (
                                                <>
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
                                                </>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <Pagination />
                        </>
                    )}
                </div>
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
        </div>
    );
};

export default UserResponses;
