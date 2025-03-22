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

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");

        try {
            const user = auth.currentUser;

            if (!user) {
                throw new Error("You must be logged in to update your profile");
            }

            const idToken = await user.getIdToken();

            if (!formData.username.trim()) {
                throw new Error("Please enter a new username");
            }

            const response = await fetch(`http://localhost:8080/api/users/${userId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${idToken}`
                },
                body: JSON.stringify({ username: formData.username }) // Ensure correct JSON structure
            });


            if (!response.ok) {
                throw new Error("Failed to update username");
            }

            localStorage.setItem("username", formData.username);
            setUsername(formData.username);
            setFormData({ ...formData, username: "" });
            setMessage("Username updated successfully!");

        } catch (error) {
            console.error("Error updating username:", error);
            setError(error.message || "Failed to update username");
        } finally {
            setLoading(false);
        }
    }

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
            const idToken = await user.getIdToken();
            const response = await fetch(`http://localhost:8080/api/users/${userId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${idToken}`
                }
            });

            if (!response.ok) {
                throw new Error("Failed to delete user from database");
            }

            await deleteUser(user);
            localStorage.removeItem("isSignedIn");
            localStorage.removeItem("username");
            localStorage.removeItem("userId");
            localStorage.removeItem("authToken");

            setUsername("Guest");
            setSignedIn(false);
            setMessage("Account successfully deleted");
            navigate("/");

        } catch (error) {
            console.error("Error deleting account:", error);
            setError(error.message || "Failed to delete account. You may need to re-login.");
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
            </div>
        </div>
    );
}

export default EditPg;