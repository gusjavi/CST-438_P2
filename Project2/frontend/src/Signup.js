import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles.css";

function SignupPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: "", email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    function handleChange(e) {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    function validatePassword(password) {
        const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
        return regex.test(password);
    }

    async function handleSubmit(e) {
        e.preventDefault();

        if (!validatePassword(formData.password)) {
            setError("Password must be at least 6 characters and include a letter, number, and special character.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            // Call our backend signup API endpoint
            const response = await fetch("http://localhost:8080/api/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password
                })
            });

            const data = await response.json();

            if (data.success) {
                alert("Account created successfully!");
                navigate("/login"); // Redirect to login page
            } else {
                setError(data.error || "Signup failed. Please try again with a different email.");
            }
        } catch (error) {
            console.error("Signup Error:", error);
            setError("Server error. Please try again later.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="container1">
            <h2>Create Account</h2>
            <form onSubmit={handleSubmit} className="form">
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="input"
                    disabled={loading}
                />

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="input"
                    disabled={loading}
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="input"
                    disabled={loading}
                />

                {error && <p className="error">{error}</p>}
                <button type="submit" className="btn" disabled={loading}>
                    {loading ? "Creating Account..." : "Sign Up"}
                </button>
            </form>

            <p>
                Already have an account? <span className="link" onClick={() => navigate("/login")}>Log in</span>
            </p>
        </div>
    );
}

export default SignupPage;