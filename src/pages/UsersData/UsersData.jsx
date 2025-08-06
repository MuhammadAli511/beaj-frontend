import React, { useState, useEffect, useRef } from 'react';
import { Navbar, Sidebar } from "../../components";
import styles from './UsersData.module.css';
import { useSidebar } from '../../components/SidebarContext';
import { getMetadataProgress, updateUserMetaData } from '../../helper';
import { TailSpin } from 'react-loader-spinner';

// Custom Single-Select Dropdown Component
const CustomSingleSelect = ({ options, value, onChange, placeholder, label }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);
    const searchInputRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen]);

    const handleOptionSelect = (option, event) => {
        event.preventDefault();
        event.stopPropagation();
        onChange(option);
        setIsOpen(false);
        setSearchTerm('');
    };

    const handleClear = (event) => {
        event.preventDefault();
        event.stopPropagation();
        onChange(null);
        setIsOpen(false);
        setSearchTerm('');
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleSearchKeyDown = (event) => {
        event.stopPropagation();
    };

    // Filter options based on search term
    const filteredOptions = options.filter(option =>
        option.label && typeof option.label === 'string' &&
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={styles.custom_select_container} ref={dropdownRef}>
            <div
                className={styles.custom_select_trigger}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={styles.custom_select_placeholder}>
                    {value ? value.label : placeholder}
                </span>
                <span className={`${styles.custom_select_arrow} ${isOpen ? styles.open : ''}`}>▼</span>
            </div>

            {isOpen && (
                <div className={styles.custom_select_dropdown}>
                    <div className={styles.search_container}>
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search options..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            onKeyDown={handleSearchKeyDown}
                            className={styles.dropdown_search_input}
                        />
                    </div>
                    <div className={styles.dropdown_actions}>
                        <button
                            className={styles.action_button}
                            onClick={handleClear}
                            type="button"
                        >
                            Clear Selection
                        </button>
                    </div>
                    <div className={styles.options_container}>
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => {
                                const isSelected = value && value.value === option.value;
                                return (
                                    <div
                                        key={option.value}
                                        className={`${styles.custom_select_option} ${isSelected ? styles.selected : ''}`}
                                        onClick={(event) => handleOptionSelect(option, event)}
                                    >
                                        <span className={styles.option_label}>{option.label}</span>
                                    </div>
                                );
                            })
                        ) : (
                            <div className={styles.no_options}>
                                No options found
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// Custom Multi-Select Dropdown Component
const CustomMultiSelect = ({ options, value, onChange, placeholder, label }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);
    const searchInputRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen]);

    const handleOptionToggle = (option, event) => {
        event.preventDefault();
        event.stopPropagation();

        const isSelected = value.some(item => item.value === option.value);
        if (isSelected) {
            onChange(value.filter(item => item.value !== option.value));
        } else {
            onChange([...value, option]);
        }
    };

    const handleSelectAll = (event) => {
        event.preventDefault();
        event.stopPropagation();
        onChange(filteredOptions);
    };

    const handleClearAll = (event) => {
        event.preventDefault();
        event.stopPropagation();
        onChange([]);
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleSearchKeyDown = (event) => {
        event.stopPropagation();
    };

    // Filter options based on search term
    const filteredOptions = options.filter(option =>
        option.label && typeof option.label === 'string' &&
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort filtered options: selected first, then unselected
    const sortedOptions = [...filteredOptions].sort((a, b) => {
        const aSelected = value.some(item => item.value === a.value);
        const bSelected = value.some(item => item.value === b.value);
        if (aSelected && !bSelected) return -1;
        if (!aSelected && bSelected) return 1;
        return 0;
    });

    return (
        <div className={styles.custom_select_container} ref={dropdownRef}>
            <div
                className={styles.custom_select_trigger}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={styles.custom_select_placeholder}>
                    {value.length > 0 ? `${value.length} selected` : placeholder}
                </span>
                <span className={`${styles.custom_select_arrow} ${isOpen ? styles.open : ''}`}>▼</span>
            </div>

            {isOpen && (
                <div className={styles.custom_select_dropdown}>
                    <div className={styles.search_container}>
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search options..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            onKeyDown={handleSearchKeyDown}
                            className={styles.dropdown_search_input}
                        />
                    </div>
                    <div className={styles.dropdown_actions}>
                        <button
                            className={styles.action_button}
                            onClick={handleSelectAll}
                            type="button"
                        >
                            Select All {filteredOptions.length > 0 && `(${filteredOptions.length})`}
                        </button>
                        <button
                            className={styles.action_button}
                            onClick={handleClearAll}
                            type="button"
                        >
                            Clear All
                        </button>
                    </div>
                    <div className={styles.options_container}>
                        {sortedOptions.length > 0 ? (
                            sortedOptions.map((option) => {
                                const isSelected = value.some(item => item.value === option.value);
                                return (
                                    <div
                                        key={option.value}
                                        className={`${styles.custom_select_option} ${isSelected ? styles.selected : ''}`}
                                        onClick={(event) => handleOptionToggle(option, event)}
                                    >
                                        <div className={styles.custom_checkbox_container}>
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => { }} // Handled by parent onClick
                                                className={styles.custom_checkbox}
                                            />
                                            <span className={styles.checkmark}></span>
                                        </div>
                                        <span className={styles.option_label}>{option.label}</span>
                                    </div>
                                );
                            })
                        ) : (
                            <div className={styles.no_options}>
                                No options found
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

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

    // Filters - changed to arrays for multi-select
    const [selectedCohort, setSelectedCohort] = useState([]);
    const [selectedCity, setSelectedCity] = useState([]);
    const [selectedCustomerSource, setSelectedCustomerSource] = useState([]);
    const [selectedCustomerChannel, setSelectedCustomerChannel] = useState([]);
    const [selectedSchool, setSelectedSchool] = useState([]);
    const [selectedRollout, setSelectedRollout] = useState([]);
    const [selectedAmountPaid, setSelectedAmountPaid] = useState([]);
    const [selectedClassLevel, setSelectedClassLevel] = useState([]);
    const [selectedProfileType, setSelectedProfileType] = useState([]);
    const [selectedCourseName, setSelectedCourseName] = useState([]);
    const [selectedWeek, setSelectedWeek] = useState([]);
    const [selectedDay, setSelectedDay] = useState([]);
    const [selectedDaysSinceLastActive, setSelectedDaysSinceLastActive] = useState(null);

    // Sorting state
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc'); // 'asc' or 'desc'

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
        { key: 'customerChannel', label: 'Customer Channel', editable: true },
        { key: 'profile_type', label: 'Profile Type', editable: false },
        { key: 'coursename', label: 'Course Name', editable: false },
        { key: 'currentWeek', label: 'Week', editable: false },
        { key: 'currentDay', label: 'Day', editable: false },
        { key: 'days_since_last_active', label: 'Days Since Last Active', editable: false }
    ];

    useEffect(() => {
        fetchUserData();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedCohort, selectedCity, selectedCustomerSource, selectedCustomerChannel, selectedSchool, selectedRollout, selectedAmountPaid, selectedClassLevel, selectedProfileType, selectedCourseName, selectedWeek, selectedDay, selectedDaysSinceLastActive]);

    // Generate filter options from data with null/none options
    const cohortOptions = [
        { value: 'null', label: 'None/Null' },
        ...[...new Set(userData.map(user => user.cohort).filter(Boolean))]
            .sort()
            .map(cohort => ({ value: cohort, label: cohort }))
    ];

    const cityOptions = [
        { value: 'null', label: 'None/Null' },
        ...[...new Set(userData.map(user => user.city).filter(Boolean))]
            .sort()
            .map(city => ({ value: city, label: city }))
    ];

    const customerSourceOptions = [
        { value: 'null', label: 'None/Null' },
        ...[...new Set(userData.map(user => user.customerSource).filter(Boolean))]
            .sort()
            .map(source => ({ value: source, label: source }))
    ];

    const customerChannelOptions = [
        { value: 'null', label: 'None/Null' },
        ...[...new Set(userData.map(user => user.customerChannel).filter(Boolean))]
            .sort()
            .map(channel => ({ value: channel, label: channel }))
    ];

    const schoolOptions = [
        { value: 'null', label: 'None/Null' },
        ...[...new Set(userData.map(user => user.schoolName).filter(Boolean))]
            .sort()
            .map(school => ({ value: school, label: school }))
    ];

    const rolloutOptions = [
        { value: 'null', label: 'None/Null' },
        ...[...new Set(userData.map(user => user.rollout).filter(val => val !== null && val !== undefined && val !== ''))]
            .sort()
            .map(rollout => ({ value: rollout, label: rollout.toString() }))
    ];

    const amountPaidOptions = [
        { value: 'null', label: 'None/Null' },
        ...[...new Set(userData.map(user => user.amountPaid).filter(val => val !== null && val !== undefined && val !== ''))]
            .sort((a, b) => parseFloat(a) - parseFloat(b))
            .map(amount => ({ value: amount, label: amount.toString() }))
    ];

    const classLevelOptions = [
        { value: 'null', label: 'None/Null' },
        ...[...new Set(userData.map(user => user.classLevel).filter(Boolean))]
            .sort()
            .map(level => ({ value: level, label: level }))
    ];

    const profileTypeOptions = [
        { value: 'null', label: 'None/Null' },
        ...[...new Set(userData.map(user => user.profile_type).filter(Boolean))]
            .sort()
            .map(profileType => ({ value: profileType, label: profileType }))
    ];

    const courseNameOptions = [
        { value: 'null', label: 'None/Null' },
        ...[...new Set(userData.map(user => user.coursename).filter(Boolean))]
            .sort()
            .map(coursename => ({ value: coursename, label: coursename }))
    ];

    const weekOptions = [
        { value: 'null', label: 'None/Null' },
        ...[...new Set(userData.map(user => user.currentWeek).filter(val => val !== null && val !== undefined && val !== ''))]
            .sort((a, b) => parseFloat(a) - parseFloat(b))
            .map(week => ({ value: week, label: week.toString() }))
    ];

    const dayOptions = [
        { value: 'null', label: 'None/Null' },
        ...[...new Set(userData.map(user => user.currentDay).filter(val => val !== null && val !== undefined && val !== ''))]
            .sort((a, b) => parseFloat(a) - parseFloat(b))
            .map(day => ({ value: day, label: day.toString() }))
    ];

    const daysSinceLastActiveOptions = [
        { value: 'null', label: 'None/Null' },
        ...[...new Set(userData.map(user => user.days_since_last_active).filter(val => val !== null && val !== undefined && val !== ''))]
            .sort((a, b) => parseFloat(a) - parseFloat(b))
            .map(days => ({ value: days, label: days.toString() }))
    ];

    const fetchUserData = async () => {
        try {
            setLoading(true);
            const response = await getMetadataProgress();
            if (response.status === 200 && response.data.success) {
                setUserData(response.data.data);
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

    // Helper function to clear all filters
    const clearAllFilters = () => {
        setSelectedCohort([]);
        setSelectedCity([]);
        setSelectedAmountPaid([]);
        setSelectedClassLevel([]);
        setSelectedCustomerSource([]);
        setSelectedCustomerChannel([]);
        setSelectedSchool([]);
        setSelectedRollout([]);
        setSelectedProfileType([]);
        setSelectedCourseName([]);
        setSelectedWeek([]);
        setSelectedDay([]);
        setSelectedDaysSinceLastActive(null);
    };

    // Check if any filters are active
    const hasActiveFilters = selectedCohort.length > 0 || selectedCity.length > 0 ||
        selectedAmountPaid.length > 0 || selectedClassLevel.length > 0 ||
        selectedCustomerSource.length > 0 || selectedCustomerChannel.length > 0 ||
        selectedSchool.length > 0 || selectedRollout.length > 0 ||
        selectedProfileType.length > 0 || selectedCourseName.length > 0 ||
        selectedWeek.length > 0 || selectedDay.length > 0 ||
        selectedDaysSinceLastActive !== null;

    const downloadCSV = () => {
        // Create CSV headers from displayColumns
        const headers = displayColumns.map(column => column.label).join(',');

        // Create CSV rows from sortedData
        const rows = sortedData.map(user => {
            return displayColumns.map(column => {
                let value = user[column.key] || '';

                // Convert to string and clean up
                value = String(value).trim();

                // Replace newlines, carriage returns, and tabs with spaces
                value = value.replace(/[\r\n\t]+/g, ' ');

                // Remove extra whitespace
                value = value.replace(/\s+/g, ' ');

                // Escape commas, quotes, and newlines in CSV values
                if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }

                return value;
            }).join(',');
        });

        // Combine headers and rows
        const csvContent = [headers, ...rows].join('\n');

        // Create and download the file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `users_data_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Helper function to check if value matches filter (including null handling)
    const matchesFilter = (userValue, selectedValues) => {
        if (!selectedValues || selectedValues.length === 0) return true;

        return selectedValues.some(selected => {
            if (selected.value === 'null') {
                return !userValue || userValue === '' || userValue === null || userValue === undefined;
            }
            return userValue === selected.value;
        });
    };

    // Helper function to check if value matches single-select filter (including null handling)
    const matchesSingleFilter = (userValue, selectedValue) => {
        if (!selectedValue) return true;

        if (selectedValue.value === 'null') {
            return !userValue || userValue === '' || userValue === null || userValue === undefined;
        }
        return userValue === selectedValue.value;
    };

    // Helper function to check if days_since_last_active is less than or equal to selected value
    const matchesDaysSinceLastActive = (userValue, selectedValue) => {
        if (!selectedValue) return true;

        if (selectedValue.value === 'null') {
            return !userValue || userValue === '' || userValue === null || userValue === undefined;
        }
        
        const userDays = parseFloat(userValue);
        const selectedDays = parseFloat(selectedValue.value);
        
        // Return true if user's days_since_last_active is less than or equal to selected value
        return !isNaN(userDays) && !isNaN(selectedDays) && userDays <= selectedDays;
    };

    // Sorting function
    const handleSort = (columnKey) => {
        // Don't sort phoneNumber and profile_id columns
        if (columnKey === 'phoneNumber' || columnKey === 'profile_id') {
            return;
        }

        if (sortColumn === columnKey) {
            // Toggle direction if same column
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            // New column, start with ascending
            setSortColumn(columnKey);
            setSortDirection('asc');
        }
    };

    // Sort data function
    const sortData = (data) => {
        if (!sortColumn) return data;

        return [...data].sort((a, b) => {
            let aValue = a[sortColumn];
            let bValue = b[sortColumn];

            // Handle null/undefined values
            if (aValue == null && bValue == null) return 0;
            if (aValue == null) return sortDirection === 'asc' ? 1 : -1;
            if (bValue == null) return sortDirection === 'asc' ? -1 : 1;

            // Handle numeric values (amountPaid, days_since_last_active, currentWeek, currentDay)
            if (['amountPaid', 'days_since_last_active', 'currentWeek', 'currentDay'].includes(sortColumn)) {
                aValue = parseFloat(aValue) || 0;
                bValue = parseFloat(bValue) || 0;
                return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
            }

            // Handle string values
            aValue = String(aValue).toLowerCase();
            bValue = String(bValue).toLowerCase();

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
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
            (user.cohort && user.cohort.toString().toLowerCase().includes(searchQuery.toLowerCase())) ||
            (user.amountPaid && user.amountPaid.toString().toLowerCase().includes(searchQuery.toLowerCase())) ||
            (user.classLevel && user.classLevel.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (user.profile_type && user.profile_type.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (user.coursename && user.coursename.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (user.currentWeek && user.currentWeek.toString().toLowerCase().includes(searchQuery.toLowerCase())) ||
            (user.currentDay && user.currentDay.toString().toLowerCase().includes(searchQuery.toLowerCase())) ||
            (user.days_since_last_active && user.days_since_last_active.toString().toLowerCase().includes(searchQuery.toLowerCase()))
        );

        // Filter matches using helper function
        const cohortMatch = matchesFilter(user.cohort, selectedCohort);
        const cityMatch = matchesFilter(user.city, selectedCity);
        const customerSourceMatch = matchesFilter(user.customerSource, selectedCustomerSource);
        const customerChannelMatch = matchesFilter(user.customerChannel, selectedCustomerChannel);
        const schoolMatch = matchesFilter(user.schoolName, selectedSchool);
        const rolloutMatch = matchesFilter(user.rollout, selectedRollout);
        const amountPaidMatch = matchesFilter(user.amountPaid, selectedAmountPaid);
        const classLevelMatch = matchesFilter(user.classLevel, selectedClassLevel);
        const profileTypeMatch = matchesFilter(user.profile_type, selectedProfileType);
        const courseNameMatch = matchesFilter(user.coursename, selectedCourseName);
        const weekMatch = matchesFilter(user.currentWeek, selectedWeek);
        const dayMatch = matchesFilter(user.currentDay, selectedDay);
        const daysSinceLastActiveMatch = matchesDaysSinceLastActive(user.days_since_last_active, selectedDaysSinceLastActive);

        return searchMatch && cohortMatch && cityMatch && customerSourceMatch && customerChannelMatch && schoolMatch && rolloutMatch && amountPaidMatch && classLevelMatch && profileTypeMatch && courseNameMatch && weekMatch && dayMatch && daysSinceLastActiveMatch;
    });

    // Apply sorting to filtered data
    const sortedData = sortData(filteredData);

    // Pagination
    const totalPages = Math.ceil(sortedData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = sortedData.slice(startIndex, endIndex);

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
                            placeholder="Search by phone, name, city, school, cohort, amount, or class level..."
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
                        <CustomMultiSelect
                            options={cohortOptions}
                            value={selectedCohort}
                            onChange={setSelectedCohort}
                            placeholder="Select Cohort(s)"
                            label="Cohort"
                        />
                    </div>
                    <div className={styles.filter_group}>
                        <label className={styles.filter_label}>City</label>
                        <CustomMultiSelect
                            options={cityOptions}
                            value={selectedCity}
                            onChange={setSelectedCity}
                            placeholder="Select City(s)"
                            label="City"
                        />
                    </div>
                    <div className={styles.filter_group}>
                        <label className={styles.filter_label}>Amount Paid</label>
                        <CustomMultiSelect
                            options={amountPaidOptions}
                            value={selectedAmountPaid}
                            onChange={setSelectedAmountPaid}
                            placeholder="Select Amount(s)"
                            label="Amount Paid"
                        />
                    </div>
                    <div className={styles.filter_group}>
                        <label className={styles.filter_label}>Class Level</label>
                        <CustomMultiSelect
                            options={classLevelOptions}
                            value={selectedClassLevel}
                            onChange={setSelectedClassLevel}
                            placeholder="Select Class Level(s)"
                            label="Class Level"
                        />
                    </div>
                    <div className={styles.filter_group}>
                        <label className={styles.filter_label}>Customer Source</label>
                        <CustomMultiSelect
                            options={customerSourceOptions}
                            value={selectedCustomerSource}
                            onChange={setSelectedCustomerSource}
                            placeholder="Select Customer Source(s)"
                            label="Customer Source"
                        />
                    </div>
                    <div className={styles.filter_group}>
                        <label className={styles.filter_label}>Customer Channel</label>
                        <CustomMultiSelect
                            options={customerChannelOptions}
                            value={selectedCustomerChannel}
                            onChange={setSelectedCustomerChannel}
                            placeholder="Select Customer Channel(s)"
                            label="Customer Channel"
                        />
                    </div>
                    <div className={styles.filter_group}>
                        <label className={styles.filter_label}>School</label>
                        <CustomMultiSelect
                            options={schoolOptions}
                            value={selectedSchool}
                            onChange={setSelectedSchool}
                            placeholder="Select School(s)"
                            label="School"
                        />
                    </div>
                    <div className={styles.filter_group}>
                        <label className={styles.filter_label}>Rollout</label>
                        <CustomMultiSelect
                            options={rolloutOptions}
                            value={selectedRollout}
                            onChange={setSelectedRollout}
                            placeholder="Select Rollout(s)"
                            label="Rollout"
                        />
                    </div>
                    <div className={styles.filter_group}>
                        <label className={styles.filter_label}>Profile Type</label>
                        <CustomMultiSelect
                            options={profileTypeOptions}
                            value={selectedProfileType}
                            onChange={setSelectedProfileType}
                            placeholder="Select Profile Type(s)"
                            label="Profile Type"
                        />
                    </div>
                    <div className={styles.filter_group}>
                        <label className={styles.filter_label}>Course Name</label>
                        <CustomMultiSelect
                            options={courseNameOptions}
                            value={selectedCourseName}
                            onChange={setSelectedCourseName}
                            placeholder="Select Course Name(s)"
                            label="Course Name"
                        />
                    </div>
                    <div className={styles.filter_group}>
                        <label className={styles.filter_label}>Week</label>
                        <CustomMultiSelect
                            options={weekOptions}
                            value={selectedWeek}
                            onChange={setSelectedWeek}
                            placeholder="Select Week(s)"
                            label="Week"
                        />
                    </div>
                    <div className={styles.filter_group}>
                        <label className={styles.filter_label}>Day</label>
                        <CustomMultiSelect
                            options={dayOptions}
                            value={selectedDay}
                            onChange={setSelectedDay}
                            placeholder="Select Day(s)"
                            label="Day"
                        />
                    </div>
                    <div className={styles.filter_group}>
                        <label className={styles.filter_label}>Days Since Last Active</label>
                        <CustomSingleSelect
                            options={daysSinceLastActiveOptions}
                            value={selectedDaysSinceLastActive}
                            onChange={setSelectedDaysSinceLastActive}
                            placeholder="Select Days Since Last Active"
                            label="Days Since Last Active"
                        />
                    </div>
                </div>

                <div className={styles.stats_and_actions}>
                    <div className={styles.stats_info}>
                        Total Users: {sortedData.length}
                    </div>
                    <div className={styles.action_buttons}>
                        {hasActiveFilters && (
                            <button
                                onClick={clearAllFilters}
                                className={styles.clear_filters_button}
                            >
                                Clear Filters
                            </button>
                        )}
                        <button
                            onClick={downloadCSV}
                            className={styles.download_button}
                            disabled={sortedData.length === 0}
                        >
                            Download CSV
                        </button>
                    </div>
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
                                    {displayColumns.map(column => {
                                        const isSortable = column.key !== 'phoneNumber' && column.key !== 'profile_id';
                                        const isCurrentSort = sortColumn === column.key;
                                        
                                        return (
                                            <th 
                                                key={column.key} 
                                                className={`${styles.table_heading} ${isSortable ? styles.sortable_header : ''}`}
                                                onClick={() => isSortable && handleSort(column.key)}
                                                style={{ cursor: isSortable ? 'pointer' : 'default' }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    {column.label}
                                                    {isSortable && (
                                                        <span style={{ 
                                                            fontSize: '14px', 
                                                            fontWeight: 'bold',
                                                            opacity: isCurrentSort ? 1 : 0.6,
                                                            color: isCurrentSort ? '#007bff' : '#666'
                                                        }}>
                                                            {isCurrentSort && sortDirection === 'asc' ? '▲' : 
                                                             isCurrentSort && sortDirection === 'desc' ? '▼' : '⇅'}
                                                        </span>
                                                    )}
                                                </div>
                                            </th>
                                        );
                                    })}
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
                                                        column.key === 'days_since_last_active' ? (
                                                            <span 
                                                                title={user.lastUpdated ? `Last updated: ${new Date(user.lastUpdated).toLocaleString()}` : 'No last updated date available'}
                                                                style={{ cursor: 'help' }}
                                                            >
                                                                {user[column.key] === 0 ? 'Today' : (user[column.key] || '-')}
                                                            </span>
                                                        ) : (
                                                            user[column.key] || '-'
                                                        )
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