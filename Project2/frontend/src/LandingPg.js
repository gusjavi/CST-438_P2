import React from "react";
import { useNavigate } from "react-router-dom";
import "./innerPages.css";

function LandingPg() {
    const navigate = useNavigate();
    return (
        <div>
            <h1>Welcome to the Landing Page</h1>

            <div className="container">
                <button onClick={() => navigate("/tier")} className="btn">
                    Go to TierList
                </button>
                <button onClick={() => navigate("/edit")} className="btn">
                    Edit Account
                </button>
            </div>

            <h2>Hello USERNAME !</h2>{/*placeholder for now, maybe session used here*/}

            <h2>Tier List of the Week placeholder !</h2>{/*placeholder for now, maybe session used here*/}


        </div>

    );
}

export default LandingPg;
