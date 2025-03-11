import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./innerPages.css";

const initialTierLists = [
    {
        name: "Tier List 1",
        likes: 10,
        tiers: {
            S: ["Item 1", "Item 2", "Item 3"],
            A: ["Item 4", "Item 5"],
            B: ["Item 6"],
            C: ["Item 7", "Item 8"],
            D: ["Item 9"]
        }
    },{
        name: "Tier List 2",
        likes: 30,
        tiers: {
            S: ["Item 1", "Item 2", "Item 3"],
            A: ["Item 4", "Item 5"],
            B: ["Item 6"],
            C: ["Item 7", "Item 8"],
            D: ["Item 9"]
        }
    },{
        name: "Tier List 3",
        likes: 120,
        tiers: {
            S: ["Item 1", "Item 2", "Item 3"],
            A: ["Item 4", "Item 5"],
            B: ["Item 6"],
            C: ["Item 7", "Item 8"],
            D: ["Item 9"]
        }
    }
];

function LandingPg() {
    const navigate = useNavigate();
    const [isSignedIn, setSignedIn] = useState(localStorage.getItem("isSignedIn") === "true");
    const [username, setUsername] = useState(localStorage.getItem("username") || "Guest");
    const [tierLists, setTierLists] = useState(initialTierLists);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const handleStorageChange = () => {
            setSignedIn(localStorage.getItem("isSignedIn") === "true");
            setUsername(localStorage.getItem("username") || "Guest");
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    const handleSignOut = () => {
        localStorage.removeItem("isSignedIn");
        localStorage.removeItem("username");
        setSignedIn(false);
        setUsername("Guest");
        window.location.reload();
    };
    const updatePg=()=>{
        {/*perhaps if update page or different model*/}
    }

    return (
        <div className="landing-container">
            <div className="header">
                <h1>Welcome {username}</h1>
                {isSignedIn && <p onClick={handleSignOut} className="sign-out">Sign Out</p>}
            </div>
            <div className="btn-group">
                {isSignedIn ? (
                    <>
                        <button onClick={() => navigate("/tier")} className="btn">Go to TierList</button>
                        <button onClick={() => navigate("/edit")} className="btn">Edit Account</button>
                    </>
                ) : (
                    <>
                        <button onClick={() => navigate("/login")} className="btn">Sign In</button>
                        <button onClick={() => navigate("/SignUp")} className="btn">Create Account</button>
                    </>
                )}
            </div>
            <h2>Tier Lists of the Week</h2>
            {isSignedIn ?(
                <>
            <button onClick={() => setShowModal(true)} className="btn">My Tier List</button>
            </>):(<></>)}
            <div className="tier-list-wrapper">
                {tierLists.map((tierList, index) => (
                    <TierListDisplay key={index} tierList={tierList} />
                ))}
            </div>
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>{username}'s Tier List</h2>
                        <TierListDisplay tierList={tierLists[0]} />
                        <div className={"btn-group"}>
                            <button className="close-btn" onClick={() => updatePg()}>Update</button>
                            <button className="close-btn" onClick={() => setShowModal(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function TierListDisplay({ tierList }) {
    return (
        <div className="tier-list-container">
            <h2>{tierList.name}</h2>
            <div className="tier-box">
                {Object.keys(tierList.tiers).map((tier) => (
                    <div key={tier} className={`tier ${tier.toLowerCase()}`}>
                        <h3>{tier} Tier</h3>
                        <div className="tier-items">
                            {tierList.tiers[tier].map((item, itemIndex) => (
                                <div key={itemIndex} className="tier-item">
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <h2> ❤️ #{tierList.likes}</h2>
        </div>
    );
}

export default LandingPg;
