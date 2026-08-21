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
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
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
  color: "#f59e0b",
  metalness: 0.4,
  roughness: 0.3,
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

// ── Default procedural model: animated donut with orbiting particles ──────────

function DefaultModel({ config }: { config: SceneConfig }) {
  const groupRef = useRef<THREE.Group>(null!);
  const particleRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    // Gentle float + subtle tilt
    groupRef.current.position.y = Math.sin(t * 0.6) * 0.12;
    groupRef.current.rotation.z = Math.sin(t * 0.22) * 0.05;
    // Orbit the particles at varying speeds and heights
    particleRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const speed = 0.35 + i * 0.07;
      const angle = t * speed + (i * Math.PI * 2) / 8;
      const radius = 1.8 + Math.sin(t * 0.4 + i) * 0.04;
      const height = Math.sin(t * 0.5 + i * 0.9) * 0.18;
      mesh.position.set(
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      );
    });
  });

  const mat = {
    color: config.color,
    metalness: config.metalness,
    roughness: config.roughness,
    wireframe: config.wireframe,
  };

  return (
    <group ref={groupRef}>
      {/* Main torus — the donut */}
      <mesh castShadow receiveShadow>
        <torusGeometry args={[1, 0.38, 32, 100]} />
        <meshStandardMaterial {...mat} />
      </mesh>

      {/* Inner accent ring — sits inside the hole */}
      <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.58, 0.022, 8, 64]} />
        <meshStandardMaterial
          color={config.color}
          metalness={Math.min(config.metalness + 0.35, 1)}
          roughness={Math.max(config.roughness - 0.25, 0)}
          wireframe={config.wireframe}
        />
      </mesh>

      {/* Orbiting ingredient particles */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh
          key={i}
          castShadow
          ref={(el) => {
            particleRefs.current[i] = el;
          }}
          scale={0.07 + (i % 3) * 0.028}
        >
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial
            color={config.color}
            metalness={config.metalness}
            roughness={config.roughness + 0.1}
            emissive={config.color}
            emissiveIntensity={0.08}
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
