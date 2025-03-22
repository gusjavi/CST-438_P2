import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
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
        setLoading(true);

        if (!validatePassword(formData.password)) {
            setError("Password must be at least 6 characters and include a special character.");
            setLoading(false);
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(formData.email, formData.password);
            const user = userCredential.user;
            console.log("Created user", formData);
            console.log("user", user.uid);
            const uid = user.uid;
            await updateProfile(user, { displayName: formData.username });
            const idToken = await user.getIdToken();
            console.log("Created ", idToken);
            const response = await fetch('http://localhost:8080/api/auth/save-user', {
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
        <div className="flex items-center justify-center min-h-screen"
             style={{background: "linear-gradient(to right, rgb(58, 28, 113), rgb(215, 109, 119), rgb(255, 175, 123))"}}>
            <div className="card w-full max-w-sm bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="text-2xl font-bold text-center mb-4">Sign Up</h2>

                    {error && (
                        <div className="alert alert-error mb-4">
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Username</span>
                            </label>
                            <input
                                type="text"
                                name="username"
                                placeholder="Username"
                                className="input input-bordered w-full"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
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
                            <button
                                type="submit"
                                className="btn w-4/5 mx-auto"
                                style={{
                                    background: "linear-gradient(to right, #ff8008, #ffc837)",
                                    border: "none",
                                    color: "white"
                                }}
                                disabled={loading}
                            >
                                {loading ? 'Creating Account...' : 'Sign Up'}
                            </button>
                        </div>
                    </form>

                    <div className="text-center mt-4">
                        <p className="text-sm mb-2">Already have an account?</p>
                        <button
                            onClick={() => navigate('/login')}
                            className="btn btn-sm w-2/5 mx-auto"
                            style={{
                                background: "linear-gradient(to right, #ff8008, #ffc837)",
                                border: "none",
                                color: "white"
                            }}
                        >
                            Log in
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignupPage;