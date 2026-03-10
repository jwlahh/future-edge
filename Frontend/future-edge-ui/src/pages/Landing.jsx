import { useNavigate } from "react-router-dom";
import "../styles/landing.css";

function Landing() {

  const navigate = useNavigate();

  return (

    <div className="landing-page">

      <div className="hero">

        <h1 className="hero-title">FutureEdge</h1>

        <h2 className="hero-subtitle">
          AI-Powered Career Recommendation System
        </h2>

        <p className="hero-description">
          Upload your resume and discover the best career paths for your skills.
          FutureEdge analyzes your resume using AI to recommend careers,
          evaluate your ATS score, and identify skill gaps to help you
          become job-ready.
        </p>

        <div className="hero-buttons">

          <button
            className="btn primary"
            onClick={() => navigate("/login")}
          >
            Login
          </button>

          <button
            className="btn secondary"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </button>

        </div>

      </div>

    </div>

  );

}

export default Landing;