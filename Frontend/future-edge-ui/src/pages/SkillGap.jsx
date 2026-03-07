import { useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "../styles/skillgap.css";
import Layout from "../components/Layout";

function SkillGap() {

  const location = useLocation();
  const role = location.state || {};

  const skillData = {

    "Data Scientist": {
      required: [
        "Python",
        "Statistics",
        "Machine Learning",
        "Deep Learning",
        "TensorFlow",
        "Model Deployment"
      ],

      userSkills: [
        "Python",
        "Statistics",
        "Machine Learning"
      ],

      gaps: [
        "Deep Learning",
        "TensorFlow",
        "Model Deployment"
      ],

      resources: [
        "Deep Learning Specialization - Coursera",
        "TensorFlow Official Tutorial",
        "ML Deployment Guide"
      ]
    },


    "Machine Learning Engineer": {
      required: [
        "Python",
        "Machine Learning",
        "Docker",
        "ML Pipelines",
        "Kubernetes"
      ],

      userSkills: [
        "Python",
        "Machine Learning"
      ],

      gaps: [
        "Docker",
        "ML Pipelines",
        "Kubernetes"
      ],

      resources: [
        "Docker Beginner Guide",
        "ML Ops Tutorial",
        "Kubernetes Basics"
      ]
    },


    "Data Analyst": {
      required: [
        "SQL",
        "Excel",
        "Power BI",
        "Statistics",
        "Data Visualization"
      ],

      userSkills: [
        "SQL",
        "Excel"
      ],

      gaps: [
        "Power BI",
        "Statistics",
        "Data Visualization"
      ],

      resources: [
        "Power BI Fundamentals",
        "Statistics for Data Analysis",
        "Data Visualization Course"
      ]
    }

  };

  const data = skillData[role?.role];
  if (!data) {
  return (
    <Layout>
      <h2 style={{padding:"40px"}}>No career selected</h2>
    </Layout>
  );
}

  return (
    <Layout>

    <div className="dashboard">

      <Sidebar />

      <main className="main-content">

        <h1>Skill Gap Analysis</h1>

        <h2>{role.role}</h2>

        <div className="skills-container">

  <div className="skill-box">
    <h3>Required Skills</h3>

    <ul>
      {data.required.map((skill, index) => (
        <li key={index}>{skill}</li>
      ))}
    </ul>
  </div>


  <div className="skill-box">
    <h3>Your Skills</h3>

    <ul>
      {data.userSkills.map((skill, index) => (
        <li key={index} style={{color:"green"}}>
          ✔ {skill}
        </li>
      ))}
    </ul>
  </div>


  <div className="skill-box">
    <h3>Missing Skills</h3>

    <ul>
      {data.gaps.map((skill, index) => (
        <li key={index} style={{color:"red"}}>
          ❌ {skill}
        </li>
      ))}
    </ul>
  </div>

</div>

      </main>

    </div>
    </Layout>
  );
}

export default SkillGap;