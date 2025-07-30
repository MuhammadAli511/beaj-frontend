import React, { useState, useEffect } from 'react';
import { Navbar, Sidebar } from "../../components";
import styles from './UsersData.module.css';
import { useSidebar } from '../../components/SidebarContext';
import { getAllMetadata, updateUserMetaData } from '../../helper';
import { TailSpin } from 'react-loader-spinner';
import Select from 'react-select';

const UsersData = () => {
    const { isSidebarOpen } = useSidebar();
    const [userData, setUserData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingUserId, setEditingUserId] = useState(null);
    const [editData, setEditData] = useState({});
    const [saving, setSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(20);
    
    // Filters
    const [selectedCohort, setSelectedCohort] = useState(null);
    const [selectedCity, setSelectedCity] = useState(null);
    const [selectedCustomerSource, setSelectedCustomerSource] = useState(null);
    const [selectedCustomerChannel, setSelectedCustomerChannel] = useState(null);
    const [selectedSchool, setSelectedSchool] = useState(null);
    const [selectedRollout, setSelectedRollout] = useState(null);

    // Editable columns
    const editableColumns = [
        'name',
        'city',
        'amountPaid',
        'cohort',
        'schoolName',
        'customerSource',
        'customerChannel'
    ];

    // All columns to display
    const displayColumns = [
        { key: 'phoneNumber', label: 'Phone Number', editable: false },
        { key: 'profile_id', label: 'Profile ID', editable: false },
        { key: 'name', label: 'Name', editable: true },
        { key: 'city', label: 'City', editable: true },
        { key: 'amountPaid', label: 'Amount Paid', editable: true },
        { key: 'cohort', label: 'Cohort', editable: true },
        { key: 'schoolName', label: 'School Name', editable: true },
        { key: 'classLevel', label: 'Class Level', editable: false },
        { key: 'rollout', label: 'Rollout', editable: false },
        { key: 'customerSource', label: 'Customer Source', editable: true },
        { key: 'customerChannel', label: 'Customer Channel', editable: true }
    ];

    useEffect(() => {
        fetchUserData();
    }, []);
    
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedCohort, selectedCity, selectedCustomerSource, selectedCustomerChannel, selectedSchool, selectedRollout]);
    
    // Generate filter options from data
    const cohortOptions = [...new Set(userData.map(user => user.cohort).filter(Boolean))]
        .sort()
        .map(cohort => ({ value: cohort, label: cohort }));
        
    const cityOptions = [...new Set(userData.map(user => user.city).filter(Boolean))]
        .sort()
        .map(city => ({ value: city, label: city }));
        
    const customerSourceOptions = [...new Set(userData.map(user => user.customerSource).filter(Boolean))]
        .sort()
        .map(source => ({ value: source, label: source }));
        
    const customerChannelOptions = [...new Set(userData.map(user => user.customerChannel).filter(Boolean))]
        .sort()
        .map(channel => ({ value: channel, label: channel }));
        
    const schoolOptions = [...new Set(userData.map(user => user.schoolName).filter(Boolean))]
        .sort()
        .map(school => ({ value: school, label: school }));
        
    const rolloutOptions = [...new Set(userData.map(user => user.rollout).filter(Boolean))]
        .sort()
        .map(rollout => ({ value: rollout, label: rollout }));

    const fetchUserData = async () => {
        try {
            setLoading(true);
            const response = await getAllMetadata();
            if (response.status === 200) {
                setUserData(response.data);
            } else {
                setError('Failed to fetch user data');
            }
        } catch (err) {
            setError('Error fetching user data: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (user) => {
        setEditingUserId(user.profile_id);
        setEditData({ ...user });
    };

    const handleCancel = () => {
        setEditingUserId(null);
        setEditData({});
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            
            // Prepare metadata object with only editable fields
            const metadata = {};
            editableColumns.forEach(column => {
                if (editData[column] !== undefined) {
                    metadata[column] = editData[column];
                }
            });

            const response = await updateUserMetaData(
                editData.phoneNumber,
                editData.profile_id,
                metadata
            );

            if (response.status === 200) {
                // Update the local data
                const updatedData = userData.map(user => 
                    user.profile_id === editingUserId ? { ...editData } : user
                );
                setUserData(updatedData);
                setEditingUserId(null);
                setEditData({});
            } else {
                setError('Failed to update user data');
            }
        } catch (err) {
            setError('Error updating user data: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleInputChange = (field, value) => {
        setEditData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Filter data based on search query and filters
    const filteredData = userData.filter(user => {
        // Search query filter
        const searchMatch = !searchQuery || (
            (user.phoneNumber && user.phoneNumber.toString().toLowerCase().includes(searchQuery.toLowerCase())) ||
            (user.profile_id && user.profile_id.toString().toLowerCase().includes(searchQuery.toLowerCase())) ||
            (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (user.city && user.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (user.schoolName && user.schoolName.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (user.cohort && user.cohort.toString().toLowerCase().includes(searchQuery.toLowerCase()))
        );
        
        // Filter matches
        const cohortMatch = !selectedCohort || user.cohort === selectedCohort.value;
        const cityMatch = !selectedCity || user.city === selectedCity.value;
        const customerSourceMatch = !selectedCustomerSource || user.customerSource === selectedCustomerSource.value;
        const customerChannelMatch = !selectedCustomerChannel || user.customerChannel === selectedCustomerChannel.value;
        const schoolMatch = !selectedSchool || user.schoolName === selectedSchool.value;
        const rolloutMatch = !selectedRollout || user.rollout === selectedRollout.value;
        
        return searchMatch && cohortMatch && cityMatch && customerSourceMatch && customerChannelMatch && schoolMatch && rolloutMatch;
    });

    // Pagination
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = filteredData.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const renderPagination = () => {
        const pages = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        // Previous button
        pages.push(
            <button
                key="prev"
                className={styles.pagination_button}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                ‹
            </button>
        );

        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    className={`${styles.pagination_button} ${currentPage === i ? styles.active : ''}`}
                    onClick={() => handlePageChange(i)}
                >
                    {i}
                </button>
            );
        }

        // Next button
        pages.push(
            <button
                key="next"
                className={styles.pagination_button}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                ›
            </button>
        );

        return pages;
    };

    return (
        <div className={styles.main_page}>
            <Navbar />
            <Sidebar />
            <div className={`${styles.content} ${!isSidebarOpen ? styles.sidebar_closed : ''}`}>
                <h1>Users Data</h1>
                
                {error && (
                    <div className={styles.error_message}>
                        {error}
                        <button onClick={() => setError('')} className={styles.close_error}>×</button>
                    </div>
                )}

                <div className={styles.filters_container}>
                    <div className={styles.filter_group}>
                        <label className={styles.filter_label}>Search</label>
                        <input
                            type="text"
                            placeholder="Search by phone, name, city, school, or cohort..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className={styles.search_input}
                        />
                    </div>
                    <div className={styles.filter_group}>
                        <label className={styles.filter_label}>Cohort</label>
                        <Select
                            className={styles.select}
                            options={cohortOptions}
                            value={selectedCohort}
                            onChange={setSelectedCohort}
                            isClearable
                            placeholder="Select Cohort"
                        />
                    </div>
                    <div className={styles.filter_group}>
                        <label className={styles.filter_label}>City</label>
                        <Select
                            className={styles.select}
                            options={cityOptions}
                            value={selectedCity}
                            onChange={setSelectedCity}
                            isClearable
                            placeholder="Select City"
                        />
                    </div>
                    <div className={styles.filter_group}>
                        <label className={styles.filter_label}>Customer Source</label>
                        <Select
                            className={styles.select}
                            options={customerSourceOptions}
                            value={selectedCustomerSource}
                            onChange={setSelectedCustomerSource}
                            isClearable
                            placeholder="Select Customer Source"
                        />
                    </div>
                    <div className={styles.filter_group}>
                        <label className={styles.filter_label}>Customer Channel</label>
                        <Select
                            className={styles.select}
                            options={customerChannelOptions}
                            value={selectedCustomerChannel}
                            onChange={setSelectedCustomerChannel}
                            isClearable
                            placeholder="Select Customer Channel"
                        />
                    </div>
                    <div className={styles.filter_group}>
                        <label className={styles.filter_label}>School</label>
                        <Select
                            className={styles.select}
                            options={schoolOptions}
                            value={selectedSchool}
                            onChange={setSelectedSchool}
                            isClearable
                            placeholder="Select School"
                        />
                    </div>
                    <div className={styles.filter_group}>
                        <label className={styles.filter_label}>Rollout</label>
                        <Select
                            className={styles.select}
                            options={rolloutOptions}
                            value={selectedRollout}
                            onChange={setSelectedRollout}
                            isClearable
                            placeholder="Select Rollout"
                        />
                    </div>
                </div>
                
                <div className={styles.stats_info}>
                    Total Users: {filteredData.length}
                </div>

                {loading ? (
                    <div className={styles.loader_container}>
                        <TailSpin color="#51bbcc" height={50} width={50} />
                        <p>Loading user data...</p>
                    </div>
                ) : (
                    <div className={styles.table_container}>
                        <table className={styles.table}>
                            <thead className={styles.heading_row}>
                                <tr>
                                    {displayColumns.map(column => (
                                        <th key={column.key} className={styles.table_heading}>
                                            {column.label}
                                        </th>
                                    ))}
                                    <th className={styles.table_heading}>Actions</th>
                                </tr>
                            </thead>
                            <tbody className={styles.table_body}>
                                {currentData.map((user, index) => {
                                    const isEditing = editingUserId === user.profile_id;
                                    
                                    return (
                                        <tr key={user.profile_id || `${user.phoneNumber}-${index}`}>
                                            {displayColumns.map(column => (
                                                <td key={column.key}>
                                                    {isEditing && column.editable ? (
                                                        <input
                                                            type="text"
                                                            value={editData[column.key] || ''}
                                                            onChange={(e) => handleInputChange(column.key, e.target.value)}
                                                            className={styles.edit_input}
                                                        />
                                                    ) : (
                                                        user[column.key] || '-'
                                                    )}
                                                </td>
                                            ))}
                                            <td>
                                                {isEditing ? (
                                                    <div className={styles.action_buttons}>
                                                        <button
                                                            onClick={handleSave}
                                                            disabled={saving}
                                                            className={styles.save_button}
                                                        >
                                                            {saving ? 'Saving...' : 'Save'}
                                                        </button>
                                                        <button
                                                            onClick={handleCancel}
                                                            disabled={saving}
                                                            className={styles.cancel_button}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => handleEdit(user)}
                                                        className={styles.edit_button}
                                                    >
                                                        Edit
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {totalPages > 1 && (
                            <div className={styles.pagination}>
                                {renderPagination()}
                                <div className={styles.page_info}>
                                    Showing {startIndex + 1}-{Math.min(endIndex, filteredData.length)} of {filteredData.length} users
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UsersData;