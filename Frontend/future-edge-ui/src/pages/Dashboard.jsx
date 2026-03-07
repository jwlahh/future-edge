import Layout from "../components/Layout";
import Card from "../components/Card";
import "../styles/dashboard.css";
import Charts from "../components/Charts";

function Dashboard() {

  return (
    <Layout>

      <h1>Dashboard</h1>

      <div className="cards-grid">

        <Card title="Resume Uploaded" value="Yes" />
        <Card title="Recommended Career" value="Data Scientist" />
        <Card title="Skill Gap Score" value="65%" />
        <Card title="Job Readiness" value="58%" />

      </div>
      <Charts />

    </Layout>
  );
}

export default Dashboard;