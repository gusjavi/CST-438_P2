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

    // Function to fetch user ID by username
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

        try {
            const response = await fetch("http://localhost:8080/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                })
            });
            const data = await response.json();

            if (data.success) {
                console.log("Login Successful", data);
                localStorage.setItem("authToken", data.data);
                localStorage.setItem("isSignedIn", "true");

                let userDisplayName = data.username || "User";
                localStorage.setItem("username", userDisplayName);

                // Fetch and store user ID if we have a username
                if (userDisplayName) {
                    const userId = await fetchUserIdByUsername(userDisplayName);
                    if (userId) {
                        localStorage.setItem("userId", userId);
                        console.log("User ID stored:", userId);
                    }
                }

                alert("Login successful!");

                // Redirect based on user role
                const userRole = data.role || "USER"; // Default role if not provided
                if (userRole === "ADMIN") {
                    navigate("/admin-dashboard"); // Redirect admins
                } else {
                    navigate("/tier"); // Redirect normal users
                }
            } else {
                setError(data.error || "Login failed. Check your credentials.");
            }
        } catch (err) {
            console.error("Login Error:", err);
            setError("Server error. Please try again later.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="container1">
            <h2>Log in</h2>
            <form onSubmit={handleSubmit} className="form">
                <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="input" />

                <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required className="input" />

                {error && <p className="error">{error}</p>}
                <button type="submit" className="btn" disabled={loading}>
                    {loading ? "Logging in..." : "Log in"}
                </button>
            </form>

            <p>
                Don't have an account? <span className="link" onClick={() => navigate("/signup")}>Sign up</span>
            </p>
        </div>
    );
}

export default LoginPage;
