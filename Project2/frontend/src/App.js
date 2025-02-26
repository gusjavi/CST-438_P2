import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./Home";
import LoginPage from "./Login";
import SignupPage from "./Signup";  // ✅ Import new Signup page

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />  {/*  */}
    </Routes>
  );
}

export default App;
