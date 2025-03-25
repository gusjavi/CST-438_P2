import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
//import "./innerPages.css";

function Dropdown({ options, onSelect, initialValue }) {
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
        <div className="dropdown" ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className="btn btn-sm"
                style={{background: "linear-gradient(to right, #ff8008, #ffc837)", border: "none", color: "white"}}
            >
                Select a Category
            </button>
            {isOpen && (
                <ul className="dropdown-menu">
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
    F: [],
    storageBox: []
};

function EditTierlist() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tiers, setTiers] = useState(initialTiers);
    const [draggingItem, setDraggingItem] = useState(null);
    const [tierListTitle, setTierListTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isPublic, setIsPublic] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [message, setMessage] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("General");
    const [username, setUsername] = useState(localStorage.getItem("username") || "Guest");
    const [isSignedIn, setIsSignedIn] = useState(localStorage.getItem("isSignedIn") === "true");
    const categories = ["General", "Anime", "Food", "Places", "Music", "Games", "Movies", "Animals"];
    const primaryButtonStyle = {background: "linear-gradient(to right, #ff8008, #ffc837)", border: "none", color: "white"};
    useEffect(() => {
        const userId = localStorage.getItem("userId");
        if (!userId) {
            navigate("/login");
            return;
        }

        fetchTierList();
    }, [id, navigate]);

    const fetchTierList = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Reset tiers to prevent duplicates on reload
            setTiers(JSON.parse(JSON.stringify(initialTiers)));

            const response = await fetch(`http://localhost:8080/api/tierlists/${id}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem("token")}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();

            setTierListTitle(data.title);
            setDescription(data.description);
            setIsPublic(data.public);
            setSelectedCategory(data.category || "General");

            const itemsResponse = await fetch(`http://localhost:8080/api/tierlists/${id}/items`, {
                credentials: 'include',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("token")}`
                }
            });

            if (!itemsResponse.ok) {
                throw new Error(`Error fetching items: ${itemsResponse.status}`);
            }

            const itemsData = await itemsResponse.json();

            const ratingsResponse = await fetch(`http://localhost:8080/api/tierlists/${id}/ratings`, {
                credentials: 'include',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("token")}`
                }
            });

            // Create a map to store item ratings
            let ratingsMap = {};
            if (ratingsResponse.ok) {
                const ratingsData = await ratingsResponse.json();
                ratingsData.forEach(rating => {
                    ratingsMap[rating.itemId] = rating.ranking;
                });
            }

            // Create a new tiers object to populate with items
            const newTiers = JSON.parse(JSON.stringify(initialTiers));

            // Place items in appropriate tiers based on ratings
            itemsData.forEach(item => {
                const formattedItem = {
                    id: item.id,
                    text: item.itemName,
                    image: item.imageUrl.startsWith('data:') ? item.imageUrl : `data:image/jpeg;base64,${item.imageUrl}`
                };

                // Check if there's a rating for this item
                const tierRanking = ratingsMap[item.id];
                if (tierRanking && newTiers[tierRanking]) {
                    // Place item in its rated tier
                    newTiers[tierRanking].push(formattedItem);
                } else {
                    // If no rating, place in storage box
                    newTiers.storageBox.push(formattedItem);
                }
            });

            setTiers(newTiers);
        } catch (err) {
            console.error("Error fetching tier list details:", err);
            setError("Failed to load tier list details. Please try again later.");
        } finally {
            setIsLoading(false);
        }
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
        setIsSignedIn(false);
        navigate("/");
    };

    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
    };

    const updateTierList = async () => {
        if (!tierListTitle.trim()) {
            setSubmitError("Please enter a title for your tier list");
            return;
        }
        if (!isSignedIn) {
            setSubmitError("Please sign in to update a tier list");
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

            const tierListData = {
                id: id,
                title: tierListTitle,
                description: description,
                isPublic: isPublic,
                category: selectedCategory,
                creator: {
                    userId: userId
                }
            };

            const tierListResponse = await fetch(`http://localhost:8080/api/tierlists/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify(tierListData)
            });

            if (!tierListResponse.ok) {
                const errorData = await tierListResponse.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to update tier list');
            }

            for (const [tierName, items] of Object.entries(tiers)) {
                if (tierName === 'storageBox') continue;
                for (const item of items) {
                    try {
                        if (item.id) {
                            const itemData = {
                                itemName: item.text,
                                imageUrl: item.image
                            };

                            const itemResponse = await fetch(`http://localhost:8080/api/tierlists/${id}/items/${item.id}`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${localStorage.getItem("token")}`
                                },
                                body: JSON.stringify(itemData)
                            });

                            if (!itemResponse.ok) {
                                console.error(`Failed to update item ${item.text}`);
                            }

                            const tierRanking = tierName.toUpperCase();
                            const ratingResponse = await fetch(`http://localhost:8080/api/tierlists/${id}/items/${item.id}/rate?userId=${encodeURIComponent(userId)}&ranking=${tierRanking}`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${localStorage.getItem("token")}`
                                }
                            });

                            if (!ratingResponse.ok) {
                                console.error(`Failed to rate item ${item.text}`);
                            }
                        } else {
                            const itemData = {
                                itemName: item.text,
                                imageUrl: item.image
                            };

                            const itemResponse = await fetch(`http://localhost:8080/api/tierlists/${id}/items`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${localStorage.getItem("token")}`
                                },
                                body: JSON.stringify(itemData)
                            });

                            if (!itemResponse.ok) {
                                console.error(`Failed to add item ${item.text}`);
                                continue;
                            }
                            const savedItem = await itemResponse.json();
                            const tierRanking = tierName.toUpperCase();
                            const ratingResponse = await fetch(`http://localhost:8080/api/tierlists/${id}/items/${savedItem.id}/rate?userId=${encodeURIComponent(userId)}&ranking=${tierRanking}`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${localStorage.getItem("token")}`
                                }
                            });

                            if (!ratingResponse.ok) {
                                console.error(`Failed to rate item ${item.text}`);
                            }
                        }
                    } catch (itemError) {
                        console.error("Error processing item:", itemError);
                    }
                }
            }

            for (const item of tiers.storageBox) {
                if (item.id) {
                    const itemData = {
                        itemName: item.text,
                        imageUrl: item.image
                    };

                    await fetch(`http://localhost:8080/api/tierlists/${id}/items/${item.id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem("token")}`
                        },
                        body: JSON.stringify(itemData)
                    });
                }
            }

            setMessage("Tier list updated successfully!");
            setTimeout(() => {
                navigate(`/`);
            }, 1500);

        } catch (error) {
            console.error("Error updating tier list:", error);
            setSubmitError(error.message || "Failed to update tier list. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading && Object.values(tiers).every(tier => tier.length === 0)) {
        return <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <p className="text-xl font-semibold">Loading tier list details...</p>
        </div>;
    }

    return (
        <div className="landing-container" style={{background: "linear-gradient(to right, rgb(58, 28, 113), rgb(215, 109, 119), rgb(255, 175, 123))"}}>
            <div className="header flex justify-between items-center w-full mb-4">
                <h1 className="text-3xl font-bold text-white">Edit: {tierListTitle}</h1>
                {isSignedIn && <button onClick={handleSignOut} className="btn btn-sm" style={primaryButtonStyle}>Sign Out</button>}
            </div>

            <div className="btn-group">
                <button onClick={() => navigate("/")} className="btn" style={primaryButtonStyle}>Home</button>
                <button onClick={() => navigate("/edit")} className="btn" style={primaryButtonStyle}>Edit Account</button>
            </div>

            {message && <div className="success-message">{message}</div>}

            <div className="tier-input-container bg-white rounded-lg shadow-lg p-4 mb-4">
                <input
                    type="text"
                    placeholder="Tier List Title"
                    className="tier-input input input-bordered w-full mb-2"
                    value={tierListTitle}
                    onChange={(e) => setTierListTitle(e.target.value)}
                />

                <div className="category-selector flex items-center gap-2">
                    <p className="font-medium">Category: {selectedCategory}</p>
                    <Dropdown options={categories} onSelect={handleCategorySelect} />
                </div>
            </div>

            <div className="tier-list-wrapper2 bg-white rounded-lg shadow-lg p-4 mb-6">
                {Object.keys(tiers).map((tier) => (
                    tier !== 'storageBox' && (
                        <div
                            key={tier}
                            className={`tier ${tier.toLowerCase()} mb-4 p-2 border rounded-lg`}
                            style={{
                                backgroundColor: tier === 'S' ?  '#FFD7D7' :
                                    tier === 'A' ? '#FFDEAD' :
                                        tier === 'B' ? '#FFFACD' :
                                            tier === 'C' ? '#CCFFCC' :
                                                tier === 'D' ? '#ADD8E6' :
                                                    tier === 'F' ? '#FFCCCB' : 'white'
                            }}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(tier, e)}
                        >
                            <h3 className="text-lg font-bold mb-2">{tier} Tier</h3>
                            <div className="tier-items flex flex-wrap gap-2">
                                {tiers[tier].map((item, index) => (
                                    <div
                                        key={`${tier}-${index}`}
                                        className="tier-item w-24 bg-white p-2 rounded border shadow-sm"
                                        draggable
                                        onDragStart={() => handleDragStart(tier, index)}
                                    >
                                        <img src={item.image} alt="tier item" className="tier-image w-full h-20 object-cover mb-1" />
                                        <input
                                            type="text"
                                            value={item.text}
                                            onChange={(e) => handleEditItemText(tier, index, e.target.value)}
                                            className="editable-text w-full text-xs input input-bordered input-sm"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                ))}
                <div className="tier storageBox p-2 border rounded-lg bg-gray-100" onDragOver={handleDragOver} onDrop={handleDropFile}>
                    <h3 className="text-lg font-bold mb-2">Storage Box</h3>
                    <div className="tier-items flex flex-wrap gap-2">
                        {tiers.storageBox.length === 0 && <p className="drag-placeholder text-gray-500 italic">Drag images here</p>}
                        {tiers.storageBox.map((item, index) => (
                            <div
                                key={`storageBox-${index}`}
                                className="tier-item w-24 bg-white p-2 rounded border shadow-sm"
                                draggable
                                onDragStart={() => handleDragStart("storageBox", index)}
                            >
                                <img src={item.image} alt="tier item" className="tier-image w-full h-20 object-cover mb-1" />
                                <input type="text" value={item.text} onChange={(e) => handleEditItemText("storageBox", index, e.target.value)} className="editable-text w-full text-xs input input-bordered input-sm"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
                <div className="tier-input-wrapper mb-4">
                    <label className="inline-block mr-2 font-medium">Add Image:</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleAddItem}
                        className="tier-input file-input file-input-bordered"
                    />
                </div>

                <div className="privacy-toggle">
                    <label className="flex items-center cursor-pointer gap-2">
                        <span className="label-text">Make this tier list public</span>
                        <input
                            type="checkbox"
                            className="checkbox"
                            checked={isPublic}
                            onChange={() => setIsPublic(!isPublic)}
                        />
                    </label>
                </div>
            </div>

            {submitError && <div className="error-message bg-red-100 text-red-700 p-3 rounded-lg mb-4">{submitError}</div>}

            <div className="flex justify-center">
                <button className="btn btn-lg" style={primaryButtonStyle} onClick={updateTierList} disabled={isSubmitting}>{isSubmitting ? "Updating..." : "Update Tier-List"}</button>
            </div>
        </div>
    );
}


export default EditTierlist;