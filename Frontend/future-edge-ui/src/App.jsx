import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/login";
import Dashboard from "./pages/Dashboard";
import ResumeAnalysis from "./pages/ResumeAnalysis";
import SkillGap from "./pages/SkillGap";
import SignUp from "./pages/SignUp";
import Profile from "./pages/Profile";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Landing />} />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/analysis" element={<ResumeAnalysis />} />
        <Route path="/skill-gap" element={<SkillGap />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
      
    </BrowserRouter>
  );
}

export default App;