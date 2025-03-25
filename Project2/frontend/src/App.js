import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginPage from "./Login";
import SignupPage from "./Signup";
import LandingPg from "./LandingPg";
import TierListPg from "./TierListPg";
import EditPg from "./EditPg";
import ProtectedRoute from "./ProtectedRoute";
import EditTierlist from "./edit_tierlist";
import LikedTierLists from './likedtierlists';
import WeeklySubmissionPg from "./WeeklySubmissionPg";
function App() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/" element={<LandingPg />} />
            <Route path="/tier" element={<ProtectedRoute element={<TierListPg />} />} />
            <Route path="/weekly/submit"  element={<ProtectedRoute element={<WeeklySubmissionPg />} />} />
            <Route path="/edit" element={<ProtectedRoute element={<EditPg />} />} />
            <Route path="/edit_tierlist/:id" element={<ProtectedRoute element={<EditTierlist />}/>}/>
            <Route path="/liked-lists" element={<ProtectedRoute element={<LikedTierLists />}/>} />
            <Route path="*" element={<h1>404 - Page Not Found</h1>} />
        </Routes>
    );
}
export default App;