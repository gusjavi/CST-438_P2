import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginPage from "./Login";
import SignupPage from "./Signup";
import LandingPg from "./LandingPg";
import TierListPage from "./TierListPg";
import EditPg from "./EditPg";
import ProtectedRoute from "./ProtectedRoute";

function App() {
    return (
        <div data-theme="dark"> {/*  theme wrapper */}
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/" element={<LandingPg />} />
                <Route path="/tier" element={<ProtectedRoute element={<TierListPage />} />} />
                <Route path="/edit" element={<ProtectedRoute element={<EditPg />} />} />
                <Route path="*" element={
                    <div className="min-h-screen flex flex-col items-center justify-center" style={{background: "linear-gradient(to right, rgb(58, 28, 113), rgb(215, 109, 119), rgb(255, 175, 123))"}}>
                        <div className="bg-white p-8 rounded-lg shadow-xl">
                            <h1 className="text-3xl font-bold mb-4">404 - Page Not Found</h1>
                            <p className="mb-4">The page you're looking for doesn't exist.</p>
                            <a
                                href="/"
                                className="btn"
                                style={{
                                    background: "linear-gradient(to right, #ff8008, #ffc837)",
                                    border: "curve",
                                    color: "white"
                                }}
                            >
                                Go Home
                            </a>
                        </div>
                    </div>
                } />
            </Routes>
        </div>
    );
}

export default App;