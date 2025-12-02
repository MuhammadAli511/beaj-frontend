/**
 * Global Error Handler
 * Centralized error handling and logging
 */

import { toast } from 'react-toastify';

// Error types
export const ErrorTypes = {
    NETWORK: 'NETWORK_ERROR',
    AUTH: 'AUTH_ERROR',
    VALIDATION: 'VALIDATION_ERROR',
    SERVER: 'SERVER_ERROR',
    UNKNOWN: 'UNKNOWN_ERROR',
};

/**
 * Determines error type from response
 * @param {object} error - Error object or response
 * @returns {string} - Error type
 */
const getErrorType = (error) => {
    if (!error) return ErrorTypes.UNKNOWN;
    
    if (error.name === 'TypeError' || error.message?.includes('fetch')) {
        return ErrorTypes.NETWORK;
    }
    
    if (error.status === 401 || error.status === 403) {
        return ErrorTypes.AUTH;
    }
    
    if (error.status >= 400 && error.status < 500) {
        return ErrorTypes.VALIDATION;
    }
    
    if (error.status >= 500) {
        return ErrorTypes.SERVER;
    }
    
    return ErrorTypes.UNKNOWN;
};

/**
 * Gets user-friendly error message
 * @param {object} error - Error object
 * @returns {string} - User-friendly message
 */
const getUserMessage = (error) => {
    const errorType = getErrorType(error);
    
    // If there's a specific message from the API, use it
    if (error.data?.message) {
        return error.data.message;
    }
    
    if (error.message && typeof error.message === 'string') {
        return error.message;
    }
    
    // Default messages by type
    const defaultMessages = {
        [ErrorTypes.NETWORK]: 'Network error. Please check your connection and try again.',
        [ErrorTypes.AUTH]: 'Authentication failed. Please log in again.',
        [ErrorTypes.VALIDATION]: 'Invalid input. Please check your data and try again.',
        [ErrorTypes.SERVER]: 'Server error. Please try again later.',
        [ErrorTypes.UNKNOWN]: 'An unexpected error occurred. Please try again.',
    };
    
    return defaultMessages[errorType];
};

/**
 * Logs error based on environment
 * @param {object} error - Error object
 * @param {string} context - Context where error occurred
 */
const logError = (error, context) => {
    const isDevelopment = process.env.REACT_APP_ENVIRONMENT === 'DEV';
    
    if (isDevelopment) {
        console.error(`[Error in ${context}]:`, error);
    }
    
    // In production, you might want to send errors to a logging service
    // e.g., Sentry, LogRocket, etc.
};

/**
 * Main error handler function
 * @param {object} error - Error object
 * @param {string} context - Context where error occurred
 * @param {object} options - Additional options
 * @returns {object} - Processed error information
 */
export const handleError = (error, context = 'Application', options = {}) => {
    const {
        showToast = true,
        silent = false,
        customMessage = null,
    } = options;
    
    const errorType = getErrorType(error);
    const userMessage = customMessage || getUserMessage(error);
    
    // Log the error
    if (!silent) {
        logError(error, context);
    }
    
    // Show toast notification
    if (showToast) {
        if (errorType === ErrorTypes.AUTH) {
            toast.error(userMessage, {
                autoClose: 5000,
                position: 'top-right',
            });
            
            // Optionally redirect to login on auth errors
            if (error.status === 401) {
                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);
            }
        } else {
            toast.error(userMessage, {
                autoClose: 3000,
                position: 'top-right',
            });
        }
    }
    
    return {
        type: errorType,
        message: userMessage,
        originalError: error,
    };
};

/**
 * Success handler for consistent success messages
 * @param {string} message - Success message
 * @param {object} options - Additional options
 */
export const handleSuccess = (message, options = {}) => {
    const {
        autoClose = 3000,
        position = 'top-right',
    } = options;
    
    toast.success(message, {
        autoClose,
        position,
    });
};

/**
 * Warning handler
 * @param {string} message - Warning message
 * @param {object} options - Additional options
 */
export const handleWarning = (message, options = {}) => {
    const {
        autoClose = 4000,
        position = 'top-right',
    } = options;
    
    toast.warning(message, {
        autoClose,
        position,
    });
};

