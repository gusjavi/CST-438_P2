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

    function handleChange(e) {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        console.log("Logging in with:", formData.email, formData.password);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;
            console.log("Login Success:", user);

            // Update state & localStorage
            setUsername(user.displayName || formData.email);
            setSignedIn(true);
            localStorage.setItem("username", user.displayName || formData.email);
            localStorage.setItem("isSignedIn", "true");

            navigate("/"); // Redirect to landing page
        } catch (error) {
            console.error("Login Error:", error.code, error.message);
            setError(error.message);
        }
    }

    // Google Sign-In Function
    async function handleGoogleLogin() {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            console.log("Google Login Success:", user);

            // Update state & localStorage
            setUsername(user.displayName || "Guest");
            setSignedIn(true);
            localStorage.setItem("username", user.displayName || "Guest");
            localStorage.setItem("isSignedIn", "true");

            alert(`Welcome ${user.displayName || "Guest"}!`);
            navigate("/");
        } catch (error) {
            console.error("Google login failed:", error.message);
            setError("Google login failed: " + error.message);
        }
    }

    return (
        <div className="container1">
            <h2>Log in</h2>
            <form onSubmit={handleSubmit} className="form">
                <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="input" />

                <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required className="input" />

                {error && <p className="error">{error}</p>}
                <button type="submit" className="btn">Log in</button>
            </form>

            {/* Google Sign-In Button */}
            <button onClick={handleGoogleLogin} className="btn google-btn">
                Sign in with Google
            </button>

            <p>
                Don't have an account? <span className="link" onClick={() => navigate("/signup")}>Sign up</span>
            </p>
        </div>
    );
}

export default LoginPage;
