import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import Sidebar from "../components/Sidebar";
import "../styles/skillgap.css";
import Layout from "../components/Layout";

function SkillGap() {

  const location = useLocation();
  const role = location.state || {};

  const [requiredSkills, setRequiredSkills] = useState([]);
  const [userSkills, setUserSkills] = useState([]);
  const [missingSkills, setMissingSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  if (!role?.role) {
    return (
      <Layout>
        <h2 style={{ padding: "40px" }}>No career selected</h2>
      </Layout>
    );
  }

  useEffect(() => {

    const fetchSkillGap = async () => {

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
              role: role.role
            })
          }
        );

        const data = await response.json();

        setRequiredSkills(data.required_skills || []);
        setUserSkills(data.user_skills || []);
        setMissingSkills(data.missing_skills || []);

      } catch (error) {

        console.error("Skill gap fetch error:", error);

      } finally {

        setLoading(false);

      }

    };

    fetchSkillGap();

  }, [role.role]);

  return (
    <Layout>

      <div className="dashboard">

        <Sidebar />

        <main className="main-content">

          <h1>Skill Gap Analysis</h1>
          <h2>{role.role}</h2>

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
                    <li key={index} style={{ color: "green" }}>
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

        </main>

      </div>

    </Layout>
  );
}

export default SkillGap;