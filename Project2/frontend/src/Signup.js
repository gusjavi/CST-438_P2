import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "./firebaseCOnfig";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import "./styles.css";

function SignupPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: "", email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const API_URL = 'http://localhost:8080';


    function handleChange(e) {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    function validatePassword(password) {
        const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
        return regex.test(password);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);

        if (!validatePassword(formData.password)) {
            setError("Password must be at least 6 characters and include a special character.");
            setLoading(false);
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;
            console.log("Created user", formData);
            console.log("user", user.uid);
            const uid = user.uid;
            await updateProfile(user, { displayName: formData.username });
            const idToken = await user.getIdToken();
            console.log("Created ", idToken);
            const response = await fetch(`${API_URL}/api/auth/save-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    uid: uid
                })
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem("username", formData.username);

                alert("Account created successfully!");
                navigate("/login"); // Redirect to login page
            } else {
                throw new Error(data.error || "Failed to create account in database");
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="container1">
            <h2>Create Account</h2>
            <form onSubmit={handleSubmit} className="form">
                <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required className="input" />

                <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="input" />
                <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required className="input" />
                {error && <p className="error">{error}</p>}

                <button type="submit" className="btn" disabled={loading}>
                    {loading ? "Creating Account..." : "Sign Up"}
                </button>
            </form>

            <p>Already have an account? <span className="link" onClick={() => navigate("/login")}>Log in</span></p>
        </div>
    );
}

export default SignupPage;