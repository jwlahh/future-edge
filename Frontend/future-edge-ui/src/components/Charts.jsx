import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

const COLORS = ["#3a60f6", "#fdd947"];

/* Tooltip that shows skills */
const CustomTooltip = ({ active, payload, matchedSkills, missingSkills }) => {

  if (active && payload && payload.length) {

    const label = payload[0].name;

    const skills =
      label === "Matched Skills" ? matchedSkills : missingSkills;

    return (
      <div
        style={{
          background: "white",
          padding: "10px",
          border: "1px solid #ddd",
          borderRadius: "8px"
        }}
      >
        <strong>
        {label} ({skills.length})
        </strong>

        <ul style={{ marginTop: "5px" }}>
          {skills.map((skill, i) => (
            <li key={i}>{skill}</li>
          ))}
        </ul>

      </div>
    );
  }

  return null;
};

function Charts({ careers, matchedSkills = [], missingSkills = [] }) {

  if (!careers || careers.length === 0) {
    return (
      <div style={{ marginTop: "30px" }}>
        <p>No career data available yet.</p>
      </div>
    );
  }

  const careerData = careers.map((career) => ({
    name: career.role,
    score: career.score
  }));

  const totalSkills = matchedSkills.length + missingSkills.length;

  const skillGapData = [
    {
      name: "Matched Skills",
      value: totalSkills ? (matchedSkills.length / totalSkills) * 100 : 0
    },
    {
      name: "Missing Skills",
      value: totalSkills ? (missingSkills.length / totalSkills) * 100 : 0
    }
  ];

  return (
    <div className="charts-grid">

      {/* Career Match Bar Chart */}
      <div className="chart-card">

        <h3>Top Career Matches</h3>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={careerData}>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="name" />

            <YAxis />

            <Tooltip />

            <Bar dataKey="score" fill="#6366f1" />

          </BarChart>
        </ResponsiveContainer>

      </div>


      {/* Skill Gap Pie Chart */}
      <div className="chart-card">

        <h3>Skill Coverage</h3>

        <ResponsiveContainer width="100%" height={300}>
          <PieChart>

            <Pie
              data={skillGapData}
              dataKey="value"
              outerRadius={90}
              label={({ value }) => `${Math.round(value)}%`}
            >

              {skillGapData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}

            </Pie>

            <Tooltip
              content={
                <CustomTooltip
                  matchedSkills={matchedSkills}
                  missingSkills={missingSkills}
                />
              }
            />

          </PieChart>
        </ResponsiveContainer>

      </div>

    </div>
  );
}

export default Charts;