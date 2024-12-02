import React, { useState, useEffect } from 'react';
import styles from './ManageCategory.module.css';
import edit from '../../../../assets/images/edit.svg';
import deleteIcon from '../../../../assets/images/delete.svg';
import { updateCategory, deleteCategory, getAllCategories } from '../../../../helper';



const EditCategoryModal = ({ isOpen, onClose, category, onSave }) => {
    const [imagePreview, setImagePreview] = useState(category ? category.image : null);
    const [currentImage, setCurrentImage] = useState(null);
    const [categoryName, setCategoryName] = useState(category ? category.CourseCategoryName : '');
    const [sequenceNumber, setSequenceNumber] = useState(category ? category.CategorySequenceNum : 0);

    useEffect(() => {
        if (category) {
            setCategoryName(category.CourseCategoryName);
            setSequenceNumber(category.CategorySequenceNum);
            setImagePreview(category.image);
            setCurrentImage(null);
        }
    }, [category]);

    if (!isOpen) {
        return null;
    }

    const handleSave = () => {
        onSave(category.CourseCategoryId, categoryName, sequenceNumber, currentImage || category.image);
        onClose();
        resetImageState();
    };

    const handleCancel = () => {
        resetImageState();
        onClose();
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
            setCurrentImage(file);
        }
    };

    const resetImageState = () => {
        setImagePreview(category ? category.image : null);
        setCurrentImage(null);
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modal}>
            <div className={styles.modalContent}>
                <h1 className={styles.modal_heading}>Edit Category</h1>
                <div className={styles.form_group}>
                    <label className={styles.label} htmlFor="categoryName">Category Name</label>
                    <input className={styles.input_field} value={categoryName} type="text" onChange={e => setCategoryName(e.target.value)} id="categoryName" />
                </div>
                <div className={styles.form_group}>
                    <label className={styles.label} htmlFor="sequenceNumber">Sequence Number:</label>
                    <input className={styles.input_field} type="number" value={sequenceNumber} onChange={e => setSequenceNumber(e.target.value)} id="sequenceNumber" />
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
                <button className={styles.submit_button} onClick={handleSave}>Save Changes</button>
                <button className={styles.cancel_button} onClick={handleCancel}>Cancel</button>
            </div>
        </div >
    );
};





const ManageCategory = () => {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchCategories = async () => {
        setIsLoading(true);
        try {
            const response = await getAllCategories();
            if (response.status === 200) {
                setCategories(response.data);
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            alert(error);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const openEditModal = (category) => {
        setSelectedCategory(category);
        setIsModalOpen(true);
    };

    const closeEditModal = () => {
        setSelectedCategory(null);
        setIsModalOpen(false);
    };

    const handleDeleteCategory = async (categoryId) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                setIsLoading(true);
                const response = await deleteCategory(categoryId);
                if (response.status === 200) {
                    alert('Category deleted successfully');
                    fetchCategories();
                } else {
                    alert(response.data.message);
                }
            } catch (error) {
                alert(error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const saveCategoryChanges = async (categoryId, categoryName, sequenceNumber, imageFile) => {
        try {
            setIsLoading(true);
            const response = await updateCategory(categoryId, categoryName, imageFile, sequenceNumber);
            if (response.status === 200) {
                alert('Category updated successfully');
                fetchCategories();
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
            <h1 className={styles.heading}>Manage your categories</h1>
            {/* loading */}
            {isLoading && <div>Fetching Data...</div>}
            {/* no data */}
            {!isLoading && categories.length === 0 && <p>No categories found</p>}
            {/* data */}
            {!isLoading && categories.length > 0 && (
                <table className={styles.table}>
                    <thead className={styles.heading_row}>
                        <tr>
                            <th className={`${styles.table_heading} ${styles.category_number}`} style={{ width: '10%' }}>Sequence Number</th>
                            <th className={`${styles.table_heading} ${styles.category_name}`} style={{ width: '84%' }}>Category Name</th>
                            <th className={`${styles.table_heading} ${styles.action_column}`} style={{ width: '3%' }}>Edit</th>
                            <th className={`${styles.table_heading} ${styles.action_column}`} style={{ width: '3%' }}>Delete</th>
                        </tr>
                    </thead>
                    <tbody className={styles.table_body}>
                        {categories.map((category, index) => (
                            <tr key={category.CourseCategoryId} className={styles.table_row}>
                                <td style={{ width: '10%' }} className={styles.category_number}>{category.CategorySequenceNum}</td>
                                <td style={{ width: '84%' }} className={styles.category_name}>{category.CourseCategoryName}</td>
                                <td style={{ width: '3%' }}><img onClick={() => openEditModal(category)} className={styles.edit} src={edit} alt="edit" /></td>
                                <td style={{ width: '3%' }}><img onClick={() => handleDeleteCategory(category.CourseCategoryId)} className={styles.delete} src={deleteIcon} alt="delete" /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <EditCategoryModal
                isOpen={isModalOpen}
                onClose={closeEditModal}
                category={selectedCategory}
                onSave={saveCategoryChanges}
            />
        </div>
    )
}

export default ManageCategory;