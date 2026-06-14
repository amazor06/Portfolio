import { useState } from "react";
import "./App.css";
import {
  personal,
  about,
  research,
  projects,
  experience,
  publications,
  skills,
  nav,
} from "./data";

// ─── Navigation ─────────────────────────────────────────────
function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="nav">
      <div className="nav-inner">
        <a href="#" className="nav-name">
          {personal.name.split(" ")[0]}
        </a>
        <button
          className="nav-toggle"
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation"
        >
          {open ? "✕" : "☰"}
        </button>
        <ul className={`nav-links${open ? " open" : ""}`}>
          {nav.map((item) => (
            <li key={item.href}>
              <a href={item.href} onClick={() => setOpen(false)}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

// ─── Hero ───────────────────────────────────────────────────
function Hero() {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-content">
          <h1 className="hero-name">{personal.name}</h1>
          <p className="hero-tagline">{personal.tagline}</p>
          <div className="hero-meta">
            <span>Computer Science & Engineering Physics</span>
            <span className="separator">·</span>
            <span>Santa Clara University '28</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── About ──────────────────────────────────────────────────
function About() {
  return (
    <section id="about">
      <div className="container">
        <div className="section-label">About</div>
        <div className="about-content">
          <div className="about-text">
            {about.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <div className="about-sidebar">
            <div className="about-sidebar-title">Honors & Fellowships</div>
            <ul className="about-honors">
              {about.honors.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Research ───────────────────────────────────────────────
function Research() {
  return (
    <section id="research">
      <div className="container">
        <div className="section-label">Research</div>
        <div className="research-grid">
          {research.map((r) => (
            <article className="research-card" key={r.id}>
              <div className="research-card-header">
                <span className="research-lab">{r.lab}</span>
                {r.publication && (
                  <span
                    className={`research-pub-badge ${
                      r.publication.includes("lead")
                        ? "lead"
                        : "contributing"
                    }`}
                  >
                    {r.publication.includes("lead")
                      ? "Lead Author"
                      : "Contributing Author"}
                  </span>
                )}
                {r.upcoming && (
                  <span className="research-pub-badge upcoming">
                    Starting 2026
                  </span>
                )}
              </div>
              <h3 className="research-title">{r.title}</h3>
              <div className="research-pi">
                {r.pi} · {r.institution}
              </div>
              <p className="research-description">{r.description}</p>
              <div className="research-tags">
                {r.tags.map((tag) => (
                  <span className="tag" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Projects ───────────────────────────────────────────────
function Projects() {
  return (
    <section id="projects">
      <div className="container">
        <div className="section-label">Projects</div>
        <div className="projects-grid">
          {projects.map((p) => (
            <article
              className={`project-card${p.featured ? " featured" : ""}`}
              key={p.id}
            >
              <h3 className="project-title">{p.title}</h3>
              <p className="project-description">{p.description}</p>
              <div className="project-footer">
                <div className="project-tags">
                  {p.tags.map((tag) => (
                    <span className="tag" key={tag}>
                      {tag}
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
                      Live Demo ↗
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Experience ─────────────────────────────────────────────
function Experience() {
  return (
    <section id="experience">
      <div className="container">
        <div className="section-label">Experience</div>
        <div className="experience-list">
          {experience.map((e, i) => (
            <div className="experience-item" key={i}>
              <div className="experience-period">{e.period}</div>
              <div>
                <h3 className="experience-role">{e.role}</h3>
                <div className="experience-company">
                  {e.company} · {e.location}
                </div>
                <p className="experience-description">{e.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Publications ───────────────────────────────────────────
function Publications() {
  return (
    <section id="publications">
      <div className="container">
        <div className="section-label">Publications</div>
        <div className="publications-list">
          {publications.map((p, i) => (
            <div className="publication-item" key={i}>
              <h3 className="publication-title">{p.title}</h3>
              <div className="publication-authors">{p.authors}</div>
              <div className="publication-venue">{p.venue}</div>
              <div className="publication-meta">
                <span
                  className={`publication-status ${
                    p.role === "Lead Author" ? "lead" : "contributing"
                  }`}
                >
                  {p.status} · {p.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Skills ─────────────────────────────────────────────────
function Skills() {
  return (
    <section id="skills">
      <div className="container">
        <div className="section-label">Skills</div>
        <div className="skills-content">
          <div>
            <div className="skills-category-title">Languages</div>
            <div className="skills-list">
              {skills.languages.map((s) => (
                <span className="tag" key={s}>
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div>
            <div className="skills-category-title">Frameworks & Tools</div>
            <div className="skills-list">
              {skills.frameworks.map((s) => (
                <span className="tag" key={s}>
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div>
            <div className="skills-category-title">Domains</div>
            <div className="skills-list">
              {skills.domains.map((s) => (
                <span className="tag" key={s}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer / Contact ───────────────────────────────────────
function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="container">
        <div className="footer-content">
          <div>
            <h2 className="footer-heading">
              Let's build something that matters.
            </h2>
            <a href={`mailto:${personal.email}`} className="footer-email">
              {personal.email}
            </a>
          </div>
          <div className="footer-links">
            <a
              href={personal.github}
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <a
              href={personal.linkedin}
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
            <a
              href={personal.efolio}
              target="_blank"
              rel="noopener noreferrer"
            >
              Grand Challenge ePortfolio
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          © {new Date().getFullYear()} {personal.name}
        </div>
      </div>
    </footer>
  );
}

// ─── App ────────────────────────────────────────────────────
function App() {
  return (
    <>
      <Nav />
      <Hero />
      <About />
      <Research />
      <Projects />
      <Experience />
      <Publications />
      <Skills />
      <Footer />
    </>
  );
}

export default App;
