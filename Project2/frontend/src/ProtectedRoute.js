import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ element }) => {
    const isSignedIn = localStorage.getItem("isSignedIn") === "true";
    return isSignedIn ? element : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
