import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ProtectedRoute = ({ isAuthenticated, children }) => {
    const navigate = useNavigate();
    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/");
        }
    }, [isAuthenticated, navigate]);

    return <>{children}</>;
};

export default ProtectedRoute;
