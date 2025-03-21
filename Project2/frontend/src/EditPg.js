import React, {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import "./innerPages.css";
import { auth } from "./firebaseCOnfig"; // Make sure path is correct
import { deleteUser, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";

function EditPg() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [isSignedIn, setSignedIn] = useState(localStorage.getItem("isSignedIn") === "true");
    const [username, setUsername] = useState(localStorage.getItem("username") || "Guest");
    const [loading, setLoading] = useState(false);
    const userId = localStorage.getItem("userId");

    useEffect(() => {
        localStorage.setItem("isSignedIn", isSignedIn);
    }, [isSignedIn]);

    function handleChange(e) {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    function handleSubmit(e) {
        e.preventDefault();
        // Implement profile update logic here
        setMessage("Profile updated successfully!");
        navigate("/");
    }

    // Delete account function
    async function deleteAccount() {
        if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
            return;
        }

        setLoading(true);
        setError("");

        try {
            const user = auth.currentUser;

            if (!user) {
                throw new Error("You must be logged in to delete your account");
            }

            // Get the auth token for backend requests
            const idToken = await user.getIdToken();

            // Delete user from backend database first
            const response = await fetch(`http://localhost:8080/api/users/${userId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${idToken}`
                }
            });

            if (!response.ok) {
                throw new Error("Failed to delete user from database");
            }

            // Now delete from Firebase Auth
            await deleteUser(user);

            // Clear local storage and update state
            localStorage.removeItem("isSignedIn");
            localStorage.removeItem("username");
            localStorage.removeItem("userId");
            localStorage.removeItem("authToken");

            setUsername("Guest");
            setSignedIn(false);
            setMessage("Account successfully deleted");

            // Redirect to home page
            navigate("/");

        } catch (error) {
            console.error("Error deleting account:", error);
            setError(error.message || "Failed to delete account. You may need to re-login.");
        } finally {
            setLoading(false);
        }
    }

    // Delete user data function
    async function deleteInfo() {
        if (!window.confirm("Are you sure you want to delete all your data? This action cannot be undone.")) {
            return;
        }

        setLoading(true);
        setError("");

        try {
            const user = auth.currentUser;

            if (!user) {
                throw new Error("You must be logged in to delete your data");
            }

            // Get the auth token for backend requests
            const idToken = await user.getIdToken();

            // This endpoint would need to be implemented on your backend
            const response = await fetch(`http://localhost:8080/api/users/${userId}/data`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${idToken}`
                }
            });

            if (!response.ok) {
                throw new Error("Failed to delete user data");
            }

            setMessage("User data successfully deleted");

        } catch (error) {
            console.error("Error deleting user data:", error);
            setError(error.message || "Failed to delete user data");
        } finally {
            setLoading(false);
        }
    }

    const handleSignOut = () => {
        localStorage.removeItem("isSignedIn");
        localStorage.removeItem("username");
        localStorage.removeItem("userId");
        localStorage.removeItem("authToken");
        setUsername("Guest");
        setSignedIn(false);
        navigate("/");
    };

    return (
        <div className="landing-container">
            <div className="header">
                <h1>Edit Account</h1>
                {isSignedIn && <p onClick={handleSignOut} className="sign-out">Sign Out</p>}
            </div>
            <div className="btn-group">
                <button onClick={() => navigate("/")} className="btn">Home</button>
                <button onClick={() => navigate("/tier")} className="btn">Go to TierList</button>
            </div>
            <div className="container2">
                {message && <p className="success-message">{message}</p>}
                {error && <p className="error">{error}</p>}
                <form onSubmit={handleSubmit} className="form">
                    <input type="text" name="username" placeholder={username} value={formData.username} onChange={handleChange} required className="input" />
                    {/*<input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required className="input" />*/}
                    <button type="submit" className="btn" disabled={loading}>
                        {loading ? "Processing..." : "Update Username"}
                    </button>
                </form>
            </div>
            <div className="btn-group">
                <button onClick={deleteAccount} className="btn danger-btn" disabled={loading}>
                    {loading ? "Processing..." : "Delete Account"}
                </button>
                <button onClick={deleteInfo} className="btn warning-btn" disabled={loading}>
                    {loading ? "Processing..." : "Delete My Data"}
                </button>
            </div>
        </div>
    );
}

export default EditPg;