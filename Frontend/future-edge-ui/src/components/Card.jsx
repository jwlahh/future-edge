function Card({ title, value }) {

  return (
    <div className="stat-card">

      <p className="card-title">{title}</p>

      <h2 className="card-value">{value}</h2>

    </div>
  );

}

export default Card;