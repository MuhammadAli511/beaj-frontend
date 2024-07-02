import React, { useState, useEffect } from 'react';
import { Navbar, Sidebar } from "../../components";
import styles from './ChatbotLogs.module.css';
import { getAllChatbotLogs, createChatbotLog } from "../../helper";
import promptText from '../../constants/prompt';

const ChatbotLogs = () => {
    const [chatbotLogs, setChatbotLogs] = useState([]);
    const [audioFile, setAudioFile] = useState(null);
    const [prompt, setPrompt] = useState(promptText);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchChatbotLogs();
    }, []);

    const fetchChatbotLogs = () => {
        getAllChatbotLogs()
            .then(response => setChatbotLogs(response.data))
            .catch(error => console.error('Error fetching chatbot logs:', error));
    };

    const handleFileChange = (event) => {
        setAudioFile(event.target.files[0]);
    };

    const handlePromptChange = (event) => {
        setPrompt(event.target.value);
    };

    const handleSubmit = async (event) => {
        setIsLoading(true);
        event.preventDefault();

        try {
            const response = await createChatbotLog(audioFile, prompt);
            if (response.status === 200) {
                setAudioFile(null);
                setPrompt(promptText);
                fetchChatbotLogs();
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            console.error('Error submitting chatbot log:', error);
        }
        setIsLoading(false);
    };

    const roundToTwo = num => +(Math.round(num + "e+2") + "e-2");


    return (
        <div className={styles.main_page}>
            <Navbar />
            <Sidebar />
            <div className={styles.content}>
                <h1>Chatbot Logs</h1>
                <form onSubmit={handleSubmit} className={styles.form_input}>
                    <input
                        type="file"
                        accept="audio/*"
                        onChange={handleFileChange}
                        required
                        className={styles.file_input}
                    />
                    <textarea
                        value={prompt}
                        onChange={handlePromptChange}
                        rows="4"
                        required
                        className={styles.text_area}
                    />
                    <button type="submit" className={styles.submit_button}>{isLoading ? <div className="loader"></div> : "Get Feedback"}</button>
                </form>
                <table className={styles.table}>
                    <thead className={styles.heading_row}>
                        <tr>
                            <th className={styles.table_heading}>ID</th>
                            <th className={styles.table_heading}>User Speech to Text Time (sec)</th>
                            <th className={styles.table_heading}>Model Feedback Time (sec)</th>
                            <th className={styles.table_heading}>Model Text to Speech Time (sec)</th>
                            <th className={styles.table_heading}>Total Time (sec)</th>
                            <th className={styles.table_heading}>Prompt</th>
                            <th className={styles.table_heading}>User Audio</th>
                            <th className={styles.table_heading}>Model Audio</th>
                            <th className={styles.table_heading}>Model Text</th>
                        </tr>
                    </thead>
                    <tbody className={styles.table_body}>
                        {chatbotLogs.map(log => (
                            <tr key={log.id} className={styles.table_row}>
                                <td className={styles.table_cell}>{log.id}</td>
                                <td className={styles.table_cell}>{roundToTwo(log.userSpeechToTextTime)}</td>
                                <td className={styles.table_cell}>{roundToTwo(log.modelFeedbackTime)}</td>
                                <td className={styles.table_cell}>{roundToTwo(log.modelTextToSpeechTime)}</td>
                                <td className={styles.table_cell}>{roundToTwo(log.totalTime)}</td>
                                <td className={styles.table_cell_text}>{log.modelPrompt}</td>
                                <td className={styles.table_cell}>
                                    <audio controls>
                                        <source src={log.userAudio} type="audio/ogg" />
                                        Your browser does not support the audio element.
                                    </audio>
                                </td>
                                <td className={styles.table_cell}>
                                    <audio controls>
                                        <source src={log.modelAudio} type="audio/ogg" />
                                        Your browser does not support the audio element.
                                    </audio>
                                </td>
                                <td className={styles.table_cell_text}>{log.modelText}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ChatbotLogs;
