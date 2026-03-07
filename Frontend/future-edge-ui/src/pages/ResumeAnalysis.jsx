import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Layout from "../components/Layout";
import CareerCard from "../components/CareerCard";
import "../styles/upload.css";

function ResumeAnalysis() {

  const navigate = useNavigate();

  const [skills, setSkills] = useState([]);
  const [atsScore, setAtsScore] = useState(null);
  const [careers, setCareers] = useState([]);

  const openSkillGap = (career) => {
    navigate("/skill-gap", { state: career });
  };

  const handleUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("resume", file);

  try {
    const response = await fetch("http://127.0.0.1:8000/api/upload-resume/", {
      method: "POST",
      body: formData
    });

   const data = await response.json();

  console.log("Backend response:", data);

  setSkills(data.skills_found || []);
  setAtsScore(data.ats_score || null);
  setCareers(data.careers || []);
  } catch (error) {
    console.error("Upload error:", error);
  }
};

  return (
    <Layout>

      <h1>Resume Analysis</h1>

      <div className="upload-box">
        <p>Upload your resume</p>
        <input
          type="file"
          accept=".pdf"
          onChange={handleUpload}
          />
      </div>

      {atsScore && (
        <h2 style={{ marginTop: "30px" }}>
          ATS Score: {atsScore}
        </h2>
      )}

      {skills.length > 0 && (
        <>
          <h2>Your Skills</h2>

          <div className="skills-list">
            {skills.map((skill, index) => (
              <span key={index} className="skill-tag">
                {skill}
              </span>
            ))}
          </div>
        </>
      )}

      {careers.length > 0 && (
        <>
          <h2>Recommended Careers</h2>

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