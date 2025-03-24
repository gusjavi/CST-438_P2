import React, {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import "./innerPages.css";
import { auth } from "./firebaseCOnfig";
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

    const primaryButtonStyle = {
        background: "linear-gradient(to right, #ff8008, #ffc837)",
        border: "none",
        color: "white"
    };

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

    function deleteAccount(){
        alert("Feature coming soon: Delete Profile");
    }

    function deleteInfo(){
        alert("Feature coming soon: Delete Info");

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


        <div className="min-h-screen flex flex-col items-center"
             style={{background: "linear-gradient(to right, rgb(58, 28, 113), rgb(215, 109, 119), rgb(255, 175, 123))"}}>
            <div className="w-full max-w-xl px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-white">Edit Account</h1>
                    {isSignedIn && (
                        <button
                            onClick={handleSignOut}
                            className="btn btn-sm"
                            style={primaryButtonStyle}
                        >
                            Sign Out
                        </button>
                    )}
                </div>

                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => navigate("/")}
                        className="btn"
                        style={primaryButtonStyle}
                    >
                        Home
                    </button>
                    <button
                        onClick={() => navigate("/tier")}
                        className="btn"
                        style={primaryButtonStyle}
                    >
                        Go to TierList
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Username or Email</span>
                            </label>
                            <input
                                type="text"
                                name="username"
                                placeholder="Username or Email"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                className="input input-bordered w-full"
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
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="input input-bordered w-full"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-100 text-red-700 p-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn w-full"
                            style={primaryButtonStyle}
                        >
                            Update Profile
                        </button>
                    </form>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex flex-col gap-2">
                        <button
                            onClick={deleteAccount}
                            className="btn w-full"
                            style={primaryButtonStyle}
                        >
                            Delete Profile
                        </button>
                        <button
                            onClick={deleteInfo}
                            className="btn w-full"
                            style={primaryButtonStyle}
                        >
                            Delete Info
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default EditPg;