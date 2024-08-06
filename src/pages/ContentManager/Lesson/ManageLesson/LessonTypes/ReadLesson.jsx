import React, { useState, useEffect } from 'react';
import { getLessonsByActivity, getLessonById, updateLesson, updateDocumentFile } from '../../../../../helper';
import edit from '../../../../../assets/images/edit.svg';
import deleteIcon from '../../../../../assets/images/delete.svg';
import styles from './ReadLesson.module.css';

const EditReadLessonModal = ({ isOpen, onClose, lesson, onSave }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [lessonData, setLessonData] = useState(null);
    const [englishAudio, setEnglishAudio] = useState(null);
    const [urduAudio, setUrduAudio] = useState(null);
    const [image, setImage] = useState(null);

    useEffect(() => {
        if (lesson) {
            try {
                setIsLoading(true);
                fetchLessonData();
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
            } else {
                alert(lessonResponse.data.message);
            }
        } catch (error) {
            alert(error);
        }
    };

    const handleCancel = () => {
        setLessonData(null);
        setEnglishAudio(null);
        setUrduAudio(null);
        setImage(null);
        onClose();
    };

    const handleSave = async () => {
        const updatedLessonData = {
            ...lessonData,
            SequenceNumber: document.getElementById("sequenceNumber").value,
            weekNumber: document.getElementById("weekNumber").value,
            dayNumber: document.getElementById("dayNumber").value,
            englishAudio,
            urduAudio,
            image,
        };

        try {
            setIsSaving(true);
            const updateResponse = await updateLesson(
                updatedLessonData.LessonId,
                updatedLessonData.lessonType,
                updatedLessonData.dayNumber,
                updatedLessonData.activity,
                updatedLessonData.activityAlias,
                updatedLessonData.weekNumber,
                updatedLessonData.text,
                updatedLessonData.courseId,
                updatedLessonData.SequenceNumber,
                updatedLessonData.status
            );
            if (updateResponse.status === 200) {
                if (updatedLessonData.englishAudio) {
                    const englishAudioFile = getDocumentFile('audio', 'English');
                    if (englishAudioFile) {
                        const updateEnglishAudioResponse = await updateDocumentFile(
                            englishAudioFile.id,
                            updatedLessonData.englishAudio,
                            updatedLessonData.LessonId,
                            englishAudioFile.language,
                            englishAudioFile.mediaType
                        );
                        if (updateEnglishAudioResponse.status !== 200) {
                            alert(updateEnglishAudioResponse.data.message);
                        }
                    }
                }

                if (updatedLessonData.urduAudio) {
                    const urduAudioFile = getDocumentFile('audio', 'Urdu');
                    if (urduAudioFile) {
                        const updateUrduAudioResponse = await updateDocumentFile(
                            urduAudioFile.id,
                            updatedLessonData.urduAudio,
                            updatedLessonData.LessonId,
                            urduAudioFile.language,
                            urduAudioFile.mediaType
                        );
                        if (updateUrduAudioResponse.status !== 200) {
                            alert(updateUrduAudioResponse.data.message);
                        }
                    }
                }

                if (updatedLessonData.image) {
                    const imageFile = getDocumentFile('image', 'image');
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

    const getDocumentFile = (mediaType, language) => {
        if (!lessonData || !lessonData.documentFiles) return null;
        return lessonData.documentFiles.find(
            (file) => file.mediaType === mediaType && file.language === language
        );
    };

    return (
        <div>
            {isOpen && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <h2 className={styles.modal_heading}>Edit Read Lesson</h2>
                        {isLoading && <div>Loading...</div>}
                        {!isLoading && lessonData && (
                            <div>
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
                                    <label className={styles.label}>English Audio</label>
                                    <audio controls className={styles.audio}>
                                        <source
                                            src={getDocumentFile('audio', 'English')?.audio || ""}
                                            type="audio/mp3"
                                        />
                                    </audio>
                                </div>
                                <div className={styles.form_group}>
                                    <label className={styles.label}>Urdu Audio</label>
                                    <audio controls className={styles.audio}>
                                        <source
                                            src={getDocumentFile('audio', 'Urdu')?.audio || ""}
                                            type="audio/mp3"
                                        />
                                    </audio>
                                </div>
                                <div className={styles.form_group}>
                                    <label className={styles.label}>Image</label>
                                    {getDocumentFile('image', 'image') ? (
                                        <img
                                            src={getDocumentFile('image', 'image')?.image}
                                            alt="Lesson Image"
                                            className={styles.image}
                                        />
                                    ) : (
                                        <p>Not Available</p>
                                    )}
                                </div>
                                <div className={styles.form_group}>
                                    <label className={styles.label}>Upload English Audio</label>
                                    <input
                                        type="file"
                                        accept="audio/*"
                                        onChange={(e) => setEnglishAudio(e.target.files[0])}
                                    />
                                </div>
                                <div className={styles.form_group}>
                                    <label className={styles.label}>Upload Urdu Audio</label>
                                    <input
                                        type="file"
                                        accept="audio/*"
                                        onChange={(e) => setUrduAudio(e.target.files[0])}
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

const ReadLesson = ({ category, course }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [lessons, setLessons] = useState([]);
    const [isEditReadLessonModalOpen, setIsEditReadLessonModalOpen] = useState(false);
    const [selectedLesson, setSelectedLesson] = useState(null);

    useEffect(() => {
        const fetchLessons = async () => {
            try {
                setIsLoading(true);
                const lessonsResponse = await getLessonsByActivity(course, 'read');
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
        if (category !== "" && course !== "") {
            fetchLessons();
        }
    }, [category, course]);

    const openEditReadLessonModal = (lesson) => {
        setSelectedLesson(lesson);
        setIsEditReadLessonModalOpen(true);
    };

    const closeEditReadLessonModal = () => {
        setSelectedLesson(null);
        setIsEditReadLessonModalOpen(false);
    };

    const extractMedia = (documentFiles, mediaType, language) => {
        return documentFiles.find(
            (file) => file.mediaType === mediaType && file.language === language
        );
    };

    return (
        <div>
            <h1 className={styles.heading}>Manage your read lessons</h1>
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
                            <th className={styles.table_heading}>English Audio</th>
                            <th className={styles.table_heading}>Urdu Audio</th>
                            <th className={styles.table_heading}>Image</th>
                            <th className={styles.table_heading}>Edit</th>
                            <th className={styles.table_heading}>Delete</th>
                        </tr>
                    </thead>
                    <tbody className={styles.table_body}>
                        {lessons.map((lesson) => {
                            const englishAudio = extractMedia(lesson.documentFiles, 'audio', 'English');
                            const urduAudio = extractMedia(lesson.documentFiles, 'audio', 'Urdu');
                            const image = extractMedia(lesson.documentFiles, 'image', 'image');

                            return (
                                <tr key={lesson.LessonId} className={styles.table_row}>
                                    <td style={{ width: "10%" }}>{lesson.LessonId || "Not Available"}</td>
                                    <td style={{ width: "10%" }}>{lesson.SequenceNumber || "Not Available"}</td>
                                    <td style={{ width: "10%" }}>{lesson.weekNumber || "Not Available"}</td>
                                    <td style={{ width: "10%" }}>{lesson.dayNumber || "Not Available"}</td>
                                    <td className={styles.audio_section} style={{ width: "10%" }}>
                                        {englishAudio ? (
                                            <audio controls className={styles.audio}>
                                                <source src={englishAudio.audio} type="audio/mp4" />
                                            </audio>
                                        ) : (
                                            <p>Not Available</p>
                                        )}
                                    </td>
                                    <td className={styles.audio_section} style={{ width: "10%" }}>
                                        {urduAudio ? (
                                            <audio controls className={styles.audio}>
                                                <source src={urduAudio.audio} type="audio/mp4" />
                                            </audio>
                                        ) : (
                                            <p>Not Available</p>
                                        )}
                                    </td>
                                    <td className={styles.image_section} style={{ width: "10%" }}>
                                        {image ? (
                                            <img
                                                src={image.image}
                                                alt="Lesson Image"
                                                className={styles.image}
                                                style={{ width: "180px", height: "120px" }}
                                            />
                                        ) : (
                                            <p>Not Available</p>
                                        )}
                                    </td>
                                    <td style={{ width: "10%" }}>
                                        <img
                                            onClick={() => openEditReadLessonModal(lesson)}
                                            src={edit}
                                            alt="Edit"
                                        />
                                    </td>
                                    <td style={{ width: "10%" }}>
                                        <img
                                            onClick={() => { }}  // Add delete functionality if needed
                                            src={deleteIcon}
                                            alt="Delete"
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
            <EditReadLessonModal
                isOpen={isEditReadLessonModalOpen}
                onClose={closeEditReadLessonModal}
                lesson={selectedLesson}
                onSave={() => {
                    const fetchLessons = async () => {
                        try {
                            const lessonsResponse = await getLessonsByActivity(course, 'read');
                            if (lessonsResponse.status === 200) {
                                setLessons(lessonsResponse.data);
                            } else {
                                alert(lessonsResponse.data.message);
                            }
                        } catch (error) {
                            alert(error);
                        }
                    };
                    fetchLessons();
                }}
            />
        </div>
    );
};

export default ReadLesson;
