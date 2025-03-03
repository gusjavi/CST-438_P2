import React, {useState} from "react";
import { useNavigate } from "react-router-dom";
import "./innerPages.css";

function EditPg() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ username: "", password: "" });
    const [error, setError] = useState("");

    function handleChange(e) {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    function handleSubmit(e) {
        e.preventDefault();
        navigate("/landing");
    }
     function deleteAccount(){
         {/*waiting for db*/}
     }
    function deleteInfo(){
        {/*waiting for db*/}
    }


    return (
        <div>
            <h1>Welcome to the Edit</h1>

            <div className="container">
                <button onClick={() => navigate("/landing")} className="btn">
                    Go to Home
                </button>
                <button onClick={() => navigate("/tier")} className="btn">
                    Go to Tier
                </button>
            </div>
            <div className="container2">
            <form onSubmit={handleSubmit} className="form">
                <input type="text" name="username" placeholder="Username or Email" value={formData.username} onChange={handleChange} required className="input" />
                <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required className="input" />
                {error && <p className="error">{error}</p>}
                <button type="submit" className="btn">Update Profile</button>
            </form> {/* can pull the username and password here*/}
            </div>
            <div className="container3">
                <button onClick={() => deleteAccount()} className="btn">
                    Delete Profile
                </button>
                <button onClick={() => deleteInfo()} className="btn">
                    Delete Info
                </button>
            </div>
        </div>

    );
}

export default EditPg;
