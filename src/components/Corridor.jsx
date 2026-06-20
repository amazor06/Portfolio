import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useRef, useMemo, Suspense, useEffect } from "react";
import EndWallNav from "./EndWallNav";
import * as THREE from "three";

const W = 5;
const H = 3.5;
const Z_START = 14;
const Z_END = -14;
const Z_REST = -10;
const CAM_Y = 1.75;
const FLY_DURATION = 7.5;
const L = Z_START - Z_END;
const MID_Z = (Z_START + Z_END) / 2;

// Left wall glass curtain zone — nearly full corridor length
const GZ0 = -13.5;
const GZ1 = 7.0;
const MULLION_GAP = 1.55;

// Right wall observation window (patient room)
const RW = { z: 3.5, zHalf: 1.35, yBot: 0.3, yTop: 3.2 };

// Clinical palette
const WALL  = "#f0f0ee";
const CEIL  = "#f6f6f4";
const FLOOR = "#e6e6e4";
const MULL  = "#1c2028";

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function lerpKF(kfs, t) {
  if (t <= kfs[0].t) return kfs[0].v.clone();
  const last = kfs[kfs.length - 1];
  if (t >= last.t) return last.v.clone();
  for (let i = 0; i < kfs.length - 1; i++) {
    const a = kfs[i], b = kfs[i + 1];
    if (t >= a.t && t <= b.t) {
      const local = (t - a.t) / (b.t - a.t);
      return new THREE.Vector3().lerpVectors(a.v, b.v, easeInOutCubic(local));
    }
  }
  return kfs[0].v.clone();
}

/* ─── GLB model components ───────────────────────────────────── */
function OperatingTableModel({ position, scale = 1, rotation = [0, 0, 0] }) {
  const { scene } = useGLTF("/models/operating_table.glb");

  useEffect(() => {
    if (!scene) return;
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    box.getSize(size);
    const sc = Array.isArray(scale) ? scale[0] : scale;
    console.log("[OR Table] native bounds (scale=1):",
      `min.y=${box.min.y.toFixed(3)}`,
      `size=${size.x.toFixed(3)} × ${size.y.toFixed(3)} × ${size.z.toFixed(3)}`);
    console.log(`[OR Table] at scene scale ${sc}:`,
      `${(size.x*sc).toFixed(3)} × ${(size.y*sc).toFixed(3)} × ${(size.z*sc).toFixed(3)} m`,
      `| y-offset for floor: ${(-box.min.y*sc).toFixed(3)} m`);
  }, [scene]); // eslint-disable-line react-hooks/exhaustive-deps

  return <primitive object={scene} position={position} scale={scale} rotation={rotation} />;
}

function HospitalBedModel({ position, scale = 1, rotation = [0, 0, 0] }) {
  const { scene } = useGLTF("/models/hospital_bed.glb");
  return <primitive object={scene} position={position} scale={scale} rotation={rotation} />;
}

useGLTF.preload("/models/operating_table.glb");
useGLTF.preload("/models/hospital_bed.glb");

/* ─── Cinematic dolly camera ─────────────────────────────────── */
function CameraFly({ onComplete, skipIntro }) {
  const { camera } = useThree();
  const startedAt = useRef(null);
  const finished  = useRef(false);

  const posKF = useMemo(() => [
    { t: 0.00, v: new THREE.Vector3( 0.0,  CAM_Y,  14) },
    { t: 0.22, v: new THREE.Vector3(-0.85, CAM_Y,   8) },
    { t: 0.43, v: new THREE.Vector3(-0.55, CAM_Y,   2) },
    { t: 0.55, v: new THREE.Vector3( 0.85, CAM_Y,  -1) },
    { t: 0.78, v: new THREE.Vector3( 0.5,  CAM_Y,  -7) },
    { t: 1.00, v: new THREE.Vector3( 0.0,  CAM_Y, -10) },
  ], []);

  const lookKF = useMemo(() => [
    { t: 0.00, v: new THREE.Vector3( 0.0,  CAM_Y, -14) },
    { t: 0.18, v: new THREE.Vector3( 2.5,  1.85,   3.5) },
    { t: 0.46, v: new THREE.Vector3( 2.5,  1.85,   3.5) },
    { t: 0.58, v: new THREE.Vector3(-2.5,  1.85,  -4.5) },
    { t: 0.80, v: new THREE.Vector3(-2.5,  1.85,  -4.5) },
    { t: 1.00, v: new THREE.Vector3( 0.0,  CAM_Y, -14) },
  ], []);

  useFrame(({ clock }) => {
    if (finished.current) return;

    // Returning visitor — jump straight to rest position on first frame
    if (skipIntro) {
      finished.current = true;
      camera.position.set(0, CAM_Y, Z_REST);
      camera.lookAt(0, CAM_Y, Z_END);
      onComplete?.();
      return;
    }

    if (startedAt.current === null) startedAt.current = clock.elapsedTime;
    const raw = Math.min((clock.elapsedTime - startedAt.current) / FLY_DURATION, 1);
    camera.position.copy(lerpKF(posKF, raw));
    camera.lookAt(lerpKF(lookKF, raw));
    if (raw >= 1) { finished.current = true; onComplete?.(); }
  });

  return null;
}

