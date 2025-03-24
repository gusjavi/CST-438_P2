import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "./firebaseCOnfig";
//import "./styles.css";

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
        <div className="flex items-center justify-center min-h-screen" style={{background: "linear-gradient(to right, rgb(58, 28, 113), rgb(215, 109, 119), rgb(255, 175, 123))"}}>
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
                            <button type="submit" className="btn w-4/5 mx-auto" style={{background: "linear-gradient(to right, #ff8008, #ffc837)", border: "none", color: "white"}} disabled={loading}
                            >
                                {loading ? 'Logging in...' : 'Log in'}
                            </button>
                        </div>
                    </form>



                    <div className="text-center mt-4">
                        <p className="text-sm mb-2">Don't have an account?</p>
                        <button onClick={() => navigate('/signup')} className="btn btn-sm w-2/5 mx-auto" style={{background: "linear-gradient(to right, #ff8008, #ffc837)", border: "none", color: "white"
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