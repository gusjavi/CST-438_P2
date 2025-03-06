import React, {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import "./innerPages.css";

function EditPg() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const [isSignedIn, setSignedIn] = useState(localStorage.getItem("isSignedIn") === "true");
    const [username, setUsername] = useState(localStorage.getItem("username") || "Guest");

    useEffect(() => {
        localStorage.setItem("isSignedIn", isSignedIn);
    }, [isSignedIn]);

    function handleChange(e) {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    function handleSubmit(e) {
        e.preventDefault();
        navigate("/");
    }
     function deleteAccount(){
         {/*waiting for db*/}
     }
    function deleteInfo(){
        {/*waiting for db*/}
    }
    const handleSignOut = () => {
        localStorage.removeItem("isSignedIn");
        localStorage.removeItem("username");
        setUsername("Guest");
        setSignedIn(false);
        navigate("/");
    };

    return (
        <div className="landing-container">
            <div className="header">
                <h1>Edit Account</h1>
                {isSignedIn && <p onClick={handleSignOut} className="sign-out">Sign Out</p>}
            </div>
            <div className="btn-group">
                <button onClick={() => navigate("/")} className="btn">Home</button>
                <button onClick={() => navigate("/tier")} className="btn">Go to TierList</button>
            </div>
            <div className="container2">
            <form onSubmit={handleSubmit} className="form">
                <input type="text" name="username" placeholder="Username or Email" value={formData.username} onChange={handleChange} required className="input" />
                <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required className="input" />
                {error && <p className="error">{error}</p>}
                <button type="submit" className="btn">Update Profile</button>
            </form> {/* can pull the username and password here*/}
            </div>
            <div className="btn-group">
                <button onClick={() => deleteAccount()} className="btn">Delete Profile</button>
                <button onClick={() => deleteInfo()} className="btn">Delete Info</button>
            </div>
        </div>

    );
}

export default EditPg;
