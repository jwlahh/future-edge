function CareerCard({ role, score, onClick }) {

  return (
    <div className="career-card" onClick={onClick}>

      <h3>{role}</h3>

      <p>{score}% Match</p>

      <div className="match-bar">

        <div
          className="match-progress"
          style={{ width: `${score}%` }}
        ></div>

      </div>

    </div>
  );

}

export default CareerCard;