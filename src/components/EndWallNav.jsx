import { Html } from "@react-three/drei";
import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { corridorHasPlayed } from "../introState";

const Z_END = -14;

// ── Panel config ─────────────────────────────────────────────────────
const NAV_ITEMS = [
  { label: "Research",   route: "/research"   },
  { label: "Projects",   route: "/projects"   },
  { label: "Experience", route: "/experience" },
  { label: "Academics",  route: "/academics"  },
  { label: "Contact",    route: "/contact"    },
];

// Panel geometry (world units = metres)
const PW      = 0.60;
const PH      = 0.82;
const GAP     = 0.20;
const PY      = 1.22;
const TOTAL_W = NAV_ITEMS.length * PW + (NAV_ITEMS.length - 1) * GAP; // 3.80 m

const TEAL     = new THREE.Color("#7ad8c0");
const SCR_DARK = new THREE.Color("#020c18");

// ── Single panel ─────────────────────────────────────────────────────
function NavPanel({ item, index, visible, onNavigate }) {
  const skipAnim = corridorHasPlayed();

  const groupRef     = useRef();
  const screenMatRef = useRef();
  const scanRef      = useRef();
  const hoveredRef   = useRef(false);
  const phaseRef     = useRef("off");
  const flickerT0    = useRef(null);

  const [isOn,    setIsOn]    = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (!visible) return;
    if (skipAnim) {
      // Returning visitor — power panels on instantly, no flicker
      phaseRef.current = "on";
      setIsOn(true);
      return;
    }
    const t = setTimeout(() => { phaseRef.current = "flicker"; }, 450 + index * 220);
    return () => clearTimeout(t);
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  useFrame(({ clock }) => {
    const g    = groupRef.current;
    const mat  = screenMatRef.current;
    const scan = scanRef.current;
    if (!g || !mat) return;

    const hov = hoveredRef.current;
    const ph  = phaseRef.current;

    // Smooth scale on hover
    const ts = hov ? 1.055 : 1.0;
    g.scale.x = THREE.MathUtils.lerp(g.scale.x, ts, 0.10);
    g.scale.y = THREE.MathUtils.lerp(g.scale.y, ts, 0.10);

    // ── Phase: flicker (CRT boot) ──
    if (ph === "flicker") {
      if (flickerT0.current === null) flickerT0.current = clock.elapsedTime;
      const e = clock.elapsedTime - flickerT0.current;
      const f = Math.sin(e * (24 + index * 5) * Math.PI * 2)
              + Math.sin(e * (41 + index * 3) * Math.PI * 2);
      mat.emissiveIntensity = e < 0.50 ? (f > 0.22 ? 1.3 : 0.02) : 0.30;
      mat.emissive.set(e > 0.28 ? "#081828" : "#7ad8c0");
      if (e > 0.74) {
        phaseRef.current  = "on";
        flickerT0.current = null;
        setIsOn(true);
      }

    // ── Phase: on (idle breathing + hover) ──
    } else if (ph === "on") {
      const breath = 0.22 + Math.sin(clock.elapsedTime * 0.72 + index * 1.08) * 0.030;
      const target = hov ? 1.5 : breath;
      mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, target, 0.07);
      mat.emissive.lerp(hov ? TEAL : SCR_DARK, 0.08);

      // Sweep scan line — top to bottom, staggered
      if (scan) {
        const cycleLen  = 5.0 + index * 0.38;
        const cycleT    = (clock.elapsedTime + index * 1.4) % cycleLen;
        const sweepDur  = cycleLen * 0.25;
        const topY      = PH / 2 - 0.04;
        const sweepDist = PH - 0.08;
        if (cycleT < sweepDur) {
          const progress               = cycleT / sweepDur;
          scan.position.y              = topY - progress * sweepDist;
          scan.visible                 = true;
          scan.material.opacity        = hov ? 0.55 : 0.13;
          scan.material.emissiveIntensity = hov ? 2.8 : 0.8;
        } else {
          scan.visible = false;
        }
      }

    // ── Phase: off ──
    } else {
      mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0, 0.1);
      if (scan) scan.visible = false;
    }
  });

  const px = -TOTAL_W / 2 + PW / 2 + index * (PW + GAP);

  return (
    <group ref={groupRef} position={[px, PY, Z_END + 0.040]}>

      {/* Outer frame — dark anodised metal */}
      <mesh>
        <boxGeometry args={[PW, PH, 0.062]} />
        <meshStandardMaterial color="#111b28" roughness={0.26} metalness={0.68} />
      </mesh>

      {/* Inner bezel */}
      <mesh position={[0, 0, 0.031]}>
        <boxGeometry args={[PW - 0.024, PH - 0.024, 0.009]} />
        <meshStandardMaterial color="#06101c" roughness={0.12} metalness={0.54} />
      </mesh>

      {/* Screen face — emissive drives all glow */}
      <mesh position={[0, 0, 0.037]}>
        <planeGeometry args={[PW - 0.056, PH - 0.056]} />
        <meshStandardMaterial
          ref={screenMatRef}
          color="#000a14"
          emissive="#020c18"
          emissiveIntensity={0}
          roughness={0.06}
        />
      </mesh>

      {/* Sweep scan line */}
      <mesh ref={scanRef} position={[0, PH / 2 - 0.04, 0.039]} visible={false}>
        <planeGeometry args={[PW - 0.060, 0.0038]} />
        <meshStandardMaterial
          color="#7ad8c0" emissive="#7ad8c0" emissiveIntensity={0.8}
          transparent opacity={0.13}
        />
      </mesh>

      {/* Teal hairline — top of screen area */}
      {isOn && (
        <mesh position={[0, PH / 2 - 0.100, 0.039]}>
          <planeGeometry args={[PW - 0.060, 0.0016]} />
          <meshStandardMaterial color="#7ad8c0" emissive="#7ad8c0"
            emissiveIntensity={1.4} transparent opacity={0.48} />
        </mesh>
      )}

      {/* Teal hairline — bottom of screen area */}
      {isOn && (
        <mesh position={[0, -(PH / 2 - 0.100), 0.039]}>
          <planeGeometry args={[PW - 0.060, 0.0016]} />
          <meshStandardMaterial color="#7ad8c0" emissive="#7ad8c0"
            emissiveIntensity={1.4} transparent opacity={0.48} />
        </mesh>
      )}

      {/* Corner mounting screws (4×) */}
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy], i) => (
        <mesh key={i}
          position={[sx * (PW / 2 - 0.019), sy * (PH / 2 - 0.019), 0.034]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.006, 0.006, 0.008, 6]} />
          <meshStandardMaterial color="#1c2c3e" roughness={0.32} metalness={0.78} />
        </mesh>
      ))}

      {/* Data port — bottom centre */}
      <mesh position={[0, -(PH / 2 + 0.006), 0.020]}>
        <boxGeometry args={[0.034, 0.012, 0.034]} />
        <meshStandardMaterial color="#06101c" roughness={0.3} metalness={0.65} />
      </mesh>

      {/* Status LED — top-right corner */}
      {isOn && (
        <mesh position={[PW / 2 - 0.046, PH / 2 - 0.033, 0.038]}>
          <circleGeometry args={[0.008, 8]} />
          <meshStandardMaterial
            color={hovered ? "#7ad8c0" : "#1d5535"}
            emissive={hovered ? "#7ad8c0" : "#1d5535"}
            emissiveIntensity={hovered ? 4.5 : 2.0}
          />
        </mesh>
      )}

      {/* Label — screen-space Html, centred on the panel face */}
      {isOn && (
        <Html position={[0, 0, 0.042]} center style={{ pointerEvents: "none" }}>
          <span style={{
            display: "block",
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            fontSize: "9px",
            fontWeight: 600,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: hovered ? "#7ad8c0" : "#4a8aaa",
            whiteSpace: "nowrap",
            transition: "color 0.2s ease",
            pointerEvents: "none",
            userSelect: "none",
          }}>
            {item.label}
          </span>
        </Html>
      )}

      {/* Invisible click / hover plane */}
      <mesh
        position={[0, 0, 0.044]}
        onClick={() => isOn && onNavigate(item.route)}
        onPointerOver={(e) => {
          if (!isOn) return;
          e.stopPropagation();
          hoveredRef.current = true;
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          hoveredRef.current = false;
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
      >
        <planeGeometry args={[PW, PH]} />
        <meshStandardMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Hover glow light */}
      {hovered && isOn && (
        <pointLight position={[0, 0, 0.55]} intensity={2.5} distance={2.0} color="#7ad8c0" decay={2} />
      )}
    </group>
  );
}

// ── Exported component ────────────────────────────────────────────────
export default function EndWallNav({ visible, onNavigate }) {
  return (
    <group>
      {/* Equipment rail — top */}
      <mesh position={[0, PY + PH / 2 + 0.058, Z_END + 0.014]}>
        <boxGeometry args={[TOTAL_W + 0.18, 0.022, 0.028]} />
        <meshStandardMaterial color="#0a1622" roughness={0.28} metalness={0.64} />
      </mesh>
      {/* Equipment rail — bottom */}
      <mesh position={[0, PY - PH / 2 - 0.058, Z_END + 0.014]}>
        <boxGeometry args={[TOTAL_W + 0.18, 0.022, 0.028]} />
        <meshStandardMaterial color="#0a1622" roughness={0.28} metalness={0.64} />
      </mesh>

      {NAV_ITEMS.map((item, i) => (
        <NavPanel
          key={item.route}
          item={item}
          index={i}
          visible={visible}
          onNavigate={onNavigate}
        />
      ))}
    </group>
  );
}
