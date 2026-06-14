import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  ContactShadows,
  Html,
  Float,
  Environment,
} from "@react-three/drei";
import { useState, useRef, useMemo } from "react";
import * as THREE from "three";

/* ─── Hover wrapper with tooltip ───────────────────────────── */
function HoverObject({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  label,
  floatSpeed = 1.8,
  floatIntensity = 0.25,
  children,
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <Float
      speed={floatSpeed}
      rotationIntensity={0.08}
      floatIntensity={floatIntensity}
    >
      <group
        position={position}
        rotation={rotation}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "default";
        }}
        scale={hovered ? 1.08 : 1}
      >
        {children}
        {hovered && (
          <Html position={[0, 1.6, 0]} center distanceFactor={8}>
            <div className="room-tooltip">{label}</div>
          </Html>
        )}
      </group>
    </Float>
  );
}

/* ─── SOCCER BALL ──────────────────────────────────────────── */
function SoccerBall() {
  return (
    <HoverObject
      position={[-2.2, 0.4, 0.8]}
      label="The beautiful game"
      floatSpeed={1.4}
    >
      {/* Solid core */}
      <mesh castShadow>
        <icosahedronGeometry args={[0.38, 2]} />
        <meshStandardMaterial
          color="#f0f0f0"
          roughness={0.55}
          flatShading
        />
      </mesh>
      {/* Panel lines */}
      <mesh>
        <icosahedronGeometry args={[0.385, 2]} />
        <meshBasicMaterial color="#1a1a1a" wireframe />
      </mesh>
    </HoverObject>
  );
}

/* ─── DUMBBELL ─────────────────────────────────────────────── */
function Dumbbell() {
  const dark = { color: "#0e0e0e", roughness: 0.25, metalness: 0.5 };
  const bar = { color: "#2a2a2a", roughness: 0.15, metalness: 0.7 };

  return (
    <HoverObject
      position={[2.0, 0.2, 1.0]}
      rotation={[0, 0.5, 0]}
      label="Discipline"
      floatSpeed={1.6}
    >
      {/* Bar */}
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 1.6, 16]} />
        <meshStandardMaterial {...bar} />
      </mesh>
      {/* Grip texture rings */}
      {[-0.15, -0.05, 0.05, 0.15].map((x, i) => (
        <mesh key={i} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.035, 0.004, 8, 16]} />
          <meshStandardMaterial color="#333" roughness={0.3} metalness={0.6} />
        </mesh>
      ))}
      {/* Left plates */}
      {[[-0.58, 0.22], [-0.67, 0.18]].map(([x, r], i) => (
        <mesh key={`l${i}`} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[r, r, 0.07, 32]} />
          <meshStandardMaterial {...dark} />
        </mesh>
      ))}
      {/* Right plates */}
      {[[0.58, 0.22], [0.67, 0.18]].map(([x, r], i) => (
        <mesh key={`r${i}`} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[r, r, 0.07, 32]} />
          <meshStandardMaterial {...dark} />
        </mesh>
      ))}
    </HoverObject>
  );
}

