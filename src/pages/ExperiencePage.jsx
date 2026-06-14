import { experience, publications, skills, about } from "../data";

export default function ExperiencePage() {
  return (
    <main className="page">
      <div className="container">
        <h1 className="page-title">Experience</h1>

        {/* Industry */}
        <section className="page-section">
          <div className="section-eyebrow">Industry</div>
          <div className="experience-list">
            {experience.map((e, i) => (
              <div className="exp-row" key={i}>
                <div className="exp-period">{e.period}</div>
                <div className="exp-content">
                  <h2 className="exp-role">{e.role}</h2>
                  <p className="exp-company">
                    {e.company} — {e.location}
                  </p>
                  <p className="exp-desc">{e.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Honors */}
        <section className="page-section">
          <div className="section-eyebrow">Honors & Fellowships</div>
          <ul className="honors-grid">
            {about.honors.map((h) => (
              <li key={h} className="honor-item">{h}</li>
            ))}
          </ul>
        </section>

        {/* Publications */}
        <section className="page-section">
          <div className="section-eyebrow">Publications</div>
          <div className="publications-list">
            {publications.map((p, i) => (
              <div className="pub-item" key={i}>
                <h3 className="pub-title">{p.title}</h3>
                <p className="pub-authors">{p.authors}</p>
                <p className="pub-venue">{p.venue}</p>
                <span
                  className={`badge ${
                    p.role === "Lead Author" ? "badge-lead" : "badge-contrib"
                  }`}
                >
                  {p.status} · {p.role}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Skills */}
        <section className="page-section">
          <div className="section-eyebrow">Skills</div>
          <div className="skills-grid">
            <div>
              <div className="skills-label">Languages</div>
              <div className="tag-row">
                {skills.languages.map((s) => (
                  <span className="tag" key={s}>{s}</span>
                ))}
              </div>
            </div>
            <div>
              <div className="skills-label">Tools & Frameworks</div>
              <div className="tag-row">
                {skills.tools.map((s) => (
                  <span className="tag" key={s}>{s}</span>
                ))}
              </div>
            </div>
            <div>
              <div className="skills-label">Domains</div>
              <div className="tag-row">
                {skills.domains.map((s) => (
                  <span className="tag" key={s}>{s}</span>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
