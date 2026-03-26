import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/login";
import Dashboard from "./pages/Dashboard";
import ResumeAnalysis from "./pages/ResumeAnalysis";
import SkillGap from "./pages/SkillGap";
import SignUp from "./pages/SignUp";
import Profile from "./pages/Profile";
import MockTest from "./pages/MockTest";
import MockInterview from "./pages/MockInterview";


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
        <Route path="/assessment/mock-test" element={<MockTest />} />
        <Route path="/assessment/mock-interview" element={<MockInterview />} />

      </Routes>
      
    </BrowserRouter>
  );
}

export default App;