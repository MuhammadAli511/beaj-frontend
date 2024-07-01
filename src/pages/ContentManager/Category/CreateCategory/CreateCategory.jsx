import React, { useState } from 'react';
import styles from './CreateCategory.module.css';
import { createCategory } from '../../../../helper';

const CreateCategory = () => {
    const [imagePreview, setImagePreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            const category_name = e.target.category_name.value;
            const sequence_number = e.target.sequence_number.value;
            const category_image = e.target.category_image.files[0];
            const response = await createCategory(category_name, category_image, sequence_number);
            if (response.status === 200) {
                alert('Category created successfully');
                e.target.reset();
                setImagePreview(null);
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
            <h1 className={styles.heading}>Fill out your category details</h1>
            <form onSubmit={handleCreateCategory} className={styles.form}>
                <div className={styles.input_row}>
                    <div className={styles.form_group}>
                        <label className={styles.label} htmlFor="category_name">Category Name</label>
                        <input className={styles.input_field} type="text" id="category_name" name="category_name" />
                    </div>
                    <div className={styles.form_group}>
                        <label className={styles.label} htmlFor="sequence_number">Sequence Number</label>
                        <input className={styles.input_field} type="number" id="sequence_number" name="sequence_number" />
                    </div>
                </div>
                <div className={styles.form_group}>
                    <label className={styles.label} htmlFor="category_image">Add Category Image</label>
                    <input type="file" id="category_image" name="category_image" onChange={handleImageChange} />
                    {imagePreview && (
                        <div className={styles.image_preview}>
                            <img src={imagePreview} alt="Preview" className={styles.image} />
                        </div>
                    )}
                </div>
                <button type="submit" className={styles.submit_button}>{isLoading ? <div className="loader"></div> : "Save Category"}</button>
            </form>
        </div>
    );
};

export default CreateCategory;
