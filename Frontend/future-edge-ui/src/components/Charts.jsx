import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

const skillData = [
  { name: "Python", value: 90 },
  { name: "ML", value: 80 },
  { name: "SQL", value: 70 },
  { name: "Deep Learning", value: 40 }
];

const careerData = [
  { name: "Data Scientist", score: 87 },
  { name: "ML Engineer", score: 65 },
  { name: "Data Analyst", score: 50 }
];

const COLORS = ["#6366f1", "#8b5cf6", "#22c55e", "#f97316"];

function Charts() {
  return (
    <div className="charts-grid">

      <div className="chart-card">
        <h3>Skill Distribution</h3>

        <ResponsiveContainer width="100%" height={250}>
          <PieChart>

            <Pie
              data={skillData}
              dataKey="value"
              outerRadius={90}
            >

              {skillData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}

            </Pie>

            <Tooltip />

          </PieChart>
        </ResponsiveContainer>

      </div>

      <div className="chart-card">

        <h3>Career Match</h3>

        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={careerData}>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="name" />

            <YAxis />

            <Tooltip />

            <Bar dataKey="score" fill="#6366f1" />

          </BarChart>
        </ResponsiveContainer>

      </div>

    </div>
  );
}

export default Charts;
