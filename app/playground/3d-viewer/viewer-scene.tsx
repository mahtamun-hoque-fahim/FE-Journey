"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  ContactShadows,
  Bounds,
  Center,
  useGLTF,
  Html,
  useProgress,
} from "@react-three/drei";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Eye, EyeOff, Loader2, RotateCcw, Upload } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

type EnvPreset =
  | "studio"
  | "city"
  | "forest"
  | "dawn"
  | "sunset"
  | "night"
  | "park";

interface SceneConfig {
  color: string;
  metalness: number;
  roughness: number;
  wireframe: boolean;
  envPreset: EnvPreset;
  autoRotate: boolean;
  autoRotateSpeed: number;
}

const DEFAULT_CONFIG: SceneConfig = {
  color: "#FFB7C5",   // strawberry frosting — change with the colour picker
  metalness: 0.1,
  roughness: 0.5,
  wireframe: false,
  envPreset: "studio",
  autoRotate: true,
  autoRotateSpeed: 1.0,
};

const PRESET_COLORS = [
  "#f59e0b",
  "#38bdf8",
  "#a78bfa",
  "#34d399",
  "#fb7185",
  "#f1f5f9",
];

const ENV_PRESETS: { value: EnvPreset; label: string }[] = [
  { value: "studio", label: "Studio" },
  { value: "city", label: "City" },
  { value: "forest", label: "Forest" },
  { value: "dawn", label: "Dawn" },
  { value: "sunset", label: "Sunset" },
  { value: "park", label: "Park" },
  { value: "night", label: "Night" },
];

// ── Canvas loading indicator ─────────────────────────────────────────────────

function SceneLoader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2 text-neutral-400 select-none pointer-events-none">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-xs tabular-nums">{Math.round(progress)}%</span>
      </div>
    </Html>
  );
}

// ── Default model: cupcake built from Three.js primitives ───────────────────
// Wrapper → cake body → frosting dome + swirl rings → cherry + stem + sprinkles.
// The frosting colour, metalness, roughness, and wireframe all respond to the
// configurator panel. Wrapper and cherry keep their natural colours.

const SPRINKLE_COLORS = ["#ff6b6b", "#ffd93d", "#6bcb77", "#4d96ff", "#e879f9", "#f97316"];

