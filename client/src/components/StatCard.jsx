export const StatCard = ({ label, value, tone = "default", hint, icon }) => (
  <div className={`stat-card ${tone}`}>
    <div className="stat-card-top">
      <div className={`stat-icon ${tone}`}>{icon || label.slice(0, 2)}</div>
      <p>{label}</p>
    </div>
    <h3>{value}</h3>
    {hint ? <span className="stat-hint">{hint}</span> : null}
  </div>
);
