import React, { useState, useEffect } from "react";
import {
    getLessonsByActivity,
    getLessonById,
    deleteLesson,
    getAllCourses,
    getAllActivityAliases,
    updateLesson,
    updateDocumentFile,
    migrateLesson
} from "../../../../../helper";
import edit from "../../../../../assets/images/edit.svg";
import deleteIcon from "../../../../../assets/images/delete.svg";
import styles from "./WatchLesson.module.css";
import MigrateLessonModal from "../../../../../components/MigrateLessonModal/MigrateLessonModal";

const EditWatchLessonModal = ({ isOpen, onClose, lesson, onSave }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [lessonData, setLessonData] = useState(null);
    const [video, setVideo] = useState(null);
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
                    setActivityAliases(aliasesResponse.data);
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
        setVideo(null);
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
            video,
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
                if (updatedLessonData.video) {
                    const updateFileResponse = await updateDocumentFile(
                        updatedLessonData.documentFiles[0].id,
                        updatedLessonData.video,
                        updatedLessonData.LessonId,
                        updatedLessonData.documentFiles[0].language,
                        updatedLessonData.documentFiles[0].mediaType
                    );
                    if (updateFileResponse.status !== 200) {
                        alert(updateFileResponse.data.message);
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

    return (
        <div>
            {isOpen && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <h2 className={styles.modal_heading}>Edit Watch Lesson</h2>
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
                                    <label className={styles.label}>Video</label>
                                    <video controls className={styles.video}>
                                        {lessonData.documentFiles ? (
                                            <source
                                                src={lessonData.documentFiles[0].video || "Not Available"}
                                                type="video/mp4"
                                            />
                                        ) : (
                                            <p>Not Available</p>
                                        )}
                                    </video>
                                </div>
                                <div className={styles.form_group}>
                                    <label className={styles.label}>Upload Video</label>
                                    <input
                                        type="file"
                                        accept="video/*"
                                        onChange={(e) => setVideo(e.target.files[0])}
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

const WatchLesson = ({ category, course, activityType }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [lessons, setLessons] = useState([]);
    const [isEditWatchLessonModalOpen, setIsEditWatchLessonModalOpen] =
        useState(false);
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [isMigrateLessonModalOpen, setIsMigrateLessonModalOpen] = useState(false);
    const isDevEnvironment = process.env.REACT_APP_ENVIRONMENT == "DEV";

    const fetchLessons = async () => {
        try {
            setIsLoading(true);
            const lessonsResponse = await getLessonsByActivity(course, activityType);
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

    const openEditWatchLessonModal = (lesson) => {
        setSelectedLesson(lesson);
        setIsEditWatchLessonModalOpen(true);
    };

    const closeEditWatchLessonModal = () => {
        setSelectedLesson(null);
        setIsEditWatchLessonModalOpen(false);
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

    return (
        <div>
            <h1 className={styles.heading}>Manage your watch lessons</h1>
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
                            <th className={styles.table_heading}>Video</th>
                            <th className={styles.table_heading}>Status</th>
                            {isDevEnvironment && <th className={styles.table_heading}>Migrate</th>}
                            <th className={styles.table_heading}>Edit</th>
                            <th className={styles.table_heading}>Delete</th>
                        </tr>
                    </thead>
                    <tbody className={styles.table_body}>
                        {lessons.map((lesson) => (
                            <tr key={lesson.LessonId} className={styles.table_row}>
                                <td style={{ width: "10%" }}>{lesson.LessonId || "Not Available"}</td>
                                <td style={{ width: "10%" }}>{lesson.SequenceNumber || "Not Available"}</td>
                                <td style={{ width: "15%" }}>{lesson.weekNumber || "Not Available"}</td>
                                <td style={{ width: "15%" }}>{lesson.dayNumber || "Not Available"}</td>
                                <td style={{ width: "100%" }} className={styles.video_section}>
                                    {lesson.documentFiles ? (
                                        <video controls className={styles.video}>
                                            <source
                                                src={lesson.documentFiles[0]?.video || ""}
                                                type="video/mp4"
                                            />
                                        </video>
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
                                        onClick={() => openEditWatchLessonModal(lesson)}
                                        src={edit}
                                        alt="Edit"
                                    />
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
            <EditWatchLessonModal
                isOpen={isEditWatchLessonModalOpen}
                onClose={closeEditWatchLessonModal}
                lesson={selectedLesson}
                onSave={fetchLessons}
            />
            <MigrateLessonModal
                isOpen={isMigrateLessonModalOpen}
                onClose={closeMigrateLessonModal}
                lesson={selectedLesson}
                onMigrate={handleMigrateLesson}
            />
        </div>
    );
};

export default WatchLesson;
