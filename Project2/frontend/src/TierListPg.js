import React from "react";
import { useNavigate } from "react-router-dom";
import "./styles.css";

function TierListPg() {
    const navigate = useNavigate();

    return (
        <div className="container">
            <h1>Welcome to the TierList</h1>
            <button onClick={() => navigate("/landing")} className="btn">
                Go to Home
            </button>
            <button onClick={() => navigate("/edit")} className="btn">
                Edit Account
            </button>
        </div>
    );
}

export default TierListPg;
