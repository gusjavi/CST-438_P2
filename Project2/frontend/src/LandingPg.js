import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./innerPages.css";

function LandingPg() {
    const navigate = useNavigate();
    const [isSignedIn, setSignedIn] = useState(localStorage.getItem("isSignedIn") === "true");
    const [username, setUsername] = useState(localStorage.getItem("username") || "Guest");

    useEffect(() => {
        localStorage.setItem("isSignedIn", isSignedIn);
    }, [isSignedIn]);

    const handleSignIn = () => { {/*This is a placeholder with random inputs to make it easier to test waiting on AuthO*/}
        localStorage.setItem("isSignedIn", "true");
        localStorage.setItem("username", "BOB");
        setUsername("BOB");
        setSignedIn(true);
        navigate("/tier");
    };

    const handleSignOut = () => {
        localStorage.removeItem("isSignedIn");
        localStorage.removeItem("username");
        setUsername("Guest");
        setSignedIn(false);
        navigate("/");
    };

    const handleCreateAcc = () => {
        navigate("/SignUp");
    }

    return (
        <div>
            <h1>Welcome to the Landing Page</h1>
            <div className="container">
                {isSignedIn ? (
                    <>
                        <button onClick={() => navigate("/tier")} className="btn">Go to TierList</button>
                        <button onClick={() => navigate("/edit")} className="btn">Edit Account</button>
                        <button onClick={handleSignOut} className="btn">Sign Out</button>
                    </>
                ) : (
                    <>
                    <button onClick={handleSignIn} className="btn">Sign In</button>
                    <button onClick={handleCreateAcc} className="btn">Create Account</button>
                    </>
                )}
            </div>
            <h2>Hello {username}!</h2>
            <h2>Tier List of the Week placeholder!</h2>
        </div>
    );
}

export default LandingPg;