/* ─── Ceiling panel light (recessed rectangular) ────────────── */
function CeilingPanel({ z }) {
  const pw = 1.5, ph = 0.85;
  return (
    <group position={[0, H - 0.018, z]}>
      {/* Panel surround */}
      <mesh>
        <boxGeometry args={[pw, 0.055, ph]} />
        <meshStandardMaterial color="#d8d8d6" roughness={0.2} metalness={0.08} />
      </mesh>
      {/* Emissive diffuser */}
      <mesh position={[0, -0.029, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[pw - 0.04, ph - 0.04]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff"
          emissiveIntensity={3.2} roughness={0.1} side={THREE.DoubleSide} />
      </mesh>
      <pointLight position={[0, -0.55, 0]} intensity={9} distance={9} color="#f8f8f5" decay={2} />
    </group>
  );
}

/* ─── Left wall glass curtain system ─────────────────────────── */
function GlassCurtainWall() {
  const lx = -W / 2;
  const gLen = GZ1 - GZ0;
  const gCZ  = (GZ0 + GZ1) / 2;
  const kickH = 0.14;
  const glassH = H - kickH - 0.06;
  const glassCY = kickH + glassH / 2;

  // Vertical mullion z positions
  const mullionZs = [];
  for (let z = GZ0; z <= GZ1 + 0.01; z += MULLION_GAP) mullionZs.push(z);

  // Horizontal rail y positions
  const hRails = [kickH, 0.95, H - 0.06];

  return (
    <group>
      {/* Single large glass pane */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[lx + 0.005, glassCY, gCZ]}>
        <planeGeometry args={[gLen, glassH]} />
        <meshStandardMaterial color="#c2d8e8" transparent opacity={0.11}
          roughness={0.01} metalness={0.04} side={THREE.DoubleSide} />
      </mesh>

      {/* Kickboard — solid painted strip at bottom */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[lx + 0.004, kickH / 2, gCZ]}>
        <planeGeometry args={[gLen, kickH]} />
        <meshStandardMaterial color={WALL} roughness={0.8} />
      </mesh>

      {/* Vertical mullions */}
      {mullionZs.map((mz, i) => (
        <mesh key={i} position={[lx + 0.016, glassCY, mz]}>
          <boxGeometry args={[0.032, glassH + kickH, 0.04]} />
          <meshStandardMaterial color={MULL} roughness={0.28} metalness={0.45} />
        </mesh>
      ))}

      {/* Horizontal rails */}
      {hRails.map((hy, i) => (
        <mesh key={i} position={[lx + 0.016, hy, gCZ]}>
          <boxGeometry args={[0.032, 0.038, gLen + 0.05]} />
          <meshStandardMaterial color={MULL} roughness={0.28} metalness={0.45} />
        </mesh>
      ))}
    </group>
  );
}

/* ─── Window frame (right wall observation window) ───────────── */
function WindowFrame({ wx, win, inward }) {
  const { z, zHalf, yBot, yTop } = win;
  const yMid = (yBot + yTop) / 2;
  const yH   = yTop - yBot;
  const ox   = wx + inward * 0.036;
  const fm   = <meshStandardMaterial color={MULL} roughness={0.28} metalness={0.45} />;
  return (
    <group>
      <mesh position={[ox, yTop + 0.026, z]}>
        <boxGeometry args={[0.056, 0.05, zHalf * 2 + 0.1]} />{fm}
      </mesh>
      <mesh position={[ox, yBot - 0.026, z]}>
        <boxGeometry args={[0.056, 0.05, zHalf * 2 + 0.1]} />{fm}
      </mesh>
      <mesh position={[ox, yMid, z - zHalf - 0.026]}>
        <boxGeometry args={[0.056, yH + 0.1, 0.05]} />{fm}
      </mesh>
      <mesh position={[ox, yMid, z + zHalf + 0.026]}>
        <boxGeometry args={[0.056, yH + 0.1, 0.05]} />{fm}
      </mesh>
    </group>
  );
}

/* ─── OR room (behind left glass curtain wall) ──────────────── */
function ORRoom() {
  const depth = 4.8;
  const lx    = -W / 2;
  const backX = lx - depth;
  const cx    = lx - depth / 2;  // ≈ −4.9 center X
  const rz    = -4.5;            // OR room center Z
  const rSpan = 6.0;             // room Z span
  const rm    = "#eaeae8";       // room wall color

  return (
    <group>
      {/* Room shell — bright white walls, floor, ceiling */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[backX, H / 2, rz]}>
        <planeGeometry args={[rSpan + 1.0, H]} />
        <meshStandardMaterial color={rm} roughness={0.82} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cx, 0.002, rz]}>
        <planeGeometry args={[depth, rSpan + 1.0]} />
        <meshStandardMaterial color="#e0e0de" roughness={0.18} metalness={0.04} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[cx, H - 0.01, rz]}>
        <planeGeometry args={[depth, rSpan + 1.0]} />
        <meshStandardMaterial color="#f2f2f0" roughness={0.8} />
      </mesh>
      {/* Blue floor stripe */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cx, 0.003, rz - rSpan / 2 + 0.06]}>
        <planeGeometry args={[depth, 0.09]} />
        <meshStandardMaterial color="#5588bb" roughness={0.3} />
      </mesh>

      {/* Operating table — native ~300 units → scale 0.005 ≈ 1.5 m.
           Console "[OR Table]" lines report exact rendered size + y-offset for floor. */}
      <OperatingTableModel
        position={[cx, 0.755, rz]}
        scale={0.005}
        rotation={[0, Math.PI / 2, 0]}
      />

      {/* Overhead surgical light — ceiling track + arm + large disc */}
      <mesh position={[cx, H - 0.03, rz]}>
        <boxGeometry args={[0.1, 0.055, 0.6]} />
        <meshStandardMaterial color="#c0c0be" roughness={0.3} metalness={0.5} />
      </mesh>
      <mesh position={[cx, H - 0.19, rz]}>
        <cylinderGeometry args={[0.028, 0.028, 0.26, 12]} />
        <meshStandardMaterial color="#888888" roughness={0.3} metalness={0.55} />
      </mesh>
      {/* Large disc housing */}
      <mesh position={[cx, H - 0.38, rz]}>
        <cylinderGeometry args={[0.40, 0.40, 0.065, 32]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.22} metalness={0.62} />
      </mesh>
      {/* Emissive face — large bright circle */}
      <mesh position={[cx, H - 0.415, rz]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.36, 32]} />
        <meshStandardMaterial color="#ddeeff" emissive="#cce4ff"
          emissiveIntensity={4.5} side={THREE.DoubleSide} />
      </mesh>
      <pointLight position={[cx, H - 0.45, rz]} intensity={14} distance={3.2} color="#ddeeff" decay={2} />

      {/* Vitals monitor on rolling stand */}
      {/* Wheeled base */}
      <mesh position={[cx + 0.85, 0.04, rz - 0.75]}>
        <cylinderGeometry args={[0.19, 0.19, 0.035, 5]} />
        <meshStandardMaterial color="#aaaaaa" roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh position={[cx + 0.85, 0.86, rz - 0.75]}>
        <cylinderGeometry args={[0.022, 0.026, 1.64, 8]} />
        <meshStandardMaterial color="#bbbbbb" roughness={0.3} metalness={0.55} />
      </mesh>
      {/* Monitor housing */}
      <mesh position={[cx + 0.76, 1.82, rz - 0.75]}>
        <boxGeometry args={[0.075, 0.44, 0.56]} />
        <meshStandardMaterial color="#1e1e1e" roughness={0.22} metalness={0.42} />
      </mesh>
      {/* Green ECG screen — facing +X toward glass */}
      <mesh position={[cx + 0.724, 1.82, rz - 0.75]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.52, 0.4]} />
        <meshStandardMaterial color="#001800" emissive="#00cc44"
          emissiveIntensity={2.2} roughness={0.1} side={THREE.DoubleSide} />
      </mesh>
      {/* ECG flatline */}
      <mesh position={[cx + 0.718, 1.82, rz - 0.75 - 0.08]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.16, 0.011]} />
        <meshStandardMaterial color="#00ff55" emissive="#00ff55" emissiveIntensity={6} side={THREE.DoubleSide} />
      </mesh>
      {/* ECG peak — rising */}
      <mesh position={[cx + 0.717, 1.87, rz - 0.75 + 0.01]} rotation={[0, Math.PI / 2, 0.42]}>
        <planeGeometry args={[0.10, 0.010]} />
        <meshStandardMaterial color="#00ff55" emissive="#00ff55" emissiveIntensity={6} side={THREE.DoubleSide} />
      </mesh>
      {/* ECG peak — falling */}
      <mesh position={[cx + 0.717, 1.86, rz - 0.75 + 0.09]} rotation={[0, Math.PI / 2, -0.62]}>
        <planeGeometry args={[0.12, 0.010]} />
        <meshStandardMaterial color="#00ff55" emissive="#00ff55" emissiveIntensity={6} side={THREE.DoubleSide} />
      </mesh>
      {/* ECG flatline right */}
      <mesh position={[cx + 0.718, 1.82, rz - 0.75 + 0.19]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.16, 0.011]} />
        <meshStandardMaterial color="#00ff55" emissive="#00ff55" emissiveIntensity={6} side={THREE.DoubleSide} />
      </mesh>

      {/* IV stand — tall pole with bag */}
      <mesh position={[cx + 0.9, 1.5, rz + 0.85]}>
        <cylinderGeometry args={[0.016, 0.02, 3.0, 8]} />
        <meshStandardMaterial color="#bbbbbb" roughness={0.3} metalness={0.6} />
      </mesh>
      <mesh position={[cx + 0.9, 2.99, rz + 0.85]}>
        <boxGeometry args={[0.28, 0.02, 0.022]} />
        <meshStandardMaterial color="#aaaaaa" roughness={0.3} metalness={0.6} />
      </mesh>
      <mesh position={[cx + 0.77, 2.72, rz + 0.85]}>
        <boxGeometry args={[0.14, 0.26, 0.07]} />
        <meshStandardMaterial color="#cce8cc" transparent opacity={0.72} roughness={0.5} />
      </mesh>

      {/* Room fill lights */}
      <pointLight position={[cx, 2.6, rz - 1]} intensity={5} distance={6} color="#e8f2ff" decay={2} />
      <pointLight position={[cx, 2.6, rz + 1]} intensity={4} distance={5} color="#deeeff" decay={2} />
      {/* Subtle blue-green surgical tint */}
      <pointLight position={[cx, 0.9, rz]} intensity={2} distance={5} color="#9ad8c8" decay={2} />
    </group>
  );
}

