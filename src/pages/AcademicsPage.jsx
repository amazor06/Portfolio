import { about, skills } from "../data";

const education = {
  school: "Santa Clara University",
  degrees: ["B.S. Computer Science & Engineering", "B.S. Engineering Physics"],
  minor: "Technical Innovation, Design & Entrepreneurship",
  period: "2024 — 2028",
};

export default function AcademicsPage() {
  return (
    <main className="page">
      <div className="container">
        <h1 className="page-title"><em>Academics</em></h1>
        <p className="page-intro">
          Double-majoring in Computer Science &amp; Engineering and Engineering
          Physics at Santa Clara University. My coursework spans embedded
          systems, machine learning, quantum mechanics, and engineering design.
        </p>

        <section className="page-section">
          <div className="section-eyebrow">Education</div>
          <div className="experience-list">
            <div className="exp-row">
              <div className="exp-period">{education.period}</div>
              <div>
                <h2 className="exp-role">{education.school}</h2>
                <p className="exp-company">
                  {education.degrees.join(" · ")}
                </p>
                <p className="exp-desc">Minor in {education.minor}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="page-section">
          <div className="section-eyebrow">Honors &amp; Fellowships</div>
          <ul className="honors-grid">
            {about.honors.map((h) => (
              <li className="honor-item" key={h}>{h}</li>
            ))}
          </ul>
        </section>

        <section className="page-section">
          <div className="section-eyebrow">Technical Skills</div>
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
              <div className="skills-label">Tools &amp; Frameworks</div>
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

        <section className="page-section">
          <div className="section-eyebrow">About</div>
          {about.paragraphs.map((p, i) => (
            <p key={i} className="page-intro" style={{ marginTop: i === 0 ? 0 : 20 }}>
              {p}
            </p>
          ))}
        </section>
      </div>
    </main>
  );
}
