import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Corridor from "../components/Corridor";
import { personal } from "../data";
import { corridorHasPlayed, markCorridorPlayed } from "../introState";

export default function Home() {
  const navigate  = useNavigate();
  const hasPlayed = corridorHasPlayed;

  const [nameIn,     setNameIn]     = useState(hasPlayed);
  const [tagIn,      setTagIn]      = useState(false);
  const [navVisible, setNavVisible] = useState(hasPlayed);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    if (hasPlayed) {
      // Returning via SPA nav — show tagline immediately
      const t = setTimeout(() => setTagIn(true), 80);
      return () => { document.body.style.overflow = ""; clearTimeout(t); };
    }

    // First load (or after refresh) — name fades in during fly-through
    const t1 = setTimeout(() => setNameIn(true), 2800);
    return () => {
      document.body.style.overflow = "";
      clearTimeout(t1);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAnimComplete = () => {
    markCorridorPlayed();
    setNavVisible(true);
    setTagIn(true); // tagline appears with the panels
  };

  return (
    <div className="corridor-home">
      <Corridor
        onAnimComplete={handleAnimComplete}
        navigate={navigate}
        navVisible={navVisible}
        skipIntro={hasPlayed}
      />
      <div className="corridor-overlay">
        <h1 className={`corridor-name${nameIn ? " in" : ""}`}>
          {personal.name.split(" ")[0]}
          <br />
          {personal.name.split(" ")[1]}
        </h1>
        <p className={`corridor-tagline${tagIn ? " in" : ""}`}>
          {personal.tagline}
        </p>
      </div>
    </div>
  );
}
