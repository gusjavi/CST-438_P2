import React from "react";
import { useNavigate } from "react-router-dom";
import "./styles.css";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="container1">
      <h1>Welcome to the App</h1>
      <button onClick={() => navigate("/login")} className="btn">
        Go to Login
      </button>
    </div>
  );
}

export default Home;
