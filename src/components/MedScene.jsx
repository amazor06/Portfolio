import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

const BLUE  = "#4a90b8";
const BLUE2 = "#b8d8ea";
const DARK  = "#0a1628";
const LIGHT = "#f0f4f8";

/* ── Shared lighting ─────────────────────────────────────── */
function Lights() {
  return (
    <>
      <ambientLight intensity={0.65} />
      <directionalLight position={[3, 5, 3]} intensity={1.1} castShadow={false} />
      <directionalLight position={[-2, -2, -2]} intensity={0.25} />
    </>
  );
}

/* ── 1. DNA Double Helix ─────────────────────────────────── */
const PAIRS   = 14;
const TURNS   = 2.2;
const HHEIGHT = 2.4;
const HRAD    = 0.38;

function DNAHelix() {
  const pairs = Array.from({ length: PAIRS }, (_, i) => {
    const t     = i / (PAIRS - 1);
    const angle = t * TURNS * Math.PI * 2;
    const y     = (t - 0.5) * HHEIGHT;
    return { angle, y };
  });

  return (
    <group>
      {pairs.map(({ angle, y }, i) => (
        <group key={i}>
          {/* Strand A */}
          <mesh position={[Math.cos(angle) * HRAD, y, Math.sin(angle) * HRAD]}>
            <sphereGeometry args={[0.062, 8, 8]} />
            <meshStandardMaterial color={BLUE} roughness={0.25} metalness={0.15} />
          </mesh>
          {/* Strand B */}
          <mesh position={[-Math.cos(angle) * HRAD, y, -Math.sin(angle) * HRAD]}>
            <sphereGeometry args={[0.062, 8, 8]} />
            <meshStandardMaterial color={BLUE2} roughness={0.25} metalness={0.15} />
          </mesh>
          {/* Rung every other pair */}
          {i % 2 === 0 && (
            <mesh
              position={[0, y, 0]}
              rotation={[Math.PI / 2, -Math.PI / 2 - angle, 0]}
            >
              <cylinderGeometry args={[0.016, 0.016, HRAD * 2, 6]} />
              <meshStandardMaterial color="#ddeef8" roughness={0.5} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}

/* ── 2. Gear ─────────────────────────────────────────────── */
const TEETH  = 12;
const DISC_R = 0.72;

function Gear() {
  const toothAngles = Array.from(
    { length: TEETH },
    (_, i) => (i / TEETH) * Math.PI * 2
  );

  return (
    <group>
      {/* Main disc */}
      <mesh>
        <cylinderGeometry args={[DISC_R, DISC_R, 0.16, 40]} />
        <meshStandardMaterial color={LIGHT} roughness={0.35} metalness={0.25} />
      </mesh>
      {/* Inner hub */}
      <mesh position={[0, 0.01, 0]}>
        <cylinderGeometry args={[0.24, 0.24, 0.18, 24]} />
        <meshStandardMaterial color={BLUE} roughness={0.28} metalness={0.3} />
      </mesh>
      {/* Centre bore */}
      <mesh>
        <cylinderGeometry args={[0.09, 0.09, 0.22, 12]} />
        <meshStandardMaterial color={DARK} roughness={0.4} />
      </mesh>
      {/* Teeth */}
      {toothAngles.map((a, i) => (
        <mesh
          key={i}
          position={[
            (DISC_R + 0.10) * Math.cos(a),
            0,
            (DISC_R + 0.10) * Math.sin(a),
          ]}
          rotation={[0, Math.PI / 2 - a, 0]}
        >
          <boxGeometry args={[0.16, 0.16, 0.22]} />
          <meshStandardMaterial color={BLUE} roughness={0.3} metalness={0.2} />
        </mesh>
      ))}
    </group>
  );
}

/* ── 3. Clipboard ────────────────────────────────────────── */
function Clipboard() {
  const lineYs = [-0.08, 0.02, 0.12, 0.22, 0.32];

  return (
    <group>
      {/* Board */}
      <mesh>
        <boxGeometry args={[0.72, 1.02, 0.07]} />
        <meshStandardMaterial color="#1c2838" roughness={0.55} metalness={0.1} />
      </mesh>
      {/* Paper */}
      <mesh position={[0, -0.02, 0.042]}>
        <boxGeometry args={[0.58, 0.80, 0.01]} />
        <meshStandardMaterial color="#f8f8f6" roughness={0.85} />
      </mesh>
      {/* Clip body */}
      <mesh position={[0, 0.55, 0.048]}>
        <boxGeometry args={[0.26, 0.09, 0.06]} />
        <meshStandardMaterial color={BLUE} roughness={0.28} metalness={0.4} />
      </mesh>
      {/* Clip throat */}
      <mesh position={[0, 0.49, 0.065]}>
        <boxGeometry args={[0.16, 0.06, 0.04]} />
        <meshStandardMaterial color={DARK} roughness={0.4} />
      </mesh>
      {/* Text lines */}
      {lineYs.map((y, i) => (
        <mesh key={i} position={[0, y, 0.050]}>
          <boxGeometry args={[0.38 - i * 0.03, 0.015, 0.01]} />
          <meshStandardMaterial color="#b8c8d8" roughness={0.7} />
        </mesh>
      ))}
      {/* Accent stripe — left margin */}
      <mesh position={[-0.22, -0.02, 0.051]}>
        <boxGeometry args={[0.018, 0.72, 0.01]} />
        <meshStandardMaterial color={BLUE} roughness={0.4} metalness={0.2}
          emissive={BLUE} emissiveIntensity={0.18} />
      </mesh>
    </group>
  );
}

/* ── 4. Atom Model ───────────────────────────────────────── */
function Atom() {
  const R = 0.75;

  return (
    <group>
      {/* Nucleus */}
      <mesh>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial
          color={BLUE} roughness={0.2} metalness={0.15}
          emissive={BLUE} emissiveIntensity={0.45}
        />
      </mesh>
      {/* Ring 1 — equatorial (XZ) */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[R, 0.032, 10, 64]} />
        <meshStandardMaterial color={BLUE} roughness={0.3} metalness={0.2} />
      </mesh>
      {/* Ring 2 — tilted 60° */}
      <mesh rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[R, 0.032, 10, 64]} />
        <meshStandardMaterial color={BLUE2} roughness={0.3} metalness={0.2} />
      </mesh>
      {/* Ring 3 — tilted -60° */}
      <mesh rotation={[-Math.PI / 3, 0, 0]}>
        <torusGeometry args={[R, 0.032, 10, 64]} />
        <meshStandardMaterial color={BLUE2} roughness={0.3} metalness={0.2} />
      </mesh>
      {/* Electrons */}
      <mesh position={[R, 0, 0]}>
        <sphereGeometry args={[0.07, 10, 10]} />
        <meshStandardMaterial color="#ffffff" roughness={0.1}
          emissive="#ffffff" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0, R, 0]}>
        <sphereGeometry args={[0.07, 10, 10]} />
        <meshStandardMaterial color="#ffffff" roughness={0.1}
          emissive="#ffffff" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[-R * 0.5, R * 0.866, 0]}>
        <sphereGeometry args={[0.07, 10, 10]} />
        <meshStandardMaterial color="#ffffff" roughness={0.1}
          emissive="#ffffff" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

/* ── 5. Envelope ─────────────────────────────────────────── */
function Envelope() {
  return (
    <group>
      {/* Body */}
      <mesh>
        <boxGeometry args={[1.0, 0.68, 0.10]} />
        <meshStandardMaterial color="#f0f4f8" roughness={0.7} />
      </mesh>
      {/* Left V-fold seam */}
      <mesh
        position={[-0.25, 0.14, 0.054]}
        rotation={[0, 0, Math.PI * 0.30]}
      >
        <boxGeometry args={[0.56, 0.020, 0.01]} />
        <meshStandardMaterial color={BLUE} roughness={0.4}
          emissive={BLUE} emissiveIntensity={0.15} />
      </mesh>
      {/* Right V-fold seam */}
      <mesh
        position={[0.25, 0.14, 0.054]}
        rotation={[0, 0, -Math.PI * 0.30]}
      >
        <boxGeometry args={[0.56, 0.020, 0.01]} />
        <meshStandardMaterial color={BLUE} roughness={0.4}
          emissive={BLUE} emissiveIntensity={0.15} />
      </mesh>
      {/* Bottom seam */}
      <mesh position={[0, -0.28, 0.054]}>
        <boxGeometry args={[0.98, 0.016, 0.01]} />
        <meshStandardMaterial color={BLUE2} roughness={0.4} />
      </mesh>
      {/* Left edge seam */}
      <mesh position={[-0.475, 0, 0.054]}>
        <boxGeometry args={[0.016, 0.66, 0.01]} />
        <meshStandardMaterial color={BLUE2} roughness={0.4} />
      </mesh>
      {/* Right edge seam */}
      <mesh position={[0.475, 0, 0.054]}>
        <boxGeometry args={[0.016, 0.66, 0.01]} />
        <meshStandardMaterial color={BLUE2} roughness={0.4} />
      </mesh>
      {/* Stamp box */}
      <mesh position={[0.36, 0.22, 0.057]}>
        <boxGeometry args={[0.13, 0.17, 0.01]} />
        <meshStandardMaterial color={BLUE} roughness={0.3}
          emissive={BLUE} emissiveIntensity={0.22} />
      </mesh>
      {/* Address line 1 */}
      <mesh position={[-0.06, 0.02, 0.056]}>
        <boxGeometry args={[0.28, 0.014, 0.01]} />
        <meshStandardMaterial color="#b8c8d8" roughness={0.6} />
      </mesh>
      {/* Address line 2 */}
      <mesh position={[-0.04, -0.06, 0.056]}>
        <boxGeometry args={[0.22, 0.014, 0.01]} />
        <meshStandardMaterial color="#b8c8d8" roughness={0.6} />
      </mesh>
      {/* Back thickness panels */}
      <mesh position={[0, 0, -0.054]}>
        <boxGeometry args={[0.98, 0.66, 0.01]} />
        <meshStandardMaterial color="#d8e4ee" roughness={0.7} />
      </mesh>
    </group>
  );
}

/* ── Scene registry ──────────────────────────────────────── */
const SCENES = {
  dna:       { component: DNAHelix,  camPos: [0, 0.1, 3.4],  fov: 55 },
  gear:      { component: Gear,      camPos: [0, 0.5, 2.6],  fov: 50 },
  clipboard: { component: Clipboard, camPos: [0, 0,   2.4],  fov: 50 },
  atom:      { component: Atom,      camPos: [0, 0.2, 2.9],  fov: 55 },
  envelope:  { component: Envelope,  camPos: [0, 0,   2.3],  fov: 50 },
};

/* ── Exported wrapper ────────────────────────────────────── */
export default function MedScene({ type }) {
  const scene = SCENES[type];
  if (!scene) return null;
  const SceneComp = scene.component;

  return (
    <Canvas
      camera={{ position: scene.camPos, fov: scene.fov }}
      gl={{ alpha: true, antialias: true }}
      style={{ width: "100%", height: "100%" }}
    >
      <Lights />
      <SceneComp />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={1.8}
        enableDamping
        dampingFactor={0.08}
      />
    </Canvas>
  );
}
