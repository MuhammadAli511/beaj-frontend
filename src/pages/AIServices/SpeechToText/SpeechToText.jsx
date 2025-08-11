import React, { useState, useRef } from 'react';
import { Oval } from 'react-loader-spinner';
import { speechToText } from '../../../helper';
import styles from './SpeechToText.module.css';

const SpeechToText = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [transcript, setTranscript] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('en');
    const [selectedProvider, setSelectedProvider] = useState('openai');
    const fileInputRef = useRef(null);

    const getLanguageOptions = () => {
        const baseOptions = [
            { value: 'en', label: 'English' },
            { value: 'ur', label: 'Urdu' },
            { value: 'none', label: 'None' },
        ];
        
        if (selectedProvider === 'gemini') {
            return [
                ...baseOptions,
                { value: 'roman_urdu', label: 'Roman Urdu' }
            ];
        }
        
        return baseOptions;
    };

    const providerOptions = [
        { value: 'openai', label: 'OpenAI' },
        { value: 'azure', label: 'Azure' },
        { value: 'elevenlabs', label: 'ElevenLabs' },
        { value: 'gemini', label: 'Gemini' },
    ];

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Check if file is audio or video
            const allowedTypes = [
                'audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/m4a', 'audio/ogg',
                'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm'
            ];

            if (allowedTypes.includes(file.type) || file.name.match(/\.(mp3|wav|m4a|ogg|mp4|avi|mov|wmv|webm)$/i)) {
                setSelectedFile(file);
                setError('');
                setTranscript('');
            } else {
                setError('Please select a valid audio or video file.');
                setSelectedFile(null);
            }
        }
    };

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    const handleDrop = (event) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (file) {
            const fakeEvent = { target: { files: [file] } };
            handleFileSelect(fakeEvent);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Please select a file first.');
            return;
        }

        setIsLoading(true);
        setError('');
        setTranscript('');

        try {
            const result = await speechToText(selectedFile, selectedLanguage, selectedProvider);
            if (result.data.transcription) {
                setTranscript(result.data.transcription);
            } else {
                setError(result.data.message || 'No transcript received from the server.');
            }
        } catch (err) {
            console.error('Error uploading file:', err);
            setError('Failed to process the file. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearFile = () => {
        setSelectedFile(null);
        setTranscript('');
        setError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(transcript).then(() => {
            // You could add a toast notification here
            alert('Transcript copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    };

    const downloadTranscript = () => {
        const element = document.createElement('a');
        const file = new Blob([transcript], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `transcript_${new Date().toISOString().slice(0, 10)}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>Speech to Text Converter</h2>
                <p className={styles.description}>
                    Upload an audio or video file to get an accurate transcript using AI-powered speech recognition.
                </p>
            </div>

            <div className={styles.upload_section}>
                <div className={styles.language_selection}>
                    <div className={styles.selection_item}>
                        <label className={styles.provider_label}>Select Provider:</label>
                        <select
                            className={styles.provider_dropdown}
                            value={selectedProvider}
                            onChange={(e) => {
                                const newProvider = e.target.value;
                                setSelectedProvider(newProvider);
                                // Reset language to 'en' if current language is not available for new provider
                                if (selectedLanguage === 'roman_urdu' && newProvider !== 'gemini') {
                                    setSelectedLanguage('en');
                                }
                            }}
                        >
                            {providerOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.selection_item}>
                        <label className={styles.language_label}>Select Language:</label>
                        <select
                            className={styles.language_dropdown}
                            value={selectedLanguage}
                            onChange={(e) => setSelectedLanguage(e.target.value)}
                        >
                            {getLanguageOptions().map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div
                    className={`${styles.drop_zone} ${selectedFile ? styles.has_file : ''}`}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="audio/*,video/*,.mp3,.wav,.m4a,.ogg,.mp4,.avi,.mov,.wmv,.webm"
                        onChange={handleFileSelect}
                        className={styles.file_input}
                    />

                    {selectedFile ? (
                        <div className={styles.file_info}>
                            <div className={styles.file_icon}>📁</div>
                            <div className={styles.file_details}>
                                <p className={styles.file_name}>{selectedFile.name}</p>
                                <p className={styles.file_size}>
                                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                                </p>
                            </div>
                            <button
                                className={styles.clear_button}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleClearFile();
                                }}
                            >
                                ✕
                            </button>
                        </div>
                    ) : (
                        <div className={styles.upload_prompt}>
                            <div className={styles.upload_icon}>🎵</div>
                            <p className={styles.upload_text}>Click to select or drag & drop your audio/video file</p>
                        </div>
                    )}
                </div>

                {error && (
                    <div className={styles.error_message}>
                        <span className={styles.error_icon}>⚠️</span>
                        {error}
                    </div>
                )}

                <div className={styles.action_buttons}>
                    <button
                        className={styles.upload_button}
                        onClick={handleUpload}
                        disabled={!selectedFile || isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Oval height="20" width="20" color="#ffffff" />
                                Processing...
                            </>
                        ) : (
                            'Generate Transcript'
                        )}
                    </button>
                </div>
            </div>

            {transcript && (
                <div className={styles.result_section}>
                    <div className={styles.result_header}>
                        <h3 className={styles.result_title}>Transcript</h3>
                        <div className={styles.result_actions}>
                            <button
                                className={styles.action_button}
                                onClick={copyToClipboard}
                                title="Copy to clipboard"
                            >
                                📋 Copy
                            </button>
                            <button
                                className={styles.action_button}
                                onClick={downloadTranscript}
                                title="Download as text file"
                            >
                                💾 Download
                            </button>
                        </div>
                    </div>
                    <div className={styles.transcript_container}>
                        <textarea
                            className={styles.transcript_text}
                            value={transcript}
                            onChange={(e) => setTranscript(e.target.value)}
                            placeholder="Your transcript will appear here..."
                            rows={10}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default SpeechToText;