/* ─── Patient room (behind right wall observation window) ────── */
function PatientRoom() {
  const { z, zHalf, yBot, yTop } = RW;
  const yMid  = (yBot + yTop) / 2;
  const yH    = yTop - yBot;
  const depth = 3.8;
  const wx    = W / 2;
  const backX = wx + depth;
  const cx    = wx + depth / 2;

  return (
    <group>
      {/* Glass — nearly clear */}
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[wx - 0.006, yMid, z]}>
        <planeGeometry args={[zHalf * 2, yH]} />
        <meshStandardMaterial color="#c2d8e8" transparent opacity={0.13}
          roughness={0.01} side={THREE.DoubleSide} />
      </mesh>
      <WindowFrame wx={wx} win={RW} inward={-1} />

      {/* Room shell */}
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[backX, H / 2, z]}>
        <planeGeometry args={[zHalf * 2 + 0.8, H]} />
        <meshStandardMaterial color="#ebebea" roughness={0.85} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cx, 0.002, z]}>
        <planeGeometry args={[depth, zHalf * 2 + 0.8]} />
        <meshStandardMaterial color="#e0e0de" roughness={0.2} metalness={0.04} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[cx, H - 0.01, z]}>
        <planeGeometry args={[depth, zHalf * 2 + 0.8]} />
        <meshStandardMaterial color="#f0f0ee" roughness={0.8} />
      </mesh>

      {/* Hospital bed — scale 0.006 puts it at ~0.9m wide × 2.0m long × 0.79m tall.
           Long axis is model-Z, which already runs along scene-Z (no Y-rotation needed).
           Model pivot is at mattress level so py=+0.42 puts the wheels on the floor. */}
      <HospitalBedModel
        position={[cx, 0.42, z]}
        scale={0.006}
        rotation={[0, 0, 0]}
      />

      {/* Bedside monitor on pole */}
      <mesh position={[cx - 0.46, 0.9, z - 0.72]}>
        <cylinderGeometry args={[0.018, 0.022, 1.8, 8]} />
        <meshStandardMaterial color="#999999" roughness={0.3} metalness={0.5} />
      </mesh>
      <mesh position={[cx - 0.46, 1.76, z - 0.72]}>
        <boxGeometry args={[0.065, 0.38, 0.48]} />
        <meshStandardMaterial color="#111111" roughness={0.22} metalness={0.42} />
      </mesh>
      <mesh position={[cx - 0.433, 1.76, z - 0.72]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[0.44, 0.34]} />
        <meshStandardMaterial color="#001020" emissive="#2255bb"
          emissiveIntensity={2.0} roughness={0.1} side={THREE.DoubleSide} />
      </mesh>

      {/* IV drip stand */}
      <mesh position={[cx - 0.44, 1.52, z + 0.88]}>
        <cylinderGeometry args={[0.016, 0.02, 3.04, 8]} />
        <meshStandardMaterial color="#bbbbbb" roughness={0.3} metalness={0.6} />
      </mesh>
      <mesh position={[cx - 0.44, 3.03, z + 0.88]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#999" roughness={0.3} metalness={0.5} />
      </mesh>
      <mesh position={[cx - 0.44, 3.04, z + 0.88]}>
        <boxGeometry args={[0.28, 0.02, 0.022]} />
        <meshStandardMaterial color="#aaaaaa" roughness={0.3} metalness={0.6} />
      </mesh>
      <mesh position={[cx - 0.55, 2.76, z + 0.88]}>
        <boxGeometry args={[0.13, 0.24, 0.07]} />
        <meshStandardMaterial color="#cce8cc" transparent opacity={0.72} roughness={0.5} />
      </mesh>

      {/* Room fill light */}
      <pointLight position={[cx, 2.5, z]} intensity={4} distance={5.5} color="#eef2ff" decay={2} />
    </group>
  );
}

