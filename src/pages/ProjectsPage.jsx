import { projects } from "../data";

export default function ProjectsPage() {
  return (
    <main className="page">
      <div className="container">
        <h1 className="page-title"><em>Projects</em></h1>
        <p className="page-intro">
          From surgical teleoperation to ML platforms — engineering work across
          robotics, software, and hardware.
        </p>

        <div className="page-section">
          <div className="section-eyebrow">Selected Work</div>
          <div className="projects-list">
            {projects.map((p, i) => (
              <div className="project-item" key={p.id}>
                <span className="project-num">0{i + 1}</span>
                <div className="project-body">
                  <h2 className="project-title">{p.title}</h2>
                  <p className="project-desc">{p.description}</p>
                  <div className="project-bottom">
                    <div className="tag-row">
                      {p.tags.map((t) => (
                        <span className="tag" key={t}>{t}</span>
                      ))}
                    </div>
                    {(p.github || p.demo) && (
                      <div className="project-links">
                        {p.github && (
                          <a href={p.github} target="_blank" rel="noopener noreferrer">
                            GitHub ↗
                          </a>
                        )}
                        {p.demo && (
                          <a href={p.demo} target="_blank" rel="noopener noreferrer">
                            Demo ↗
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
