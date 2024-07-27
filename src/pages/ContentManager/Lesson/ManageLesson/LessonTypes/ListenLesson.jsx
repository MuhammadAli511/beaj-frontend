import React, { useState, useEffect } from 'react';
import { getLessonsByActivity } from '../../../../../helper';
import edit from '../../../../../assets/images/edit.svg';
import deleteIcon from '../../../../../assets/images/delete.svg';
import styles from './ListenLesson.module.css';

const ListenLesson = ({ category, course }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [lessons, setLessons] = useState([]);

    useEffect(() => {
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
        if (category !== "" && course !== "") {
            fetchLessons();
        }
    }, [category, course]);

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
                                <td style={{ width: "100%" }} className={styles.audio_section}>
                                    <audio controls className={styles.audio}>
                                        {lesson.documentFiles && <source src={lesson.documentFiles[0].audio} type="audio/mp3" />}
                                    </audio>
                                </td>
                                <td style={{ width: "10%" }}><img src={edit} alt="Edit" /></td>
                                <td style={{ width: "10%" }}><img src={deleteIcon} alt="Delete" /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default ListenLesson;