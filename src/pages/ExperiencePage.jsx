import PageHeader from "../components/PageHeader";
import FadeUp from "../components/FadeUp";
import { experience, publications, skills } from "../data";

export default function ExperiencePage() {
  return (
    <main className="page">
      <div className="container">
        <PageHeader
          dept="Professional &amp; Research Record"
          title="Experience"
          sceneType="clipboard"
          intro="Industry, research, and engineering work at the intersection of software, hardware, and medicine."
        />

        <section className="page-section">
          <div className="section-eyebrow">Industry</div>
          <div className="experience-list">
            {experience.map((e, i) => (
              <FadeUp key={i} delay={i * 0.07}>
                <div className="exp-row">
                  <div className="exp-period">{e.period}</div>
                  <div>
                    <h2 className="exp-role">{e.role}</h2>
                    <p className="exp-company">{e.company} · {e.location}</p>
                    <p className="exp-desc">{e.description}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </section>

        <section className="page-section">
          <div className="section-eyebrow">Publications</div>
          <div className="publications-list">
            {publications.map((p, i) => (
              <FadeUp key={i} delay={i * 0.07}>
                <div className="pub-item">
                  <h3 className="pub-title">{p.title}</h3>
                  <p className="pub-authors">{p.authors}</p>
                  <p className="pub-venue">{p.venue}</p>
                  <span className={`badge ${p.role === "Lead Author" ? "badge-lead" : "badge-contrib"}`}>
                    {p.status} · {p.role}
                  </span>
                </div>
              </FadeUp>
            ))}
          </div>
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
      </div>
    </main>
  );
}