/* ─── GLOBE ────────────────────────────────────────────────── */
function Globe() {
  const globeRef = useRef();

  useFrame((_, delta) => {
    if (globeRef.current) {
      globeRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <HoverObject
      position={[1.8, 0.3, -1.6]}
      label="Global perspective"
      floatSpeed={1.2}
      floatIntensity={0.15}
    >
      {/* Stand base */}
      <mesh position={[0, -0.55, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.24, 0.05, 24]} />
        <meshStandardMaterial color="#111" roughness={0.3} metalness={0.4} />
      </mesh>
      {/* Stand column */}
      <mesh position={[0, -0.35, 0]} castShadow>
        <cylinderGeometry args={[0.025, 0.03, 0.4, 12]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.2} metalness={0.5} />
      </mesh>
      {/* Axis arc (meridian ring) */}
      <mesh rotation={[0, 0, 0.35]}>
        <torusGeometry args={[0.44, 0.012, 8, 48]} />
        <meshStandardMaterial color="#222" roughness={0.2} metalness={0.5} />
      </mesh>
      {/* Globe sphere group - rotates */}
      <group ref={globeRef} rotation={[0, 0, 0.35]}>
        {/* Solid sphere */}
        <mesh castShadow>
          <sphereGeometry args={[0.4, 32, 24]} />
          <meshStandardMaterial color="#e8e8e8" roughness={0.7} />
        </mesh>
        {/* Latitude lines */}
        {[-0.3, -0.15, 0, 0.15, 0.3].map((y, i) => {
          const r = Math.sqrt(0.4 * 0.4 - y * y);
          return (
            <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[r - 0.003, r + 0.003, 48]} />
              <meshBasicMaterial color="#888" side={THREE.DoubleSide} />
            </mesh>
          );
        })}
        {/* Longitude lines */}
        {[0, Math.PI / 3, (2 * Math.PI) / 3].map((rot, i) => (
          <mesh key={`lon${i}`} rotation={[0, rot, 0]}>
            <torusGeometry args={[0.4, 0.004, 8, 48]} />
            <meshBasicMaterial color="#888" />
          </mesh>
        ))}
      </group>
    </HoverObject>
  );
}

/* ─── ATOM MODEL ───────────────────────────────────────────── */
function AtomModel() {
  const orbit1 = useRef();
  const orbit2 = useRef();
  const orbit3 = useRef();

  useFrame((_, delta) => {
    if (orbit1.current) orbit1.current.rotation.z += delta * 0.6;
    if (orbit2.current) orbit2.current.rotation.z += delta * 0.45;
    if (orbit3.current) orbit3.current.rotation.z += delta * 0.35;
  });

  const ringMat = { color: "#333", roughness: 0.3, metalness: 0.4 };
  const electronMat = { color: "#111", roughness: 0.2, metalness: 0.5 };

  return (
    <HoverObject
      position={[-1.6, 0.5, -1.5]}
      label="Science & discovery"
      floatSpeed={1.5}
    >
      {/* Nucleus cluster */}
      <mesh castShadow>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#111" roughness={0.3} metalness={0.3} />
      </mesh>
      <mesh position={[0.06, 0.04, 0]} castShadow>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshStandardMaterial color="#222" roughness={0.4} />
      </mesh>
      <mesh position={[-0.04, 0.06, 0.03]} castShadow>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.35} />
      </mesh>

      {/* Orbit 1 — horizontal-ish */}
      <group rotation={[0.3, 0, 0]} ref={orbit1}>
        <mesh>
          <torusGeometry args={[0.5, 0.006, 8, 64]} />
          <meshStandardMaterial {...ringMat} />
        </mesh>
        <mesh position={[0.5, 0, 0]} castShadow>
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshStandardMaterial {...electronMat} />
        </mesh>
      </group>

      {/* Orbit 2 — tilted */}
      <group rotation={[1.2, 0.8, 0]} ref={orbit2}>
        <mesh>
          <torusGeometry args={[0.5, 0.006, 8, 64]} />
          <meshStandardMaterial {...ringMat} />
        </mesh>
        <mesh position={[0.5, 0, 0]} castShadow>
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshStandardMaterial {...electronMat} />
        </mesh>
      </group>

      {/* Orbit 3 — opposite tilt */}
      <group rotation={[-0.8, 1.2, 0.4]} ref={orbit3}>
        <mesh>
          <torusGeometry args={[0.5, 0.006, 8, 64]} />
          <meshStandardMaterial {...ringMat} />
        </mesh>
        <mesh position={[0.5, 0, 0]} castShadow>
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshStandardMaterial {...electronMat} />
        </mesh>
      </group>
    </HoverObject>
  );
}

