import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles.css";

function LoginPage() {
    const navigate = useNavigate();
    const [isSignedIn, setSignedIn] = useState(localStorage.getItem("isSignedIn") === "true");
    const [username, setUsername] = useState(localStorage.getItem("username") || "Guest");
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function fetchUserIdByUsername(username) {
        try {
            const response = await fetch(`http://localhost:8080/api/users/by-name/${username}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });

            if (response.ok) {
                const data = await response.json();
                return data.userId;
            } else {
                console.warn("Could not fetch user ID for username:", username);

                alert("User not found!");
                navigate("/signup");

                return null;
            }
        } catch (err) {
            console.error("Error fetching user ID:", err);
            return null;
        }
    }
    async function fetchUserIdByEmail(email) {
        try {
            const response = await fetch(`http://localhost:8080/api/users/by-email/${email}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });

            if (response.ok) {
                const data = await response.json();
                return data.userId;
            } else {
                console.warn("Could not fetch user ID for gmail:", email);

                alert("User not found!");
                navigate("/signup");
                return null;
            }
        } catch (err) {
            console.error("Error fetching user ID:", err);
            return null;
        }
    }
    async function fetchUserNameById(id) {
        try {
            const response = await fetch(`http://localhost:8080/api/users/${id}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });

            if (response.ok) {
                const data = await response.json();
                console.log(data);
                return data.name;
            } else {
                console.warn("Could not fetch user ID for gmail:", id);

                alert("User not found!");
                navigate("/signup");
                return null;
            }
        } catch (err) {
            console.error("Error fetching user ID:", err);
            return null;
        }
    }
    function handleChange(e) {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        console.log("Logging in with:", formData.email, formData.password);
        setLoading(true);
        setError(""); // Clear previous errors

        try {
            const response = await fetch("http://localhost:8080/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                })
            });

            // Log the raw response for debugging
            console.log("Response status:", response.status);

            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }

            const data = await response.json();
            console.log("Response data:", data);

            // Match the response structure from AuthResponse in your Java code
            if (data.success) {
                // Store the token - in your Java code it's the second parameter of AuthResponse
                localStorage.setItem("authToken", data.token);
                localStorage.setItem("isSignedIn", "true");

                if (data.username) {
                    localStorage.setItem("username", data.username);


                // Fetch and store user ID if we have a username
                if (userDisplayName) {
                    let userId = await fetchUserIdByUsername(userDisplayName);
                    if(!userId){
                         userId = await fetchUserIdByEmail(formData.email);
                    }
                    if (userId) {
                        localStorage.setItem("userId", userId);
                        console.log("User ID stored:", userId);
                        const username2 = await fetchUserNameById(userId);
                        localStorage.setItem("username", username2);
                    }else{
                        alert("Login Failed!");
                        navigate("/signup");
                        return null;

                    }
                }

                alert("Login successful!");
                navigate("/");
            } else {
                // Error message is the third parameter in your AuthResponse
                setError(data.error || "Login failed. Check your credentials.");
            }
        } catch (err) {
            console.error("Login Error:", err);
            if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
                setError("Cannot connect to server. Is the backend running?");
            } else {
                setError("Server error: " + err.message);
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen"
             style={{background: "linear-gradient(to right, rgb(58, 28, 113), rgb(215, 109, 119), rgb(255, 175, 123))"}}>
            <div className="card w-full max-w-sm bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="text-2xl font-bold text-center mb-4">Login</h2>

                    {error && (
                        <div className="alert alert-error mb-4">
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Email address</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email address"
                                className="input input-bordered w-full"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Password</span>
                            </label>
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                className="input input-bordered w-full"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-control mt-6">
                            <button
                                type="submit"
                                className="btn w-4/5 mx-auto"
                                style={{
                                    background: "linear-gradient(to right, #ff8008, #ffc837)",
                                    border: "none",
                                    color: "white"
                                }}
                                disabled={loading}
                            >
                                {loading ? 'Logging in...' : 'Log in'}
                            </button>
                        </div>
                    </form>

                    <div className="text-center mt-4">
                        <p className="text-sm mb-2">Don't have an account?</p>
                        <button
                            onClick={() => navigate('/signup')}
                            className="btn btn-sm w-2/5 mx-auto"
                            style={{
                                background: "linear-gradient(to right, #ff8008, #ffc837)",
                                border: "none",
                                color: "white"
                            }}
                        >
                            Sign up
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;