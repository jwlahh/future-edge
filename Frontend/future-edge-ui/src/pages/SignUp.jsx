import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "../supabaseClient";
import { FaGoogle, FaApple, FaFacebook } from "react-icons/fa";
import "../styles/signup.css";

function SignUp() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    console.log("Signup response:", data, error);

    if (error) {
      alert(error.message);
      return;
    }

    if (data?.user) {
      alert("Signup successful! .");
      navigate("/dashboard");
    } else {
      alert("Signup failed. Please try again.");
    }
  };

  return (
    <div className="signup-page">

      <div className="signup-card">

        <h1 className="logo">Future Edge</h1>
        <p className="subtitle">AI Career Intelligence Platform</p>

        <h2 className="signup-title">Create Account</h2>

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

        <button className="signup-btn" onClick={handleSignUp}>
          Sign Up
        </button>

        <div className="divider">OR</div>

        <button className="social-btn">
          <FaGoogle /> Continue with Google
        </button>

        <button className="social-btn">
          <FaApple /> Continue with Apple
        </button>

        <button className="social-btn">
          <FaFacebook /> Continue with Facebook
        </button>

        <p className="signin-link">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")}>Login</span>
        </p>

      </div>

    </div>
  );
}

export default SignUp;