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

const COLORS = ["#8b5cf6", "#c4b5fd"];

/* Tooltip that shows skills */
const CustomTooltip = ({ active, payload, matchedSkills, missingSkills }) => {

  if (active && payload && payload.length) {

    const label = payload[0].name;

    const skills =
      label === "Matched Skills" ? matchedSkills : missingSkills;

    return (
      <div
        style={{
          background: "linear-gradient(145deg,rgba(139,92,246,0.15),rgba(0,0,0,0.65)",
          padding: "12px",
          border: "1px solid rgba(139,92,246,0.25)",
          borderRadius: "12px",
          color: "#efeafa",
          boxShadow: "0 8px 20px rgba(0,0,0,0.4)"
        }}
      >
        <strong>
        {label} ({skills.length})
        </strong>

        <ul style={{ marginTop: "8px", color: "#bbb8db" }}>
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
      value: totalSkills ? (matchedSkills.length / totalSkills) * 100 : 1
    },
    {
      name: "Missing Skills",
      value: totalSkills ? (missingSkills.length / totalSkills) * 100 : 1
    }
  ];

  return (
    <div className="charts-grid">

      {/* Career Match Bar Chart */}
      <div className="chart-card">

        <h3>Top Career Matches</h3>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={careerData}>
        <CartesianGrid stroke="rgba(0,0,0,0.65)" />

        <XAxis
          dataKey="name"
          stroke="#EAF6FF"
          tick={{ fill: "#EAF6FF" }}
        />

        <YAxis
          stroke="#EAF6FF"
          tick={{ fill: "#EAF6FF" }}
        />

        <Tooltip
          contentStyle={{
            background: "rgba(0,0,0,0.65)",
            border: "1px solid  rgba(139,92,246,0.25)",
            color: "#EAF6FF"
          }}
        />

            <Bar dataKey="score" fill="#8b5cf6" />

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