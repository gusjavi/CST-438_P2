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

    // Button style for consistent theming
    const primaryButtonStyle = {
        background: "linear-gradient(to right, #ff8008, #ffc837)",
        border: "none",
        color: "white"
    };

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
        // Existing submit logic
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
        <div className="min-h-screen flex flex-col items-center"
             style={{background: "linear-gradient(to right, rgb(58, 28, 113), rgb(215, 109, 119), rgb(255, 175, 123))"}}>
            <div className="w-full max-w-6xl px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-white">{username}'s Tier List</h1>
                    {isSignedIn && (
                        <button
                            onClick={handleSignOut}
                            className="btn btn-sm"
                            style={primaryButtonStyle}
                        >
                            Sign Out
                        </button>
                    )}
                </div>

                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => navigate("/")}
                        className="btn"
                        style={primaryButtonStyle}
                    >
                        Home
                    </button>
                    <button
                        onClick={() => navigate("/edit")}
                        className="btn"
                        style={primaryButtonStyle}
                    >
                        Edit Account
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center mb-4">
                        <input
                            type="text"
                            placeholder="Tier List Title"
                            className="input input-bordered w-full"
                            value={tierListTitle}
                            onChange={(e) => setTierListTitle(e.target.value)}
                        />

                        <div className="flex items-center gap-2">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isPublic}
                                    onChange={togglePrivacy}
                                    className="toggle toggle-primary"
                                />
                                <span className="ml-2">{isPublic ? "Public" : "Private"}</span>
                            </label>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {Object.keys(tiers).map((tier) => (
                            tier !== 'storageBox' && (
                                <div
                                    key={tier}
                                    className={`bg-${getTierColor(tier)} p-4 rounded-lg`}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(tier, e)}
                                >
                                    <h3 className="text-xl font-bold mb-2">{tier} Tier</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {tiers[tier].map((item, index) => (
                                            <div
                                                key={`${tier}-${index}`}
                                                className="bg-white p-2 rounded shadow-md w-24"
                                                draggable
                                                onDragStart={() => handleDragStart(tier, index)}
                                            >
                                                <img src={item.image} alt="tier item" className="w-full h-20 object-cover rounded mb-1" />
                                                <input
                                                    type="text"
                                                    value={item.text}
                                                    onChange={(e) => handleEditItemText(tier, index, e.target.value)}
                                                    className="w-full text-xs text-center"
                                                />
                                            </div>
                                        ))}
                                        {tiers[tier].length === 0 && (
                                            <div className="text-gray-500 italic p-2">Drag items here</div>
                                        )}
                                    </div>
                                </div>
                            )
                        ))}

                        <div
                            className="bg-gray-100 p-4 rounded-lg border-2 border-dashed border-gray-300"
                            onDragOver={handleDragOver}
                            onDrop={handleDropFile}
                        >
                            <h3 className="text-xl font-bold mb-2">Storage Box</h3>
                            <div className="flex flex-wrap gap-3">
                                {tiers.storageBox.length === 0 && (
                                    <div className="text-gray-500 italic p-4 text-center w-full">
                                        Drag images here or use the upload button below
                                    </div>
                                )}
                                {tiers.storageBox.map((item, index) => (
                                    <div
                                        key={`storageBox-${index}`}
                                        className="bg-white p-2 rounded shadow-md w-24"
                                        draggable
                                        onDragStart={() => handleDragStart("storageBox", index)}
                                    >
                                        <img src={item.image} alt="tier item" className="w-full h-20 object-cover rounded mb-1" />
                                        <input
                                            type="text"
                                            value={item.text}
                                            onChange={(e) => handleEditItemText("storageBox", index, e.target.value)}
                                            className="w-full text-xs text-center"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <label className="btn w-full" style={primaryButtonStyle}>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleAddItem}
                                className="hidden"
                            />
                            Upload Image
                        </label>
                    </div>

                    {submitError && (
                        <div className="bg-red-100 text-red-700 p-3 rounded-lg mt-4">
                            {submitError}
                        </div>
                    )}

                    <div className="mt-6">
                        <button
                            className="btn w-full"
                            style={primaryButtonStyle}
                            onClick={submitTierList}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Creating..." : "Create Tier-List"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper function to get background color for tier
function getTierColor(tier) {
    const colors = {
        S: 'red-100',
        A: 'orange-100',
        B: 'yellow-100',
        C: 'green-100',
        D: 'blue-100',
        F: 'purple-100'
    };
    return colors[tier] || 'gray-100';
}

export default TierListPage;