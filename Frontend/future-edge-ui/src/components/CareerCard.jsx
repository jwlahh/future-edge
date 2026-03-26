function CareerCard({ role, score, onClick }) {

  // ✅ SAFETY FIX
  const safeScore = Number(score) || 0;

  const percent = safeScore <= 1 ? safeScore * 100 : safeScore;

  return (
    <div className="career-card" onClick={onClick}>

      <h3>{role}</h3>

      <p>{percent.toFixed(2)}% Match</p>

      <div className="match-bar">

        <div
          className="match-fill"
          style={{ width: `${percent}%` }}
        ></div>

      </div>

    </div>
  );
}

export default CareerCard;