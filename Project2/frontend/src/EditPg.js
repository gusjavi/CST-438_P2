import React, {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import "./innerPages.css";

function EditPg() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const [isSignedIn, setSignedIn] = useState(localStorage.getItem("isSignedIn") === "true");
    const [username, setUsername] = useState(localStorage.getItem("username") || "Guest");

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

    function handleSubmit(e) {
        e.preventDefault();
        navigate("/");
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