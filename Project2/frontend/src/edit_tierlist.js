import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./innerPages.css";

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
            <button onClick={toggleDropdown}>
                Select a Category
            </button>
            {isOpen && (
                <ul className="dropdown-menu">
                    {options.map((option) => (
                        <li key={option} onClick={() => handleOptionClick(option)}>
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
        return <div className="loading">Loading tier list details...</div>;
    }

    return (
        <div className="landing-container">
            <div className="header">
                <h1>Edit: {tierListTitle}</h1>
                {isSignedIn && <p onClick={handleSignOut} className="sign-out">Sign Out</p>}
            </div>
            <div className="btn-group">
                <button onClick={() => navigate("/")} className="btn">Home</button>
                <button onClick={() => navigate("/edit")} className="btn">Edit Account</button>
            </div>

            {message && <div className="success-message">{message}</div>}

            <input
                type="text"
                placeholder="Tier List Title"
                className="tier-input"
                value={tierListTitle}
                onChange={(e) => setTierListTitle(e.target.value)}
            />

            <div className="category-selector">
                <p>Category: {selectedCategory}</p>
                <Dropdown options={categories} onSelect={handleCategorySelect} />
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

            <div className="privacy-toggle">
                <label>
                    <input
                        type="checkbox"
                        checked={isPublic}
                        onChange={() => setIsPublic(!isPublic)}
                    />
                    Make this tier list public
                </label>
            </div>

            {submitError && <div className="error-message">{submitError}</div>}

            <div>
                <button
                    className="btn"
                    onClick={updateTierList}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Updating..." : "Update Tier-List"}
                </button>
            </div>
        </div>
    );
}

export default EditTierlist;