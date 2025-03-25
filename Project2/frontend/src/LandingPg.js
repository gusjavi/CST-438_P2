import React, {useState, useEffect, useRef} from "react";
import { useNavigate } from "react-router-dom";
import "./innerPages.css";

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
function LandingPg() {
    const navigate = useNavigate();
    const [isSignedIn, setSignedIn] = useState(localStorage.getItem("isSignedIn") === "true");
    const [username, setUsername] = useState(localStorage.getItem("username") || "Guest");
    const [allTierLists, setAllTierLists] = useState([]);
    const [filteredTierLists, setFilteredTierLists] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userTierLists, setUserTierLists] = useState([]);
    const [filteredUserTierLists, setFilteredUserTierLists] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("General");
    const categories = ["General", "Anime", "Food", "Places", "Music", "Games", "Movies", "Animals"];
    const [weeklyTierList, setWeeklyTierList] = useState(null);

    useEffect(() => {
        fetchWeeklyTierList();
    }, []);

    const fetchWeeklyTierList = async () => {
        try {
            const res = await fetch("http://localhost:8080/api/tierlists/weekly", {
                credentials: "include"
            });
            if (res.ok) {
                const data = await res.json();
                setWeeklyTierList(data);
            } else {
                setWeeklyTierList(null);
            }
        } catch (err) {
            console.error("Failed to fetch weekly tier list:", err);
            setWeeklyTierList(null);
        }
    };

    useEffect(() => {
        fetchTierLists();

        if (isSignedIn) {
            fetchUserTierLists().then(lists => {
                setUserTierLists(lists);
                filterUserTierLists(lists, selectedCategory);
            });
        }

        const handleStorageChange = () => {
            const newSignedInState = localStorage.getItem("isSignedIn") === "true";
            setSignedIn(newSignedInState);
            setUsername(localStorage.getItem("username") || "Guest");

            if (newSignedInState && !isSignedIn) {
                fetchUserTierLists().then(lists => {
                    setUserTierLists(lists);
                    filterUserTierLists(lists, selectedCategory);
                });
            }
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, [isSignedIn]);

    useEffect(() => {
        filterTierLists(allTierLists, selectedCategory);
        filterUserTierLists(userTierLists, selectedCategory);
    }, [selectedCategory, allTierLists, userTierLists]);

    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
    };

    const filterTierLists = (lists, category) => {
        const publicLists = lists.filter(list => !list.weeklyParent); // Exclude weekly submissions
        if (category === "General") {
            setFilteredTierLists(publicLists);
        } else {
            setFilteredTierLists(publicLists.filter(list => list.category === category));
        }
    };

    const filterUserTierLists = (lists, category) => {
        if (category === "General") {
            setFilteredUserTierLists(lists);
        } else {
            setFilteredUserTierLists(lists.filter(list => list.category === category));
        }
    };

    const fetchUserTierLists = async () => {
        try {
            const userId = localStorage.getItem("userId");

            if (!userId) {
                console.error("User ID not found in localStorage");
                return [];
            }

            setIsLoading(true);
            setError(null);

            const response = await fetch(`http://localhost:8080/api/tierlists/user/${userId}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }
            });

            if (!response.ok) {
                console.error(`HTTP error! Status: ${response.status}`);
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const userLists = await response.json();

            // Process the user's tier lists like you do with the public lists
            const processedLists = await Promise.all(userLists.map(async (list) => {
                try {
                    const itemsResponse = await fetch(`http://localhost:8080/api/tierlists/${list.id}/items`, {
                        credentials: 'include'
                    });

                    if (!itemsResponse.ok) {
                        console.error(`Error fetching items for list ${list.id}: ${itemsResponse.status}`);
                        return {
                            id: list.id,
                            name: list.title,
                            creator: list.user_id,
                            description: list.description,
                            category: list.category || "General",
                            tiers: { S: [], A: [], B: [], C: [], D: [], F: [] },
                            likes: 0
                        };
                    }

                    const items = await itemsResponse.json();

                    const ratingsResponse = await fetch(`http://localhost:8080/api/tierlists/${list.id}/ratings`, {
                        credentials: 'include'
                    });

                    if (!ratingsResponse.ok) {
                        console.error(`Error fetching ratings for list ${list.id}: ${ratingsResponse.status}`);
                        return {
                            id: list.id,
                            name: list.title,
                            description: list.description,
                            category: list.category || "General",
                            tiers: organizeTierItems(items, []),
                            likes: 0
                        };
                    }

                    const ratings = await ratingsResponse.json();

                    const likesResponse = await fetch(`http://localhost:8080/api/tierlists/${list.id}/likes/count`, {
                        credentials: 'include'
                    });

                    let likesCount = 0;
                    if (likesResponse.ok) {
                        const likesData = await likesResponse.json();
                        likesCount = likesData.count;
                    } else {
                        console.error(`Error fetching likes for list ${list.id}: ${likesResponse.status}`);
                    }

                    const tiers = organizeTierItems(items, ratings);

                    return {
                        id: list.id,
                        name: list.title,
                        description: list.description,
                        creator: list.creator,
                        category: list.category || "General",
                        tiers: tiers,
                        likes: likesCount
                    };
                } catch (err) {
                    console.error(`Error processing list ${list.id}:`, err);
                    return {
                        id: list.id,
                        name: list.title,
                        description: list.description,
                        category: list.category || "General",
                        tiers: { S: [], A: [], B: [], C: [], D: [], F: [] },
                        likes: 0
                    };
                }
            }));

            return processedLists;
        } catch (err) {
            console.error("Error fetching user tier lists:", err);
            setError("Failed to load your tier lists. Please try again later.");
            return [];
        } finally {
            setIsLoading(false);
        }
    };

    const fetchTierLists = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch('http://localhost:8080/api/tierlists', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }
            });

            if (!response.ok) {
                console.error(`HTTP error! Status: ${response.status}`);
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();

            if (!Array.isArray(data)) {
                console.error("Expected an array but received:", data);
                setAllTierLists([]);
                setFilteredTierLists([]);
                throw new Error("Invalid data format received from server");
            }

            const processedLists = await Promise.all(data.map(async (list) => {
                try {
                    const itemsResponse = await fetch(`http://localhost:8080/api/tierlists/${list.id}/items`, {
                        credentials: 'include'
                    });

                    if (!itemsResponse.ok) {
                        console.error(`Error fetching items for list ${list.id}: ${itemsResponse.status}`);
                        return {
                            id: list.id,
                            name: list.title,
                            creator: list.user_id,
                            description: list.description,
                            category: list.category || "General",
                            tiers: { S: [], A: [], B: [], C: [], D: [], F: [] },
                            likes: 0
                        };
                    }

                    const items = await itemsResponse.json();

                    const ratingsResponse = await fetch(`http://localhost:8080/api/tierlists/${list.id}/ratings`, {
                        credentials: 'include'
                    });
                    if (!ratingsResponse.ok) {
                        console.error(`Error fetching ratings for list ${list.id}: ${ratingsResponse.status}`);
                        return {
                            id: list.id,
                            name: list.title,
                            description: list.description,
                            category: list.category || "General",
                            tiers: organizeTierItems(items, []),
                            likes: 0
                        };
                    }

                    const ratings = await ratingsResponse.json();

                    const likesResponse = await fetch(`http://localhost:8080/api/tierlists/${list.id}/likes/count`, {
                        credentials: 'include'
                    });

                    let likesCount = 0;
                    if (likesResponse.ok) {
                        const likesData = await likesResponse.json();
                        likesCount = likesData.count;
                    } else {
                        console.error(`Error fetching likes for list ${list.id}: ${likesResponse.status}`);
                    }

                    const tiers = organizeTierItems(items, ratings);

                    return {
                        id: list.id,
                        name: list.title,
                        description: list.description,
                        creator: list.creator,
                        category: list.category || "General",
                        tiers: tiers,
                        likes: likesCount
                    };
                } catch (err) {
                    console.error(`Error processing list ${list.id}:`, err);
                    return {
                        id: list.id,
                        name: list.title,
                        description: list.description,
                        category: list.category || "General",
                        tiers: { S: [], A: [], B: [], C: [], D: [], F: [] },
                        likes: 0
                    };
                }
            }));

            setAllTierLists(processedLists.filter(list => !list.weeklyParent));
            filterTierLists(processedLists, selectedCategory);
        } catch (err) {
            console.error("Error fetching tier lists:", err);
            setError("Failed to load tier lists. Please try again later.");
            setAllTierLists([]);
            setFilteredTierLists([]);
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


    const calculateAverageRating = (ratings) => {
        if (ratings.length === 0) return "F";

        const ratingValues = {
            'S': 6,
            'A': 5,
            'B': 4,
            'C': 3,
            'D': 2,
            'F': 1
        };

        const sum = ratings.reduce((total, rating) => total + ratingValues[rating.ranking], 0);
        const average = sum / ratings.length;

        if (average >= 5.5) return "S";
        if (average >= 4.5) return "A";
        if (average >= 3.5) return "B";
        if (average >= 2.5) return "C";
        if (average >= 1.5) return "D";
        return "F";
    };

    const handleSignOut = () => {
        localStorage.removeItem("isSignedIn");
        localStorage.removeItem("username");
        setSignedIn(false);
        setUsername("Guest");
        window.location.reload();
    };

    const updatePg = () => {
        fetchTierLists();
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
                        <button onClick={() => navigate("/tier")} className="btn">Go to TierList</button>
                        <button onClick={() => navigate("/edit")} className="btn">Edit Account</button>
                    </>
                ) : (
                    <>
                        <button onClick={() => navigate("/login")} className="btn">Sign In</button>
                        <button onClick={() => navigate("/SignUp")} className="btn">Create Account</button>
                    </>
                )}
            </div>
            {isSignedIn && (
                <button
                    className="btn"
                    onClick={() =>
                        navigate("/weekly/submit", {
                            state: {
                                weeklyListId: weeklyTierList?.id,
                                weeklyListTitle: weeklyTierList?.title || "Weekly Tier List"
                            }
                        })
                    }
                >
                    Weekly Tier List
                </button>
            )}
            <h2>Tier Lists of the Week</h2>
            {isSignedIn && (
                <button onClick={() => setShowModal(true)} className="btn">My Tier List</button>
            )}
            <div className="category-selector">
                <p>Category: {selectedCategory}</p>
                <Dropdown options={categories} onSelect={handleCategorySelect} />
            </div>
            {isLoading ? (
                <p>Loading tier lists...</p>
            ) : error ? (
                <div>
                    <p className="error-message">{error}</p>
                    <button onClick={fetchTierLists} className="btn">Retry</button>
                </div>
            ) : (
                <div className="tier-list-wrapper">
                    {filteredTierLists.length > 0 ? filteredTierLists.map((tierList) => (
                        <TierListDisplay
                            key={tierList.id}
                            tierList={tierList}
                            isOwner={tierList.creator?.userId === localStorage.getItem("userId")}
                        />
                    )) : (
                        <p>No tier lists available for the {selectedCategory} category.</p>
                    )}
                </div>
            )}

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>{username}'s Tier Lists</h2>
                        <div className="category-selector">
                            <p>Filter by Category: {selectedCategory}</p>
                            <Dropdown options={categories} onSelect={handleCategorySelect} />
                        </div>
                        {isSignedIn && username !== "Guest" ? (
                            filteredUserTierLists.length > 0 ? (
                                <div className="user-tier-lists">
                                    {filteredUserTierLists.map(tierList => (
                                        <TierListDisplay
                                            key={tierList.id}
                                            tierList={tierList}
                                            isOwner={true}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <p className={"error_notl"}>
                                    {selectedCategory === "General"
                                        ? "You haven't created any tier lists yet."
                                        : `You haven't created any tier lists in the ${selectedCategory} category yet.`}
                                </p>
                            )
                        ) : (
                            <p>Please sign in to view your tier lists.</p>
                        )}
                        <div className="btn-group">
                            <button className="close-btn" onClick={() => {
                                fetchUserTierLists().then(lists => {
                                    setUserTierLists(lists);
                                    filterUserTierLists(lists, selectedCategory);
                                });
                            }}>Refresh</button>
                            <button className="close-btn" onClick={() => setShowModal(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function TierListDisplay({ tierList, isOwner }) {
    const navigate = useNavigate();

    const handleEdit = () => {
        console.log({ tierList });
        navigate(`/edit_tierlist/${tierList.id}`);
    };

    return (
        <div className="tier-list-container">
            <h2>{tierList.name}</h2>
            <p>Category: {tierList.category || "General"}</p>
            <div className="tier-box">
                {Object.keys(tierList.tiers).map((tier) => (
                    <div key={tier} className={`tier ${tier.toLowerCase()}`}>
                        <h3>{tier} Tier</h3>
                        <div className="tier-items">
                            {tierList.tiers[tier].map((item, itemIndex) => (
                                <div key={itemIndex} className="tier-item">
                                    {item.imageUrl && (
                                        <img
                                            src={item.imageUrl.startsWith('data:') ? item.imageUrl : `data:image/jpeg;base64,${item.imageUrl}`}
                                            alt={item.itemName}
                                            className="tier-image"
                                            onError={(e) => {
                                                console.error('Image failed to load for:', item.itemName);
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    )}
                                    <div>{item.itemName}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <div className="tier-actions">
                <h2> ❤️ #{tierList.likes || 0}</h2>
                {isOwner && (
                    <button onClick={handleEdit} className="edit-btn">Edit Tierlist</button>
                )}
            </div>
        </div>
    );
}

export default LandingPg;