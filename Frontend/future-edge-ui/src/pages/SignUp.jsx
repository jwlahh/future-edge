import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "../supabaseClient";
import "../styles/signup.css";

function SignUp() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const handleSignup = async () => {

  if (password !== confirmPassword) {
    alert("Passwords do not match");
    return;
  }

  const { error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) {
    alert(error.message);
    return;
  }

  alert("Signup successful! Please verify your email.");
  navigate("/");
};

  return (
    <div className="signup-page">

      <h1 className="logo">Future Edge</h1>
      <p className="subtitle">AI Career Intelligence Platform</p>

      <h1 className="signup-title">Create Account</h1>

      <div className="signup-container">

        <div className="signup-form">

          <input
            type="email"
            placeholder="Email"
            className="input-field"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="input-field"
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            className="input-field"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button className="signup-btn" onClick={handleSignup}>
            Sign up
          </button>

        </div>

        </div>

    </div>
  );
}

export default SignUp; 