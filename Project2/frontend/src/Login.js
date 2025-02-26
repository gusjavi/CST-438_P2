import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles.css";

function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  function handleSignup() {
    navigate("/signup");  // 
  }

  function handleSubmit(e) {
    e.preventDefault();
    alert("Login successful! (Redirect to dashboard when backend is ready)");
  }

  return (
    <div className="container">
      <h2>Log in</h2>
      <form onSubmit={handleSubmit} className="form">
        <input type="text" name="username" placeholder="Username or Email" value={formData.username} onChange={handleChange} required className="input" />
        <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required className="input" />
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn">Log in</button>
      </form>
      <p>
        Don't have an account? <span className="link" onClick={handleSignup}>Sign up</span>  {/* */}
      </p>
    </div>
  );
}

export default LoginPage;
