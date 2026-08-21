import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "3D Viewer — Flavorly",
  description:
    "Interactive 3D model viewer with material configurator. Drop any .glb to load your model.",
};

// Canvas and Three.js are client-only. The dynamic import with ssr:false
// keeps the entire R3F tree out of the SSR bundle — no window/WebGL
// references during server rendering, and the chunk is only fetched when
// the user navigates to this route.
const ViewerScene = dynamic(
  () => import("./viewer-scene").then((m) => ({ default: m.ViewerScene })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-96 items-center justify-center text-neutral-600">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    ),
  }
);

export default function ThreeDViewerPage() {
  return (
    <div className="min-h-screen bg-neutral-950 px-4 py-4 sm:px-6">
      <ViewerScene />
    </div>
  );
}
