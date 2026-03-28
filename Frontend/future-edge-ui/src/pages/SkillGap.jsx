import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import Layout from "../components/Layout";
import "../styles/skillgap.css";

function SkillGap() {

  const [careers, setCareers] = useState([]);
  const [selectedCareer, setSelectedCareer] = useState(null);

  const [requiredSkills, setRequiredSkills] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [matchedSkills, setMatchedSkills] = useState([]);
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
      setAllSkills(parsed.skills || []);

    };

    loadCareers();

  }, []);
  const fetchSkillGap = (career) => {
  setSelectedCareer(career);

  setRequiredSkills([]); // not needed anymore

  setMatchedSkills([
    ...career.core_matched,
    ...career.secondary_matched,
    ...career.optional_matched
  ]);

  setMissingSkills([
    ...career.core_missing,
    ...career.secondary_missing,
    ...career.optional_missing
  ]);
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
                
                <p>
                  {career.skill_score}% Match 
                </p>
                <div className="match-bar">   
                <div
                  className="match-fill"
                  style={{ width: `${career.skill_score}%` }}
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

  {/* CORE */}
  <div className="skill-box">
    <h3>Core Skills</h3>

    {selectedCareer.core_matched.map((skill, i) => (
      <p key={i} style={{ color: "#00ff9d" }}>✔ {skill}</p>
    ))}

    {selectedCareer.core_missing.map((skill, i) => (
      <p key={i} style={{ color: "red" }}>❌ {skill}</p>
    ))}
  </div>

  {/* SECONDARY */}
  <div className="skill-box">
    <h3>Secondary Skills</h3>

    {selectedCareer.secondary_matched.map((skill, i) => (
      <p key={i} style={{ color: "#00ff9d" }}>✔ {skill}</p>
    ))}

    {selectedCareer.secondary_missing.map((skill, i) => (
      <p key={i} style={{ color: "red" }}>❌ {skill}</p>
    ))}
  </div>

  {/* OPTIONAL */}
  <div className="skill-box">
    <h3>Optional Skills</h3>

    {selectedCareer.optional_matched.map((skill, i) => (
      <p key={i} style={{ color: "#00ff9d" }}>✔ {skill}</p>
    ))}

    {selectedCareer.optional_missing.map((skill, i) => (
      <p key={i} style={{ color: "red" }}>❌ {skill}</p>
    ))}
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