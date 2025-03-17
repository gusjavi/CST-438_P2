import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
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

    async function handleGoogleLogin() {
        setLoading(true);
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup( provider);
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
                if (displayName) {
                    localStorage.setItem("username", displayName);
                } else if (data.username) {
                    localStorage.setItem("username", data.username);
                } else {
                    localStorage.setItem("username", "User");
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