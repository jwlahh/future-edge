import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "../supabaseClient";
import "../styles/login.css";

function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {

    setErrorMsg("");

    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      setErrorMsg("Invalid email or password");
    } else {
      navigate("/dashboard");
    }

  };

  // clear old data
  localStorage.removeItem("resume_skills");
  localStorage.removeItem("resume_careers");
  localStorage.removeItem("resume_score");

  return (
    <div className="login-container">

      <div className="login-box">

        <h1 className="logo">Future Edge</h1>
        <p className="subtitle">AI Career Intelligence Platform</p>

        {errorMsg && <div className="error-box">{errorMsg}</div>}

        <input
          type="email"
          placeholder="Email"
          className="input-field"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="password-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <span
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "Hide" : "Show"}
          </span>
        </div>

        <button className="login-btn" onClick={handleLogin}>
          Login
        </button>

        <p className="signup-text">
          Don't have an account?{" "}
          <span onClick={() => navigate("/signup")}>
            Sign Up
          </span>
        </p>

      </div>

    </div>
  );
}

export default Login;