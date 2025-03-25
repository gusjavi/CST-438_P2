import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./innerPages.css";
import { useLocation } from "react-router-dom";

const initialTiers = {
    S: [],
    A: [],
    B: [],
    C: [],
    D: [],
    F: [],
    storageBox: []
};

const API_BASE_URL = 'http://localhost:8080';

function WeeklySubmissionPg() {
    const navigate = useNavigate();
    const location = useLocation();
    const weeklyListId = location.state?.weeklyListId;
    const weeklyListTitle = location.state?.weeklyListTitle || "Weekly Tier List";
    const [tiers, setTiers] = useState(initialTiers);
    const [draggingItem, setDraggingItem] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const username = localStorage.getItem("username") || "Guest";
    const userId = localStorage.getItem("userId");

    useEffect(() => {
        if (!weeklyListId) return;

        fetch(`${API_BASE_URL}/api/tierlists/${weeklyListId}/items`)
            .then(res => res.json())
            .then(items => {
                setTiers(prev => ({
                    ...prev,
                    storageBox: items.map(item => ({
                        image: item.imageUrl,
                        text: item.itemName
                    }))
                }));
            })
            .catch(err => {
                console.error("Failed to load weekly tier list items", err);
            });
    }, [weeklyListId]);

    const handleDragStart = (tier, index) => {
        setDraggingItem({ tier, index, item: tiers[tier][index] });
    };

    const handleDragOver = (e) => e.preventDefault();

    const handleDrop = (newTier, e) => {
        e.preventDefault();
        if (!draggingItem) return;
        const { tier: oldTier, index, item } = draggingItem;
        setTiers(prev => {
            const updated = { ...prev };
            updated[oldTier] = updated[oldTier].filter((_, i) => i !== index);
            updated[newTier] = [...updated[newTier], item];
            return updated;
        });
        setDraggingItem(null);
    };

    const handleEditItemText = (tier, index, newText) => {
        setTiers(prev => {
            const updated = { ...prev };
            updated[tier][index].text = newText;
            return updated;
        });
    };

    const submitTierList = async () => {
        if (!userId) {
            setSubmitError("User not signed in.");
            return;
        }
        const hasItems = Object.keys(tiers).some(tier => tier !== 'storageBox' && tiers[tier].length > 0);
        if (!hasItems) {
            setSubmitError("Please rank at least one item.");
            return;
        }

        try {
            setIsSubmitting(true);
            setSubmitError(null);

            const tierListData = {
                title: `My Weekly Tier List: ${weeklyListTitle}`,
                description: `${username}'s version of the weekly tier list`,
                isPublic: false,
                creator: { userId },
                weeklyParent: { id: weeklyListId }
            };

            const response = await fetch(`${API_BASE_URL}/api/tierlists`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify(tierListData)
            });

            if (!response.ok) throw new Error("Failed to submit weekly tier list");

            const result = await response.json();
            const tierListId = result.id;

            // Add items and ratings
            for (const [tierName, items] of Object.entries(tiers)) {
                if (tierName === "storageBox") continue;

                for (const item of items) {
                    const itemData = { itemName: item.text, imageUrl: item.image };
                    const itemRes = await fetch(`${API_BASE_URL}/api/tierlists/${tierListId}/items`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem("token")}`
                        },
                        body: JSON.stringify(itemData)
                    });

                    const savedItem = await itemRes.json();
                    await fetch(`${API_BASE_URL}/api/tierlists/${tierListId}/items/${savedItem.id}/rate?userId=${userId}&ranking=${tierName}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem("token")}`
                        }
                    });
                }
            }

            alert("Weekly tier list submitted!");
            navigate("/");
        } catch (err) {
            console.error(err);
            setSubmitError(err.message || "Submission failed.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="landing-container">
            <div className="header">
                <h1>Weekly Tier List Submission</h1>
                <p>{weeklyListTitle}</p>
            </div>

            <div className="tier-list-wrapper2">
                {Object.keys(tiers).filter(tier => tier !== "storageBox").map((tier) => (
                    <div
                        key={tier}
                        className={`tier ${tier.toLowerCase()}`}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(tier, e)}
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
                                    <img src={item.image} alt="tier item" className="tier-image"/>
                                    <input
                                        type="text"
                                        value={item.text}
                                        onChange={(e) => handleEditItemText(tier, index, e.target.value)}
                                        className="editable-text"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
                <div
                    className="tier storageBox"
                    onDragOver={handleDragOver}
                    onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files[0];
                        if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                                const newItem = {image: reader.result, text: file.name};
                                setTiers(prev => ({
                                    ...prev,
                                    storageBox: [...prev.storageBox, newItem]
                                }));
                            };
                            reader.readAsDataURL(file);
                        }
                    }}
                >
                    <h3>Storage Box</h3>
                    <div className="tier-items">
                        {tiers.storageBox.map((item, index) => (
                            <div
                                key={`storageBox-${index}`}
                                className="tier-item"
                                draggable
                                onDragStart={() => handleDragStart("storageBox", index)}
                            >
                                <img src={item.image} alt="tier item" className="tier-image"/>
                                <input
                                    type="text"
                                    value={item.text}
                                    onChange={(e) => handleEditItemText("storageBox", index, e.target.value)}
                                    className="editable-text"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="tier-input-wrapper">
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                                const newItem = {image: reader.result, text: file.name};
                                setTiers(prev => ({
                                    ...prev,
                                    storageBox: [...prev.storageBox, newItem]
                                }));
                            };
                            reader.readAsDataURL(file);
                        }
                    }}
                    className="tier-input"
                />
            </div>
            {submitError && <div className="error-message">{submitError}</div>}

            <div>
                <button className="btn" onClick={submitTierList} disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Tier-List"}
                </button>
                <button className="btn" onClick={() => navigate("/")}>
                    Cancel
                </button>
            </div>
        </div>

    );
}

export default WeeklySubmissionPg;