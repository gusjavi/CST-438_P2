import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
//import "./innerPages.css";

function Dropdown({ options, onSelect }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleOptionClick = (option) => {
        onSelect(option);
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="dropdown relative" ref={dropdownRef}>
            <button onClick={toggleDropdown} className="btn btn-sm" style={{background: "linear-gradient(to right, #ff8008, #ffc837)", border: "none", color: "white"}}
            >
                Select a Category
            </button>
            {isOpen && (
                <ul className="dropdown-menu absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg">
                    {options.map((option) => (
                        <li
                            key={option}
                            onClick={() => handleOptionClick(option)}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        >
                            {option}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

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
    const [tierListTitle, setTierListTitle] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [isPublic, setIsPublic] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("General");
    const categories = ["General", "Anime", "Food", "Places", "Music", "Games", "Movies", "Animals"];
     const primaryButtonStyle = {background: "linear-gradient(to right, #ff8008, #ffc837)", border: "none", color: "white"};
    useEffect(() => {
        localStorage.setItem("isSignedIn", isSignedIn);
    }, [isSignedIn, isPublic]);


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

    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
    };

    // This is the updated submitTierList function
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
            if (!userId) {
                throw new Error("User ID not found. Please sign in again.");
            }

            // Create tier list first
            const tierListData = {
                title: tierListTitle,
                description: `${username}'s tier list for ${tierListTitle}`,
                category: selectedCategory,
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
                            const errorData = await itemResponse.json().catch(() => ({}));
                            console.error(`Failed to add item ${item.text}: ${errorData.message || 'Unknown error'}`);
                            continue;
                        }
                        const savedItem = await itemResponse.json();
                        const tierRanking = tierName.toUpperCase();

                        const ratingResponse = await fetch(`${API_BASE_URL}/api/tierlists/${tierListId}/items/${savedItem.id}/rate?userId=${encodeURIComponent(userId)}&ranking=${tierRanking}`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${localStorage.getItem("token")}`
                            }
                        });

                        if (!ratingResponse.ok) {
                            const errorData = await ratingResponse.json().catch(() => ({}));
                            console.error(`Failed to rate item ${item.text}: ${errorData.message || 'Unknown error'}`);
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
        <div className="min-h-screen flex flex-col items-center" style={{background: "linear-gradient(to right, rgb(58, 28, 113), rgb(215, 109, 119), rgb(255, 175, 123))"}}>
            <div className="w-full max-w-6xl px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-white">{username}'s Tier List</h1>
                    {isSignedIn && (<button onClick={handleSignOut} className="btn btn-sm" style={primaryButtonStyle}>Sign Out</button>)}
                </div>

                <div className="flex gap-2 mb-6">
                    <button onClick={() => navigate("/")} className="btn" style={primaryButtonStyle}>Home</button>
                    <button onClick={() => navigate("/edit")} className="btn" style={primaryButtonStyle}>Edit Account</button>
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

                        <div className="category-selector flex items-center gap-2">
                            <p className="font-medium">Category: {selectedCategory}</p>
                            <Dropdown options={categories} onSelect={handleCategorySelect} />
                        </div>
                    </div>

                    <div className="space-y-4">
                        {Object.keys(tiers).map((tier) => (
                            tier !== 'storageBox' && (
                                <div
                                    key={tier}
                                    className={`tier ${tier.toLowerCase()} p-4 rounded-lg`}
                                    style={{
                                        backgroundColor: tier === 'S' ? '#FFD7D7' : // Pink for S tier
                                            tier === 'A' ? '#FFDEAD' : // Light orange/peach for A tier
                                                tier === 'B' ? '#FFFACD' : // Light yellow for B tier
                                                    tier === 'C' ? '#CCFFCC' : // Light green for C tier
                                                        tier === 'D' ? '#ADD8E6' : // Light blue for D tier
                                                            tier === 'F' ? '#FFCCCB' : // Light red for F tier
                                                                'white'
                                    }}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(tier, e)}
                                >
                                    <h3 className="text-xl font-bold mb-2">{tier} Tier</h3>
                                    <div className="tier-items flex flex-wrap gap-3">
                                        {tiers[tier].map((item, index) => (
                                            <div
                                                key={`${tier}-${index}`}
                                                className="tier-item bg-white p-2 rounded shadow-md w-24"
                                                draggable
                                                onDragStart={() => handleDragStart(tier, index)}
                                            >
                                                <img src={item.image} alt="tier item" className="tier-image w-full h-20 object-cover rounded mb-1" />
                                                <input
                                                    type="text"
                                                    value={item.text}
                                                    onChange={(e) => handleEditItemText(tier, index, e.target.value)}
                                                    className="editable-text w-full text-xs text-center"
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
                            className="tier storageBox bg-gray-100 p-4 rounded-lg border-2 border-dashed border-gray-300"
                            onDragOver={handleDragOver}
                            onDrop={handleDropFile}
                        >
                            <h3 className="text-xl font-bold mb-2">Storage Box</h3>
                            <div className="tier-items flex flex-wrap gap-3">
                                {tiers.storageBox.length === 0 && (
                                    <p className="drag-placeholder text-gray-500 italic p-4 text-center w-full">
                                        Drag images here or use the upload button below
                                    </p>
                                )}
                                {tiers.storageBox.map((item, index) => (
                                    <div
                                        key={`storageBox-${index}`}
                                        className="tier-item bg-white p-2 rounded shadow-md w-24"
                                        draggable
                                        onDragStart={() => handleDragStart("storageBox", index)}
                                    >
                                        <img src={item.image} alt="tier item" className="tier-image w-full h-20 object-cover rounded mb-1" />
                                        <input
                                            type="text"
                                            value={item.text}
                                            onChange={(e) => handleEditItemText("storageBox", index, e.target.value)}
                                            className="editable-text w-full text-xs text-center"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <div className="privacy-toggle flex items-center gap-2 mb-4">
                            <label className="flex items-center cursor-pointer">
                                <span className="mr-2">Make this tier list public</span>
                                <input type="checkbox" className="checkbox" checked={isPublic} onChange={() => setIsPublic(!isPublic)}
                                />
                            </label>
                        </div>

                        <div className="tier-input-wrapper">
                            <label className="btn w-full mb-4" style={primaryButtonStyle}>
                                <span>Upload Image</span>
                                <input type="file" accept="image/*" onChange={handleAddItem} className="tier-input hidden"
                                />
                            </label>
                        </div>

                        {submitError && (
                            <div className="error-message bg-red-100 text-red-700 p-3 rounded-lg mb-4">
                                {submitError}
                            </div>
                        )}

                        <button className="btn w-full" style={primaryButtonStyle} onClick={submitTierList} disabled={isSubmitting}>
                            {isSubmitting ? "Creating..." : "Create Tier-List"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TierListPage;