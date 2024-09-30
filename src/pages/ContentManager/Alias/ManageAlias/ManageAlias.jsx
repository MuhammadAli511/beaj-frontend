import React, { useState, useEffect } from 'react';
import styles from './ManageAlias.module.css';
import edit from '../../../../assets/images/edit.svg';
import deleteIcon from '../../../../assets/images/delete.svg';
import { getAllActivityAliases, deleteActivityAlias, updateActivityAlias, getActivityAliasById } from '../../../../helper';


const EditAliasModal = ({ isOpen, onClose, alias, onSave }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [aliasName, setAliasName] = useState(alias ? alias.Alias : '');

    useEffect(() => {
        if (alias) {
            setAliasName(alias.Alias);
        }
    }, [alias]);


    if (!isOpen) {
        return null;
    };

    const handleSave = async () => {
        onSave(alias.id, aliasName);
        onClose();
    };

    const handleCancel = () => {
        onClose();
    };

    return (
        <div className={styles.modal}>
            <div className={styles.modalContent}>
                <h2>Edit Alias</h2>
                <div className={styles.form_group}>
                    <label className={styles.label} htmlFor="aliasName">Activity Alias Name</label>
                    <input className={styles.input_field} value={aliasName} type="text" name="aliasName" id="aliasName" onChange={(e) => setAliasName(e.target.value)} required />
                </div>
                <button className={styles.submit_button} onClick={handleSave}>Save Changes</button>
                <button className={styles.cancel_button} onClick={handleCancel}>Cancel</button>
            </div>
        </div>
    );
};


const ManageAlias = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [aliases, setAliases] = useState([]);
    const [selectedAlias, setSelectedAlias] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);



    const fetchAliases = async () => {
        setIsLoading(true);
        try {
            const response = await getAllActivityAliases();
            if (response.status === 200) {
                setAliases(response.data.sort((a, b) => a.id - b.id));
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            alert(error);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchAliases();
    }, []);

    const openEditModal = (alias) => {
        setSelectedAlias(alias);
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setSelectedAlias(null);
        setIsEditModalOpen(false);
    };



    const handleDeleteAlias = async (aliasId) => {
        if (window.confirm('Are you sure you want to delete this alias?')) {
            try {
                setIsLoading(true);
                const response = await deleteActivityAlias(aliasId);
                if (response.status === 200) {
                    alert('Alias deleted successfully');
                    fetchAliases();
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

    const saveAliasChanges = async (aliasId, aliasName) => {
        try {
            setIsLoading(true);
            const response = await updateActivityAlias(aliasId, aliasName);
            if (response.status === 200) {
                alert('Alias updated successfully');
                fetchAliases();
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
            <h1 className={styles.heading}>Manage your activity aliases</h1>
            {/* loading */}
            {isLoading && <div>Fetching Data...</div>}
            {/* no data */}
            {!isLoading && aliases.length === 0 && <p>No activity aliases found</p>}
            {/* data */}
            {!isLoading && aliases.length > 0 && (
                <table className={styles.table}>
                    <thead className={styles.heading_row}>
                        <tr>
                            <th className={styles.table_heading}>Id</th>
                            <th className={styles.table_heading}>Alias Name</th>
                            <th className={styles.table_heading}>Edit</th>
                            <th className={styles.table_heading}>Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {aliases.map((alias) => (
                            <tr key={alias.id}>
                                <td className={styles.table_data}>{alias.id}</td>
                                <td className={styles.table_data}>{alias.Alias}</td>
                                <td className={styles.table_data}>
                                    <div onClick={() => openEditModal(alias)}>
                                        <img src={edit} alt="edit" />
                                    </div>
                                </td>
                                <td className={styles.table_data}>
                                    <div onClick={() => handleDeleteAlias(alias.id)}>
                                        <img src={deleteIcon} alt="delete" />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            <EditAliasModal
                isOpen={isEditModalOpen}
                onClose={closeEditModal}
                alias={selectedAlias}
                onSave={saveAliasChanges}
            />
        </div>
    )
};

export default ManageAlias;