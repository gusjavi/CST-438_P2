import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./innerPages.css";

const initialTiers = {
    S: [],
    A: [],
    B: [],
    C: [],
    D: [],
    storageBox: []
};

function TierListPage() {
    const navigate = useNavigate();
    const [tiers, setTiers] = useState(initialTiers);
    const [draggingItem, setDraggingItem] = useState(null);
    const [isSignedIn, setSignedIn] = useState(localStorage.getItem("isSignedIn") === "true");
    const [username, setUsername] = useState(localStorage.getItem("username") || "Guest");

    useEffect(() => {
        localStorage.setItem("isSignedIn", isSignedIn);
    }, [isSignedIn]);

    const handleAddItem = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setTiers((prev) => ({
                    ...prev,
                    storageBox: [...prev.storageBox, reader.result]
                }));
            };
            reader.readAsDataURL(file);
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
        <div className="landing-container">
            <div className="header">
                <h1>{username}'s Tier List</h1>
                {isSignedIn && <p onClick={handleSignOut} className="sign-out">Sign Out</p>}
            </div>
            <div className="btn-group">
                <button onClick={() => navigate("/")} className="btn">Home</button>
                <button onClick={() => navigate("/edit")} className="btn">Edit Account</button>
            </div>

            <h2>Tier List</h2>
            <div className="tier-list-wrapper2">
                {Object.keys(tiers).map((tier) => (
                    tier !== 'storageBox' && (
                        <div
                            key={tier}
                            className={`tier ${tier.toLowerCase()}`}
                            onDragOver={handleDragOver}
                            onDrop={() => handleDrop(tier)}
                        >
                            <h3>{tier} Tier</h3>
                            <div className="tier-items">
                                {tiers[tier].map((item, index) => (
                                    <div
                                        key={`${tier}-${index}`}
                                        className="tier-item"
                                        draggable
                                        onDragStart={() => handleDragStart(tier, index)}
                                    >
                                        <img src={item} alt="tier item" className="tier-image" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                ))}
                <div className="tier storageBox">
                    <h3>Storage Box</h3>
                    <div className="tier-items">
                        {tiers.storageBox.map((item, index) => (
                            <div
                                key={`storageBox-${index}`}
                                className="tier-item"
                                draggable
                                onDragStart={() => handleDragStart("storageBox", index)}
                            >
                                <img src={item} alt="tier item" className="tier-image" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="tier-input-wrapper">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleAddItem}
                    className="tier-input"
                />
            </div>
        </div>
    );
}

export default TierListPage;
