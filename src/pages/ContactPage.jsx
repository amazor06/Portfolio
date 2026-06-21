import PageHeader from "../components/PageHeader";
import FadeUp from "../components/FadeUp";
import { personal } from "../data";

export default function ContactPage() {
  return (
    <main className="page contact-page">
      <div className="container">
        <PageHeader
          dept="Communication &amp; Collaboration"
          title="Contact"
          sceneType="envelope"
          intro={null}
        />

        <FadeUp delay={0.1}>
          <div className="contact-grid" style={{ marginTop: 48 }}>
            <div>
              <p className="contact-blurb">
                I'm always open to conversations about medical robotics, AI in
                surgery, research collaborations, or interesting engineering
                problems. Currently based in the Bay Area.
              </p>
              <a href={`mailto:${personal.email}`} className="contact-email">
                {personal.email}
              </a>
            </div>

            <div className="contact-links">
              <div className="contact-links-label">Elsewhere</div>
              <a href={personal.github} target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
              <a href={personal.linkedin} target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
              <a href={personal.efolio} target="_blank" rel="noopener noreferrer">
                GCSP ePortfolio
              </a>
            </div>
          </div>
        </FadeUp>

        <FadeUp delay={0.2}>
          <div className="contact-footer">
            <p>© {new Date().getFullYear()} {personal.name}</p>
            <p>Santa Clara University · CS&amp;E + Engineering Physics '28</p>
          </div>
        </FadeUp>
      </div>
    </main>
  );
}
