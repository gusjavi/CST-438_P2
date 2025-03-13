import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles.css";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "./FirebaseConfig";




function LoginPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);


    function handleChange(e) {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setError("");

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
                localStorage.setItem("authToken", data.data);
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
        setError("");

        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            // On success, get the ID token from Firebase
            const idToken = await result.user.getIdToken();

            // Send that ID token to your backend for verification
            const res = await fetch("http://localhost:8080/api/auth/google-verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: idToken })
            });
            const data = await res.json();

            if (data.success) {
                localStorage.setItem("authToken", data.data);
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
            <h2>Login</h2>

            {/* Apply the "form" class to match your CSS */}
            <form onSubmit={handleSubmit} className="form">
                {/* Each input uses className="input" */}
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    className="input"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    className="input"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                    required
                />

                {/* Error message */}
                {error && <p className="error">{error}</p>}

                {/* Button uses className="btn" */}
                <button type="submit" disabled={loading} className="btn">
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>

            <hr />

            {/*  Google Sign-In Button */}
            <button onClick={handleGoogleLogin} className="btn google-btn">
                Sign in with Google
            </button>

            <p>
                Don't have an account?{" "}
                <span className="link" onClick={() => navigate("/signup")}>
          Sign Up
        </span>
            </p>
        </div>
    );
}

export default LoginPage;
