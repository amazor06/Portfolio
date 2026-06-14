import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Html, Float, Environment } from "@react-three/drei";
import { useState, useRef, useMemo } from "react";
import * as THREE from "three";

/* ─── Reusable wrapper: hover detection + tooltip ──────────── */
function InteractiveObject({ position, rotation, label, children, floatSpeed = 2, floatIntensity = 0.3 }) {
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef();

  return (
    <Float speed={floatSpeed} rotationIntensity={0.1} floatIntensity={floatIntensity}>
      <group
        ref={groupRef}
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
        scale={hovered ? 1.06 : 1}
      >
        {children}
        {hovered && (
          <Html position={[0, 1.4, 0]} center distanceFactor={8}>
            <div className="room-tooltip">{label}</div>
          </Html>
        )}
      </group>
    </Float>
  );
}

/* ─── Objects ──────────────────────────────────────────────── */

function Laptop() {
  const mat = { color: "#111", roughness: 0.35, metalness: 0.15 };
  return (
    <InteractiveObject position={[0, 0, 0]} label="Building things that matter">
      {/* Base */}
      <mesh position={[0, 0.04, 0]} castShadow>
        <boxGeometry args={[1.3, 0.06, 0.9]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      {/* Keyboard surface detail */}
      <mesh position={[0, 0.071, 0.05]}>
        <boxGeometry args={[1.05, 0.001, 0.55]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>
      {/* Screen hinge area */}
      <group position={[0, 0.07, -0.42]} rotation={[-1.15, 0, 0]}>
        {/* Screen body */}
        <mesh castShadow>
          <boxGeometry args={[1.25, 0.82, 0.03]} />
          <meshStandardMaterial {...mat} />
        </mesh>
        {/* Screen display */}
        <mesh position={[0, 0.02, 0.016]}>
          <boxGeometry args={[1.08, 0.66, 0.001]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.95} emissive="#111" emissiveIntensity={0.05} />
        </mesh>
      </group>
    </InteractiveObject>
  );
}

function SoccerBall() {
  return (
    <InteractiveObject position={[-2, 0.35, 1.2]} label="The beautiful game" floatSpeed={1.5}>
      <mesh castShadow>
        <icosahedronGeometry args={[0.35, 1]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.6} flatShading />
      </mesh>
      {/* Wireframe overlay for panel look */}
      <mesh>
        <icosahedronGeometry args={[0.352, 1]} />
        <meshBasicMaterial color="#111" wireframe />
      </mesh>
    </InteractiveObject>
  );
}

function Dumbbell() {
  const plateMat = { color: "#111", roughness: 0.3, metalness: 0.4 };
  const barMat = { color: "#333", roughness: 0.2, metalness: 0.6 };
  return (
    <InteractiveObject position={[2.2, 0.18, 0.6]} rotation={[0, 0.4, 0]} label="Discipline" floatSpeed={1.8}>
      {/* Bar */}
      <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.035, 0.035, 1.4, 16]} />
        <meshStandardMaterial {...barMat} />
      </mesh>
      {/* Left plates */}
      <mesh position={[-0.55, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.18, 0.18, 0.08, 24]} />
        <meshStandardMaterial {...plateMat} />
      </mesh>
      <mesh position={[-0.64, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.06, 24]} />
        <meshStandardMaterial {...plateMat} />
      </mesh>
      {/* Right plates */}
      <mesh position={[0.55, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.18, 0.18, 0.08, 24]} />
        <meshStandardMaterial {...plateMat} />
      </mesh>
      <mesh position={[0.64, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.06, 24]} />
        <meshStandardMaterial {...plateMat} />
      </mesh>
    </InteractiveObject>
  );
}

function Flask() {
  const points = useMemo(() => {
    return [
      new THREE.Vector2(0, 0),
      new THREE.Vector2(0.28, 0),
      new THREE.Vector2(0.28, 0.03),
      new THREE.Vector2(0.26, 0.06),
      new THREE.Vector2(0.08, 0.42),
      new THREE.Vector2(0.065, 0.55),
      new THREE.Vector2(0.065, 0.62),
      new THREE.Vector2(0.075, 0.63),
      new THREE.Vector2(0.075, 0.65),
    ];
  }, []);

  return (
    <InteractiveObject position={[-1.8, 0, -1.4]} label="Research & discovery" floatSpeed={1.2}>
      <mesh castShadow>
        <latheGeometry args={[points, 32]} />
        <meshStandardMaterial
          color="#e8e8e8"
          roughness={0.1}
          metalness={0.05}
          transparent
          opacity={0.85}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Dark rim */}
      <mesh position={[0, 0.65, 0]}>
        <torusGeometry args={[0.075, 0.008, 8, 24]} />
        <meshStandardMaterial color="#111" roughness={0.3} />
      </mesh>
      {/* Liquid inside */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.18, 0.25, 0.12, 24]} />
        <meshStandardMaterial color="#222" roughness={0.8} transparent opacity={0.6} />
      </mesh>
    </InteractiveObject>
  );
}

