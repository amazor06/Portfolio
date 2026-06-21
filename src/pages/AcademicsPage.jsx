import PageHeader from "../components/PageHeader";
import FadeUp from "../components/FadeUp";
import { about, skills } from "../data";

const education = {
  school:  "Santa Clara University",
  degrees: ["B.S. Computer Science & Engineering", "B.S. Engineering Physics"],
  minor:   "Technical Innovation, Design & Entrepreneurship",
  period:  "2024 — 2028",
};

export default function AcademicsPage() {
  return (
    <main className="page">
      <div className="container">
        <PageHeader
          dept="Academic &amp; Scholarly Record"
          title="Academics"
          sceneType="atom"
          intro="Double-majoring in Computer Science &amp; Engineering and Engineering Physics at Santa Clara University. My coursework spans embedded systems, machine learning, quantum mechanics, and engineering design."
        />

        <section className="page-section">
          <div className="section-eyebrow">Education</div>
          <FadeUp>
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
          </FadeUp>
        </section>

        <section className="page-section">
          <div className="section-eyebrow">Honors &amp; Fellowships</div>
          <ul className="honors-grid">
            {about.honors.map((h, i) => (
              <FadeUp key={h} delay={i * 0.05}>
                <li className="honor-item">{h}</li>
              </FadeUp>
            ))}
          </ul>
        </section>

        <section className="page-section">
          <div className="section-eyebrow">Technical Skills</div>
          <FadeUp>
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
          </FadeUp>
        </section>

        <section className="page-section">
          <div className="section-eyebrow">About</div>
          {about.paragraphs.map((p, i) => (
            <FadeUp key={i} delay={i * 0.08}>
              <p className="page-intro" style={{ marginTop: i === 0 ? 0 : 20 }}>{p}</p>
            </FadeUp>
          ))}
        </section>
      </div>
    </main>
  );
}
