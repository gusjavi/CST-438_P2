import React from "react";
import { useNavigate } from "react-router-dom";
import "./styles.css";

function EditPg() {
    const navigate = useNavigate();

    return (
        <div className="container">
            <h1>Welcome to the Edit</h1>
            <button onClick={() => navigate("/landing")} className="btn">
                Go to Home
            </button>
            <button onClick={() => navigate("/tier")} className="btn">
                Go to Tier
            </button>
        </div>
    );
}

export default EditPg;
