import React, {useState, useEffect, useRef} from "react";
import { useNavigate } from "react-router-dom";
//import "./innerPages.css"; // Keep the original CSS import

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
            <button
                onClick={toggleDropdown}
                className="bg-gray-100 text-black py-1 px-3 rounded border border-gray-300 flex items-center"
            >
                {options[0]} <span className="ml-2">▼</span>
            </button>
            {isOpen && (
                <ul className="dropdown-menu absolute bg-white shadow-lg border border-gray-300 rounded-md mt-1 z-10 w-40 max-h-48 overflow-y-auto">
                    {options.map((option) => (
                        <li
                            key={option}
                            onClick={() => handleOptionClick(option)}
                            className="p-2 hover:bg-gray-100 cursor-pointer text-black flex items-center"
                        >
                            <span className="text-orange-500 mr-2">•</span> {option}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

function TierListDisplay({ tierList, isOwner }) {
    const navigate = useNavigate();

    const getTierColor = (tier) => {
        const bgColors = {
            "S": "bg-pink-200",
            "A": "bg-orange-200",
            "B": "bg-yellow-100",
            "C": "bg-green-100",
            "D": "bg-blue-200",
            "F": "bg-red-200"
        };
        return bgColors[tier] || "bg-gray-200";
    };

    const handleEdit = () => {
        navigate(`/edit_tierlist/${tierList.id}`);
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <h3 className="text-xl font-bold p-4 text-center">{tierList.name}</h3>

            {/* Sort tiers to ensure they display in the right order */}
            {["S", "A", "B", "C", "D", "F"]
                .filter(tier => Object.keys(tierList.tiers).includes(tier))
                .map((tier) => (
                    <div key={tier} className={`${getTierColor(tier)} mb-px`}>
                        <div className="flex p-2">
                            <div className="font-bold w-8 text-center">{tier}</div>
                            <div className="flex flex-wrap flex-1 gap-2 pl-4">
                                {tierList.tiers[tier] && tierList.tiers[tier].length > 0 ? (
                                    tierList.tiers[tier].map((item, index) => (
                                        <div key={index} className="bg-gray-50 rounded w-24 text-center overflow-hidden">
                                            {item.imageUrl ? (
                                                <img
                                                    src={item.imageUrl.startsWith('data:') ? item.imageUrl : `data:image/jpeg;base64,${item.imageUrl}`}
                                                    alt={item.itemName}
                                                    className="w-full h-20 object-cover"
                                                    onError={(e) => {
                                                        e.target.src = `https://via.placeholder.com/100x80?text=${encodeURIComponent(item.itemName.charAt(0))}`;
                                                    }}
                                                />
                                            ) : (
                                                <div className="h-20 bg-gray-100 flex items-center justify-center text-2xl">
                                                    {item.itemName.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div className="p-1 bg-gray-200 text-sm">{item.itemName}</div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-gray-500 italic p-2">
                                        No items in this tier
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))
            }

            <div className="flex justify-between items-center p-4">
                <div className="text-lg">❤️ #{tierList.likes || 0}</div>

                {isOwner && (
                    <button
                        onClick={handleEdit}
                        className="bg-orange-500 text-white py-1 px-4 rounded hover:bg-orange-600"
                    >
                        Edit Tierlist
                    </button>
                )}
            </div>
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

    // Define the gradient background as in your original code
    const gradientBackground = {
        background: "linear-gradient(to right, rgb(58, 28, 113), rgb(215, 109, 119), rgb(255, 175, 123))"
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
        if (category === "General") {
            setFilteredTierLists(lists);
        } else {
            setFilteredTierLists(lists.filter(list => list.category === category));
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

            setAllTierLists(processedLists);
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
        <div className="min-h-screen" style={gradientBackground}>
            <div className="container mx-auto px-4 py-8">
                <div className="text-center mb-8 relative">
                    <h1 className="text-4xl font-bold text-white mb-4">Welcome {username}</h1>
                    {isSignedIn && (
                        <button
                            onClick={handleSignOut}
                            className="absolute top-0 right-0 bg-orange-500 text-white py-1 px-4 rounded hover:bg-orange-600"
                        >
                            Sign Out
                        </button>
                    )}
                </div>

                <div className="flex justify-center gap-4 mb-8">
                    {isSignedIn ? (
                        <>
                            <button
                                onClick={() => navigate("/tier")}
                                className="bg-orange-500 text-white py-1 px-4 rounded hover:bg-orange-600"
                            >
                                Go to TierList
                            </button>
                            <button
                                onClick={() => navigate("/edit")}
                                className="bg-orange-500 text-white py-1 px-4 rounded hover:bg-orange-600"
                            >
                                Edit Account
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => navigate("/login")}
                                className="bg-orange-500 text-white py-1 px-4 rounded hover:bg-orange-600"
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => navigate("/SignUp")}
                                className="bg-orange-500 text-white py-1 px-4 rounded hover:bg-orange-600"
                            >
                                Create Account
                            </button>
                        </>
                    )}
                </div>

                <h2 className="text-2xl font-bold text-white text-center mb-6">Tier Lists of the Week</h2>

                {isSignedIn && (
                    <div className="flex justify-end mb-6">
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-orange-500 text-white py-1 px-4 rounded hover:bg-orange-600"
                        >
                            My Tier List
                        </button>
                    </div>
                )}

                <div className="flex items-center mb-6">
                    <span className="text-white mr-2">Category:</span>
                    <Dropdown options={categories} onSelect={handleCategorySelect} />
                </div>

                {isLoading ? (
                    <p className="text-white text-center text-xl">Loading tier lists...</p>
                ) : error ? (
                    <div className="bg-white p-6 rounded-lg text-center">
                        <p className="text-red-600 mb-2">Failed to load your tier lists. Please try again later.</p>
                        <button
                            onClick={fetchTierLists}
                            className="bg-orange-500 text-white py-1 px-4 rounded hover:bg-orange-600"
                        >
                            Retry
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredTierLists.length > 0 ? filteredTierLists.map((tierList) => (
                            <TierListDisplay
                                key={tierList.id}
                                tierList={tierList}
                                isOwner={tierList.creator?.userId === localStorage.getItem("userId")}
                            />
                        )) : (
                            <p className="text-white text-center text-xl col-span-2">
                                No tier lists available for the {selectedCategory} category.
                            </p>
                        )}
                    </div>
                )}

                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-auto">
                            <h2 className="text-2xl font-bold mb-4 text-center">{username}'s Tier Lists</h2>

                            <div className="mb-4">
                                <p className="mb-2">Filter by Category: <span className="font-semibold">{selectedCategory}</span></p>
                                <Dropdown options={categories} onSelect={handleCategorySelect} />
                            </div>

                            {isSignedIn && username !== "Guest" ? (
                                filteredUserTierLists.length > 0 ? (
                                    <div className="space-y-4">
                                        {filteredUserTierLists.map(tierList => (
                                            <TierListDisplay
                                                key={tierList.id}
                                                tierList={tierList}
                                                isOwner={true}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-red-500 text-center py-4">
                                        {selectedCategory === "General"
                                            ? "You haven't created any tier lists yet."
                                            : `You haven't created any tier lists in the ${selectedCategory} category yet.`}
                                    </p>
                                )
                            ) : (
                                <p className="text-center py-4">Please sign in to view your tier lists.</p>
                            )}

                            <div className="flex justify-between mt-6">
                                <button
                                    className="bg-orange-500 text-white py-1 px-4 rounded hover:bg-orange-600"
                                    onClick={() => {
                                        fetchUserTierLists().then(lists => {
                                            setUserTierLists(lists);
                                            filterUserTierLists(lists, selectedCategory);
                                        });
                                    }}
                                >
                                    Refresh
                                </button>
                                <button
                                    className="bg-orange-500 text-white py-1 px-4 rounded hover:bg-orange-600"
                                    onClick={() => setShowModal(false)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default LandingPg;