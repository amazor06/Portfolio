import { personal, about } from "../data";

export default function ContactPage() {
  return (
    <main className="page contact-page">
      <div className="container">
        <h1 className="page-title">
          Let's build
          <br />
          <em>something that matters.</em>
        </h1>

        <div className="contact-grid">
          <div className="contact-main">
            <p className="contact-blurb">
              I'm always open to conversations about medical robotics, AI in
              surgery, research collaborations, or interesting engineering
              problems. Currently based in the Bay Area.
            </p>
            <a
              href={`mailto:${personal.email}`}
              className="contact-email"
            >
              {personal.email}
            </a>
          </div>

          <div className="contact-links">
            <div className="contact-links-label">Elsewhere</div>
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
              GCS ePortfolio
            </a>
          </div>
        </div>

        <div className="contact-footer">
          <p>© {new Date().getFullYear()} {personal.name}</p>
          <p>
            Santa Clara University · CS&E + Engineering Physics '28
          </p>
        </div>
      </div>
    </main>
  );
}
