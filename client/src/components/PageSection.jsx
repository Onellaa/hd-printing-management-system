export const PageSection = ({ title, leading, action, children }) => (
  <section className="page-section">
    <div className="section-header">
      <div className="section-heading">
        {leading}
        <h3>{title}</h3>
      </div>
      {action}
    </div>
    {children}
  </section>
);

