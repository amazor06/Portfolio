import Room from "../components/Room";
import { personal } from "../data";

export default function Home() {
  return (
    <div className="home">
      <header className="home-header">
        <h1 className="home-name">
          {personal.name.split(" ")[0]}
          <br />
          {personal.name.split(" ")[1]}
        </h1>
        <p className="home-tagline">{personal.tagline}</p>
      </header>

      <div className="home-room">
        <Room />
      </div>

      <div className="home-hint">
        <span>Drag to explore</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7 1v12M3 9l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
