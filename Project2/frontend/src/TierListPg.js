import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./innerPages.css";

const initialTiers = {
    S: [],
    A: [],
    B: [],
    C: [],
    D: [],
    F:[],
    storageBox: []
};

const API_BASE_URL = 'http://localhost:8080';

function TierListPage() {
    const navigate = useNavigate();
    const [tiers, setTiers] = useState(initialTiers);
    const [draggingItem, setDraggingItem] = useState(null);
    const [isSignedIn, setSignedIn] = useState(localStorage.getItem("isSignedIn") === "true");
    const [username, setUsername] = useState(localStorage.getItem("username") || "Guest");
    const [isPublic, setIsPublic] = useState(localStorage.getItem("isPublic") !== "false");
    const [tierListTitle, setTierListTitle] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    useEffect(() => {
        localStorage.setItem("isSignedIn", isSignedIn);
        localStorage.setItem("isPublic", isPublic);
    }, [isSignedIn, isPublic]);

    const togglePrivacy = () => {
        setIsPublic((prev) => {
            const newValue = !prev;
            localStorage.setItem("isPublic", newValue.toString());
            console.log("Privacy toggled to:", newValue ? "Public" : "Private");
            return newValue;
        });
    };

    const handleAddItem = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newItem = { image: reader.result, text: file.name };

                setTiers((prevTiers) => ({
                    ...prevTiers,
                    storageBox: [...prevTiers.storageBox, newItem],
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDragStart = (tier, index) => {
        setDraggingItem({ tier, index, item: tiers[tier][index] });
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (newTier, e) => {
        e.preventDefault();
        if (!draggingItem) return;
        const { tier: oldTier, index, item } = draggingItem;
        setTiers((prevTiers) => {
            const newTiers = { ...prevTiers };
            newTiers[oldTier] = newTiers[oldTier].filter((_, i) => i !== index);
            newTiers[newTier] = [...newTiers[newTier], item];
            return newTiers;
        });
        setDraggingItem(null);
    };

    const handleDropFile = (event) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];

        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newItem = { image: reader.result, text: file.name };

                setTiers((prevTiers) => ({
                    ...prevTiers,
                    storageBox: [...prevTiers.storageBox, newItem],
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleEditItemText = (tier, index, newText) => {
        setTiers((prevTiers) => {
            const newTiers = { ...prevTiers };
            newTiers[tier][index].text = newText;
            return { ...newTiers };
        });
    };

    const handleSignOut = () => {
        localStorage.removeItem("isSignedIn");
        localStorage.removeItem("username");
        setUsername("Guest");
        setSignedIn(false);
        navigate("/");
    };

    const submitTierList = async () => {

        if (!tierListTitle.trim()) {
            setSubmitError("Please enter a title for your tier list");
            return;
        }
        if (!isSignedIn) {
            setSubmitError("Please sign in to create a tier list");
            return;
        }

        const hasItems = Object.keys(tiers).some(tier =>
            tier !== 'storageBox' && tiers[tier].length > 0
        );

        if (!hasItems) {
            setSubmitError("Please add at least one item to a tier");
            return;
        }

        try {
            setIsSubmitting(true);
            setSubmitError(null);

            const userId = localStorage.getItem("userId");
            console.log("userid",userId);

            if (!userId) {
                throw new Error("User ID not found. Please sign in again.");
            }

            const tierListData = {
                title: tierListTitle,
                description: `${username}'s tier list for ${tierListTitle}`,
                isPublic: isPublic,
                category: "General",
                creator: {
                    userId: userId
                }
            };

            const tierListResponse = await fetch(`${API_BASE_URL}/api/tierlists`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify(tierListData)
            });

            if (!tierListResponse.ok) {
                const errorData = await tierListResponse.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to create tier list');
            }

            const tierList = await tierListResponse.json();
            const tierListId = tierList.id;

            for (const [tierName, items] of Object.entries(tiers)) {
                if (tierName === 'storageBox') continue;
                for (const item of items) {
                    try {
                        const itemData = {
                            itemName: item.text,
                            imageUrl: item.image
                        };

                        const itemResponse = await fetch(`${API_BASE_URL}/api/tierlists/${tierListId}/items`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${localStorage.getItem("token")}`
                            },
                            body: JSON.stringify(itemData)
                        });

                        if (!itemResponse.ok) {
                            console.error(`Failed to add item ${item.text}`);
                            continue; // Continue with other items
                        }
                        const savedItem = await itemResponse.json();

                        const ratingResponse = await fetch(`${API_BASE_URL}/api/tierlists/${tierListId}/items/${savedItem.id}/rate?userId=${encodeURIComponent(userId)}&ranking=${tierName}`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${localStorage.getItem("token")}`
                            }
                        });

                        if (!ratingResponse.ok) {
                            console.error(`Failed to rate item ${item.text}`);
                        }
                    } catch (itemError) {
                        console.error("Error processing item:", itemError);
                    }
                }
            }

            alert("Tier list created successfully!");
            navigate(`/`);

        } catch (error) {
            console.error("Error submitting tier list:", error);
            setSubmitError(error.message || "Failed to create tier list. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
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
            <input
                type="text"
                placeholder="Tier List Title"
                className="tier-input"
                value={tierListTitle}
                onChange={(e) => setTierListTitle(e.target.value)}
            />
            <div className="privacy-toggle">
                <label className="switch">
                    <input type="checkbox" checked={isPublic} onChange={togglePrivacy} />
                    <span className="slider"></span>
                </label>
                <span className="privacy-label">{isPublic ? "Public" : "Private"}</span>
            </div>
            <div className="tier-list-wrapper2">
                {Object.keys(tiers).map((tier) => (
                    tier !== 'storageBox' && (
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
                                        <img src={item.image} alt="tier item" className="tier-image" />
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
                    )
                ))}
                <div className="tier storageBox" onDragOver={handleDragOver} onDrop={handleDropFile}>
                    <h3>Storage Box</h3>
                    <div className="tier-items">
                        {tiers.storageBox.length === 0 && <p className="drag-placeholder">Drag images here</p>}
                        {tiers.storageBox.map((item, index) => (
                            <div
                                key={`storageBox-${index}`}
                                className="tier-item"
                                draggable
                                onDragStart={() => handleDragStart("storageBox", index)}
                            >
                                <img src={item.image} alt="tier item" className="tier-image" />
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
                    onChange={handleAddItem}
                    className="tier-input"
                />
            </div>

            {submitError && <div className="error-message">{submitError}</div>}

            <div>
                <button
                    className="btn"
                    onClick={submitTierList}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Creating..." : "Create Tier-List"}
                </button>
            </div>
        </div>
    );
}

export default TierListPage;