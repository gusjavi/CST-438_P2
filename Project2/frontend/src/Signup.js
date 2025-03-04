
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, createUserWithEmailAndPassword } from "./firebaseConfig";
import "./styles.css";

function SignupPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: "", email: "", password: "" });
    const [error, setError] = useState("");

    function handleChange(e) {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    function validatePassword(password) {
        const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
        return regex.test(password);
    }

    function handleSubmit(e) {
        e.preventDefault();

        if (!validatePassword(formData.password)) {
            setError("Password must be at least 6 characters and include a special character.");
            return;
        }

        createUserWithEmailAndPassword(auth, formData.email, formData.password)
            .then(() => {
                alert("Account created successfully!");
                navigate("/login");
            })
            .catch((error) => setError(error.message));
    }


    return (
        <div className="container1">
            <h2>Create Account</h2>
            <form onSubmit={handleSubmit} className="form">
                {/*  Username Input Field */}
                <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required className="input" />

                {/*  Email and Password Inputs */}
                <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="input" />
                <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required className="input" />

                {/*  Error Display */}
                {error && <p className="error">{error}</p>}

                <button type="submit" className="btn">Sign Up</button>
            </form>

            <p>Already have an account? <span className="link" onClick={() => navigate("/login")}>Log in</span></p>
        </div>
    );
}

export default SignupPage;
