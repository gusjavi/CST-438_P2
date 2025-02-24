import React from "react";
import { useNavigate } from "react-router-dom";
import "./styles.css";

function LandingPg() {
    const navigate = useNavigate();
    return (
        <div className="container">
            <h1>Welcome to the Landing Page</h1>
            <button onClick={() => navigate("/tier")} className="btn">
                Go to TierList
            </button>
            <button onClick={() => navigate("/edit")} className="btn">
                Edit Account
            </button>
        </div>
    );
}

export default LandingPg;