function DefaultModel({ config }: { config: SceneConfig }) {
  const groupRef = useRef<THREE.Group>(null!);
  const cherryRef = useRef<THREE.Mesh>(null!);

  // Sprinkle positions computed once — stable across re-renders.
  const sprinkles = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => {
        // Distribute evenly in theta, randomise phi on the lower hemisphere dome
        const theta = (i / 26) * Math.PI * 2 + Math.random() * 0.4;
        const phi   = 0.35 + Math.random() * 1.05; // lower half of dome
        const r     = 0.52;
        return {
          // position on hemisphere surface (dome center is at group-y 0.52)
          x: r * Math.sin(phi) * Math.cos(theta),
          y: 0.52 + r * Math.cos(phi),
          z: r * Math.sin(phi) * Math.sin(theta),
          color: SPRINKLE_COLORS[i % SPRINKLE_COLORS.length],
          rotX: Math.random() * Math.PI,
          rotZ: Math.random() * Math.PI,
        };
      }),
    []
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    // Gentle float
    groupRef.current.position.y = Math.sin(t * 0.55) * 0.09 - 0.25;
    // Slow auto-spin handled by OrbitControls.autoRotate — only add a tiny
    // independent sway so it looks alive even with autoRotate off.
    groupRef.current.rotation.y = Math.sin(t * 0.18) * 0.12;
    // Cherry bobs independently — cute micro-animation
    if (cherryRef.current) {
      cherryRef.current.position.y = 1.22 + Math.sin(t * 1.6 + 1) * 0.025;
    }
  });

  const frostingMat = {
    color: config.color,
    metalness: config.metalness,
    roughness: config.roughness,
    wireframe: config.wireframe,
  };

  return (
    <group ref={groupRef} position={[0, -0.25, 0]}>
      {/* ── Paper wrapper (tapered cylinder) ─────────────────────────── */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.5, 0.4, 0.65, 32]} />
        <meshStandardMaterial
          color="#f5e6c8"
          metalness={0}
          roughness={0.85}
          wireframe={config.wireframe}
        />
      </mesh>

      {/* ── Cake body (sits on top of wrapper) ───────────────────────── */}
      <mesh castShadow position={[0, 0.43, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.21, 32]} />
        <meshStandardMaterial
          color="#c4956a"
          metalness={0}
          roughness={0.75}
          wireframe={config.wireframe}
        />
      </mesh>

      {/* ── Frosting: base dome (lower hemisphere) ───────────────────── */}
      <mesh castShadow position={[0, 0.52, 0]}>
        {/* phiLength = PI/2 → bottom half of sphere only */}
        <sphereGeometry args={[0.52, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial {...frostingMat} />
      </mesh>

      {/* ── Frosting: swirl ring 1 (widest, closest to base) ─────────── */}
      <mesh castShadow position={[0, 0.68, 0]}>
        <torusGeometry args={[0.3, 0.11, 16, 40]} />
        <meshStandardMaterial {...frostingMat} />
      </mesh>

      {/* ── Frosting: swirl ring 2 ────────────────────────────────────── */}
      <mesh castShadow position={[0, 0.9, 0]} rotation={[0, Math.PI / 6, 0]}>
        <torusGeometry args={[0.18, 0.09, 16, 32]} />
        <meshStandardMaterial {...frostingMat} />
      </mesh>

      {/* ── Frosting: swirl tip (small sphere at top of piping) ──────── */}
      <mesh castShadow position={[0, 1.07, 0]}>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshStandardMaterial {...frostingMat} />
      </mesh>

      {/* ── Cherry ───────────────────────────────────────────────────── */}
      <mesh castShadow position={[0, 1.22, 0]} ref={cherryRef}>
        <sphereGeometry args={[0.1, 20, 20]} />
        <meshStandardMaterial
          color="#c0392b"
          metalness={0.25}
          roughness={0.25}
          wireframe={config.wireframe}
        />
      </mesh>

      {/* ── Cherry stem ──────────────────────────────────────────────── */}
      <mesh castShadow position={[0.045, 1.35, 0]} rotation={[0, 0, 0.35]}>
        <cylinderGeometry args={[0.014, 0.014, 0.2, 8]} />
        <meshStandardMaterial color="#2d6a4f" metalness={0} roughness={0.9} />
      </mesh>

      {/* ── Sprinkles ─────────────────────────────────────────────────── */}
      {sprinkles.map((s, i) => (
        <mesh
          key={i}
          castShadow
          position={[s.x, s.y, s.z]}
          rotation={[s.rotX, 0, s.rotZ]}
        >
          <boxGeometry args={[0.03, 0.13, 0.03]} />
          <meshStandardMaterial
            color={s.color}
            metalness={0.1}
            roughness={0.4}
          />
        </mesh>
      ))}
    </group>
  );
}

// ── GLB model — mounted only when a URL is provided ──────────────────────────

function GLBModel({
  url,
  config,
}: {
  url: string;
  config: SceneConfig;
}) {
  const { scene } = useGLTF(url);

  // Apply material overrides across every mesh in the loaded scene
  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const mat = child.material;
        if (mat instanceof THREE.MeshStandardMaterial) {
          mat.color.set(config.color);
          mat.metalness = config.metalness;
          mat.roughness = config.roughness;
          mat.wireframe = config.wireframe;
          mat.needsUpdate = true;
        }
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene, config.color, config.metalness, config.roughness, config.wireframe]);

  // Release the GLTF cache entry when this component unmounts
  useEffect(() => {
    return () => {
      useGLTF.clear(url);
    };
  }, [url]);

  return <primitive object={scene} />;
}

// ── Full scene graph ─────────────────────────────────────────────────────────

function Scene({
  config,
  glbUrl,
}: {
  config: SceneConfig;
  glbUrl: string | null;
}) {
  return (
    <>
      <color attach="background" args={["#080808"]} />
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={0.1}
        shadow-camera-far={30}
      />
      <pointLight position={[-4, 2, -4]} intensity={0.45} color="#4488ff" />

      <Environment preset={config.envPreset} />

      <ContactShadows
        position={[0, -1.9, 0]}
        opacity={0.35}
        scale={6}
        blur={2.5}
        far={3}
      />

      {glbUrl ? (
        <Bounds fit clip observe maxDuration={0.6}>
          <Center>
            <Suspense fallback={<SceneLoader />}>
              <GLBModel url={glbUrl} config={config} />
            </Suspense>
          </Center>
        </Bounds>
      ) : (
        <DefaultModel config={config} />
      )}

      <OrbitControls
        makeDefault
        autoRotate={config.autoRotate}
        autoRotateSpeed={config.autoRotateSpeed}
        enableDamping
        dampingFactor={0.05}
        minDistance={2}
        maxDistance={14}
      />
    </>
  );
}

