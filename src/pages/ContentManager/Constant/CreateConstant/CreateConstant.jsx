import React, { useState } from 'react';
import styles from './CreateConstant.module.css';
import { createConstant } from '../../../../helper';


const CreateConstant = () => {
    const [isLoading, setIsLoading] = useState(false);


    const handleCreateConstant = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            const response = await createConstant(e.target.key.value, e.target.constantValue.value, e.target.category.value);
            if (response.status === 200) {
                e.target.reset();
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
                        <label className={styles.label} htmlFor="key">Constant Key</label>
                        <input className={styles.input_field} type="text" name="key" id="key" required />
                    </div>
                </div>
                <div className={styles.input_row}>
                    <div className={styles.form_group}>
                        <label className={styles.label} htmlFor="constantValue">Constant Value</label>
                        <input className={styles.input_field} type="text" name="constantValue" id="constantValue" required />
                    </div>
                </div>
                <div className={styles.input_row}>
                    <div className={styles.form_group}>
                        <label className={styles.label} htmlFor="category">Constant Category</label>
                        <input className={styles.input_field} type="text" name="category" id="category" required />
                    </div>
                </div>
                <button type="submit" className={styles.submit_button}>{isLoading ? <div className="loader"></div> : "Save Constant"}</button>
            </form>
        </div>
    )
};

export default CreateConstant;