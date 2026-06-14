import { BrowserRouter, Routes, Route, NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Home from "./pages/Home";
import ResearchPage from "./pages/ResearchPage";
import ProjectsPage from "./pages/ProjectsPage";
import ExperiencePage from "./pages/ExperiencePage";
import ContactPage from "./pages/ContactPage";
import { personal } from "./data";
import "./App.css";

/* ─── Scroll to top on route change ───────────────────────── */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

/* ─── Navigation ──────────────────────────────────────────── */
function Nav() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [location]);

  return (
    <nav className="nav">
      <div className="nav-inner">
        <NavLink to="/" className="nav-logo">
          {personal.name.split(" ")[0]}
        </NavLink>

        <button
          className="nav-toggle"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <span className={`hamburger ${open ? "open" : ""}`} />
        </button>

        <ul className={`nav-links ${open ? "open" : ""}`}>
          {[
            ["/", "Home"],
            ["/research", "Research"],
            ["/projects", "Projects"],
            ["/experience", "Experience"],
            ["/contact", "Contact"],
          ].map(([to, label]) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

/* ─── App ──────────────────────────────────────────────────── */
export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/research" element={<ResearchPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/experience" element={<ExperiencePage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
    </BrowserRouter>
  );
}
