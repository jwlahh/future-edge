import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "../supabaseClient";
import { FaUser, FaEnvelope, FaLock, FaGoogle, FaApple, FaFacebook } from "react-icons/fa";
import "../styles/signup.css";

function SignUp() {

  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  const handleSignup = async () => {

  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
  });

  if (error) {
    alert(error.message);
    return;
  }

  const user = data.user;

  // Insert into users table
  const { error: insertError } = await supabase
    .from("users")
    .insert([
      {
        user_id: user.id,
        email: email,
        first_name: firstName,
        last_name: lastName,
        phone: phone
      }
    ]);

  if (insertError) {
    alert(insertError.message);
  } else {
    alert("Signup successful!");
    navigate("/");
  }

};

  return (
    <div className="signup-page">

      <h1 className="logo">Future Edge</h1>
      <p className="subtitle">AI Career Intelligence Platform</p>

      <h1 className="signup-title">Sign up</h1>

      <p className="signin-link">
        Already have an account?
        <span onClick={() => navigate("/")}> Sign in</span>
      </p>

      <div className="signup-container">

        <div className="signup-form">

          <div className="input-group">
            <FaUser className="input-icon" />
            <input
              type="text"
              placeholder="First Name"
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>

          <div className="input-group">
            <FaUser className="input-icon" />
            <input
              type="text"
              placeholder="Last Name"
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          <div className="input-group">
            <FaEnvelope className="input-icon" />
            <input
              type="email"
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="input-group">
            <input
                type="text"
                placeholder="Phone"
                onChange={(e) => setPhone(e.target.value)}
            />
            </div>

          <div className="input-group">
            <FaLock className="input-icon" />
            <input
              type="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <label className="terms">
            <input type="checkbox" />
            I agree to the <span>terms and conditions</span>
          </label>

          <button className="signup-btn" onClick={handleSignup}>
            Sign up
          </button>

        </div>

        <div className="divider">
          <span>or</span>
        </div>

        <div className="social-login">

          <button className="social-btn">
            <FaGoogle /> Continue with Google
          </button>

          <button className="social-btn">
            <FaApple /> Continue with Apple
          </button>

          <button className="social-btn">
            <FaFacebook /> Continue with Facebook
          </button>

        </div>

      </div>

    </div>
  );
}

export default SignUp;