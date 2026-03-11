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
  const [deductions, setDeductions] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");

  useEffect(() => {

    const loadResumeData = async () => {

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      const storedData =
        localStorage.getItem(`resume_analysis_${user.id}`);

      if (!storedData) return;

      const parsed = JSON.parse(storedData);

      setSkills(parsed.skills || []);
      setCareers(parsed.careers || []);
      setAtsScore(parsed.score || null);
      setDeductions(parsed.deductions || []);
      setSuggestions(parsed.suggestions || []);

    };

    loadResumeData();

  }, []);

  const analyzeResume = async () => {

    if (!file) {
      alert("Please upload a resume first.");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert("You must be logged in.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("user_id", user.id);

    try {

      setLoading(true);

      setLoadingStep("Reading resume...");
      await new Promise(r => setTimeout(r, 600));

      setLoadingStep("Detecting skills...");
      await new Promise(r => setTimeout(r, 600));

      setLoadingStep("Calculating ATS score...");
      await new Promise(r => setTimeout(r, 600));

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
      const score = data.ats_score || 0;
      const deductionsList = data.deductions || [];
      const suggestionsList = data.suggestions || [];

      setSkills(detectedSkills);
      setCareers(recommendedCareers);
      setAtsScore(score);
      setDeductions(deductionsList);
      setSuggestions(suggestionsList);

      const resumeData = {
        skills: detectedSkills,
        careers: recommendedCareers,
        score: score,
        deductions: deductionsList,
        suggestions: suggestionsList
      };

      localStorage.setItem(
        `resume_analysis_${user.id}`,
        JSON.stringify(resumeData)
      );

    } catch (error) {

      alert("Error analyzing resume.");

    } finally {

      setLoading(false);
      setLoadingStep("");

    }
  };

  const handleFileChange = (event) => {

    const selectedFile = event.target.files[0];

    if (!selectedFile) return;

    setFile(selectedFile);

    setSkills([]);
    setCareers([]);
    setAtsScore(null);
    setDeductions([]);
    setSuggestions([]);

    localStorage.removeItem("resume_skills");
    localStorage.removeItem("resume_careers");
    localStorage.removeItem("resume_score");
    localStorage.removeItem("resume_deductions");
    localStorage.removeItem("resume_suggestions");

  };

  return (

    <Layout>

      <div className="analysis-header">
        <h1>Resume Analysis</h1>
        <p>Upload your resume to analyze ATS score and discover career matches.</p>
      </div>


      <div className="analysis-grid">

        {/* Upload Card */}

        <div className="upload-box upload-card">

          <h3>Upload Resume</h3>

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

            <div className="ai-loader">

              <div className="ai-spinner"></div>

              <p>{loadingStep}</p>

            </div>

          )}

        </div>


        {/* ATS Score */}

        <div className="analysis-card">

          <h3>ATS Resume Score</h3>

          <div className="ats-score">
            {atsScore !== null ? `${atsScore}%` : "--"}
          </div>

          <div className="ats-meter">
            <div
              className="ats-meter-fill"
              style={{ width: `${atsScore || 0}%` }}
            ></div>
          </div>

          <p className="ats-strength">

            {atsScore >= 80 && "Strong Resume"}
            {atsScore >= 60 && atsScore < 80 && "Good Resume"}
            {atsScore >= 40 && atsScore < 60 && "Needs Improvement"}
            {atsScore < 40 && atsScore !== null && "Weak Resume"}

          </p>

        </div>


        {/* Suggestions */}

        <div className="analysis-card">

          <h3>Improvement Suggestions</h3>

          {suggestions.length === 0 && (
            <p>No suggestions yet.</p>
          )}

          <ul>

            {suggestions.map((item, i) => (
              <li key={i}>{item}</li>
            ))}

          </ul>

        </div>

      </div>


      {/* Skills */}

      {skills.length > 0 && (

        <div className="skills-section">

          <h3>Skills Extracted</h3>

          <div className="skills-grid">

            {skills.map((skill, index) => (

              <div key={index} className="skill-pill">
                {skill}
              </div>

            ))}

          </div>

        </div>

      )}


      {/* Career Matches */}

      {careers.length > 0 && (

        <div className="career-section">

          <h2>Best Career Matches</h2>

          <div className="career-list">

            {careers.map((role, index) => (

              <CareerCard
                key={index}
                role={role.role}
                score={role.score}
              />

            ))}

          </div>

        </div>

      )}

    </Layout>

  );

}

export default ResumeAnalysis;