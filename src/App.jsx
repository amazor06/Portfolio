import { useState } from "react";
import Room from "./components/Room";
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
import "./App.css";

/* ─── Navigation ──────────────────────────────────────────── */
function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="nav">
      <div className="nav-inner">
        <a href="#" className="nav-logo">
          {personal.name.split(" ")[0]}
        </a>
        <button
          className="nav-toggle"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <span className={`hamburger ${open ? "open" : ""}`} />
        </button>
        <ul className={`nav-links ${open ? "open" : ""}`}>
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

/* ─── Hero with 3D Room ───────────────────────────────────── */
function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero-text">
        <h1 className="hero-name">{personal.name}</h1>
        <p className="hero-tagline">{personal.tagline}</p>
      </div>
      <Room />
    </section>
  );
}

/* ─── About ────────────────────────────────────────────────── */
function About() {
  return (
    <section className="section" id="about">
      <div className="container">
        <div className="section-eyebrow">About</div>
        <div className="about-grid">
          <div className="about-text">
            {about.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <aside className="about-sidebar">
            <div className="sidebar-label">Honors & Fellowships</div>
            <ul className="honors-list">
              {about.honors.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </section>
  );
}

/* ─── Research ─────────────────────────────────────────────── */
function Research() {
  return (
    <section className="section" id="research">
      <div className="container">
        <div className="section-eyebrow">Research</div>
        <div className="research-list">
          {research.map((r) => (
            <article className="research-card" key={r.id}>
              <div className="research-meta">
                <span className="research-lab">{r.lab}</span>
                {r.publication && (
                  <span
                    className={`badge ${
                      r.publication.includes("lead") ? "badge-lead" : "badge-contrib"
                    }`}
                  >
                    {r.publication.includes("lead") ? "Lead Author" : "Contributing Author"}
                  </span>
                )}
                {r.upcoming && <span className="badge badge-upcoming">Starting 2026</span>}
              </div>
              <h3 className="research-title">{r.title}</h3>
              <p className="research-pi">{r.pi} — {r.institution}</p>
              <p className="research-desc">{r.description}</p>
              <div className="tag-row">
                {r.tags.map((t) => (
                  <span className="tag" key={t}>{t}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Projects ─────────────────────────────────────────────── */
function Projects() {
  return (
    <section className="section" id="projects">
      <div className="container">
        <div className="section-eyebrow">Projects</div>
        <div className="projects-grid">
          {projects.map((p) => (
            <article
              className={`project-card ${p.featured ? "project-featured" : ""}`}
              key={p.id}
            >
              <div className="project-body">
                <h3 className="project-title">{p.title}</h3>
                <p className="project-desc">{p.description}</p>
              </div>
              <div className="project-bottom">
                <div className="tag-row">
                  {p.tags.map((t) => (
                    <span className="tag" key={t}>{t}</span>
                  ))}
                </div>
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
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Experience ───────────────────────────────────────────── */
function Experience() {
  return (
    <section className="section" id="experience">
      <div className="container">
        <div className="section-eyebrow">Experience</div>
        <div className="experience-list">
          {experience.map((e, i) => (
            <div className="exp-row" key={i}>
              <div className="exp-period">{e.period}</div>
              <div className="exp-content">
                <h3 className="exp-role">{e.role}</h3>
                <p className="exp-company">{e.company} — {e.location}</p>
                <p className="exp-desc">{e.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="section-eyebrow" style={{ marginTop: 80 }}>Publications</div>
        <div className="publications-list">
          {publications.map((p, i) => (
            <div className="pub-item" key={i}>
              <h3 className="pub-title">{p.title}</h3>
              <p className="pub-authors">{p.authors}</p>
              <p className="pub-venue">{p.venue}</p>
              <span className={`badge ${p.role === "Lead Author" ? "badge-lead" : "badge-contrib"}`}>
                {p.status} · {p.role}
              </span>
            </div>
          ))}
        </div>

        <div className="section-eyebrow" style={{ marginTop: 80 }}>Skills</div>
        <div className="skills-grid">
          <div>
            <div className="sidebar-label">Languages</div>
            <div className="tag-row">{skills.languages.map((s) => <span className="tag" key={s}>{s}</span>)}</div>
          </div>
          <div>
            <div className="sidebar-label">Tools</div>
            <div className="tag-row">{skills.tools.map((s) => <span className="tag" key={s}>{s}</span>)}</div>
          </div>
          <div>
            <div className="sidebar-label">Domains</div>
            <div className="tag-row">{skills.domains.map((s) => <span className="tag" key={s}>{s}</span>)}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer / Contact ─────────────────────────────────────── */
function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="container">
        <div className="footer-inner">
          <div>
            <h2 className="footer-cta">Let's build something<br />that matters.</h2>
            <a href={`mailto:${personal.email}`} className="footer-email">
              {personal.email} ↗
            </a>
          </div>
          <div className="footer-right">
            <a href={personal.github} target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href={personal.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a href={personal.efolio} target="_blank" rel="noopener noreferrer">GCS ePortfolio</a>
          </div>
        </div>
        <div className="footer-copy">© {new Date().getFullYear()} {personal.name}</div>
      </div>
    </footer>
  );
}

/* ─── App ──────────────────────────────────────────────────── */
export default function App() {
  return (
    <>
      <Nav />
      <Hero />
      <main className="main-content">
        <About />
        <Research />
        <Projects />
        <Experience />
        <Footer />
      </main>
    </>
  );
}
