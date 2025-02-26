import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./Home";
import LoginPage from "./Login";
import SignupPage from "./Signup";
import LandingPg from "./LandingPg";
import TierListPg from "./TierListPg";
import EditPg from "./EditPg";

function App() {
    return (
        <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/landing" element={<LandingPg />} />
                <Route path="/tier" element={<TierListPg />} />
                <Route path="/edit" element={<EditPg />} />
                <Route path="*" element={<h1>404 - Page Not Found</h1>} />
        </Routes>
    );
}

export default App;
