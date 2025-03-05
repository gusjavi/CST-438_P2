import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginPage from "./Login";
import SignupPage from "./Signup";
import LandingPg from "./LandingPg";
import TierListPg from "./TierListPg";
import EditPg from "./EditPg";
import ProtectedRoute from "./ProtectedRoute";

function App() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/" element={<LandingPg />} />

            <Route path="/tier" element={<ProtectedRoute element={<TierListPg />} />} />
            <Route path="/edit" element={<ProtectedRoute element={<EditPg />} />} />
            <Route path="*" element={<h1>404 - Page Not Found</h1>} />
        </Routes>
    );
}

export default App;
