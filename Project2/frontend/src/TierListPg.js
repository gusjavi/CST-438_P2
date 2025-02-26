import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./innerPages.css";

const initialTiers = {
    S: [],
    A: [],
    B: [],
    C: [],
    D: []
};

function TierListPg() {
    const navigate = useNavigate();
    const [tiers, setTiers] = useState(initialTiers);
    const [input, setInput] = useState("");
    const [draggingItem, setDraggingItem] = useState(null);

    const handleAddItem = () => {
        if (input.trim() !== "") {
            setTiers((prev) => ({
                ...prev,
                S: [...prev.S, input]
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
            <div className="tierList-container">
                <h1>Tier List</h1>
                <div className="input-section">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Enter an item..."
                    />{/* prehaps change item with the topic of the tier list here, "item"*/}
                    <button className="btn" onClick={handleAddItem}>Add</button>
                </div>

                {Object.keys(tiers).map((tier) => (
                    <div
                        key={tier}
                        className="tier"
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(tier)}
                    >
                        <h2>{tier}-Tier</h2>
                        <div className="tier-box">
                            {tiers[tier].map((item, index) => (
                                <div
                                    key={item}
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