function BookStack() {
  const books = [
    { width: 0.9, height: 0.12, depth: 0.65, color: "#111", y: 0.06 },
    { width: 0.85, height: 0.1, depth: 0.62, color: "#2a2a2a", y: 0.17, rotY: 0.08 },
    { width: 0.78, height: 0.14, depth: 0.6, color: "#0a0a0a", y: 0.29, rotY: -0.05 },
  ];

  return (
    <InteractiveObject position={[1.6, 0, -1.6]} label="Always learning" floatSpeed={1.3}>
      {books.map((b, i) => (
        <mesh key={i} position={[0, b.y, 0]} rotation={[0, b.rotY || 0, 0]} castShadow>
          <boxGeometry args={[b.width, b.height, b.depth]} />
          <meshStandardMaterial color={b.color} roughness={0.7} />
        </mesh>
      ))}
      {/* Page edges visible on the middle book */}
      <mesh position={[0.38, 0.17, 0]} rotation={[0, 0.08, 0]}>
        <boxGeometry args={[0.01, 0.08, 0.58]} />
        <meshStandardMaterial color="#d0d0d0" roughness={0.9} />
      </mesh>
    </InteractiveObject>
  );
}

function RoboticArm() {
  const jointMat = { color: "#222", roughness: 0.25, metalness: 0.5 };
  const armMat = { color: "#111", roughness: 0.35, metalness: 0.3 };

  return (
    <InteractiveObject position={[0.8, 0, 2]} rotation={[0, -0.5, 0]} label="The future of surgery" floatSpeed={1.6}>
      {/* Base */}
      <mesh castShadow>
        <cylinderGeometry args={[0.3, 0.35, 0.12, 24]} />
        <meshStandardMaterial {...armMat} />
      </mesh>
      {/* Base column */}
      <mesh position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 0.32, 16]} />
        <meshStandardMaterial {...armMat} />
      </mesh>
      {/* Joint 1 */}
      <mesh position={[0, 0.38, 0]} castShadow>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial {...jointMat} />
      </mesh>
      {/* Lower arm */}
      <group position={[0, 0.38, 0]} rotation={[0, 0, 0.6]}>
        <mesh position={[0, 0.28, 0]} castShadow>
          <boxGeometry args={[0.07, 0.5, 0.07]} />
          <meshStandardMaterial {...armMat} />
        </mesh>
        {/* Joint 2 */}
        <mesh position={[0, 0.55, 0]} castShadow>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial {...jointMat} />
        </mesh>
        {/* Upper arm */}
        <group position={[0, 0.55, 0]} rotation={[0, 0, -1.0]}>
          <mesh position={[0, 0.2, 0]} castShadow>
            <boxGeometry args={[0.055, 0.35, 0.055]} />
            <meshStandardMaterial {...armMat} />
          </mesh>
          {/* End effector */}
          <group position={[0, 0.4, 0]}>
            <mesh castShadow>
              <sphereGeometry args={[0.04, 12, 12]} />
              <meshStandardMaterial {...jointMat} />
            </mesh>
            {/* Gripper prongs */}
            <mesh position={[-0.03, 0.08, 0]} rotation={[0, 0, 0.2]} castShadow>
              <boxGeometry args={[0.015, 0.12, 0.015]} />
              <meshStandardMaterial {...armMat} />
            </mesh>
            <mesh position={[0.03, 0.08, 0]} rotation={[0, 0, -0.2]} castShadow>
              <boxGeometry args={[0.015, 0.12, 0.015]} />
              <meshStandardMaterial {...armMat} />
            </mesh>
          </group>
        </group>
      </group>
    </InteractiveObject>
  );
}

/* ─── Slow auto-rotate that stops on interaction ───────────── */
function AutoRotate({ controlsRef }) {
  const interacting = useRef(false);
  const timeout = useRef(null);

  useFrame(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = !interacting.current;
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      autoRotate
      autoRotateSpeed={0.4}
      enableZoom={false}
      enablePan={false}
      minPolarAngle={Math.PI * 0.25}
      maxPolarAngle={Math.PI * 0.5}
      makeDefault
      onStart={() => {
        interacting.current = true;
        clearTimeout(timeout.current);
      }}
      onEnd={() => {
        timeout.current = setTimeout(() => {
          interacting.current = false;
        }, 3000);
      }}
    />
  );
}

/* ─── Main Scene ───────────────────────────────────────────── */
function Scene() {
  const controlsRef = useRef();

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={20}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
      />
      <directionalLight position={[-3, 4, -2]} intensity={0.3} />

      {/* Environment for subtle reflections */}
      <Environment preset="studio" />

      {/* Objects */}
      <Laptop />
      <SoccerBall />
      <Dumbbell />
      <Flask />
      <BookStack />
      <RoboticArm />

      {/* Ground shadow */}
      <ContactShadows
        position={[0, -0.01, 0]}
        opacity={0.35}
        scale={12}
        blur={2.5}
        far={4}
      />

      {/* Subtle floor grid */}
      <gridHelper args={[20, 20, "#ddd", "#eee"]} position={[0, -0.02, 0]} />

      {/* Controls */}
      <AutoRotate controlsRef={controlsRef} />
    </>
  );
}

/* ─── Exported Component ───────────────────────────────────── */
export default function Room() {
  return (
    <div className="room-canvas-wrapper">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [4.5, 3.2, 4.5], fov: 40 }}
        style={{ background: "transparent" }}
      >
        <Scene />
      </Canvas>
      <div className="room-hint">
        <span>Drag to explore</span>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 3v10M4 9l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
}
