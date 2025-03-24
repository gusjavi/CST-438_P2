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

    // Add the style objects from the new code
    const gradientBackground = {
        background: "linear-gradient(to right, rgb(58, 28, 113), rgb(215, 109, 119), rgb(255, 175, 123))"
    };

    const primaryButtonStyle = {
        background: "linear-gradient(to right, #ff8008, #ffc837)",
        border: "none",
        color: "white"
    };

    // Keep your original useEffect and fetch logic
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

    // Update your return to use the new styling
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

        <div className="min-h-screen" style={gradientBackground}>
            <div className="container mx-auto px-4 py-8">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-4">Welcome {username}</h1>
                    {isSignedIn &&
                        <p onClick={handleSignOut} className="sign-out" style={{
                            color: "white",
                            cursor: "pointer",
                            position: "absolute",
                            top: "20px",
                            right: "20px",
                            background: primaryButtonStyle.background,
                            padding: "8px 16px",
                            borderRadius: "4px"
                        }}>
                            Sign Out
                        </p>
                    }
                </div>

                <div className="flex justify-center gap-2 mb-6">
                    {isSignedIn ? (
                        <>
                            <button onClick={() => navigate("/tier")} className="btn" style={primaryButtonStyle}>Go to TierList</button>
                            <button onClick={() => navigate("/edit")} className="btn" style={primaryButtonStyle}>Edit Account</button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => navigate("/login")} className="btn" style={primaryButtonStyle}>Sign In</button>
                            <button onClick={() => navigate("/signup")} className="btn" style={primaryButtonStyle}>Create Account</button>
                        </>

                    )}
                </div>


         /*   {showModal && (
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
                         */   <button className="close-btn" onClick={() => setShowModal(false)}>Close</button>

                <h2 className="text-2xl font-bold text-white text-center mb-6">Tier Lists of the Week</h2>

                {isSignedIn && (
                    <div className="text-center mb-6">
                        <button onClick={() => setShowModal(true)} className="btn" style={primaryButtonStyle}>My Tier List</button>
                    </div>
                )}

                {isLoading ? (
                    <p className="text-white text-center">Loading tier lists...</p>
                ) : error ? (
                    <div className="text-center">
                        <p className="text-white mb-2">{error}</p>
                        <button onClick={fetchTierLists} className="btn" style={primaryButtonStyle}>Retry</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {tierLists.length > 0 ? tierLists.map((tierList) => (
                            <TierListDisplay
                                key={tierList.id}
                                tierList={tierList}
                                isOwner={tierList.creator?.userId === localStorage.getItem("userId")}
                            />
                        )) : (
                            <p className="text-white text-center col-span-2">No tier lists available.</p>
                        )}
                    </div>
                )}

                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-xl w-full max-h-[80vh] overflow-auto">
                            <h2 className="text-xl font-bold mb-4 text-center">{username}'s Tier List</h2>
                            {isSignedIn && username !== "Guest" ? (
                                tierLists.find(list => list.creator?.name === username) ? (
                                    <TierListDisplay
                                        tierList={tierLists.find(list => list.creator?.name === username)}
                                        isOwner={true}
                                    />
                                ) : (
                                    <p className="text-red-500 text-center">You haven't created any tier lists yet.</p>
                                )
                            ) : (
                                <TierListDisplay tierList={tierLists[0]} />
                            )}
                            <div className="flex justify-between mt-4">
                                <button className="btn" style={primaryButtonStyle} onClick={() => updatePg()}>Update</button>
                                <button className="btn" style={primaryButtonStyle} onClick={() => setShowModal(false)}>Close</button>
                            </div>

                        </div>
                    </div>
                )}

                {/* Call to action for signed-out users */}
                {!isSignedIn && (
                    <div className="text-center mt-8">
                        <h3 className="text-xl font-bold text-white mb-4">Create your own tier lists!</h3>
                        <button
                            onClick={() => navigate("/signup")}
                            className="btn btn-lg"
                            style={primaryButtonStyle}
                        >
                            Get Started
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}


//function TierListDisplay({ tierList, isOwner }) {
   // const navigate = useNavigate();

   // const handleEdit = () => {
      //  console.log({ tierList });

// Modified TierListDisplay to match the style from the other component
function TierListDisplay({ tierList, isOwner }) {
    const navigate = useNavigate();

    const getTierColor = (tier) => {
        const bgColors = {
            "S": "#ffcdd2", // Light pink for S tier
            "A": "#ffe0b2", // Light orange for A tier
            "B": "#fff9c4", // Light yellow for B tier
            "C": "#dcedc8", // Light green for C tier
            "D": "#bbdefb", // Light blue for D tier
            "F": "#e0e0e0"  // Light gray for F tier
        };
        return bgColors[tier] || "#e0e0e0";
    };

    // Card style for tier list container
    const tierListCardStyle = {
        backgroundColor: "#efecec",
        color: "black",
        borderRadius: "0.5rem",
        padding: "1rem",
        height: "100%"
    };

    // Style for each tier row
    const tierRowStyle = (tier) => {
        return {
            backgroundColor: getTierColor(tier),
            padding: "0.5rem",
            marginBottom: "0.5rem",
            borderRadius: "0.25rem",
            display: "flex",
            alignItems: "center",
            minHeight: "60px"
        };
    };

    // Style for tier items
    const itemStyle = {
        padding: "0.25rem",
        backgroundColor: "#ddcbcb",
        borderRadius: "0.25rem",
        color: "black",
        width: "100px",
        textAlign: "center",
        marginRight: "8px",
        overflow: "hidden"
    };

    const handleEdit = () => {

        navigate(`/edit_tierlist/${tierList.id}`);
    };

    return (

        <div style={tierListCardStyle}>
            <h3 className="text-xl font-bold mb-4 text-center">{tierList.name}</h3>

            {/* Sort tiers to ensure they display in the right order */}
            {["S", "A", "B", "C", "D", "F"]
                .filter(tier => Object.keys(tierList.tiers).includes(tier))
                .map((tier) => (
                    <div key={tier} style={tierRowStyle(tier)}>
                        <div style={{fontWeight: "bold", width: "20px", color: "black"}}>{tier}</div>
                        <div style={{
                            display: "flex",
                            flexWrap: "wrap",
                            flex: 1,
                            marginLeft: "15px",
                            gap: "8px"
                        }}>
                            {tierList.tiers[tier] && tierList.tiers[tier].length > 0 ? (
                                tierList.tiers[tier].map((item, index) => (
                                    <div key={index} style={itemStyle}>
                                        {item.imageUrl ? (
                                            <img
                                                src={item.imageUrl.startsWith('data:') ? item.imageUrl : `data:image/jpeg;base64,${item.imageUrl}`}
                                                alt={item.itemName}
                                                style={{
                                                    width: "100%",
                                                    height: "80px",
                                                    objectFit: "cover"
                                                }}
                                                onError={(e) => {
                                                    e.target.src = `https://via.placeholder.com/100x80?text=${encodeURIComponent(item.itemName.charAt(0))}`;
                                                }}
                                            />
                                        ) : (
                                            <div style={{
                                                height: "80px",
                                                backgroundColor: "#f3eeee",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: "24px"
                                            }}>
                                                {item.itemName.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div style={{padding: "5px"}}>{item.itemName}</div>
                                    </div>
                                ))
                            ) : (
                                <div style={{
                                    color: "#888",
                                    fontStyle: "italic",
                                    padding: "8px"
                                }}>
                                    Drag items here

                                </div>
                            )}
                        </div>
                    </div>
                ))
            }

            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "10px"
            }}>
                <div> ❤️ #{tierList.likes || 0}</div>

                {isOwner && (
                    <button
                        onClick={handleEdit}
                        style={{
                            background: "linear-gradient(to right, #ff8008, #ffc837)",
                            border: "none",
                            color: "white",
                            padding: "5px 10px",
                            borderRadius: "4px",
                            cursor: "pointer"
                        }}
                    >
                        Edit Tierlist
                    </button>
                )}
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