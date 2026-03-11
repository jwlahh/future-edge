import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import Layout from "../components/Layout";
import "../styles/skillgap.css";

function SkillGap() {

  const [careers, setCareers] = useState([]);
  const [selectedCareer, setSelectedCareer] = useState(null);

  const [requiredSkills, setRequiredSkills] = useState([]);
  const [userSkills, setUserSkills] = useState([]);
  const [missingSkills, setMissingSkills] = useState([]);

  const [loading, setLoading] = useState(false);

  // Load careers from localStorage
  useEffect(() => {

    const loadCareers = async () => {

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      const storedData =
        localStorage.getItem(`resume_analysis_${user.id}`);

      if (!storedData) return;

      const parsed = JSON.parse(storedData);

      setCareers(parsed.careers || []);

    };

    loadCareers();

  }, []);
  const fetchSkillGap = async (career) => {

    setSelectedCareer(career);
    setLoading(true);

    try {

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
            role: career.role
          })
        }
      );

      const data = await response.json();

      setRequiredSkills(data.required_skills || []);
      setUserSkills(data.user_skills || []);
      setMissingSkills(data.missing_skills || []);

      setLoading(false);

    } catch (error) {

      console.error("Skill gap error:", error);

    }

  };

  return (

    <Layout>

      <div className="dashboard">

       

        <main className="main-content">

          <h1>Skill Gap Analysis</h1>

          {/* If no career selected show career cards */}
          {!selectedCareer && (

            <div className="career-grid">

              {careers.length === 0 && (
                <p>No career recommendations found. Analyze a resume first.</p>
              )}

              {careers.map((career, index) => (

                <div
                key={index}
                className="career-card"
                onClick={() => fetchSkillGap(career)}
              >

                <h3>{career.role}</h3>
                <p>{career.score}% Match</p>

                <div className="match-bar">

                  <div
                    className="match-fill"
                    style={{ width: `${career.score}%` }}
                  ></div>

                </div>

              </div>

              ))}

            </div>

          )}

          {/* If career selected show skill gap */}
          {selectedCareer && (

            <>

              <button
                className="back-btn"
                onClick={() => setSelectedCareer(null)}
              >
                ← Back to Careers
              </button>

              <h2>{selectedCareer.role}</h2>

              {loading && (
                <p style={{ marginTop: "20px" }}>
                  Analyzing your skills...
                </p>
              )}

              {!loading && (

                <div className="skills-container">

                  {/* Required Skills */}
                  <div className="skill-box">

                    <h3>Required Skills</h3>

                    <ul>
                      {requiredSkills.map((skill, index) => (
                        <li key={index}>{skill}</li>
                      ))}
                    </ul>

                  </div>

                  {/* Your Skills */}
                  <div className="skill-box">

                    <h3>Your Skills</h3>

                    <ul>
                      {userSkills.map((skill, index) => (
                        <li key={index} style={{ color: "#00ff9d" }}>
                          ✔ {skill}
                        </li>
                      ))}
                    </ul>

                  </div>

                  {/* Missing Skills */}
                  <div className="skill-box">

                    <h3>Missing Skills</h3>

                    <ul>
                      {missingSkills.map((skill, index) => (
                        <li key={index} style={{ color: "red" }}>
                          ❌ {skill}
                        </li>
                      ))}
                    </ul>

                  </div>

                </div>

              )}

            </>

          )}

        </main>

      </div>

    </Layout>

  );

}

export default SkillGap;