/* ─── ROBOTIC ARM ──────────────────────────────────────────── */
function RoboticArm() {
  const armMat = { color: "#0e0e0e", roughness: 0.3, metalness: 0.35 };
  const jointMat = { color: "#1a1a1a", roughness: 0.2, metalness: 0.55 };

  return (
    <HoverObject
      position={[0.2, 0, 1.8]}
      rotation={[0, -0.6, 0]}
      label="The future of surgery"
      floatSpeed={1.3}
      floatIntensity={0.2}
    >
      {/* Base plate */}
      <mesh castShadow>
        <cylinderGeometry args={[0.32, 0.36, 0.08, 32]} />
        <meshStandardMaterial {...armMat} />
      </mesh>
      {/* Base ring detail */}
      <mesh position={[0, 0.04, 0]}>
        <torusGeometry args={[0.33, 0.01, 8, 32]} />
        <meshStandardMaterial {...jointMat} />
      </mesh>
      {/* Column */}
      <mesh position={[0, 0.24, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.09, 0.34, 16]} />
        <meshStandardMaterial {...armMat} />
      </mesh>
      {/* Joint 1 */}
      <mesh position={[0, 0.42, 0]} castShadow>
        <sphereGeometry args={[0.1, 20, 20]} />
        <meshStandardMaterial {...jointMat} />
      </mesh>

      {/* Lower arm segment */}
      <group position={[0, 0.42, 0]} rotation={[0, 0, 0.55]}>
        <mesh position={[0, 0.25, 0]} castShadow>
          <boxGeometry args={[0.065, 0.45, 0.065]} />
          <meshStandardMaterial {...armMat} />
        </mesh>
        {/* Joint 2 */}
        <mesh position={[0, 0.5, 0]} castShadow>
          <sphereGeometry args={[0.075, 20, 20]} />
          <meshStandardMaterial {...jointMat} />
        </mesh>

        {/* Upper arm segment */}
        <group position={[0, 0.5, 0]} rotation={[0, 0, -0.9]}>
          <mesh position={[0, 0.18, 0]} castShadow>
            <boxGeometry args={[0.05, 0.32, 0.05]} />
            <meshStandardMaterial {...armMat} />
          </mesh>
          {/* Wrist joint */}
          <mesh position={[0, 0.36, 0]} castShadow>
            <sphereGeometry args={[0.045, 16, 16]} />
            <meshStandardMaterial {...jointMat} />
          </mesh>
          {/* End effector / gripper */}
          <group position={[0, 0.36, 0]}>
            {/* Gripper housing */}
            <mesh position={[0, 0.06, 0]} castShadow>
              <boxGeometry args={[0.06, 0.08, 0.04]} />
              <meshStandardMaterial {...armMat} />
            </mesh>
            {/* Left finger */}
            <mesh position={[-0.035, 0.14, 0]} rotation={[0, 0, 0.15]} castShadow>
              <boxGeometry args={[0.012, 0.1, 0.02]} />
              <meshStandardMaterial {...jointMat} />
            </mesh>
            {/* Right finger */}
            <mesh position={[0.035, 0.14, 0]} rotation={[0, 0, -0.15]} castShadow>
              <boxGeometry args={[0.012, 0.1, 0.02]} />
              <meshStandardMaterial {...jointMat} />
            </mesh>
          </group>
        </group>
      </group>
    </HoverObject>
  );
}

/* ─── Auto-rotate controls ─────────────────────────────────── */
function Controls() {
  const controlsRef = useRef();
  const interacting = useRef(false);
  const timeout = useRef(null);

  return (
    <OrbitControls
      ref={controlsRef}
      autoRotate
      autoRotateSpeed={0.35}
      enableZoom={false}
      enablePan={false}
      minPolarAngle={Math.PI * 0.28}
      maxPolarAngle={Math.PI * 0.52}
      dampingFactor={0.05}
      enableDamping
      onStart={() => {
        interacting.current = true;
        if (controlsRef.current) controlsRef.current.autoRotate = false;
        clearTimeout(timeout.current);
      }}
      onEnd={() => {
        timeout.current = setTimeout(() => {
          interacting.current = false;
          if (controlsRef.current) controlsRef.current.autoRotate = true;
        }, 3500);
      }}
    />
  );
}

/* ─── Full Scene ───────────────────────────────────────────── */
function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[6, 10, 6]}
        intensity={1.4}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-4, 6, -3]} intensity={0.25} />

      <Environment preset="studio" />

      <SoccerBall />
      <Dumbbell />
      <Globe />
      <AtomModel />
      <RoboticArm />

      <ContactShadows
        position={[0, -0.02, 0]}
        opacity={0.3}
        scale={14}
        blur={2.5}
        far={4}
      />

      <gridHelper
        args={[24, 24, "#e0e0e0", "#ececec"]}
        position={[0, -0.03, 0]}
      />

      <Controls />
    </>
  );
}

/* ─── Exported Canvas ──────────────────────────────────────── */
export default function Room() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [5, 3.5, 5], fov: 38 }}
      style={{ background: "transparent" }}
    >
      <Scene />
    </Canvas>
  );
}
