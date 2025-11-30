/**
 * XSS Protection Utilities
 * Provides functions to sanitize and validate data stored in localStorage
 */

/**
 * Sanitizes a string to prevent XSS attacks
 * @param {string} str - The string to sanitize
 * @returns {string} - Sanitized string
 */
export const sanitizeString = (str) => {
    if (typeof str !== 'string') return '';
    
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;',
    };
    
    return str.replace(/[&<>"'/]/g, (char) => map[char]);
};

/**
 * Validates that a value is safe to store
 * @param {any} value - The value to validate
 * @returns {boolean} - True if safe, false otherwise
 */
export const isValueSafe = (value) => {
    if (value === null || value === undefined) return false;
    
    const str = String(value);
    
    // Check for common XSS patterns
    const xssPatterns = [
        /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /<iframe/gi,
        /eval\(/gi,
        /expression\(/gi,
    ];
    
    return !xssPatterns.some(pattern => pattern.test(str));
};

/**
 * Secure localStorage wrapper with XSS protection
 */
export const secureStorage = {
    /**
     * Sets an item in localStorage with validation
     * @param {string} key - Storage key
     * @param {any} value - Value to store
     * @returns {boolean} - Success status
     */
    setItem: (key, value) => {
        try {
            if (!isValueSafe(key) || !isValueSafe(value)) {
                console.warn('Attempted to store potentially unsafe value');
                return false;
            }
            
            localStorage.setItem(key, value);
            return true;
        } catch (error) {
            console.error('Error storing item:', error);
            return false;
        }
    },
    
    /**
     * Gets an item from localStorage with validation
     * @param {string} key - Storage key
     * @returns {string|null} - Stored value or null
     */
    getItem: (key) => {
        try {
            const value = localStorage.getItem(key);
            
            if (value && !isValueSafe(value)) {
                console.warn('Retrieved potentially unsafe value, removing');
                localStorage.removeItem(key);
                return null;
            }
            
            return value;
        } catch (error) {
            console.error('Error retrieving item:', error);
            return null;
        }
    },
    
    /**
     * Removes an item from localStorage
     * @param {string} key - Storage key
     */
    removeItem: (key) => {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Error removing item:', error);
        }
    },
    
    /**
     * Clears all items from localStorage
     */
    clear: () => {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Error clearing storage:', error);
        }
    }
};