// ── Configurator panel ───────────────────────────────────────────────────────

function ConfigPanel({
  config,
  onChange,
  glbUrl,
  onReset,
}: {
  config: SceneConfig;
  onChange: (partial: Partial<SceneConfig>) => void;
  glbUrl: string | null;
  onReset: () => void;
}) {
  return (
    <div
      className="absolute top-3 right-3 z-10 w-52 rounded-xl border border-neutral-800 bg-neutral-950/90 p-4 text-xs backdrop-blur flex flex-col gap-3.5"
      role="group"
      aria-label="Scene configurator"
    >
      {/* Color presets + custom picker */}
      <div className="flex flex-col gap-1.5">
        <span className="uppercase tracking-wider text-neutral-500">Color</span>
        <div className="flex flex-wrap items-center gap-1.5">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => onChange({ color: c })}
              className="h-5 w-5 rounded-full border-2 transition-transform hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
              style={{
                backgroundColor: c,
                borderColor: config.color === c ? "#fff" : "transparent",
              }}
              aria-label={`Color ${c}`}
              aria-pressed={config.color === c}
            />
          ))}
          <label
            className="relative flex h-5 w-5 cursor-pointer items-center justify-center rounded-full border border-dashed border-neutral-600 transition-colors hover:border-neutral-400"
            aria-label="Custom color"
          >
            <span className="select-none text-neutral-500 leading-none">+</span>
            <input
              type="color"
              value={config.color}
              onChange={(e) => onChange({ color: e.target.value })}
              className="sr-only"
            />
          </label>
        </div>
      </div>

      {/* Metalness */}
      <label className="flex flex-col gap-1">
        <div className="flex justify-between">
          <span className="uppercase tracking-wider text-neutral-500">Metalness</span>
          <span className="tabular-nums text-neutral-600">
            {config.metalness.toFixed(2)}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={config.metalness}
          onChange={(e) => onChange({ metalness: parseFloat(e.target.value) })}
          className="h-1 w-full cursor-pointer accent-amber-400"
          aria-label="Metalness"
        />
      </label>

      {/* Roughness */}
      <label className="flex flex-col gap-1">
        <div className="flex justify-between">
          <span className="uppercase tracking-wider text-neutral-500">Roughness</span>
          <span className="tabular-nums text-neutral-600">
            {config.roughness.toFixed(2)}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={config.roughness}
          onChange={(e) => onChange({ roughness: parseFloat(e.target.value) })}
          className="h-1 w-full cursor-pointer accent-amber-400"
          aria-label="Roughness"
        />
      </label>

      {/* Environment preset */}
      <label className="flex flex-col gap-1">
        <span className="uppercase tracking-wider text-neutral-500">
          Environment
        </span>
        <select
          value={config.envPreset}
          onChange={(e) =>
            onChange({ envPreset: e.target.value as EnvPreset })
          }
          className="rounded-lg border border-neutral-700 bg-neutral-900 px-2 py-1 text-white focus:outline-none focus:border-neutral-500"
          aria-label="Environment preset"
        >
          {ENV_PRESETS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </label>

      {/* Spin speed */}
      <label className="flex flex-col gap-1">
        <div className="flex justify-between">
          <span className="uppercase tracking-wider text-neutral-500">
            Spin speed
          </span>
          <span className="tabular-nums text-neutral-600">
            {config.autoRotateSpeed.toFixed(1)}x
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={5}
          step={0.1}
          value={config.autoRotateSpeed}
          onChange={(e) =>
            onChange({ autoRotateSpeed: parseFloat(e.target.value) })
          }
          className="h-1 w-full cursor-pointer accent-amber-400"
          aria-label="Auto-rotate speed"
        />
      </label>

      {/* Wire / Spin toggles */}
      <div className="flex gap-2">
        <button
          onClick={() => onChange({ wireframe: !config.wireframe })}
          className={`flex flex-1 items-center justify-center gap-1 rounded-lg border py-1.5 transition-colors ${
            config.wireframe
              ? "border-white bg-white text-black"
              : "border-neutral-700 text-neutral-400 hover:border-neutral-500"
          }`}
          aria-pressed={config.wireframe}
          aria-label="Toggle wireframe"
        >
          {config.wireframe ? (
            <Eye className="h-3 w-3" />
          ) : (
            <EyeOff className="h-3 w-3" />
          )}
          Wire
        </button>

        <button
          onClick={() => onChange({ autoRotate: !config.autoRotate })}
          className={`flex flex-1 items-center justify-center gap-1 rounded-lg border py-1.5 transition-colors ${
            config.autoRotate
              ? "border-white bg-white text-black"
              : "border-neutral-700 text-neutral-400 hover:border-neutral-500"
          }`}
          aria-pressed={config.autoRotate}
          aria-label="Toggle auto-rotate"
        >
          <RotateCcw className="h-3 w-3" />
          Spin
        </button>
      </div>

      {/* Reset model button — shown only when a GLB is loaded */}
      {glbUrl && (
        <button
          onClick={onReset}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-red-900/60 py-1.5 text-red-500 transition-colors hover:border-red-700 hover:text-red-400"
        >
          Reset to default
        </button>
      )}
    </div>
  );
}

