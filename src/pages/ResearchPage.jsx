import PageHeader from "../components/PageHeader";
import FadeUp from "../components/FadeUp";
import { research } from "../data";

export default function ResearchPage() {
  return (
    <main className="page">
      <div className="container">
        <PageHeader
          dept="Dept. of Medical Robotics &amp; Quantum Systems"
          title="Research"
          sceneType="dna"
          intro="My research spans medical robotics, quantum materials, and AI-driven surgical systems — connected by a focus on building tools that reveal what was previously invisible."
        />

        <div className="page-section">
          <div className="section-eyebrow">Active Projects</div>
          <div className="research-list">
            {research.map((r, i) => (
              <FadeUp key={r.id} delay={i * 0.07}>
                <article className="research-card">
                  <div className="research-meta">
                    <span className="research-lab">{r.lab} · {r.institution}</span>
                    {r.publication && (
                      <span className={`badge ${r.publication.includes("lead") ? "badge-lead" : "badge-contrib"}`}>
                        {r.publication.includes("lead") ? "Lead Author" : "Contributing Author"}
                      </span>
                    )}
                    {r.upcoming && (
                      <span className="badge badge-upcoming">Starting 2026</span>
                    )}
                  </div>
                  <h2 className="research-card-title">{r.title}</h2>
                  <p className="research-pi">{r.pi}</p>
                  <p className="research-desc">{r.description}</p>
                  <div className="tag-row">
                    {r.tags.map((t) => (
                      <span className="tag" key={t}>{t}</span>
                    ))}
                  </div>
                </article>
              </FadeUp>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
