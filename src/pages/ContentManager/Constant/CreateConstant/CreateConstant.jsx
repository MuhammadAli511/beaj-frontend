import React, { useState } from 'react';
import styles from './CreateConstant.module.css';
import { createConstant } from '../../../../helper';

const CreateConstant = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [category, setCategory] = useState('MESSAGES');
    const [file, setFile] = useState(null);

    const handleCategoryChange = (e) => {
        setCategory(e.target.value);
        setFile(null);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        const { size, type } = file;

        // Check file size and type based on category
        if (category === 'IMAGES' && (type !== 'image/jpeg' || size > 5 * 1024 * 1024)) {
            alert('Please upload a JPEG image smaller than 5MB.');
            return;
        }

        if (category === 'AUDIOS' && (type !== 'audio/mpeg' || size > 16 * 1024 * 1024)) {
            alert('Please upload an MP3 file smaller than 16MB.');
            return;
        }

        if (category === 'VIDEOS' && (type !== 'video/mp4' || size > 16 * 1024 * 1024)) {
            alert('Please upload an MP4 file smaller than 16MB.');
            return;
        }

        setFile(file);
    };

    const handleCreateConstant = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);

            let constantValue;
            if (category === 'MESSAGES' || category === 'CRITICAL') {
                constantValue = e.target.constantValue.value;
            } else {
                constantValue = file;
            }

            const response = await createConstant(e.target.key.value, constantValue, category);
            if (response.status === 200) {
                e.target.reset();
                setFile(null);
                alert('Constant created successfully');
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            alert(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.content}>
            <h1 className={styles.heading}>Fill out your constant details</h1>
            <form onSubmit={handleCreateConstant} className={styles.form}>
                <div className={styles.input_row}>
                    <div className={styles.form_group}>
                        <label className={styles.label} htmlFor="category">Constant Category</label>
                        <select
                            className={styles.input_field}
                            name="category"
                            id="category"
                            value={category}
                            onChange={handleCategoryChange}
                            required
                        >
                            <option value="MESSAGES">MESSAGES</option>
                            <option value="VIDEOS">VIDEOS</option>
                            <option value="IMAGES">IMAGES</option>
                            <option value="AUDIOS">AUDIOS</option>
                            <option value="CRITICAL">CRITICAL</option>
                        </select>
                    </div>
                </div>

                <div className={styles.input_row}>
                    <div className={styles.form_group}>
                        <label className={styles.label} htmlFor="key">Constant Key</label>
                        <input className={styles.input_field} type="text" name="key" id="key" required />
                    </div>
                </div>

                {category === 'MESSAGES' || category === 'CRITICAL' ? (
                    <div className={styles.input_row}>
                        <div className={styles.form_group}>
                            <label className={styles.label} htmlFor="constantValue">Constant Value</label>
                            <input className={styles.input_field} type="text" name="constantValue" id="constantValue" required />
                        </div>
                    </div>
                ) : (
                    <div className={styles.input_row}>
                        <div className={styles.form_group}>
                            <label className={styles.label} htmlFor="file">
                                Upload {category.slice(0, -1)} File
                            </label>
                            <input
                                className={styles.input_field}
                                type="file"
                                name="file"
                                id="file"
                                onChange={handleFileChange}
                                accept={
                                    category === 'IMAGES' ? 'image/jpeg' :
                                        category === 'AUDIOS' ? 'audio/mpeg' :
                                            category === 'VIDEOS' ? 'video/mp4' : ''
                                }
                                required
                            />
                        </div>
                    </div>
                )}

                <button type="submit" className={styles.submit_button}>
                    {isLoading ? <div className="loader"></div> : "Save Constant"}
                </button>
            </form>
        </div>
    );
};

export default CreateConstant;