// ── Static fallback for prefers-reduced-motion ───────────────────────────────

function ReducedMotionFallback() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-neutral-600 select-none">
      {/* Static torus silhouette */}
      <div className="relative flex h-24 w-24 items-center justify-center">
        <div className="h-24 w-24 rounded-full border-[12px] border-neutral-700" />
        <div className="absolute h-8 w-8 rounded-full bg-neutral-900" />
      </div>
      <p className="text-sm text-neutral-500">3D scene paused</p>
      <p className="max-w-xs text-center text-xs text-neutral-700">
        Reduce Motion is enabled in your OS. Disable it to see the live scene.
      </p>
    </div>
  );
}

// ── Drag-and-drop overlay ────────────────────────────────────────────────────

function DropOverlay({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-xl border-2 border-dashed border-white/25 bg-black/55 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3 text-white">
        <Upload className="h-10 w-10 opacity-75" />
        <span className="text-base font-medium">Drop your .glb file</span>
      </div>
    </div>
  );
}

// ── Main exported component ──────────────────────────────────────────────────

export function ViewerScene() {
  const [config, setConfig] = useState<SceneConfig>(DEFAULT_CONFIG);
  const [glbUrl, setGlbUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Watch for OS-level reduced-motion changes
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mql.matches);
    const handler = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  const handleChange = useCallback(
    (partial: Partial<SceneConfig>) =>
      setConfig((prev) => ({ ...prev, ...partial })),
    []
  );

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "glb" && ext !== "gltf") return;
    setGlbUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  }, []);

  const handleReset = useCallback(() => {
    setGlbUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, []);

  return (
    <div
      className="flex flex-col gap-4"
      style={{ height: "calc(100dvh - 6rem)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">3D Viewer</h1>
          <p className="mt-0.5 text-xs text-neutral-500">
            {glbUrl
              ? "Custom model loaded — drop another .glb to replace"
              : "Animated scene — drop a .glb file to load your own model"}
          </p>
        </div>
        <span className="font-mono text-xs text-neutral-700">FE-AA2</span>
      </div>

      {/* Viewport */}
      <div
        className="relative min-h-0 flex-1 overflow-hidden rounded-xl border border-neutral-800/60 bg-neutral-950"
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setIsDragging(false);
          }
        }}
        onDrop={handleDrop}
        role="region"
        aria-label="3D viewport — drag and drop a GLB file to load a model"
      >
        {prefersReducedMotion ? (
          <ReducedMotionFallback />
        ) : (
          <Canvas
            shadows
            dpr={[1, 2]}
            camera={{ position: [0, 0, 5], fov: 50 }}
            performance={{ min: 0.5 }}
          >
            <Suspense fallback={<SceneLoader />}>
              <Scene config={config} glbUrl={glbUrl} />
            </Suspense>
          </Canvas>
        )}

        <DropOverlay active={isDragging} />

        <ConfigPanel
          config={config}
          onChange={handleChange}
          glbUrl={glbUrl}
          onReset={handleReset}
        />

        {/* Hint badge */}
        {!glbUrl && !isDragging && !prefersReducedMotion && (
          <div className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-1.5 text-xs text-neutral-700">
            <Upload className="h-3 w-3" />
            Drop a .glb to load your model
          </div>
        )}
      </div>
    </div>
  );
}
