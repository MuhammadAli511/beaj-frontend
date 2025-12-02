/**
 * JWT Utility Functions
 * Provides functions for JWT token handling and role extraction
 */

/**
 * Decodes a JWT token without verification (client-side only)
 * @param {string} token - The JWT token to decode
 * @returns {object|null} - Decoded token payload or null if invalid
 */
export const decodeJWT = (token) => {
    if (!token) return null;
    
    try {
        const base64Url = token.split('.')[1];
        if (!base64Url) return null;
        
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error decoding JWT:', error);
        return null;
    }
};

/**
 * Extracts role from JWT token
 * @param {string} token - The JWT token
 * @returns {string|null} - User role or null if not found
 */
export const getRoleFromToken = (token) => {
    const decoded = decodeJWT(token);
    return decoded?.role || null;
};

/**
 * Checks if token is expired
 * @param {string} token - The JWT token
 * @returns {boolean} - True if expired, false otherwise
 */
export const isTokenExpired = (token) => {
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
};

/**
 * Gets user email from token
 * @param {string} token - The JWT token
 * @returns {string|null} - User email or null if not found
 */
export const getEmailFromToken = (token) => {
    const decoded = decodeJWT(token);
    return decoded?.email || null;
};

