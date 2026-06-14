import { projects } from "../data";

export default function ProjectsPage() {
  return (
    <main className="page">
      <div className="container">
        <h1 className="page-title">Projects</h1>
        <p className="page-intro">
          From surgical teleoperation to ML platforms — engineering work across
          robotics, software, and hardware.
        </p>

        <div className="projects-grid">
          {projects.map((p) => (
            <article
              className={`project-card ${p.featured ? "project-featured" : ""}`}
              key={p.id}
            >
              <div className="project-body">
                <h2 className="project-title">{p.title}</h2>
                <p className="project-desc">{p.description}</p>
              </div>
              <div className="project-bottom">
                <div className="tag-row">
                  {p.tags.map((t) => (
                    <span className="tag" key={t}>
                      {t}
                    </span>
                  ))}
                </div>
                <div className="project-links">
                  {p.github && (
                    <a
                      href={p.github}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      GitHub ↗
                    </a>
                  )}
                  {p.demo && (
                    <a
                      href={p.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Demo ↗
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
