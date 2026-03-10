function CareerCard({ role, score, onClick }) {

  const percent = score <= 1 ? score * 100 : score;

  return (
    <div className="career-card" onClick={onClick}>

      <h3>{role}</h3>

      <p>{Math.round(percent)}% Match</p>

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