import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Charts from "../components/Charts";
import "../styles/dashboard.css";

function Dashboard() {

  const [skills, setSkills] = useState([]);
  const [careers, setCareers] = useState([]);
  const [atsScore, setAtsScore] = useState(0);
  const [jobReadiness, setJobReadiness] = useState(0);
  const [matchedSkills, setMatchedSkills] = useState([]);
  const [missingSkills, setMissingSkills] = useState([]);

  const fetchSkillGap = async (career) => {

  const { data: { user } } = await supabase.auth.getUser();

  const response = await fetch(
    "http://127.0.0.1:8000/api/skill-gap/",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user_id: user.id,
        role: career
      })
    }
  );

  const data = await response.json();

  setMatchedSkills(data.user_skills || []);
  setMissingSkills(data.missing_skills || []);
  

};

  useEffect(() => {

  const storedSkills = localStorage.getItem("resume_skills");
  const storedCareers = localStorage.getItem("resume_careers");

  if (storedSkills) {
    setSkills(JSON.parse(storedSkills));
  }

  if (storedCareers) {

    const parsedCareers = JSON.parse(storedCareers);
    setCareers(parsedCareers);

    if (parsedCareers.length > 0) {
      fetchSkillGap(parsedCareers[0].role);
    }

  }

  // random placeholder scores
  setAtsScore(Math.floor(Math.random() * 30) + 70);
  setJobReadiness(Math.floor(Math.random() * 30) + 60);

}, []);

  const topCareer =
    careers.length > 0 ? careers[0].role : "No analysis yet";

  return (
    <Layout>

      <h1>Dashboard</h1>

      <div className="cards-grid">

        <Card title="Top Career Match" value={topCareer} />

        <Card title="ATS Score" value={`${atsScore}%`} />

        <Card title="Job Readiness" value={`${jobReadiness}%`} />

      </div>

      <div className="skills-dashboard">

        <h2>My Skills</h2>

        <div className="skills-grid">

          {skills.length === 0 && (
            <p>No resume analyzed yet</p>
          )}

          {skills.map((skill, index) => (
            <span key={index} className="skill-pill">
              {skill}
            </span>
          ))}

        </div>

      </div>

      <Charts
        careers={careers.slice(0,3)}
        matchedSkills={matchedSkills}
        missingSkills={missingSkills}
      />
      

    </Layout>
  );
}

export default Dashboard;