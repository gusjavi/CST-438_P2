import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

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

function TierListDisplay({ tierList, onUnlike }) {
    const navigate = useNavigate();

    return (
        <div className="tier-list-container">
            <h2>{tierList.name}</h2>
            <p>Category: {tierList.category || "General"}</p>
            <div className="tier-box">
                {Object.keys(tierList.tiers).map((tier) => (
                    tierList.tiers[tier].length > 0 && (
                        <div key={tier} className={`tier ${tier.toLowerCase()}`}>
                            <h3>{tier} Tier</h3>
                            <div className="tier-items">
                                {tierList.tiers[tier].slice(0, 3).map((item, index) => (
                                    <div key={index} className="tier-item">
                                        {item.imageUrl && (
                                            <img
                                                src={item.imageUrl.startsWith('data:')
                                                    ? item.imageUrl
                                                    : `data:image/jpeg;base64,${item.imageUrl}`}
                                                alt={item.itemName}
                                                className="tier-image"
                                            />
                                        )}
                                        <span>{item.itemName}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                ))}
            </div>
            <div className="tier-actions">
                <button
                    onClick={() => onUnlike(tierList.id)}
                    className="btn"
                >
                    Unlike
                </button>
            </div>
        </div>
    );
}

function LikedTierLists() {
    const [likedTierLists, setLikedTierLists] = useState([]);
    const [filteredLikedTierLists, setFilteredLikedTierLists] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [isSignedIn, setSignedIn] = useState(localStorage.getItem("isSignedIn") === "true");
    const [username, setUsername] = useState(localStorage.getItem("username") || "Guest");
    const [selectedCategory, setSelectedCategory] = useState("General");
    const categories = ["General", "Anime", "Food", "Places", "Music", "Games", "Movies", "Animals"];

    useEffect(() => {
        fetchLikedTierLists();
    }, []);

    useEffect(() => {
        filterLikedTierLists(likedTierLists, selectedCategory);
    }, [selectedCategory, likedTierLists]);

    const handleSignOut = () => {
        localStorage.removeItem("isSignedIn");
        localStorage.removeItem("username");
        setSignedIn(false);
        setUsername("Guest");
        window.location.reload();
    };

    const filterLikedTierLists = (lists, category) => {
        if (category === "General") {
            setFilteredLikedTierLists(lists);
        } else {
            setFilteredLikedTierLists(lists.filter(list => list.category === category));
        }
    };

    const fetchLikedTierLists = async () => {
        try {
            const userId = localStorage.getItem("userId");
            if (!userId) {
                setError("Please sign in to view liked tier lists");
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);

            const response = await fetch(`http://localhost:8080/api/tierlists/liked/${userId}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const likedLists = await response.json();

            const processedLists = await Promise.all(likedLists.map(async (list) => {
                try {
                    const itemsResponse = await fetch(`http://localhost:8080/api/tierlists/${list.id}/items`, {
                        credentials: 'include'
                    });

                    if (!itemsResponse.ok) {
                        console.error(`Error fetching items for list ${list.id}: ${itemsResponse.status}`);
                        return {
                            id: list.id,
                            name: list.title,
                            description: list.description,
                            category: list.category || "General",
                            tiers: { S: [], A: [], B: [], C: [], D: [], F: [] },
                            likes: list.likeCount || 0
                        };
                    }

                    const items = await itemsResponse.json();

                    const ratingsResponse = await fetch(`http://localhost:8080/api/tierlists/${list.id}/ratings`, {
                        credentials: 'include'
                    });

                    const ratings = ratingsResponse.ok ? await ratingsResponse.json() : [];

                    const tiers = organizeTierItems(items, ratings);

                    return {
                        id: list.id,
                        name: list.title,
                        description: list.description,
                        category: list.category || "General",
                        tiers: tiers,
                        likes: list.likeCount || 0,
                        creator: list.creator
                    };
                } catch (err) {
                    console.error(`Error processing liked list ${list.id}:`, err);
                    return {
                        id: list.id,
                        name: list.title,
                        description: list.description,
                        category: list.category || "General",
                        tiers: { S: [], A: [], B: [], C: [], D: [], F: [] },
                        likes: list.likeCount || 0
                    };
                }
            }));

            setLikedTierLists(processedLists);
        } catch (err) {
            console.error("Error fetching liked tier lists:", err);
            setError("Failed to load liked tier lists. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    const organizeTierItems = (items, ratings) => {
        const tiers = {
            S: [],
            A: [],
            B: [],
            C: [],
            D: [],
            F: []
        };

        items.forEach(item => {
            const itemId = item.id;
            const itemRatings = ratings.filter(rating => rating.id === itemId);
            if (itemRatings.length > 0) {
                const tierRating = itemRatings[0].ranking;
                tiers[tierRating].push(item);
            } else {
                tiers.F.push(item);
            }
        });
        return tiers;
    };

    const handleUnlike = async (tierListId) => {
        try {
            const userId = localStorage.getItem("userId");
            const response = await fetch(`http://localhost:8080/api/tierlists/${tierListId}/like?userId=${userId}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                setLikedTierLists(prevLists =>
                    prevLists.filter(list => list.id !== tierListId)
                );
            } else {
                console.error('Failed to unlike tier list');
            }
        } catch (error) {
            console.error('Error unliking tier list:', error);
        }
    };

    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
    };

    return (
        <div className="landing-container">
            <div className="header">
                <h1>Welcome {username}</h1>
                {isSignedIn && <p onClick={handleSignOut} className="sign-out">Sign Out</p>}
            </div>
            <div className="btn-group">
                {isSignedIn ? (
                    <>
                        <button onClick={() => navigate("/")} className="btn">Go Back</button>
                    </>
                ) : (
                    <>
                        <button onClick={() => navigate("/login")} className="btn">Sign In</button>
                        <button onClick={() => navigate("/SignUp")} className="btn">Create Account</button>
                    </>
                )}
            </div>
            <div className="category-selector">
                <p>Category: {selectedCategory}</p>
                <Dropdown options={categories} onSelect={handleCategorySelect} />
            </div>
            <h2>Liked Tier Lists</h2>
            {isLoading ? (
                <p>Loading liked tier lists...</p>
            ) : error ? (
                <div>
                    <p className="error_notl">{error}</p>
                    <button onClick={fetchLikedTierLists} className="btn">Retry</button>
                </div>
            ) : filteredLikedTierLists.length === 0 ? (
                <p>You haven't liked any tier lists yet.</p>
            ) : (
                <div className="tier-list-wrapper">
                    {filteredLikedTierLists.map(tierList => (
                        <TierListDisplay
                            key={tierList.id}
                            tierList={tierList}
                            onUnlike={handleUnlike}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default LikedTierLists;