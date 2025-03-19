import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "./firebaseCOnfig";
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

                let userDisplayName;

                if (data.username) {
                    userDisplayName = data.username;
                    localStorage.setItem("username", data.username);
                } else {
                    try {
                        const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
                        const displayName = userCredential.user.displayName;
                        console.log(userCredential);
                        if (displayName) {
                            userDisplayName = displayName;
                            localStorage.setItem("username", displayName);
                        }
                    } catch (firebaseError) {
                        console.warn("Couldn't get username from Firebase:", firebaseError);
                    }
                }

                // Fetch and store user ID if we have a username
                if (userDisplayName) {
                    const userId = await fetchUserIdByUsername(userDisplayName);
                    if (userId) {
                        localStorage.setItem("userId", userId);
                        console.log("User ID stored:", userId);
                    }
                }

                alert("Login successful!");
                navigate("/");
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

    // Google Sign-In Function
    async function handleGoogleLogin() {
        setLoading(true);
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);

            const idToken = await result.user.getIdToken();
            const displayName = result.user.displayName;
            const res = await fetch("http://localhost:8080/api/auth/google-verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: idToken })
            });
            const data = await res.json();

            if (data.success) {
                localStorage.setItem("authToken", data.data);
                localStorage.setItem("isSignedIn", "true");

                let userDisplayName;

                if (displayName) {
                    userDisplayName = displayName;
                    localStorage.setItem("username", displayName);
                } else if (data.username) {
                    userDisplayName = data.username;
                    localStorage.setItem("username", data.username);
                } else {
                    userDisplayName = "User";
                    localStorage.setItem("username", "User");
                }

                // Fetch and store user ID
                if (userDisplayName) {
                    const userId = await fetchUserIdByUsername(userDisplayName);
                    if (userId) {
                        localStorage.setItem("userId", userId);
                        console.log("User ID stored:", userId);
                    }
                }

                alert("Google login successful!");
                navigate("/");
            } else {
                setError(data.error || "Google sign-in failed on server side.");
            }
        } catch (err) {
            console.error("Google login error:", err);
            setError("Failed to sign in with Google. Please try again.");
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

            <button onClick={handleGoogleLogin} className="btn google-btn" disabled={loading}>
                {loading ? "Processing..." : "Sign in with Google"}
            </button>

            <p>
                Don't have an account? <span className="link" onClick={() => navigate("/signup")}>Sign up</span>
            </p>
        </div>
    );
}

export default LoginPage;