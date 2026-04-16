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
          Score: {Math.round(data.score)}%
        </p>

        
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

    const careerData = careers.slice(0, 5).map((career) => ({
      name: career.role,
      score: Number(career.ml_score) || 0,
    }));

    

    return (
    <>
      <h3>Top 5 Career Matches</h3>

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
            tick={{ fill: "#c4b5fd", fontSize: 12 }}
            angle={-20}
            textAnchor="end"
          />

          <YAxis stroke="#686e72" tick={{ fill: "#EAF6FF" }} />

          <Tooltip
            content={<CustomTooltip />}
            cursor={{
              fill: "rgba(139, 92, 246, 0.12)",   // soft glass purple
              stroke: "rgba(139, 92, 246, 0.3)",
              strokeWidth: 1
            }}
          />

          <Bar
            dataKey="score"
            fill="url(#barGradient)"
            radius={[14, 14, 0, 0]}
            barSize={55}
          />

        </BarChart>
      </ResponsiveContainer>
    </>
  );
}

export default Charts;