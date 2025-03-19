import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./innerPages.css";

function LandingPg() {
    const navigate = useNavigate();
    const [isSignedIn, setSignedIn] = useState(localStorage.getItem("isSignedIn") === "true");
    const [username, setUsername] = useState(localStorage.getItem("username") || "Guest");
    const [tierLists, setTierLists] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTierLists();

        const handleStorageChange = () => {
            setSignedIn(localStorage.getItem("isSignedIn") === "true");
            setUsername(localStorage.getItem("username") || "Guest");
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    const fetchTierLists = async () => {
        try {
            setIsLoading(true);
            setError(null); // Clear any previous errors

            console.log("Fetching tier lists...");
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
            console.log("Successfully fetched tier lists:", data);

            // Check if data is an array before processing
            if (!Array.isArray(data)) {
                console.error("Expected an array but received:", data);
                setTierLists([]);
                throw new Error("Invalid data format received from server");
            }

            const processedLists = await Promise.all(data.map(async (list) => {
                try {
                    console.log(`Fetching items for list ${list.id}...`);
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
                            tiers: { S: [], A: [], B: [], C: [], D: [], F: [] },
                            likes: 0
                        };
                    }

                    const items = await itemsResponse.json();

                    console.log(`Fetching ratings for list ${list.id}...`);
                    const ratingsResponse = await fetch(`http://localhost:8080/api/tierlists/${list.id}/ratings`, {
                        credentials: 'include'
                    });

                    if (!ratingsResponse.ok) {
                        console.error(`Error fetching ratings for list ${list.id}: ${ratingsResponse.status}`);
                        return {
                            id: list.id,
                            name: list.title,
                            description: list.description,
                            tiers: organizeTierItems(items, []),
                            likes: 0
                        };
                    }

                    const ratings = await ratingsResponse.json();

                    console.log(`Fetching likes for list ${list.id}...`);
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
                        tiers: tiers,
                        likes: likesCount
                    };
                } catch (err) {
                    console.error(`Error processing list ${list.id}:`, err);
                    return {
                        id: list.id,
                        name: list.title,
                        description: list.description,
                        tiers: { S: [], A: [], B: [], C: [], D: [], F: [] },
                        likes: 0
                    };
                }
            }));

            setTierLists(processedLists);
        } catch (err) {
            console.error("Error fetching tier lists:", err);
            setError("Failed to load tier lists. Please try again later.");
            setTierLists([]); // Set an empty array to avoid further errors
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
            const itemRatings = ratings.filter(rating => rating.tierListItem.id === item.id);

            if (itemRatings.length > 0) {
                const avgRating = calculateAverageRating(itemRatings);
                tiers[avgRating].push(item.itemName);
            } else {
                tiers.F.push(item.itemName);
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
        fetchTierLists(); // Refresh the tier lists
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
            <h2>Tier Lists of the Week</h2>
            {isSignedIn && (
                <button onClick={() => setShowModal(true)} className="btn">My Tier List</button>
            )}

            {isLoading ? (
                <p>Loading tier lists...</p>
            ) : error ? (
                <div>
                    <p className="error-message">{error}</p>
                    <button onClick={fetchTierLists} className="btn">Retry</button>
                </div>
            ) : (
                <div className="tier-list-wrapper">
                    {tierLists.length > 0 ? tierLists.map((tierList) => (
                        <TierListDisplay key={tierList.id} tierList={tierList} />
                    )) : (
                        <p>No tier lists available.</p>
                    )}
                </div>
            )}

            {showModal && tierLists.length > 0 && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>{username}'s Tier List</h2>
                        {isSignedIn && username !== "Guest" ? (
                            // Find the user's tier list if they're signed in
                            tierLists.find(list => list.creator?.name === username) ? (
                                <TierListDisplay tierList={tierLists.find(list => list.creator?.name === username)} />
                            ) : (
                                <p className={"error_notl"}>You haven't created any tier lists yet.</p>
                            )
                        ) : (
                            <TierListDisplay tierList={tierLists[0]} />
                        )}
                        <div className="btn-group">
                            <button className="close-btn" onClick={() => updatePg()}>Update</button>
                            <button className="close-btn" onClick={() => setShowModal(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function TierListDisplay({ tierList }) {
    return (
        <div className="tier-list-container">
            <h2>{tierList.name}</h2>
            <div className="tier-box">
                {Object.keys(tierList.tiers).map((tier) => (
                    <div key={tier} className={`tier ${tier.toLowerCase()}`}>
                        <h3>{tier} Tier</h3>
                        <div className="tier-items">
                            {tierList.tiers[tier].map((item, itemIndex) => (
                                <div key={itemIndex} className="tier-item">
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <h2> ❤️ #{tierList.likes || 0}</h2>
        </div>
    );
}

export default LandingPg;