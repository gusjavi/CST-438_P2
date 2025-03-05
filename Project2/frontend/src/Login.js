import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "./firebaseConfig";
import "./styles.css";

function LoginPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: "", password: "" });

    const [error, setError] = useState("");

    function handleChange(e) {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    function handleSubmit(e) {
        e.preventDefault();
        console.log("Logging in with:", formData.email, formData.password);
        signInWithEmailAndPassword(auth, formData.email, formData.password)
            .then(() => navigate("/landing"))
            .catch((error) => {
                console.error("Login Error: ", error.code, error.message);
                setError(error.message);
            });
    }



    //  Google Sign-In Function
    async function handleGoogleLogin() {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            console.log("Google Login Success:", result.user);
            alert(`Welcome ${result.user.displayName}!`);
            navigate("/landing"); //  Redirect to landing page
        } catch (error) {
            console.error("Google login failed:", error.message);
            setError("Google login failed: " + error.message);
        }
    }

    return (
        <div className="container1">
            <h2>Log in</h2>
            <form onSubmit={handleSubmit} className="form">
                <input type="text" name="email" placeholder="Username or Email" value={formData.email} onChange={handleChange} required className="input" />

                <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required className="input" />
                {error && <p className="error">{error}</p>}
                <button type="submit" className="btn">Log in</button>
            </form>

            {/*  Google Sign-In Button */}
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
