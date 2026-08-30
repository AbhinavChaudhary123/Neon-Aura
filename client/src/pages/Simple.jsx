export default function Simple({ title, subtitle }) {
  return (
    <main className="page simple">
      <div className="simple-card">
        <div className="big-symbol">✦</div>
        <span className="kicker">NEON AURA</span>
        <h1>{title}</h1>
        <p>{subtitle}</p>
        <button className="primary">Coming together soon</button>
      </div>
    </main>
  );
}
