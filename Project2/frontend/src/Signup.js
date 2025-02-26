import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles.css";

function SignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    alert("Account created successfully! Redirecting to login...");
    navigate("/login");  // 
  }

  return (
    <div className="container1">
      <h2>Create Account</h2>
      <form onSubmit={handleSubmit} className="form">
        <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required className="input" />
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="input" />
        <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required className="input" />
        <button type="submit" className="btn">Sign Up</button>
      </form>
      <p>
        Already have an account? <span className="link" onClick={() => navigate("/login")}>Log in</span>  {/* */}
      </p>
    </div>
  );
}

export default SignupPage;
