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
  Cell,
  Sector
} from "recharts";
import { useState } from "react";

const COLORS = [
  "#8b5cf6",
  "#a78bfa",
  "#c4b5fd",
  "#7c3aed",
  "#6d28d9"
];

/* ================= TOOLTIP ================= */
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;

    return (
      <div
        style={{
          background: "linear-gradient(145deg, rgba(139,92,246,0.15), rgba(0,0,0,0.65))",
          padding: "12px",
          border: "1px solid rgba(139,92,246,0.25)",
          borderRadius: "12px",
          color: "#efeafa",
          boxShadow: "0 8px 20px rgba(0,0,0,0.4)"
        }}
      >
        <strong>{data.name}</strong>

        <p style={{ marginTop: "6px", color: "#c4b5fd" }}>
          Score: {Math.round(data.value)}%
        </p>

        <div style={{ marginTop: "8px" }}>
          <strong style={{ fontSize: "13px" }}>Missing Skills:</strong>
          <ul style={{ marginTop: "6px", color: "#bbb8db" }}>
            {data.missingSkills?.length > 0 ? (
              data.missingSkills.map((skill, i) => (
                <li key={i}>{skill}</li>
              ))
            ) : (
              <li>No missing skills</li>
            )}
          </ul>
        </div>
      </div>
    );
  }
  return null;
};

/* ================= ACTIVE PIE SLICE ================= */
const renderActiveShape = (props) => {
  const {
    cx, cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
  } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius || 0}
        outerRadius={outerRadius + 12}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{
          filter: "drop-shadow(0 0 20px rgba(139,92,246,0.9))"
        }}
      />

      <Sector
        cx={cx}
        cy={cy}
        innerRadius={outerRadius + 12}
        outerRadius={outerRadius + 18}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.25}
      />
    </g>
  );
};

function Charts({ careers }) {

  const [activeIndex, setActiveIndex] = useState(null);

  if (!careers || careers.length === 0) {
    return (
      <div style={{ marginTop: "30px" }}>
        <p>No career data available yet.</p>
      </div>
    );
  }

  const careerData = careers.map((career) => ({
    name: career.role,
    score: Number(career.ml_score) || 0
  }));

  const pieData = careers.slice(0, 5).map((career) => ({
    name: career.role,
    value: Number(career.ml_score) || 0,
    missingSkills: career.missingSkills || []
  }));

  return (
    <div className="charts-grid">

      {/* ================= BAR CHART ================= */}
      <div className="chart-card">
        <h3>Top Career Matches</h3>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={careerData}
            margin={{ top: 20, right: 20, left: 10, bottom: 10 }}
            barCategoryGap="20%" 
          >

            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#c4b5fd" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="rgba(139,92,246,0.08)" />

            <XAxis
              dataKey="name"
              tick={false}          // ❌ hides labels
              tickLine={false}      // optional clean look
              axisLine={{ stroke: "#aaa" }}  // ✅ keeps the line
            />

            <YAxis
              stroke="#686e72"
              tick={{ fill: "#EAF6FF" }}
            />

            <Tooltip
              formatter={(value) => [`${value}`, "Score"]}
              labelFormatter={(label, payload) =>
                payload && payload.length ? payload[0].payload.name : ""
              }
              cursor={{ fill: "transparent" }}
              contentStyle={{
                background: "linear-gradient(145deg, rgba(139,92,246,0.15), rgba(0,0,0,0.7))",
                border: "1px solid rgba(139,92,246,0.25)",
                borderRadius: "12px",
                color: "#c8b7eb"
              }}
            />

            <Bar
              dataKey="score"
              fill="url(#barGradient)"
              radius={[14, 14, 0, 0]}
              barSize={55}  
              animationDuration={1200}
              activeBar={false}
              style={{
                filter: "drop-shadow(0 0 12px rgba(139,92,246,0.6))"
              }}
              onMouseOver={(data, index, e) => {
                e.target.style.filter = "drop-shadow(0 0 20px #8b5cf6)";
              }}
              onMouseOut={(data, index, e) => {
                e.target.style.filter = "drop-shadow(0 0 12px rgba(139,92,246,0.6))";
              }}
            />

          </BarChart>
        </ResponsiveContainer>
      </div>


      {/* ================= PIE CHART ================= */}
      <div className="chart-card">
        <h3>Top Career Distribution</h3>

        <ResponsiveContainer width="100%" height={300}>
          <PieChart>

            <defs>
              <radialGradient id="pieGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#000000" stopOpacity={0} />
              </radialGradient>
            </defs>

            <circle cx="50%" cy="50%" r="120" fill="url(#pieGlow)" />

            <Pie
              data={pieData}
              dataKey="value"
              outerRadius={95}
              paddingAngle={0}
              stroke="none"
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              
              /* ✅ SHOW ROLE NAME INSTEAD OF % */
              label={({ name, x, y, cx, cy }) => {
              const words = name.split(" ");

              return (
                <text
                  x={x}
                  y={y}
                  fill="#c4b5fd"
                  textAnchor={x > cx ? "start" : "end"}
                  dominantBaseline="central"
                  style={{ fontSize: "11px" }}
                >
                  {words.map((word, index) => (
                  <tspan x={x} dy={index === 0 ? 0 : 12} key={index}>
                  {word}
                  </tspan>
                  ))}
                </text>
              );
            }}  

              animationDuration={1200}
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index % COLORS.length]}
                  style={{
                    cursor: "pointer",
                    filter: "drop-shadow(0 0 10px rgba(139,92,246,0.6))"
                  }}
                />
              ))}
            </Pie>

            <Tooltip content={<CustomTooltip />} />

          </PieChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}

export default Charts;