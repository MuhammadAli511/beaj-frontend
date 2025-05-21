import React, { useState, useEffect } from 'react';
import {
    getLessonsByActivity,
    getLessonById,
    deleteLesson,
    getAllCourses,
    getAllActivityAliases,
    updateLesson,
    updateDocumentFile,
    migrateLesson,
    testLesson
} from "../../../../../helper";
import edit from '../../../../../assets/images/edit.svg';
import deleteIcon from '../../../../../assets/images/delete.svg';
import styles from './ListenLesson.module.css';
import MigrateLessonModal from "../../../../../components/MigrateLessonModal/MigrateLessonModal";
import TestLessonModal from "../../../../../components/TestLessonModal/TestLessonModal";

const EditListenLessonModal = ({ isOpen, onClose, lesson, onSave }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [lessonData, setLessonData] = useState(null);
    const [audio, setAudio] = useState(null);
    const [image, setImage] = useState(null);
    const [courses, setCourses] = useState([]);
    const [activityAliases, setActivityAliases] = useState([]);

    useEffect(() => {
        const fetchAllData = async () => {
            setIsLoading(true);
            try {
                const lessonResponse = await getLessonById(lesson.LessonId);
                if (lessonResponse.status === 200) {
                    setLessonData(lessonResponse.data);
                } else {
                    alert(lessonResponse.data.message);
                }

                const coursesResponse = await getAllCourses();
                if (coursesResponse.status === 200) {
                    setCourses(coursesResponse.data);
                } else {
                    alert(coursesResponse.data.message);
                }

                const aliasesResponse = await getAllActivityAliases();
                if (aliasesResponse.status === 200) {
                    const filteredAliases = aliasesResponse.data.sort((a, b) => a.Alias.localeCompare(b.Alias));
                    setActivityAliases(filteredAliases);
                } else {
                    alert(aliasesResponse.data.message);
                }
            } catch (error) {
                alert(error);
            } finally {
                setIsLoading(false);
            }
        };

        if (isOpen && lesson) {
            fetchAllData();
        }
    }, [isOpen, lesson]);


    const handleCancel = () => {
        setLessonData(null);
        setCourses([]);
        setActivityAliases([]);
        setAudio(null);
        setImage(null);
        onClose();
    };

    const handleSave = async () => {
        const updatedLessonData = {
            ...lessonData,
            CourseId: document.getElementById("course_id").value,
            SequenceNumber: document.getElementById("sequenceNumber").value,
            weekNumber: document.getElementById("weekNumber").value,
            dayNumber: document.getElementById("dayNumber").value,
            Alias: document.getElementById("activity_alias").value,
            status: document.getElementById("status").value,
            audio,
            image,
        };

        try {
            setIsSaving(true);
            const updateResponse = await updateLesson(
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
            if (updateResponse.status === 200) {
                if (updatedLessonData.audio) {
                    const audioFile = getDocumentFile('audio');
                    if (audioFile) {
                        const updateFileResponse = await updateDocumentFile(
                            audioFile.id,
                            updatedLessonData.audio,
                            updatedLessonData.LessonId,
                            audioFile.language,
                            audioFile.mediaType
                        );
                        if (updateFileResponse.status !== 200) {
                            alert(updateFileResponse.data.message);
                        }
                    }
                }

                if (updatedLessonData.image) {
                    const imageFile = getDocumentFile('image');
                    if (imageFile) {
                        const updateImageResponse = await updateDocumentFile(
                            imageFile.id,
                            updatedLessonData.image,
                            updatedLessonData.LessonId,
                            imageFile.language,
                            imageFile.mediaType
                        );
                        if (updateImageResponse.status !== 200) {
                            alert(updateImageResponse.data.message);
                        }
                    }
                }

                onSave();
            } else {
                alert(updateResponse.data.message);
            }
        } catch (error) {
            alert(error);
        } finally {
            setIsSaving(false);
            onClose();
        }
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

    const getDocumentFile = (mediaType) => {
        if (!lessonData || !lessonData.documentFiles) return null;
        return lessonData.documentFiles.find((file) => file.mediaType === mediaType);
    };

    return (
        <div>
            {isOpen && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <h2 className={styles.modal_heading}>Edit Listen Lesson</h2>
                        {isLoading && <div>Loading...</div>}
                        {!isLoading && lessonData && (
                            <div>
                                <div className={styles.form_group}>
                                    <label className={styles.label} htmlFor="course_id">
                                        Select Course
                                    </label>
                                    <select
                                        className={styles.input_field}
                                        id="course_id"
                                        name="course_id"
                                        defaultValue={lessonData.CourseId || "Not Available"}
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
                                        onChange={(e) =>
                                            setLessonData({
                                                ...lessonData,
                                                SequenceNumber: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div className={styles.form_group}>
                                    <label className={styles.label}>Week Number</label>
                                    <input
                                        className={styles.input_field}
                                        type="text"
                                        id="weekNumber"
                                        defaultValue={lessonData.weekNumber || "Not Available"}
                                        onChange={(e) =>
                                            setLessonData({
                                                ...lessonData,
                                                weekNumber: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div className={styles.form_group}>
                                    <label className={styles.label}>Day Number</label>
                                    <input
                                        className={styles.input_field}
                                        type="text"
                                        id="dayNumber"
                                        defaultValue={lessonData.dayNumber || "Not Available"}
                                        onChange={(e) =>
                                            setLessonData({
                                                ...lessonData,
                                                dayNumber: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div className={styles.form_group}>
                                    <label className={styles.label} htmlFor="activity_alias">
                                        Select Activity Alias
                                    </label>
                                    <select
                                        className={styles.input_field}
                                        id="activity_alias"
                                        name="activity_alias"
                                        defaultValue={lessonData.Alias || "Not Available"}
                                    >
                                        {sortedActivityAliases().map((activityAlias) => (
                                            <option
                                                key={activityAlias.id}
                                                value={activityAlias.Alias}
                                            >
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
                                        name="status"
                                        defaultValue={lessonData.status || "Not Available"}
                                        onChange={(e) =>
                                            setLessonData({
                                                ...lessonData,
                                                status: e.target.value,
                                            })
                                        }
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Not Active">Not Active</option>
                                    </select>
                                </div>
                                <div className={styles.form_group}>
                                    <label className={styles.label}>Audio</label>
                                    <audio controls className={styles.audio}>
                                        <source
                                            src={getDocumentFile('audio')?.audio || ""}
                                            type="audio/mp3"
                                        />
                                    </audio>
                                </div>
                                <div className={styles.form_group}>
                                    <label className={styles.label}>Image</label>
                                    {getDocumentFile('image') ? (
                                        <img
                                            src={getDocumentFile('image')?.image}
                                            alt="Lesson Image"
                                            className={styles.image}
                                        />
                                    ) : (
                                        <p>Not Available</p>
                                    )}
                                </div>
                                <div className={styles.form_group}>
                                    <label className={styles.label}>Upload Audio</label>
                                    <input
                                        type="file"
                                        accept="audio/*"
                                        onChange={(e) => setAudio(e.target.files[0])}
                                    />
                                </div>
                                <div className={styles.form_group}>
                                    <label className={styles.label}>Upload Image</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setImage(e.target.files[0])}
                                    />
                                </div>
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

const ListenLesson = ({ category, course }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [lessons, setLessons] = useState([]);
    const [isEditListenLessonModalOpen, setIsEditListenLessonModalOpen] =
        useState(false);
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [isMigrateLessonModalOpen, setIsMigrateLessonModalOpen] = useState(false);
    const [isTestLessonModalOpen, setIsTestLessonModalOpen] = useState(false);
    const isDevEnvironment = process.env.REACT_APP_ENVIRONMENT == "DEV";

    const fetchLessons = async () => {
        try {
            setIsLoading(true);
            const lessonsResponse = await getLessonsByActivity(course, 'audio');
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

    const openEditListenLessonModal = (lesson) => {
        setSelectedLesson(lesson);
        setIsEditListenLessonModalOpen(true);
    };

    const closeEditListenLessonModal = () => {
        setSelectedLesson(null);
        setIsEditListenLessonModalOpen(false);
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
    
        const handleTestLesson = async (profile_id, phoneNumber, selectedLesson) => {
            console.log(phoneNumber, selectedLesson);
            const testResponse = await testLesson(profile_id, phoneNumber, selectedLesson);
            if (testResponse.status !== 200) {
                alert(testResponse.data.message);
            } else {
                alert("Lesson test setup successfully.");
            }
        };

    const handleDeleteLesson = async (lesson) => {
        const isConfirmed = window.confirm(
            "Are you sure you want to delete this lesson?"
        );
        if (isConfirmed) {
            try {
                setIsLoading(true);
                const deleteResponse = await deleteLesson(lesson.LessonId);
                if (deleteResponse.status === 200) {
                    fetchLessons();
                } else {
                    alert(deleteResponse.data.message);
                }
            } catch (error) {
                alert(error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const getDocumentFile = (lesson, mediaType) => {
        if (!lesson || !lesson.documentFiles) return null;
        return lesson.documentFiles.find((file) => file.mediaType === mediaType);
    };

    return (
        <div>
            <h1 className={styles.heading}>Manage your listen lessons</h1>
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
                            <th className={styles.table_heading}>Audio</th>
                            <th className={styles.table_heading}>Image</th>
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
                                <td style={{ width: "10%" }}>{lesson.LessonId || "Not Available"}</td>
                                <td style={{ width: "10%" }}>{lesson.SequenceNumber || "Not Available"}</td>
                                <td style={{ width: "10%" }}>{lesson.weekNumber || "Not Available"}</td>
                                <td style={{ width: "10%" }}>{lesson.dayNumber || "Not Available"}</td>
                                <td className={styles.audio_section} style={{ width: "10%" }}>
                                    {getDocumentFile(lesson, 'audio') ? (
                                        <audio controls className={styles.audio}>
                                            <source
                                                src={getDocumentFile(lesson, 'audio')?.audio || ""}
                                                type="audio/mp3"
                                            />
                                        </audio>
                                    ) : (
                                        <p>Not Available</p>
                                    )}
                                </td>
                                <td className={styles.image_section} style={{ width: "10%" }}>
                                    {getDocumentFile(lesson, 'image') ? (
                                        <img
                                            src={getDocumentFile(lesson, 'image')?.image}
                                            alt="Lesson Image"
                                            className={styles.image}
                                        />
                                    ) : (
                                        <p>Not Available</p>
                                    )}
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
                                        onClick={() => openEditListenLessonModal(lesson)}
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
                                        onClick={() => handleDeleteLesson(lesson)}
                                        src={deleteIcon}
                                        alt="Delete"
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            <EditListenLessonModal
                isOpen={isEditListenLessonModalOpen}
                onClose={closeEditListenLessonModal}
                lesson={selectedLesson}
                onSave={fetchLessons}
            />
            <MigrateLessonModal
                isOpen={isMigrateLessonModalOpen}
                onClose={closeMigrateLessonModal}
                lesson={selectedLesson}
                onMigrate={handleMigrateLesson}
            />
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

export default ListenLesson;
