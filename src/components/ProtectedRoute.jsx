import React from 'react';
import { Navigate } from 'react-router-dom';
import { secureStorage } from '../utils/xssProtection';
import { getRoleFromToken, isTokenExpired } from '../utils/jwtUtils';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const token = secureStorage.getItem('token');
    
    // Check if token exists and is not expired
    if (!token || isTokenExpired(token)) {
        secureStorage.clear();
        return <Navigate to="/" replace />;
    }
    
    // Get role from token (not from localStorage directly)
    const role = getRoleFromToken(token);
    
    if (!role) {
        secureStorage.clear();
        return <Navigate to="/" replace />;
    }

    if (!allowedRoles.includes(role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;
