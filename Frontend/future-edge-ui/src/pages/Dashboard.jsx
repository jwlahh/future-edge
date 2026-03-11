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

    const loadDashboard = async () => {

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      const storedData =
        localStorage.getItem(`resume_analysis_${user.id}`);

      if (storedData) {

        const parsed = JSON.parse(storedData);

        setSkills(parsed.skills || []);
        setCareers(parsed.careers || []);
        setAtsScore(parsed.score || 0);

        if (parsed.careers && parsed.careers.length > 0) {
          fetchSkillGap(parsed.careers[0].role);
        }

      }
      

      if (storedSkills && storedCareers) {

        const parsedSkills = JSON.parse(storedSkills);
        const parsedCareers = JSON.parse(storedCareers);

        setSkills(parsedSkills);
        setCareers(parsedCareers);

        if (parsedCareers.length > 0) {
          fetchSkillGap(parsedCareers[0].role);
        }

      }
      const storedScore = localStorage.getItem("resume_score");

      if (storedScore) {
        setAtsScore(storedScore);
      }

    };

    loadDashboard();

  }, []);

  const topCareer =
    careers.length > 0 ? careers[0].role : "No analysis yet";

  return (
    <Layout>

      <div className="dashboard-header">

        <h1>Welcome👋</h1>

        <p>
        Track your AI career insights and improve your
        skills to become job-ready.
        </p>

        </div>

      <div className="cards-grid">

        <Card title="Top Career Match" value={topCareer} />

        <Card title="ATS Score" value={`${atsScore}%`} />

        <Card title="Job Readiness" value={`${jobReadiness}%`} />

      </div>

      

      <div className="dashboard-grid">

        <div className="analytics-panel">

          <Charts
            careers={careers.slice(0,3)}
            matchedSkills={matchedSkills}
            missingSkills={missingSkills}
          />

        </div>

        <div className="skills-panel">

          <h2>Your Skills</h2>

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

      </div>
      

    </Layout>
  );
}

export default Dashboard;