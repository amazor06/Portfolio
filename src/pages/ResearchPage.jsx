import { research } from "../data";

export default function ResearchPage() {
  return (
    <main className="page">
      <div className="container">
        <h1 className="page-title">Research</h1>
        <p className="page-intro">
          My research spans medical robotics, quantum materials, and AI-driven
          surgical systems — connected by a focus on building tools that reveal
          what was previously invisible.
        </p>

        <div className="research-list">
          {research.map((r) => (
            <article className="research-card" key={r.id}>
              <div className="research-meta">
                <span className="research-lab">{r.lab}</span>
                {r.publication && (
                  <span
                    className={`badge ${
                      r.publication.includes("lead")
                        ? "badge-lead"
                        : "badge-contrib"
                    }`}
                  >
                    {r.publication.includes("lead")
                      ? "Lead Author"
                      : "Contributing Author"}
                  </span>
                )}
                {r.upcoming && (
                  <span className="badge badge-upcoming">Starting 2026</span>
                )}
              </div>
              <h2 className="research-card-title">{r.title}</h2>
              <p className="research-pi">
                {r.pi} — {r.institution}
              </p>
              <p className="research-desc">{r.description}</p>
              <div className="tag-row">
                {r.tags.map((t) => (
                  <span className="tag" key={t}>
                    {t}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
