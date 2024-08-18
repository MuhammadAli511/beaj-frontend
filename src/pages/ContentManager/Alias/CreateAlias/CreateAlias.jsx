import React, { useState } from 'react';
import styles from './CreateAlias.module.css';
import { createActivityAlias } from '../../../../helper';


const CreateAlias = () => {
    const [isLoading, setIsLoading] = useState(false);


    const handleCreateAlias = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            const response = await createActivityAlias(e.target.alias.value);
            if (response.status === 200) {
                e.target.alias.value = '';
                alert('Alias created successfully');
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
            <h1 className={styles.heading}>Fill out your alias details</h1>
            <form onSubmit={handleCreateAlias} className={styles.form}>
                <div className={styles.input_row}>
                    <div className={styles.form_group}>
                        <label className={styles.label} htmlFor="alias">Activity Alias Name</label>
                        <input className={styles.input_field} type="text" name="alias" id="alias" required />
                    </div>
                </div>
                <button type="submit" className={styles.submit_button}>{isLoading ? <div className="loader"></div> : "Save Alias"}</button>
            </form>
        </div>
    )
};

export default CreateAlias;