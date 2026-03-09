import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import CareerCard from "../components/CareerCard";
import "../styles/upload.css";


function ResumeAnalysis() {

  const navigate = useNavigate();

 const [skills, setSkills] = useState([]);
  const [atsScore, setAtsScore] = useState(null);
  const [careers, setCareers] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {

    const storedSkills = localStorage.getItem("resume_skills");
    const storedCareers = localStorage.getItem("resume_careers");
    const storedScore = localStorage.getItem("resume_score");

    if (storedSkills) {
      setSkills(JSON.parse(storedSkills));
    }

    if (storedCareers) {
      setCareers(JSON.parse(storedCareers));
    }

    if (storedScore) {
      setAtsScore(storedScore);
    }

  }, []);
  
  const openSkillGap = (career) => {
    navigate("/skill-gap", { state: career });
  };

  const analyzeResume = async () => {

  if (!file) {
    setMessage("Please upload a resume first.");
    return;
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    setMessage("You must be logged in.");
    return;
  }

  const formData = new FormData();
  formData.append("resume", file);
  formData.append("user_id", user.id);

  try {

    setLoading(true);
    setMessage("Analyzing your resume...");

    const response = await fetch(
      "http://127.0.0.1:8000/api/upload-resume/",
      {
        method: "POST",
        body: formData
      }
    );

    const data = await response.json();

    const detectedSkills = data.skills_found || [];
    const recommendedCareers = data.careers || [];
    const score = data.ats_score || null;

    setSkills(detectedSkills);
    setCareers(recommendedCareers);
    setAtsScore(score);

    // Save results so they persist
    localStorage.setItem("resume_skills", JSON.stringify(detectedSkills));
    localStorage.setItem("resume_careers", JSON.stringify(recommendedCareers));
    localStorage.setItem("resume_score", score);
    setMessage("Analysis complete.");

  } catch (error) {

    setMessage("Error analyzing resume.");

  } finally {

    setLoading(false);

  }
};
  const handleFileChange = (event) => {

    const selectedFile = event.target.files[0];

    if (selectedFile) {

      setFile(selectedFile);

      // reset previous results
      setSkills([]);
      setCareers([]);
      setAtsScore(null);

      // clear stored analysis
      localStorage.removeItem("resume_skills");
      localStorage.removeItem("resume_careers");
      localStorage.removeItem("resume_score");

      setMessage("Resume selected. Click Analyze.");

    }
  };
  return (
    <Layout>

      <h1>Resume Analysis</h1>

      <div className="upload-box">

        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
        />

        {file && (
          <p className="file-name">
            Selected file: {file.name}
          </p>
        )}

        <button
          onClick={analyzeResume}
          className="analyze-btn"
          disabled={loading}
        >
          {loading ? "Analyzing..." : "Analyze Resume"}
        </button>

        {loading && (
          <div className="loading-box">
            <p>🔍 Extracting resume text...</p>
            <p>🧠 Detecting skills...</p>
            <p>📊 Calculating career matches...</p>
          </div>
        )}

{!loading && message && (
  <p className="status-message">{message}</p>
)}

      </div>

      {atsScore && (
        <h2 style={{ marginTop: "30px" }}>
          ATS Score: {atsScore}
        </h2>
      )}

      {skills.length > 0 && (
        <div className="skills-section">

          <h3>✨ Skills Extracted from Resume</h3>

          <div className="skills-grid">
            {skills.map((skill, index) => (
              <div key={index} className="skill-pill">
                {skill}
              </div>
            ))}
          </div>

        </div>
      )}

     
      {careers.length > 0 && (
        <>
          <h2>🚀 Best Career Matches for You</h2>

          <div className="career-list">
            {careers.map((role, index) => (
              <CareerCard
                key={index}
                role={role.role}
                score={role.score}
                onClick={() => openSkillGap(role)}
              />
            ))}
          </div>
        </>
      )}

    </Layout>
  );
}

export default ResumeAnalysis;