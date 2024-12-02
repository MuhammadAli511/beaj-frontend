import React, { useState, useEffect } from 'react';
import styles from './ManageConstant.module.css';
import edit from '../../../../assets/images/edit.svg';
import deleteIcon from '../../../../assets/images/delete.svg';
import { getAllConstants, deleteConstant, updateConstant, getConstantById } from '../../../../helper';


const EditConstantModal = ({ isOpen, onClose, constant, onSave }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [key, setKey] = useState('');
    const [constantValue, setConstantValue] = useState('');
    const [category, setCategory] = useState('');

    useEffect(() => {
        if (constant) {
            setKey(constant.key);
            setConstantValue(constant.constantValue);
            setCategory(constant.category);
        }
    }, [constant]);


    if (!isOpen) {
        return null;
    };

    const handleSave = async () => {
        onSave(constant.id, key, constantValue, category);
        onClose();
    };

    const handleCancel = () => {
        onClose();
    };

    return (
        <div className={styles.modal}>
            <div className={styles.modalContent}>
                <h2>Edit Constant</h2>
                <div className={styles.form_group}>
                    <label className={styles.label} htmlFor="key">Constant Key</label>
                    <input className={styles.input_field} value={key} type="text" name="key" id="key" onChange={(e) => setKey(e.target.value)} required />
                </div>
                <div className={styles.form_group}>
                    <label className={styles.label} htmlFor="constantValue">Constant Value</label>
                    <input className={styles.input_field} value={constantValue} type="text" name="constantValue" id="constantValue" onChange={(e) => setConstantValue(e.target.value)} required />
                </div>
                <div className={styles.form_group}>
                    <label className={styles.label} htmlFor="category">Constant Category</label>
                    <input className={styles.input_field} value={category} type="text" name="category" id="category" onChange={(e) => setCategory(e.target.value)} required />
                </div>
                <button className={styles.submit_button} onClick={handleSave}>Save Changes</button>
                <button className={styles.cancel_button} onClick={handleCancel}>Cancel</button>
            </div>
        </div>
    );
};


const ManageConstant = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [constants, setConstants] = useState([]);
    const [selectedConstant, setSelectedConstant] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);



    const fetchConstants = async () => {
        setIsLoading(true);
        try {
            const response = await getAllConstants();
            if (response.status === 200) {
                setConstants(response.data);
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            alert(error);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchConstants();
    }, []);

    const openEditModal = (constant) => {
        setSelectedConstant(constant);
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setSelectedConstant(null);
        setIsEditModalOpen(false);
    };



    const handleDeleteConstant = async (constantId) => {
        if (window.confirm('Are you sure you want to delete this constant?')) {
            try {
                setIsLoading(true);
                const response = await deleteConstant(constantId);
                if (response.status === 200) {
                    alert('Constant deleted successfully');
                    fetchConstants();
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

    const saveConstantChanges = async (constantId, key, constantValue, category) => {
        try {
            setIsLoading(true);
            const response = await updateConstant(constantId, key, constantValue, category);
            if (response.status === 200) {
                alert('Constant updated successfully');
                fetchConstants();
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
            <h1 className={styles.heading}>Manage your constants</h1>
            {/* loading */}
            {isLoading && <div>Fetching Data...</div>}
            {/* no data */}
            {!isLoading && constants.length === 0 && <p>No constants found</p>}
            {/* data */}
            {!isLoading && constants.length > 0 && (
                <table className={styles.table}>
                    <thead className={styles.heading_row}>
                        <tr>
                            <th className={`${styles.table_heading} ${styles.constant_id}`} style={{ width: '10%' }}>Id</th>
                            <th className={`${styles.table_heading} ${styles.constant_key}`} style={{ width: '25%' }}>Key</th>
                            <th className={`${styles.table_heading} ${styles.constant_value}`} style={{ width: '32%' }}>Value</th>
                            <th className={`${styles.table_heading} ${styles.constant_category}`} style={{ width: '27%' }}>Category</th>
                            <th className={`${styles.table_heading} ${styles.action_column}`} style={{ width: '3%' }}>Edit</th>
                            <th className={`${styles.table_heading} ${styles.action_column}`} style={{ width: '3%' }}>Delete</th>
                        </tr>
                    </thead>
                    <tbody className={styles.table_body}>
                        {constants.map((constant) => (
                            <tr key={constant.id} className={styles.table_row}>
                                <td style={{ width: '10%' }}>{constant.id}</td>
                                <td style={{ width: '25%' }}>{constant.key}</td>
                                <td style={{ width: '32%' }}>{constant.constantValue}</td>
                                <td style={{ width: '27%' }}>{constant.category}</td>
                                <td style={{ width: '3%' }}>
                                    <img onClick={() => openEditModal(constant)} className={styles.edit} src={edit} alt="edit" />
                                </td>
                                <td style={{ width: '3%' }}>
                                    <img onClick={() => handleDeleteConstant(constant.id)} className={styles.delete} src={deleteIcon} alt="delete" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            <EditConstantModal
                isOpen={isEditModalOpen}
                onClose={closeEditModal}
                constant={selectedConstant}
                onSave={saveConstantChanges}
            />
        </div>
    )
};

export default ManageConstant;