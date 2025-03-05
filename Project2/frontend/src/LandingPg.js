import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./innerPages.css";

{/*placeholder information, change probs to top three tierlists*/}
const initialTierLists = [
    {
        name: "Tier List 1",
        tiers: {
            S: ["Item 1", "Item 2", "Item 3"],
            A: ["Item 4", "Item 5"],
            B: ["Item 6"],
            C: ["Item 7", "Item 8"],
            D: ["Item 9"]
        }
    },
    {
        name: "Tier List 2",
        tiers: {
            S: ["Item 10", "Item 11", "Item 12"],
            A: ["Item 13", "Item 14"],
            B: ["Item 15"],
            C: ["Item 16", "Item 17"],
            D: ["Item 18"]
        }
    },
    {
        name: "Tier List 3",
        tiers: {
            S: ["Item 10", "Item 11", "Item 12"],
            A: ["Item 13", "Item 14"],
            B: ["Item 15"],
            C: ["Item 16", "Item 17"],
            D: ["Item 18"]
        }
    }
];

function LandingPg() {
    const navigate = useNavigate();
    const [isSignedIn, setSignedIn] = useState(localStorage.getItem("isSignedIn") === "true");
    const [username, setUsername] = useState(localStorage.getItem("username") || "Guest");
    const [tierLists, setTierLists] = useState(initialTierLists);

    useEffect(() => {
        localStorage.setItem("isSignedIn", isSignedIn);
    }, [isSignedIn]);

    const handleSignIn = () => {
        navigate("/login");
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
    };

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
            <h2>Tier Lists of the Week!</h2>
            <div className="horizontal-scroll-wrapper2">
                {tierLists.map((tierList, index) => (
                    <div key={index} className="tierList-container2">
                        <h2>{tierList.name}</h2>
                        <div className="tier-box2">
                            {Object.keys(tierList.tiers).map((tier) => (
                                <div key={tier} className={`tier ${tier}`}>
                                    <h3>{tier} Tier</h3>
                                    <div className="tier-box">
                                        {tierList.tiers[tier].map((item, itemIndex) => (
                                            <div key={itemIndex} className="tier-item2">
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default LandingPg;