/* ─── Hospital gurney parked in corridor ─────────────────────── */
function CorridorGurney({ z }) {
  const x = W / 2 - 0.6;
  return (
    <group position={[x, 0, z]}>
      {/* Frame */}
      <mesh position={[0, 0.68, 0]}>
        <boxGeometry args={[0.64, 0.055, 1.9]} />
        <meshStandardMaterial color="#c8c8c8" roughness={0.38} metalness={0.4} />
      </mesh>
      {/* Mattress */}
      <mesh position={[0, 0.75, 0.1]}>
        <boxGeometry args={[0.58, 0.11, 1.68]} />
        <meshStandardMaterial color="#d8e4f0" roughness={0.65} />
      </mesh>
      {/* Head raised */}
      <mesh position={[0, 0.84, -0.68]} rotation={[0.35, 0, 0]}>
        <boxGeometry args={[0.58, 0.09, 0.58]} />
        <meshStandardMaterial color="#ccdae8" roughness={0.65} />
      </mesh>
      {/* Side rails */}
      {[-0.3, 0.3].map((dx, i) => (
        <mesh key={i} position={[dx, 0.8, 0.05]}>
          <boxGeometry args={[0.016, 0.18, 1.55]} />
          <meshStandardMaterial color="#aaaaaa" roughness={0.3} metalness={0.5} />
        </mesh>
      ))}
      {/* Legs + wheels */}
      {[[-0.22, -0.82], [-0.22, 0.82], [0.22, -0.82], [0.22, 0.82]].map(([dx, dz], i) => (
        <group key={i} position={[dx, 0, dz]}>
          <mesh position={[0, 0.34, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.68, 8]} />
            <meshStandardMaterial color="#aaaaaa" roughness={0.3} metalness={0.5} />
          </mesh>
          <mesh position={[0, 0.055, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.055, 0.055, 0.04, 12]} />
            <meshStandardMaterial color="#555" roughness={0.5} metalness={0.3} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ─── Corridor IV stand ──────────────────────────────────────── */
function CorridorIVStand({ z }) {
  const x = W / 2 - 0.26;
  return (
    <group position={[x, 0, z]}>
      {/* Base (pentagonal feet) */}
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.21, 0.21, 0.032, 5]} />
        <meshStandardMaterial color="#aaaaaa" roughness={0.4} metalness={0.4} />
      </mesh>
      {/* Pole */}
      <mesh position={[0, 1.54, 0]}>
        <cylinderGeometry args={[0.016, 0.02, 3.08, 8]} />
        <meshStandardMaterial color="#bbbbbb" roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Top hook */}
      <mesh position={[0, 3.07, 0]}>
        <boxGeometry args={[0.28, 0.02, 0.022]} />
        <meshStandardMaterial color="#aaaaaa" roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Bag */}
      <mesh position={[-0.1, 2.8, 0]}>
        <boxGeometry args={[0.13, 0.22, 0.07]} />
        <meshStandardMaterial color="#cce8cc" transparent opacity={0.72} roughness={0.5} />
      </mesh>
    </group>
  );
}

/* ─── Wall-mounted handrail (both sides) ─────────────────────── */
function Handrail({ side }) {
  const x = side === "left" ? -W / 2 + 0.052 : W / 2 - 0.052;
  return (
    <mesh position={[x, 0.9, MID_Z]}>
      <boxGeometry args={[0.028, 0.034, L]} />
      <meshStandardMaterial color="#9a9998" roughness={0.32} metalness={0.48} />
    </mesh>
  );
}

/* ─── Room number sign ───────────────────────────────────────── */
function RoomSign({ z, side = "right" }) {
  const x = side === "right" ? W / 2 - 0.034 : -W / 2 + 0.034;
  return (
    <group position={[x, 2.55, z]}>
      <mesh>
        <boxGeometry args={[0.055, 0.13, 0.22]} />
        <meshStandardMaterial color="#1a2230" roughness={0.3} metalness={0.2} />
      </mesh>
      <mesh position={[side === "right" ? 0.033 : -0.033, 0, 0]}>
        <boxGeometry args={[0.005, 0.10, 0.18]} />
        <meshStandardMaterial color="#ffffff" emissive="#cce8ff"
          emissiveIntensity={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
}

/* ─── Hand sanitizer dispenser ───────────────────────────────── */
function Sanitizer({ z, side = "left" }) {
  const x = side === "left" ? -W / 2 + 0.04 : W / 2 - 0.04;
  return (
    <group position={[x, 1.52, z]}>
      {/* Bracket */}
      <mesh position={[side === "left" ? -0.015 : 0.015, 0, 0]}>
        <boxGeometry args={[0.025, 0.32, 0.17]} />
        <meshStandardMaterial color="#c8c8c6" roughness={0.4} metalness={0.3} />
      </mesh>
      {/* Body */}
      <mesh>
        <boxGeometry args={[0.062, 0.27, 0.13]} />
        <meshStandardMaterial color="#e2e2e0" roughness={0.5} metalness={0.08} />
      </mesh>
      {/* Nozzle */}
      <mesh position={[side === "left" ? 0.04 : -0.04, 0.05, 0]}
            rotation={[0, 0, side === "left" ? -Math.PI / 5 : Math.PI / 5]}>
        <cylinderGeometry args={[0.013, 0.013, 0.09, 8]} />
        <meshStandardMaterial color="#aaaaaa" roughness={0.3} metalness={0.5} />
      </mesh>
    </group>
  );
}

/* ─── Emergency exit sign ────────────────────────────────────── */
function ExitSign({ z }) {
  const x = -W / 2 + 0.036;
  return (
    <group position={[x, H - 0.28, z]}>
      <mesh>
        <boxGeometry args={[0.052, 0.13, 0.32]} />
        <meshStandardMaterial color="#111" roughness={0.3} />
      </mesh>
      <mesh position={[0.030, 0, 0]}>
        <boxGeometry args={[0.007, 0.10, 0.28]} />
        <meshStandardMaterial color="#00cc44" emissive="#00cc44"
          emissiveIntensity={2.8} roughness={0.1} />
      </mesh>
      <pointLight position={[0.075, 0, 0]} intensity={0.4} distance={1.8} color="#00dd44" decay={2} />
    </group>
  );
}

/* ─── Double push doors (light gray, open 65°) ───────────────── */
function DoorPanel({ side, doorZ }) {
  const DW   = W / 2 - 0.04;
  const DH   = H - 0.07;
  const OPEN = Math.PI * 0.36;
  const hx   = side === "left" ? -W / 2 + 0.02 : W / 2 - 0.02;
  const ang  = side === "left" ? -OPEN : OPEN;
  const px   = side === "left" ?  DW / 2 : -DW / 2;
  const phx  = side === "left" ?  DW * 0.58 : -DW * 0.58;
  return (
    <group position={[hx, 0, doorZ]} rotation={[0, ang, 0]}>
      <mesh position={[px, DH / 2, 0]}>
        <boxGeometry args={[DW, DH, 0.055]} />
        <meshStandardMaterial color="#d8d8d6" roughness={0.55} metalness={0.06} />
      </mesh>
      <mesh position={[px, DH * 0.44, 0.036]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.016, 0.016, 0.52, 10]} />
        <meshStandardMaterial color="#888886" roughness={0.28} metalness={0.55} />
      </mesh>
      <mesh position={[phx, DH * 0.73, 0.034]}>
        <torusGeometry args={[0.18, 0.015, 8, 32]} />
        <meshStandardMaterial color="#888886" roughness={0.3} metalness={0.5} />
      </mesh>
      <mesh position={[phx, DH * 0.73, 0.035]}>
        <circleGeometry args={[0.16, 32]} />
        <meshStandardMaterial color="#c8d8e4" transparent opacity={0.4}
          roughness={0.04} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function HospitalDoors({ z }) {
  const DH = H - 0.07;
  return (
    <group>
      <mesh position={[0, DH + 0.038, z]}>
        <boxGeometry args={[W + 0.06, 0.062, 0.09]} />
        <meshStandardMaterial color="#c8c8c6" roughness={0.38} metalness={0.3} />
      </mesh>
      <DoorPanel side="left"  doorZ={z} />
      <DoorPanel side="right" doorZ={z} />
    </group>
  );
}

/* ─── Main corridor geometry ─────────────────────────────────── */
function CorridorGeometry() {
  const panelZs = [-11, -7.5, -4, -0.5, 3, 6.5, 10, 13];
  const lx = -W / 2;
  const rx =  W / 2;

  const ws = (rot, x, z0, z1, y0, y1) => ({
    rot, x,
    mz: (z0 + z1) / 2, my: (y0 + y1) / 2,
    lz: z1 - z0, ly: y1 - y0,
  });

  const lRot = [0,  Math.PI / 2, 0];
  const rRot = [0, -Math.PI / 2, 0];
  const Z0 = Z_END, Z1 = Z_START;

  // Left wall — solid only at the entrance section beyond the glass zone
  const leftSegs = [
    ws(lRot, lx, GZ1, Z1, 0, H),
  ];

  // Right wall — segmented around observation window
  const rightSegs = [
    ws(rRot, rx, Z0, Z1, 0, RW.yBot),
    ws(rRot, rx, Z0, Z1, RW.yTop, H),
    ws(rRot, rx, Z0, RW.z - RW.zHalf, RW.yBot, RW.yTop),
    ws(rRot, rx, RW.z + RW.zHalf, Z1, RW.yBot, RW.yTop),
  ];

  return (
    <>
      {/* Floor — polished light vinyl */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, MID_Z]}>
        <planeGeometry args={[W, L]} />
        <meshStandardMaterial color={FLOOR} roughness={0.22} metalness={0.06} />
      </mesh>
      {/* Blue accent stripe — left edge */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-W / 2 + 0.065, 0.002, MID_Z]}>
        <planeGeometry args={[0.09, L]} />
        <meshStandardMaterial color="#5588bb" roughness={0.3} />
      </mesh>
      {/* Blue accent stripe — right edge */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[W / 2 - 0.065, 0.002, MID_Z]}>
        <planeGeometry args={[0.09, L]} />
        <meshStandardMaterial color="#5588bb" roughness={0.3} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, H, MID_Z]}>
        <planeGeometry args={[W, L]} />
        <meshStandardMaterial color={CEIL} roughness={0.85} />
      </mesh>

      {/* Walls */}
      {[...leftSegs, ...rightSegs].map((s, i) => (
        <mesh key={i} rotation={s.rot} position={[s.x, s.my, s.mz]}>
          <planeGeometry args={[s.lz, s.ly]} />
          <meshStandardMaterial color={WALL} roughness={0.85} />
        </mesh>
      ))}

      {/* Left wall back section (behind glass zone — covers below/above where glass doesn't reach) */}
      {/* Bottom strip behind glass */}
      <mesh rotation={lRot} position={[lx, 0.07, (GZ0 + GZ1) / 2]}>
        <planeGeometry args={[GZ1 - GZ0, 0.14]} />
        <meshStandardMaterial color={WALL} roughness={0.85} />
      </mesh>
      {/* Top strip behind glass */}
      <mesh rotation={lRot} position={[lx, H - 0.03, (GZ0 + GZ1) / 2]}>
        <planeGeometry args={[GZ1 - GZ0, 0.06]} />
        <meshStandardMaterial color={WALL} roughness={0.85} />
      </mesh>
      {/* Small solid left wall section before GZ0 (deep end) */}
      <mesh rotation={lRot} position={[lx, H / 2, (GZ0 + Z_END) / 2]}>
        <planeGeometry args={[GZ0 - Z_END, H]} />
        <meshStandardMaterial color={WALL} roughness={0.85} />
      </mesh>

      {/* End wall */}
      <mesh position={[0, H / 2, Z_END]}>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial color={WALL} roughness={0.88} />
      </mesh>

      {/* Ceiling recessed panels */}
      {panelZs.map((z) => <CeilingPanel key={z} z={z} />)}

      {/* Glass curtain wall + OR room */}
      <GlassCurtainWall />
      <ORRoom />

      {/* Observation window + patient room */}
      <PatientRoom />

      {/* Corridor equipment — right side */}
      <CorridorGurney    z={-7.5} />
      <CorridorIVStand   z={-6.2} />

      {/* Handrails — both walls */}
      <Handrail side="left" />
      <Handrail side="right" />

      {/* Room number signs */}
      <RoomSign z={-1.8} side="right" />
      <RoomSign z={4.8}  side="right" />

      {/* Hand sanitizer dispensers */}
      <Sanitizer z={7.5}  side="left" />
      <Sanitizer z={-8.5} side="left" />
      <Sanitizer z={8}    side="right" />

      {/* Exit sign */}
      <ExitSign z={11} />

      {/* Double push doors */}
      <HospitalDoors z={1} />
    </>
  );
}

/* ─── Scene ──────────────────────────────────────────────────── */
function Scene({ onComplete, navigate, navVisible, skipIntro }) {
  return (
    <>
      <ambientLight intensity={1.3} color="#f6f6f2" />
      <Suspense fallback={null}>
        <CorridorGeometry />
      </Suspense>
      <CameraFly onComplete={onComplete} skipIntro={skipIntro} />
      <EndWallNav visible={navVisible} onNavigate={navigate} />
    </>
  );
}

/* ─── Canvas ─────────────────────────────────────────────────── */
export default function Corridor({ onAnimComplete, navigate, navVisible, skipIntro }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, CAM_Y, skipIntro ? Z_REST : Z_START], fov: 68 }}
      gl={{ antialias: true }}
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      <color attach="background" args={["#d4d4d2"]} />
      <Scene
        onComplete={onAnimComplete}
        navigate={navigate}
        navVisible={navVisible}
        skipIntro={skipIntro}
      />
    </Canvas>
  );
}
