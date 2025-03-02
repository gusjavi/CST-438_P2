import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./innerPages.css";

const initialTiers = {
    S: [],
    A: [],
    B: [],
    C: [],
    D: [],
    StoreBx:[]
};

function TierListPg() {
    const navigate = useNavigate();
    const [tiers, setTiers] = useState(initialTiers);
    const [input, setInput] = useState("");
    const [draggingItem, setDraggingItem] = useState(null);
    const [isSignedIn, setSignedIn] = useState(localStorage.getItem("isSignedIn") === "true");
    const [username, setUsername] = useState(localStorage.getItem("username") || "Guest");

    useEffect(() => {
        localStorage.setItem("isSignedIn", isSignedIn);
    }, [isSignedIn]);

    const handleAddItem = () => {
        if (input.trim() !== "") {
            setTiers((prev) => ({
                ...prev,
                StoreBx: [...prev.StoreBx, input] // Add to StoreBx
            }));
            setInput("");
        }
    };

    const handleDragStart = (tier, index) => {
        setDraggingItem({ tier, index });
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (newTier) => {
        if (!draggingItem) return;

        const { tier: oldTier, index } = draggingItem;

        if (oldTier !== newTier) {
            const newTiers = { ...tiers };
            const itemToMove = newTiers[oldTier].splice(index, 1)[0];
            newTiers[newTier].push(itemToMove);
            setTiers(newTiers);
        }

        setDraggingItem(null);
    };

    const handleSignOut = () => {
        localStorage.removeItem("isSignedIn");
        localStorage.removeItem("username");
        setUsername("Guest");
        setSignedIn(false);
        navigate("/");
    };

    return (
        <div>
            <h1>Welcome to the Tier List Page</h1>
            <div className="container">
                <button onClick={() => navigate("/")} className="btn">Go to Home</button>
                <button onClick={() => navigate("/edit")} className="btn">Edit Account</button>
                <button onClick={handleSignOut} className="btn">Sign Out</button>
            </div>

            <h2>Hello {username}!</h2>
            <div className="tierList-container">
                <h1>Tier List</h1>
                <div className="input-section">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Enter an item..."
                    />
                    <button className="btn" onClick={handleAddItem}>Add</button>{/*for now its input by user, later will change*/}
                </div>

                {Object.keys(tiers).map((tier) => (
                    <div
                        key={tier}
                        className={`tier ${tier}`} // Dynamically assign the tier class
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(tier)}
                    >
                        <h2>{tier}-Tier</h2>
                        <div className="tier-box">
                            {tiers[tier].map((item, index) => (
                                <div
                                    key={`${tier}-${index}`}
                                    className="tier-item"
                                    draggable
                                    onDragStart={() => handleDragStart(tier, index)}
                                >
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default TierListPg;
