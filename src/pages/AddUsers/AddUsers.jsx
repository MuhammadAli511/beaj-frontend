import { Navbar, Sidebar } from "../../components"
import styles from './AddUsers.module.css'
import { useSidebar } from "../../components/SidebarContext"
import { useState } from 'react';
import Papa from 'papaparse';
import { uploadUserData } from '../../helper';

const AddUsers = () => {
    const { isSidebarOpen } = useSidebar();
    const [csvData, setCsvData] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [stats, setStats] = useState(null);

    const expectedHeaders = ['uid', 's0_name', 'gender', 'phone_number', 'schoolname', 'school_role', 'Target.Group', 'cohort_assignment'];
    const requiredFields = ['uid', 's0_name', 'gender', 'phone_number', 'school_role', 'Target.Group', 'cohort_assignment'];

    const formatPhoneNumber = (phone) => {
        if (!phone) return null;
        
        // Remove any non-digit characters except '+'
        let cleaned = phone.toString().trim().replace(/[^\d+]/g, '');
        
        // Handle different formats
        if (cleaned.startsWith('+92')) {
            // Format 1: Already starts with +92 (Pakistan)
            cleaned = cleaned;
        } else if (cleaned.startsWith('+1')) {
            // Format for USA numbers
            cleaned = cleaned;
        } else if (cleaned.startsWith('03')) {
            // Format 2: Starts with 03 (Pakistan)
            cleaned = '+92' + cleaned.substring(1);
        } else if (cleaned.startsWith('92')) {
            // Format 3: Starts with 92 (Pakistan)
            cleaned = '+' + cleaned;
        } else if (cleaned.startsWith('1')) {
            // Format for USA numbers without +
            cleaned = '+' + cleaned;
        } else {
            // Invalid format
            return null;
        }

        // Check if the number has the correct number of digits
        const digitsOnly = cleaned.replace(/[^\d]/g, '');
        if (cleaned.startsWith('+92') && digitsOnly.length !== 12) {
            return null;
        } else if (cleaned.startsWith('+1') && digitsOnly.length !== 11) {
            return null;
        }

        return cleaned;
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        setError('');
        setSuccess('');
        setStats(null);
        
        if (file) {
            Papa.parse(file, {
                complete: async (results) => {
                    // Check if we have any data
                    if (!results.data || results.data.length === 0) {
                        setError('The CSV file appears to be empty');
                        setCsvData([]);
                        return;
                    }

                    const totalRows = results.data.length;
                    
                    // Get headers from the first row
                    const headers = Object.keys(results.data[0]);
                    
                    // Validate headers
                    const missingHeaders = expectedHeaders.filter(header => !headers.includes(header));
                    
                    if (missingHeaders.length > 0) {
                        setError(`Missing required columns: ${missingHeaders.join(', ')}`);
                        setCsvData([]);
                        return;
                    }

                    let invalidRows = [];
                    let emptyRows = 0;
                    let invalidPhoneNumbers = 0;
                    const uidMap = new Map(); // Map to track UIDs and their row numbers

                    // First pass: identify duplicate UIDs
                    results.data.forEach((row, index) => {
                        const uid = row.uid && row.uid.trim();
                        if (uid) {
                            if (uidMap.has(uid)) {
                                // Store both the original and duplicate row
                                const originalRow = uidMap.get(uid);
                                invalidRows.push({
                                    rowNumber: originalRow.rowNumber,
                                    reason: `Duplicate UID: ${uid} (also found in row ${index + 1})`
                                });
                                invalidRows.push({
                                    rowNumber: index + 1,
                                    reason: `Duplicate UID: ${uid} (also found in row ${originalRow.rowNumber})`
                                });
                            } else {
                                uidMap.set(uid, { rowNumber: index + 1 });
                            }
                        }
                    });

                    // Get the set of duplicate UIDs
                    const duplicateUids = new Set(
                        invalidRows
                            .filter(row => row.reason.includes('Duplicate UID'))
                            .map(row => results.data[row.rowNumber - 1].uid.trim())
                    );

                    // Filter out empty rows and format data
                    const validData = results.data
                        .filter((row, index) => {
                            // Check if row is completely empty
                            const hasAnyValue = Object.values(row).some(value => value && value.trim() !== '');
                            if (!hasAnyValue) {
                                emptyRows++;
                                return false;
                            }

                            // Skip if UID is duplicate
                            const uid = row.uid && row.uid.trim();
                            if (duplicateUids.has(uid)) {
                                return false;
                            }

                            // Validate phone number
                            const formattedPhone = formatPhoneNumber(row.phone_number);
                            if (!formattedPhone) {
                                invalidRows.push({
                                    rowNumber: index + 1,
                                    reason: `Invalid phone number format: ${row.phone_number}`
                                });
                                invalidPhoneNumbers++;
                                return false;
                            }

                            // Check required fields only if row isn't completely empty
                            const hasRequiredFields = requiredFields.every(field => row[field] && row[field].trim() !== '');
                            
                            if (!hasRequiredFields) {
                                invalidRows.push({
                                    rowNumber: index + 1,
                                    reason: `Missing values for: ${requiredFields.filter(field => !row[field] || row[field].trim() === '').join(', ')}`
                                });
                                return false;
                            }
                            return true;
                        })
                        .map(row => ({
                            uid: row.uid.toString().trim(),
                            s0_name: row.s0_name.trim(),
                            gender: row.gender.trim(),
                            phone_number: formatPhoneNumber(row.phone_number),
                            schoolname: (row.schoolname || '').trim(),
                            school_role: row.school_role.trim(),
                            "Target.Group": row["Target.Group"].trim(),
                            cohort_assignment: row.cohort_assignment.trim()
                        }));

                    if (validData.length === 0) {
                        setError('No valid data rows found in the CSV');
                        setCsvData([]);
                        return;
                    }

                    setCsvData(validData);
                    setStats({
                        totalRows,
                        validRows: validData.length,
                        invalidRows: invalidRows,
                        skippedRows: totalRows - validData.length,
                        emptyRows,
                        duplicateUids: duplicateUids.size,
                        invalidPhoneNumbers
                    });

                    if (invalidRows.length > 0) {
                        setError(`Found ${invalidRows.length} invalid rows. Check console for details.`);
                        console.log('Invalid rows:', invalidRows);
                    }
                },
                header: true,
                skipEmptyLines: false,
                transformHeader: (header) => {
                    return header.trim();
                }
            });
        }
    };

    const handleUpload = async () => {
        if (csvData.length === 0) {
            setError('Please select a valid CSV file first');
            return;
        }

        try {
            setIsLoading(true);
            setError('');
            setSuccess('');
            
            const response = await uploadUserData(csvData);

            if (response.status !== 200) {
                throw new Error(response.data.message || 'Failed to upload user data');
            }

            setSuccess(response.data.message);
            setCsvData([]);
            setStats(null);
        } catch (err) {
            setError('Failed to upload user data: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.main_page}>
            <Navbar />
            {isSidebarOpen && <Sidebar />}
            <div className={styles.content}>
                <h1>Add Users</h1>
                
                <div className={styles.upload_section}>
                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        className={styles.file_input}
                    />
                    {csvData.length > 0 && (
                        <button 
                            onClick={handleUpload} 
                            className={styles.upload_button}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Uploading...' : 'Add Users'}
                        </button>
                    )}
                    {error && <p className={styles.error}>{error}</p>}
                    {success && <p className={styles.success}>{success}</p>}
                </div>

                {stats && (
                    <div className={styles.stats_container}>
                        <h3>File Statistics:</h3>
                        <ul className={styles.stats_list}>
                            <li>Valid users: {stats.validRows}</li>
                            {stats.duplicateUids > 0 && (
                                <li className={styles.warning}>
                                    Users with duplicate UIDs: {stats.duplicateUids}
                                </li>
                            )}
                            {stats.invalidPhoneNumbers > 0 && (
                                <li className={styles.warning}>
                                    Invalid phone numbers: {stats.invalidPhoneNumbers}
                                </li>
                            )}
                            {stats.invalidRows.length > 0 && (
                                <li className={styles.warning}>
                                    Invalid rows: {stats.invalidRows.length}
                                    {' (Check console for details)'}
                                </li>
                            )}
                        </ul>
                    </div>
                )}

                {csvData.length > 0 && (
                    <div className={styles.table_container}>
                        <h2>Preview of Valid Users:</h2>
                        <table className={styles.users_table}>
                            <thead>
                                <tr>
                                    {expectedHeaders.map((header) => (
                                        <th key={header}>{header}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {csvData.map((row, index) => (
                                    <tr key={index}>
                                        {expectedHeaders.map((header) => (
                                            <td key={header}>{row[header]}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddUsers;