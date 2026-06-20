import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import EndWallNav from "./EndWallNav";
import * as THREE from "three";

/* ── Scene constants ──────────────────────────────────────────── */
const W       = 5;
const H       = 3.5;
const Z_START = 14;
const Z_END   = -14;
const Z_REST  = -10;
const CAM_Y   = 1.65;
const FLY_DUR = 12;
const L       = Z_START - Z_END;
const MID_Z   = (Z_START + Z_END) / 2;

/* ── OR window (left wall) ────────────────────────────────────── */
const WIN_L_Z0   = 0.5;
const WIN_L_Z1   = 4.5;
const WIN_L_ZC   = (WIN_L_Z0 + WIN_L_Z1) / 2;   // 2.5
const WIN_L_ZH   = (WIN_L_Z1 - WIN_L_Z0) / 2;   // 2.0
const WIN_L_YBOT = 0.35;
const WIN_L_YTOP = 3.1;
const WIN_L_YC   = (WIN_L_YBOT + WIN_L_YTOP) / 2;
const WIN_L_YH   = WIN_L_YTOP - WIN_L_YBOT;

/* ── OR room geometry ─────────────────────────────────────────── */
const OR_DEPTH = 5.0;
const OR_CX    = -W / 2 - OR_DEPTH / 2;   // -5.0  room centre X
const OR_RZ    = WIN_L_ZC;                 //  2.5  room centre Z
const OR_BACK  = -W / 2 - OR_DEPTH;       // -7.5  back wall X
const OR_ZSPAN = 7.0;                      // room total Z extent

/* ── Patient room window (right wall) ────────────────────────── */
const WIN_R_Z0   = -5.5;
const WIN_R_Z1   = -1.5;
const WIN_R_ZC   = (WIN_R_Z0 + WIN_R_Z1) / 2;   // -3.5
const WIN_R_ZH   = (WIN_R_Z1 - WIN_R_Z0) / 2;   //  2.0
const WIN_R_YBOT = 0.35;
const WIN_R_YTOP = 3.1;
const WIN_R_YC   = (WIN_R_YBOT + WIN_R_YTOP) / 2;
const WIN_R_YH   = WIN_R_YTOP - WIN_R_YBOT;

/* ── Patient room geometry ────────────────────────────────────── */
const PR_DEPTH = 4.5;
const PR_CX    =  W / 2 + PR_DEPTH / 2;   //  4.75
const PR_RZ    = WIN_R_ZC;                 // -3.5
const PR_BACK  =  W / 2 + PR_DEPTH;       //  7.0
const PR_ZSPAN = 7.0;

/* ── Palette ──────────────────────────────────────────────────── */
const WALL   = "#f0f0f0";
const FLOOR  = "#e0e0e0";
const CEIL   = "#f4f4f4";
const BASE   = "#d4d4d4";
const STRIPE = "#4a90b8";
const MULL   = "#1c2028";

/* ── Easing ───────────────────────────────────────────────────── */
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
      const f = easeInOutCubic((t - a.t) / (b.t - a.t));
      return new THREE.Vector3().lerpVectors(a.v, b.v, f);
    }
  }
  return kfs[0].v.clone();
}

/* ── Cinematic camera fly-through ─────────────────────────────── */
function CameraFly({ onComplete, skipIntro }) {
  const { camera } = useThree();
  const startedAt = useRef(null);
  const finished  = useRef(false);

  // Camera world-position path
  const posKF = useMemo(() => [
    { t: 0.00, v: new THREE.Vector3( 0.00, CAM_Y,  14) }, // entrance
    { t: 0.25, v: new THREE.Vector3( 0.00, CAM_Y,   8) }, // phase 1 end — moved forward
    { t: 0.35, v: new THREE.Vector3( 0.65, CAM_Y,   6) }, // drift right (phase 2)
    { t: 0.50, v: new THREE.Vector3( 0.65, CAM_Y,   4) }, // hold right — alongside OR window
    { t: 0.58, v: new THREE.Vector3( 0.00, CAM_Y,   1) }, // return to centre (phase 2→3)
    { t: 0.68, v: new THREE.Vector3(-0.65, CAM_Y,  -3) }, // drift left (phase 3)
    { t: 0.78, v: new THREE.Vector3(-0.65, CAM_Y,  -5) }, // hold left — alongside patient window
    { t: 0.90, v: new THREE.Vector3(-0.10, CAM_Y,  -7) }, // straighten (phase 4)
    { t: 1.00, v: new THREE.Vector3( 0.00, CAM_Y, Z_REST) }, // rest position
  ], []);

  // Look-at target path (world coords)
  const lookKF = useMemo(() => [
    { t: 0.00, v: new THREE.Vector3( 0.00, CAM_Y, Z_END)   }, // straight down corridor
    { t: 0.22, v: new THREE.Vector3( 0.00, CAM_Y, Z_END)   }, // hold straight
    { t: 0.38, v: new THREE.Vector3(-5.00,  1.50, WIN_L_ZC) }, // pivot left — OR room
    { t: 0.50, v: new THREE.Vector3(-5.00,  1.50, WIN_L_ZC) }, // hold on OR room
    { t: 0.62, v: new THREE.Vector3( 4.50,  1.50, WIN_R_ZC) }, // swing right — patient room
    { t: 0.78, v: new THREE.Vector3( 4.50,  1.50, WIN_R_ZC) }, // hold on patient room
    { t: 0.92, v: new THREE.Vector3( 0.00, CAM_Y, Z_END)   }, // straighten to end wall
    { t: 1.00, v: new THREE.Vector3( 0.00, CAM_Y, Z_END)   }, // rest — facing end wall
  ], []);

  useFrame(({ clock }) => {
    if (finished.current) return;
    if (skipIntro) {
      finished.current = true;
      camera.position.set(0, CAM_Y, Z_REST);
      camera.lookAt(0, CAM_Y, Z_END);
      onComplete?.();
      return;
    }
    if (startedAt.current === null) startedAt.current = clock.elapsedTime;
    const raw = Math.min((clock.elapsedTime - startedAt.current) / FLY_DUR, 1);
    camera.position.copy(lerpKF(posKF, raw));
    camera.lookAt(lerpKF(lookKF, raw));
    if (raw >= 1) { finished.current = true; onComplete?.(); }
  });

  return null;
}

/* ── Recessed ceiling panel light ────────────────────────────── */
function CeilingPanel({ z }) {
  return (
    <group position={[0, H, z]}>
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[1.4, 0.04, 0.8]} />
        <meshStandardMaterial color="#cccccc" roughness={0.2} metalness={0.1} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.3, 0.72]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff"
          emissiveIntensity={3.0} roughness={0.05} side={THREE.DoubleSide} />
      </mesh>
      <pointLight position={[0, -0.6, 0]} intensity={9} distance={9}
        color="#f8f8f4" decay={2} />
    </group>
  );
}

/* ── Operating Room (behind left window) ──────────────────────── */
function ORRoom() {
  const cx    = OR_CX;    // -5.0
  const rz    = OR_RZ;    //  2.5
  const backX = OR_BACK;  // -7.5
  const zspan = OR_ZSPAN; //  7.0

  // Vitals monitor position (closer to window, visible from corridor)
  const monX = cx + 0.85;          // -4.15
  const monZ = rz - 0.75;          //  1.75
  const scrX = monX - 0.01;        // front face of screen housing (-4.16)
  const ecgX = scrX + 0.003;       // ECG sits on screen surface

  // ECG baseline/peak Y
  const ecgY0 = 1.620;             // baseline
  const ecgY1 = 1.682;             // R-peak

  // Precomputed ECG segment angles (rotate around world X to tilt in Y-Z plane)
  const spikeAngle = Math.atan2(ecgY1 - ecgY0, 0.013); // ~78° rising
  const twaveAngle = Math.atan2(0.016, 0.026);          // ~32° T-wave

  // IV stand position
  const ivX = cx - 0.35;           // -5.35
  const ivZ = rz + 1.1;            //  3.6

  return (
    <group>
      {/* ── Room shell ───────────────────────────────────────── */}
      {/* Back wall */}
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[backX, H / 2, rz]}>
        <planeGeometry args={[zspan, H]} />
        <meshStandardMaterial color="#eeeeee" roughness={0.85} />
      </mesh>
      {/* Floor — light blue-green tint */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cx, 0.001, rz]}>
        <planeGeometry args={[OR_DEPTH, zspan]} />
        <meshStandardMaterial color="#e8f4f4" roughness={0.18} metalness={0.04} />
      </mesh>
      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[cx, H - 0.002, rz]}>
        <planeGeometry args={[OR_DEPTH, zspan]} />
        <meshStandardMaterial color="#f4f4f4" roughness={0.85} />
      </mesh>
      {/* Far Z side wall */}
      <mesh position={[cx, H / 2, rz + zspan / 2]}>
        <planeGeometry args={[OR_DEPTH, H]} />
        <meshStandardMaterial color="#eeeeee" roughness={0.85} />
      </mesh>
      {/* Near Z side wall */}
      <mesh rotation={[0, Math.PI, 0]} position={[cx, H / 2, rz - zspan / 2]}>
        <planeGeometry args={[OR_DEPTH, H]} />
        <meshStandardMaterial color="#eeeeee" roughness={0.85} />
      </mesh>

      {/* ── Operating table ──────────────────────────────────── */}
      {/* Central pedestal */}
      <mesh position={[cx, 0.425, rz]}>
        <cylinderGeometry args={[0.18, 0.22, 0.85, 16]} />
        <meshStandardMaterial color="#c8c8c8" roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Table surface */}
      <mesh position={[cx, 0.89, rz]}>
        <boxGeometry args={[2.05, 0.08, 0.64]} />
        <meshStandardMaterial color="#f8f8f8" roughness={0.3} metalness={0.1} />
      </mesh>
      {/* Mattress padding */}
      <mesh position={[cx, 0.94, rz]}>
        <boxGeometry args={[1.96, 0.055, 0.57]} />
        <meshStandardMaterial color="#e6eef4" roughness={0.72} />
      </mesh>

      {/* ── Overhead surgical lamp ───────────────────────────── */}
      {/* Ceiling track */}
      <mesh position={[cx, H - 0.015, rz]}>
        <boxGeometry args={[0.08, 0.03, 0.55]} />
        <meshStandardMaterial color="#bebebe" roughness={0.3} metalness={0.5} />
      </mesh>
      {/* Arm */}
      <mesh position={[cx, H - 0.268, rz]}>
        <cylinderGeometry args={[0.024, 0.024, 0.46, 12]} />
        <meshStandardMaterial color="#aaaaaa" roughness={0.28} metalness={0.62} />
      </mesh>
      {/* Disc housing */}
      <mesh position={[cx, H - 0.525, rz]}>
        <cylinderGeometry args={[0.30, 0.30, 0.07, 32]} />
        <meshStandardMaterial color="#282828" roughness={0.22} metalness={0.62} />
      </mesh>
      {/* Emissive underside — warm surgical white */}
      <mesh position={[cx, H - 0.562, rz]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.27, 32]} />
        <meshStandardMaterial color="#fff9e8" emissive="#fff9e8"
          emissiveIntensity={5} side={THREE.DoubleSide} />
      </mesh>
      <pointLight position={[cx, H - 0.59, rz]}
        intensity={14} distance={3.5} color="#fff8e8" decay={2} />

      {/* ── Vitals monitor on rolling stand ──────────────────── */}
      {/* Pentagonal base */}
      <mesh position={[monX, 0.02, monZ]}>
        <cylinderGeometry args={[0.18, 0.18, 0.04, 5]} />
        <meshStandardMaterial color="#aaaaaa" roughness={0.4} metalness={0.4} />
      </mesh>
      {/* Pole */}
      <mesh position={[monX, 0.76, monZ]}>
        <cylinderGeometry args={[0.018, 0.022, 1.52, 8]} />
        <meshStandardMaterial color="#bbbbbb" roughness={0.3} metalness={0.55} />
      </mesh>
      {/* Bracket arm */}
      <mesh position={[monX - 0.04, 1.54, monZ]}>
        <boxGeometry args={[0.12, 0.04, 0.04]} />
        <meshStandardMaterial color="#aaaaaa" roughness={0.3} metalness={0.5} />
      </mesh>
      {/* Monitor housing */}
      <mesh position={[monX - 0.04, 1.62, monZ]}>
        <boxGeometry args={[0.06, 0.28, 0.38]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.22} metalness={0.4} />
      </mesh>
      {/* Screen face — dark green, facing +X toward corridor */}
      <mesh position={[scrX, 1.62, monZ]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[0.34, 0.24]} />
        <meshStandardMaterial color="#001200" emissive="#001a00"
          emissiveIntensity={1.6} roughness={0.1} side={THREE.DoubleSide} />
      </mesh>

      {/* ── ECG heartbeat line (green boxes on screen face) ─── */}
      {/* 1 — left baseline */}
      <mesh position={[ecgX, ecgY0, monZ - 0.105]}>
        <boxGeometry args={[0.007, 0.005, 0.08]} />
        <meshStandardMaterial color="#00ff55" emissive="#00ff55" emissiveIntensity={5} />
      </mesh>
      {/* 2 — rising R spike */}
      <mesh position={[ecgX, (ecgY0 + ecgY1) / 2, monZ - 0.054]}
            rotation={[-spikeAngle, 0, 0]}>
        <boxGeometry args={[0.007, 0.005, 0.064]} />
        <meshStandardMaterial color="#00ff55" emissive="#00ff55" emissiveIntensity={5} />
      </mesh>
      {/* 3 — falling R spike */}
      <mesh position={[ecgX, (ecgY0 + ecgY1) / 2, monZ - 0.028]}
            rotation={[spikeAngle, 0, 0]}>
        <boxGeometry args={[0.007, 0.005, 0.064]} />
        <meshStandardMaterial color="#00ff55" emissive="#00ff55" emissiveIntensity={5} />
      </mesh>
      {/* 4 — middle baseline */}
      <mesh position={[ecgX, ecgY0, monZ + 0.028]}>
        <boxGeometry args={[0.007, 0.005, 0.06]} />
        <meshStandardMaterial color="#00ff55" emissive="#00ff55" emissiveIntensity={5} />
      </mesh>
      {/* 5 — T-wave up */}
      <mesh position={[ecgX, ecgY0 + 0.008, monZ + 0.074]}
            rotation={[-twaveAngle, 0, 0]}>
        <boxGeometry args={[0.007, 0.005, 0.031]} />
        <meshStandardMaterial color="#00ff55" emissive="#00ff55" emissiveIntensity={5} />
      </mesh>
      {/* 6 — T-wave down */}
      <mesh position={[ecgX, ecgY0 + 0.008, monZ + 0.100]}
            rotation={[twaveAngle, 0, 0]}>
        <boxGeometry args={[0.007, 0.005, 0.031]} />
        <meshStandardMaterial color="#00ff55" emissive="#00ff55" emissiveIntensity={5} />
      </mesh>
      {/* 7 — right baseline */}
      <mesh position={[ecgX, ecgY0, monZ + 0.128]}>
        <boxGeometry args={[0.007, 0.005, 0.076]} />
        <meshStandardMaterial color="#00ff55" emissive="#00ff55" emissiveIntensity={5} />
      </mesh>

      {/* ── IV Stand ─────────────────────────────────────────── */}
      {/* Base */}
      <mesh position={[ivX, 0.02, ivZ]}>
        <cylinderGeometry args={[0.20, 0.20, 0.036, 5]} />
        <meshStandardMaterial color="#aaaaaa" roughness={0.4} metalness={0.4} />
      </mesh>
      {/* Pole */}
      <mesh position={[ivX, 0.94, ivZ]}>
        <cylinderGeometry args={[0.014, 0.018, 1.88, 8]} />
        <meshStandardMaterial color="#c0c0c0" roughness={0.28} metalness={0.62} />
      </mesh>
      {/* Top crossbar (hook) */}
      <mesh position={[ivX, 1.87, ivZ]}>
        <boxGeometry args={[0.24, 0.016, 0.016]} />
        <meshStandardMaterial color="#aaaaaa" roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Small hook curve */}
      <mesh position={[ivX - 0.08, 1.84, ivZ]} rotation={[0, 0, -0.6]}>
        <cylinderGeometry args={[0.008, 0.008, 0.06, 8]} />
        <meshStandardMaterial color="#aaaaaa" roughness={0.3} metalness={0.6} />
      </mesh>
      {/* IV bag — translucent */}
      <mesh position={[ivX - 0.06, 1.68, ivZ]}>
        <boxGeometry args={[0.08, 0.14, 0.04]} />
        <meshStandardMaterial color="#c8e8c8" transparent opacity={0.78} roughness={0.5} />
      </mesh>
      {/* Drip tube */}
      <mesh position={[ivX - 0.06, 1.54, ivZ]}>
        <cylinderGeometry args={[0.005, 0.005, 0.26, 6]} />
        <meshStandardMaterial color="#88aa88" transparent opacity={0.55} roughness={0.5} />
      </mesh>

      {/* ── Room lighting ─────────────────────────────────────── */}
      <pointLight position={[cx, H - 0.5, rz - 0.5]}
        intensity={5} distance={7} color="#eef4ff" decay={2} />
      <pointLight position={[cx, H - 0.5, rz + 0.5]}
        intensity={4} distance={6} color="#eef4ff" decay={2} />
      {/* Blue-green surgical accent */}
      <pointLight position={[cx, 1.1, rz]}
        intensity={2.5} distance={5} color="#9ad8c8" decay={2} />
    </group>
  );
}

/* ── Patient Recovery Room (behind right window) ─────────────── */
function PatientRoom() {
  const cx    = PR_CX;    //  4.75
  const rz    = PR_RZ;    // -3.5
  const backX = PR_BACK;  //  7.0
  const zspan = PR_ZSPAN; //  7.0

  // Bed position — close to window so it's visible
  const bedX = 3.8;
  const bedZ = rz;  // -3.5

  // Bed Y-levels
  const legTopY  = 0.55;
  const frameTopY = legTopY + 0.10;   // 0.65
  const mattThk  = 0.15;
  const mattBotY = frameTopY;         // 0.65
  const mattTopY = mattBotY + mattThk; // 0.80

  // Head section (group-pivot approach — rotates around hinge cleanly)
  const hingeZ    = bedZ - 0.72;      // -4.22
  const headLen   = 0.58;
  const headAngle = Math.PI * 20 / 180;

  // Flat body section spans footEndZ → hingeZ
  const footEndZ = bedZ + 0.82;       // -2.68
  const flatLen  = Math.abs(hingeZ - footEndZ);          // 1.54
  const flatCZ   = (hingeZ + footEndZ) / 2;              // -3.45

  // Monitor position — close to window, visible from corridor
  const monX = 3.2;
  const monZ = bedZ + 0.65;           // -2.85  (foot/corridor side of bed)

  // Bedside table — between window wall and bed
  const tbX = 2.85;
  const tbZ = hingeZ - 0.05;         // -4.27  (near head of bed)

  return (
    <group>
      {/* ── Room shell ───────────────────────────────────────── */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[backX, H / 2, rz]}>
        <planeGeometry args={[zspan, H]} />
        <meshStandardMaterial color="#eeeeee" roughness={0.85} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cx, 0.001, rz]}>
        <planeGeometry args={[PR_DEPTH, zspan]} />
        <meshStandardMaterial color="#e8f4f4" roughness={0.18} metalness={0.04} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[cx, H - 0.002, rz]}>
        <planeGeometry args={[PR_DEPTH, zspan]} />
        <meshStandardMaterial color="#f4f4f4" roughness={0.85} />
      </mesh>
      {/* Near Z side wall (entrance side) */}
      <mesh rotation={[0, Math.PI, 0]} position={[cx, H / 2, rz + zspan / 2]}>
        <planeGeometry args={[PR_DEPTH, H]} />
        <meshStandardMaterial color="#eeeeee" roughness={0.85} />
      </mesh>
      {/* Far Z side wall (deep side) */}
      <mesh position={[cx, H / 2, rz - zspan / 2]}>
        <planeGeometry args={[PR_DEPTH, H]} />
        <meshStandardMaterial color="#eeeeee" roughness={0.85} />
      </mesh>

      {/* ── Outside window on back wall ──────────────────────── */}
      {/* Dark frame border */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[backX - 0.012, 1.85, rz]}>
        <planeGeometry args={[1.32, 1.52]} />
        <meshStandardMaterial color="#2a3040" roughness={0.4} />
      </mesh>
      {/* Bright glass — suggests daylight */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[backX - 0.016, 1.85, rz]}>
        <planeGeometry args={[1.18, 1.38]} />
        <meshStandardMaterial color="#d0e8ff" emissive="#c0e0ff"
          emissiveIntensity={1.4} roughness={0.06} side={THREE.DoubleSide} />
      </mesh>
      {/* Cross dividers */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[backX - 0.014, 1.85, rz]}>
        <planeGeometry args={[0.03, 1.38]} />
        <meshStandardMaterial color="#2a3040" roughness={0.4} />
      </mesh>
      <mesh rotation={[0, Math.PI / 2, 0]} position={[backX - 0.014, 1.85, rz]}>
        <planeGeometry args={[1.18, 0.03]} />
        <meshStandardMaterial color="#2a3040" roughness={0.4} />
      </mesh>
      <pointLight position={[backX - 0.6, 1.85, rz]}
        intensity={3} distance={5} color="#c8e0ff" decay={2} />

      {/* ── Hospital bed ──────────────────────────────────────── */}
      {/* Four legs */}
      {[[-0.38, footEndZ - 0.08], [ 0.38, footEndZ - 0.08],
        [-0.38, hingeZ + 0.06],   [ 0.38, hingeZ + 0.06]].map(([dx, lz], i) => (
        <mesh key={i} position={[bedX + dx, legTopY / 2, lz]}>
          <cylinderGeometry args={[0.035, 0.035, legTopY, 10]} />
          <meshStandardMaterial color="#c0c0c0" roughness={0.3} metalness={0.6} />
        </mesh>
      ))}
      {/* Frame */}
      <mesh position={[bedX, (legTopY + frameTopY) / 2, bedZ]}>
        <boxGeometry args={[0.92, 0.10, flatLen + headLen + 0.04]} />
        <meshStandardMaterial color="#d0d0d0" roughness={0.38} metalness={0.3} />
      </mesh>
      {/* Flat mattress — body/foot section */}
      <mesh position={[bedX, mattBotY + mattThk / 2, flatCZ]}>
        <boxGeometry args={[0.88, mattThk, flatLen]} />
        <meshStandardMaterial color="#dce8f4" roughness={0.72} />
      </mesh>
      {/* Angled head section — pivots at hinge to tilt up 20° */}
      <group position={[bedX, mattTopY, hingeZ]} rotation={[headAngle, 0, 0]}>
        <mesh position={[0, -mattThk / 2, -headLen / 2]}>
          <boxGeometry args={[0.88, mattThk, headLen]} />
          <meshStandardMaterial color="#ccdded" roughness={0.72} />
        </mesh>
        {/* Pillow */}
        <mesh position={[0, mattThk * 0.4, -(headLen - 0.22)]}>
          <boxGeometry args={[0.66, 0.075, 0.32]} />
          <meshStandardMaterial color="#f0f4f8" roughness={0.85} />
        </mesh>
      </group>
      {/* Side rails */}
      {[-0.46, 0.46].map((dx, i) => (
        <mesh key={i} position={[bedX + dx, mattTopY + 0.12, flatCZ]}>
          <boxGeometry args={[0.015, 0.20, flatLen * 0.72]} />
          <meshStandardMaterial color="#bbbbbb" roughness={0.3} metalness={0.55} />
        </mesh>
      ))}

      {/* ── Bedside monitor on short stand ───────────────────── */}
      <mesh position={[monX, 0.02, monZ]}>
        <cylinderGeometry args={[0.14, 0.14, 0.04, 5]} />
        <meshStandardMaterial color="#aaaaaa" roughness={0.4} metalness={0.4} />
      </mesh>
      <mesh position={[monX, 0.64, monZ]}>
        <cylinderGeometry args={[0.016, 0.020, 1.28, 8]} />
        <meshStandardMaterial color="#bbbbbb" roughness={0.3} metalness={0.55} />
      </mesh>
      {/* Housing */}
      <mesh position={[monX + 0.03, 1.30, monZ]}>
        <boxGeometry args={[0.055, 0.22, 0.30]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.22} metalness={0.4} />
      </mesh>
      {/* Screen — faces -X toward corridor window */}
      <mesh position={[monX + 0.002, 1.30, monZ]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.26, 0.18]} />
        <meshStandardMaterial color="#001020" emissive="#1a3a6a"
          emissiveIntensity={2.0} roughness={0.1} side={THREE.DoubleSide} />
      </mesh>
      {/* Patient vitals line on screen */}
      <mesh position={[monX + 0.001, 1.308, monZ]}>
        <boxGeometry args={[0.005, 0.004, 0.20]} />
        <meshStandardMaterial color="#44aaff" emissive="#44aaff" emissiveIntensity={3.5} />
      </mesh>

      {/* ── Bedside table ─────────────────────────────────────── */}
      {/* Tabletop */}
      <mesh position={[tbX, 0.50, tbZ]}>
        <boxGeometry args={[0.42, 0.04, 0.42]} />
        <meshStandardMaterial color="#e2e2e0" roughness={0.5} metalness={0.1} />
      </mesh>
      {/* Legs */}
      {[[-0.16, -0.16], [-0.16, 0.16],
        [ 0.16, -0.16], [ 0.16, 0.16]].map(([dx, dz], i) => (
        <mesh key={i} position={[tbX + dx, 0.25, tbZ + dz]}>
          <cylinderGeometry args={[0.016, 0.016, 0.50, 8]} />
          <meshStandardMaterial color="#cccccc" roughness={0.4} metalness={0.4} />
        </mesh>
      ))}
      {/* Water cup on table */}
      <mesh position={[tbX + 0.09, 0.565, tbZ - 0.08]}>
        <cylinderGeometry args={[0.034, 0.030, 0.12, 10]} />
        <meshStandardMaterial color="#a8c8e8" transparent opacity={0.65} roughness={0.1} />
      </mesh>

      {/* ── Room lighting ─────────────────────────────────────── */}
      <pointLight position={[cx, H - 0.5, rz]}
        intensity={5} distance={7} color="#eef4ff" decay={2} />
      <pointLight position={[cx, 1.0, rz]}
        intensity={2} distance={5} color="#9ad8c8" decay={2} />
    </group>
  );
}

