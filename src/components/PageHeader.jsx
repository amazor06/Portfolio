import MedScene from "./MedScene";

export default function PageHeader({ dept, title, intro, sceneType }) {
  return (
    <>
      <div className="med-header">
        <div className="med-header-text">
          <div className="med-dept-label">{dept}</div>
          <h1 className="med-title"><em>{title}</em></h1>
        </div>
        <div
          className="med-scene-wrap"
          title="Drag to rotate"
        >
          <MedScene type={sceneType} />
        </div>
      </div>
      {intro && <p className="page-intro" style={{ marginTop: 36 }}>{intro}</p>}
    </>
  );
}