/* ── Cylindrical wall handrail ────────────────────────────────── */
function Handrail({ side, z0, z1 }) {
  const x   = side === "left" ? -W / 2 + 0.058 : W / 2 - 0.058;
  const cz  = (z0 + z1) / 2;
  const len = Math.abs(z1 - z0);
  return (
    <group>
      <mesh position={[x, 1.0, cz]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.022, 0.022, len, 10]} />
        <meshStandardMaterial color="#b4b4b2" roughness={0.28} metalness={0.58} />
      </mesh>
      {/* Wall brackets every ~2.5m */}
      {Array.from({ length: Math.floor(len / 2.5) + 1 }, (_, i) => z0 + i * 2.5)
        .filter(bz => bz <= z1)
        .map((bz, i) => (
          <mesh key={i}
            position={[side === "left" ? x + 0.028 : x - 0.028, 0.98, bz]}>
            <boxGeometry args={[0.055, 0.055, 0.04]} />
            <meshStandardMaterial color="#888886" roughness={0.35} metalness={0.55} />
          </mesh>
        ))}
    </group>
  );
}

/* ── Corridor gurney ──────────────────────────────────────────── */
function Gurney() {
  const x = W / 2 - 0.38;   // centre; right edge ≈ 2.43, close to wall
  const z = -0.5;
  return (
    <group position={[x, 0, z]}>
      {/* Frame */}
      <mesh position={[0, 0.70, 0]}>
        <boxGeometry args={[0.62, 0.055, 1.95]} />
        <meshStandardMaterial color="#c8c8c6" roughness={0.38} metalness={0.42} />
      </mesh>
      {/* Mattress */}
      <mesh position={[0, 0.762, 0.06]}>
        <boxGeometry args={[0.58, 0.095, 1.72]} />
        <meshStandardMaterial color="#d6e2f0" roughness={0.65} />
      </mesh>
      {/* Head raised section */}
      <mesh position={[0, 0.835, -0.72]} rotation={[0.28, 0, 0]}>
        <boxGeometry args={[0.58, 0.085, 0.55]} />
        <meshStandardMaterial color="#ccd8e8" roughness={0.65} />
      </mesh>
      {/* Side rails */}
      {[-0.31, 0.31].map((dx, i) => (
        <mesh key={i} position={[dx, 0.792, 0.04]}>
          <boxGeometry args={[0.014, 0.155, 1.55]} />
          <meshStandardMaterial color="#aaaaaa" roughness={0.3} metalness={0.5} />
        </mesh>
      ))}
      {/* 4 legs + sphere wheels */}
      {[[-0.22, -0.85], [-0.22, 0.85],
        [ 0.22, -0.85], [ 0.22, 0.85]].map(([dx, dz], i) => (
        <group key={i} position={[dx, 0, dz]}>
          <mesh position={[0, 0.33, 0]}>
            <cylinderGeometry args={[0.018, 0.018, 0.66, 8]} />
            <meshStandardMaterial color="#aaaaaa" roughness={0.3} metalness={0.5} />
          </mesh>
          <mesh position={[0, 0.046, 0]}>
            <sphereGeometry args={[0.046, 10, 8]} />
            <meshStandardMaterial color="#444" roughness={0.5} metalness={0.35} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ── Wheelchair ───────────────────────────────────────────────── */
function Wheelchair() {
  const x = W / 2 - 0.38;   // same wall proximity as gurney
  const z = -8.5;            // deep section, right wall
  return (
    <group position={[x, 0, z]}>
      {/* Seat */}
      <mesh position={[0, 0.47, 0]}>
        <boxGeometry args={[0.46, 0.055, 0.44]} />
        <meshStandardMaterial color="#1e2030" roughness={0.6} metalness={0.1} />
      </mesh>
      {/* Backrest */}
      <mesh position={[0, 0.80, -0.21]} rotation={[0.12, 0, 0]}>
        <boxGeometry args={[0.44, 0.60, 0.055]} />
        <meshStandardMaterial color="#1e2030" roughness={0.6} metalness={0.1} />
      </mesh>
      {/* Frame side tubes (seat → backrest) */}
      {[-0.21, 0.21].map((dx, i) => (
        <mesh key={i} position={[dx, 0.63, -0.18]} rotation={[0.15, 0, 0]}>
          <cylinderGeometry args={[0.014, 0.014, 0.68, 8]} />
          <meshStandardMaterial color="#888" roughness={0.28} metalness={0.6} />
        </mesh>
      ))}
      {/* Armrests */}
      {[-0.24, 0.24].map((dx, i) => (
        <mesh key={i} position={[dx, 0.56, 0]}>
          <boxGeometry args={[0.026, 0.026, 0.44]} />
          <meshStandardMaterial color="#888" roughness={0.28} metalness={0.6} />
        </mesh>
      ))}
      {/* Large rear wheels — ring in YZ plane (hub along X) */}
      {[-0.265, 0.265].map((dx, i) => (
        <group key={i} position={[dx, 0.34, 0.04]}>
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.30, 0.028, 8, 28]} />
            <meshStandardMaterial color="#222" roughness={0.55} metalness={0.3} />
          </mesh>
          {/* Spoke cross */}
          {[0, Math.PI / 3, Math.PI * 2 / 3].map((a, j) => (
            <mesh key={j} rotation={[0, Math.PI / 2, a]}>
              <cylinderGeometry args={[0.007, 0.007, 0.56, 5]} />
              <meshStandardMaterial color="#555" roughness={0.4} metalness={0.5} />
            </mesh>
          ))}
        </group>
      ))}
      {/* Small front caster wheels — cylinder hub along X */}
      {[-0.15, 0.15].map((dx, i) => (
        <mesh key={i} position={[dx, 0.062, 0.24]}
              rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.062, 0.062, 0.032, 10]} />
          <meshStandardMaterial color="#333" roughness={0.5} metalness={0.3} />
        </mesh>
      ))}
      {/* Footrest */}
      <mesh position={[0, 0.24, 0.26]}>
        <boxGeometry args={[0.38, 0.028, 0.16]} />
        <meshStandardMaterial color="#888" roughness={0.32} metalness={0.5} />
      </mesh>
    </group>
  );
}

/* ── Hand sanitizer dispenser ─────────────────────────────────── */
function Sanitizer({ z }) {
  const x = W / 2 - 0.042;  // flush against right wall
  return (
    <group position={[x, 1.52, z]}>
      {/* Wall bracket */}
      <mesh position={[0.016, 0, 0]}>
        <boxGeometry args={[0.026, 0.30, 0.16]} />
        <meshStandardMaterial color="#c8c8c6" roughness={0.4} metalness={0.3} />
      </mesh>
      {/* Body */}
      <mesh>
        <boxGeometry args={[0.058, 0.25, 0.12]} />
        <meshStandardMaterial color="#e4e4e2" roughness={0.5} metalness={0.08} />
      </mesh>
      {/* Pump nozzle — angled toward corridor */}
      <mesh position={[-0.038, 0.04, 0]} rotation={[0, 0, Math.PI / 5]}>
        <cylinderGeometry args={[0.012, 0.012, 0.08, 8]} />
        <meshStandardMaterial color="#aaaaaa" roughness={0.28} metalness={0.55} />
      </mesh>
    </group>
  );
}

/* ── Room number sign ──────────────────────────────────────────── */
function RoomSign({ side, z, label }) {
  const x       = side === "left" ? -W / 2 + 0.032 : W / 2 - 0.032;
  const faceDir = side === "left" ? 0.030 : -0.030;
  return (
    <group position={[x, 2.58, z]}>
      {/* Sign body */}
      <mesh>
        <boxGeometry args={[0.052, 0.13, 0.22]} />
        <meshStandardMaterial color="#192030" roughness={0.3} metalness={0.2} />
      </mesh>
      {/* Illuminated face */}
      <mesh position={[faceDir, 0, 0]}>
        <boxGeometry args={[0.006, 0.095, 0.17]} />
        <meshStandardMaterial color="#ffffff" emissive="#cce8ff"
          emissiveIntensity={1.1} roughness={0.08} />
      </mesh>
      {/* Teal accent strip at base of sign */}
      <mesh position={[faceDir, -0.056, 0]}>
        <boxGeometry args={[0.006, 0.016, 0.17]} />
        <meshStandardMaterial color="#4a90b8" emissive="#4a90b8"
          emissiveIntensity={1.4} />
      </mesh>
    </group>
  );
}

/* ── Corridor shell ───────────────────────────────────────────── */
function CorridorShell() {
  const panelZs = [];
  for (let z = Z_END + 1.75; z < Z_START; z += 3.5)
    panelZs.push(parseFloat(z.toFixed(2)));

  const LX = -W / 2;

  return (
    <>
      {/* ── Floor ─────────────────────────────────────────────── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, MID_Z]}>
        <planeGeometry args={[W, L]} />
        <meshStandardMaterial color={FLOOR} roughness={0.18} metalness={0.06} />
      </mesh>
      {/* Accent stripes */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-W / 2 + 0.055, 0.003, MID_Z]}>
        <planeGeometry args={[0.09, L]} />
        <meshStandardMaterial color={STRIPE} roughness={0.3} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[W / 2 - 0.055, 0.003, MID_Z]}>
        <planeGeometry args={[0.09, L]} />
        <meshStandardMaterial color={STRIPE} roughness={0.3} />
      </mesh>

      {/* ── Ceiling ───────────────────────────────────────────── */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, H, MID_Z]}>
        <planeGeometry args={[W, L]} />
        <meshStandardMaterial color={CEIL} roughness={0.85} />
      </mesh>

      {/* ── Left wall — segmented around OR window ─────────────
           Window opening: Z = WIN_L_Z0 (0.5) to WIN_L_Z1 (4.5)
                           Y = WIN_L_YBOT (0.35) to WIN_L_YTOP (3.1)      */}

      {/* Bottom strip — full length */}
      <mesh rotation={[0, Math.PI / 2, 0]}
            position={[LX, WIN_L_YBOT / 2, MID_Z]}>
        <planeGeometry args={[L, WIN_L_YBOT]} />
        <meshStandardMaterial color={WALL} roughness={0.85} />
      </mesh>
      {/* Top strip — full length */}
      <mesh rotation={[0, Math.PI / 2, 0]}
            position={[LX, (WIN_L_YTOP + H) / 2, MID_Z]}>
        <planeGeometry args={[L, H - WIN_L_YTOP]} />
        <meshStandardMaterial color={WALL} roughness={0.85} />
      </mesh>
      {/* Deep section — from end wall to window left edge */}
      <mesh rotation={[0, Math.PI / 2, 0]}
            position={[LX, WIN_L_YC, (Z_END + WIN_L_Z0) / 2]}>
        <planeGeometry args={[WIN_L_Z0 - Z_END, WIN_L_YH]} />
        <meshStandardMaterial color={WALL} roughness={0.85} />
      </mesh>
      {/* Entrance section — from window right edge to entrance */}
      <mesh rotation={[0, Math.PI / 2, 0]}
            position={[LX, WIN_L_YC, (WIN_L_Z1 + Z_START) / 2]}>
        <planeGeometry args={[Z_START - WIN_L_Z1, WIN_L_YH]} />
        <meshStandardMaterial color={WALL} roughness={0.85} />
      </mesh>

      {/* ── Window frame — dark metal ──────────────────────────── */}
      {/* Top bar */}
      <mesh position={[LX + 0.026, WIN_L_YTOP + 0.022, WIN_L_ZC]}>
        <boxGeometry args={[0.048, 0.044, WIN_L_ZH * 2 + 0.09]} />
        <meshStandardMaterial color={MULL} roughness={0.28} metalness={0.5} />
      </mesh>
      {/* Bottom bar */}
      <mesh position={[LX + 0.026, WIN_L_YBOT - 0.022, WIN_L_ZC]}>
        <boxGeometry args={[0.048, 0.044, WIN_L_ZH * 2 + 0.09]} />
        <meshStandardMaterial color={MULL} roughness={0.28} metalness={0.5} />
      </mesh>
      {/* Left jamb (deep/low-Z side) */}
      <mesh position={[LX + 0.026, WIN_L_YC, WIN_L_Z0 - 0.022]}>
        <boxGeometry args={[0.048, WIN_L_YH + 0.088, 0.044]} />
        <meshStandardMaterial color={MULL} roughness={0.28} metalness={0.5} />
      </mesh>
      {/* Right jamb (entrance/high-Z side) */}
      <mesh position={[LX + 0.026, WIN_L_YC, WIN_L_Z1 + 0.022]}>
        <boxGeometry args={[0.048, WIN_L_YH + 0.088, 0.044]} />
        <meshStandardMaterial color={MULL} roughness={0.28} metalness={0.5} />
      </mesh>

      {/* Glass pane — nearly clear */}
      <mesh rotation={[0, Math.PI / 2, 0]}
            position={[LX + 0.003, WIN_L_YC, WIN_L_ZC]}>
        <planeGeometry args={[WIN_L_ZH * 2, WIN_L_YH]} />
        <meshStandardMaterial color="#b8d8e8" transparent opacity={0.07}
          roughness={0.02} side={THREE.DoubleSide} />
      </mesh>

      {/* ── Right wall — segmented around patient room window ───
           Window: Z = WIN_R_Z0 (-5.5) → WIN_R_Z1 (-1.5)
                   Y = WIN_R_YBOT (0.35) → WIN_R_YTOP (3.1)     */}
      {/* Bottom strip — full length */}
      <mesh rotation={[0, -Math.PI / 2, 0]}
            position={[W / 2, WIN_R_YBOT / 2, MID_Z]}>
        <planeGeometry args={[L, WIN_R_YBOT]} />
        <meshStandardMaterial color={WALL} roughness={0.85} />
      </mesh>
      {/* Top strip — full length */}
      <mesh rotation={[0, -Math.PI / 2, 0]}
            position={[W / 2, (WIN_R_YTOP + H) / 2, MID_Z]}>
        <planeGeometry args={[L, H - WIN_R_YTOP]} />
        <meshStandardMaterial color={WALL} roughness={0.85} />
      </mesh>
      {/* Deep section — end wall to window */}
      <mesh rotation={[0, -Math.PI / 2, 0]}
            position={[W / 2, WIN_R_YC, (Z_END + WIN_R_Z0) / 2]}>
        <planeGeometry args={[WIN_R_Z0 - Z_END, WIN_R_YH]} />
        <meshStandardMaterial color={WALL} roughness={0.85} />
      </mesh>
      {/* Entrance section — window to entrance */}
      <mesh rotation={[0, -Math.PI / 2, 0]}
            position={[W / 2, WIN_R_YC, (WIN_R_Z1 + Z_START) / 2]}>
        <planeGeometry args={[Z_START - WIN_R_Z1, WIN_R_YH]} />
        <meshStandardMaterial color={WALL} roughness={0.85} />
      </mesh>

      {/* ── Patient room window frame — dark metal ─────────────── */}
      {/* Top bar */}
      <mesh position={[W / 2 - 0.026, WIN_R_YTOP + 0.022, WIN_R_ZC]}>
        <boxGeometry args={[0.048, 0.044, WIN_R_ZH * 2 + 0.09]} />
        <meshStandardMaterial color={MULL} roughness={0.28} metalness={0.5} />
      </mesh>
      {/* Bottom bar */}
      <mesh position={[W / 2 - 0.026, WIN_R_YBOT - 0.022, WIN_R_ZC]}>
        <boxGeometry args={[0.048, 0.044, WIN_R_ZH * 2 + 0.09]} />
        <meshStandardMaterial color={MULL} roughness={0.28} metalness={0.5} />
      </mesh>
      {/* Left jamb (deep side, WIN_R_Z0) */}
      <mesh position={[W / 2 - 0.026, WIN_R_YC, WIN_R_Z0 - 0.022]}>
        <boxGeometry args={[0.048, WIN_R_YH + 0.088, 0.044]} />
        <meshStandardMaterial color={MULL} roughness={0.28} metalness={0.5} />
      </mesh>
      {/* Right jamb (entrance side, WIN_R_Z1) */}
      <mesh position={[W / 2 - 0.026, WIN_R_YC, WIN_R_Z1 + 0.022]}>
        <boxGeometry args={[0.048, WIN_R_YH + 0.088, 0.044]} />
        <meshStandardMaterial color={MULL} roughness={0.28} metalness={0.5} />
      </mesh>
      {/* Glass pane */}
      <mesh rotation={[0, -Math.PI / 2, 0]}
            position={[W / 2 - 0.003, WIN_R_YC, WIN_R_ZC]}>
        <planeGeometry args={[WIN_R_ZH * 2, WIN_R_YH]} />
        <meshStandardMaterial color="#b8d8e8" transparent opacity={0.07}
          roughness={0.02} side={THREE.DoubleSide} />
      </mesh>

      {/* ── Patient room ───────────────────────────────────────── */}
      <PatientRoom />

      {/* ── End wall ──────────────────────────────────────────── */}
      <mesh position={[0, H / 2, Z_END]}>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial color={WALL} roughness={0.88} />
      </mesh>

      {/* ── Entrance wall ─────────────────────────────────────── */}
      <mesh position={[0, H / 2, Z_START]}>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial color={WALL} roughness={0.88} />
      </mesh>

      {/* ── Baseboards ────────────────────────────────────────── */}
      <mesh position={[-W / 2 + 0.025, 0.065, MID_Z]}>
        <boxGeometry args={[0.05, 0.13, L]} />
        <meshStandardMaterial color={BASE} roughness={0.7} />
      </mesh>
      <mesh position={[W / 2 - 0.025, 0.065, MID_Z]}>
        <boxGeometry args={[0.05, 0.13, L]} />
        <meshStandardMaterial color={BASE} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.065, Z_END + 0.025]}>
        <boxGeometry args={[W, 0.13, 0.05]} />
        <meshStandardMaterial color={BASE} roughness={0.7} />
      </mesh>

      {/* ── Ceiling panels ────────────────────────────────────── */}
      {panelZs.map((z) => <CeilingPanel key={z} z={z} />)}

      {/* ── OR room ───────────────────────────────────────────── */}
      <ORRoom />

      {/* ── Handrails — cylindrical, 1 m height, split at windows ─ */}
      <Handrail side="left"  z0={Z_END}    z1={WIN_L_Z0} />
      <Handrail side="left"  z0={WIN_L_Z1} z1={Z_START}  />
      <Handrail side="right" z0={Z_END}    z1={WIN_R_Z0} />
      <Handrail side="right" z0={WIN_R_Z1} z1={Z_START}  />

      {/* ── Corridor equipment — right wall ───────────────────── */}
      <Gurney />
      <Wheelchair />

      {/* ── Hand sanitizer dispensers — right wall ─────────────── */}
      <Sanitizer z={8.5} />
      <Sanitizer z={1.5} />

      {/* ── Room number signs ─────────────────────────────────── */}
      <RoomSign side="left"  z={WIN_L_Z1 + 0.22} />
      <RoomSign side="right" z={WIN_R_Z1 + 0.22} />
    </>
  );
}

/* ── Scene ────────────────────────────────────────────────────── */
function Scene({ onComplete, navigate, navVisible, skipIntro }) {
  return (
    <>
      <ambientLight intensity={1.5} color="#f8f8f4" />
      <CorridorShell />
      <CameraFly onComplete={onComplete} skipIntro={skipIntro} />
      <EndWallNav visible={navVisible} onNavigate={navigate} />
    </>
  );
}

/* ── Canvas ───────────────────────────────────────────────────── */
export default function Corridor({ onAnimComplete, navigate, navVisible, skipIntro }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, CAM_Y, skipIntro ? Z_REST : Z_START], fov: 68 }}
      gl={{ antialias: true }}
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      <color attach="background" args={["#d8d8d6"]} />
      <Scene
        onComplete={onAnimComplete}
        navigate={navigate}
        navVisible={navVisible}
        skipIntro={skipIntro}
      />
    </Canvas>
  );
}
