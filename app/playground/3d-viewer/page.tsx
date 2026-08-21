import { ViewerLoader } from "./viewer-loader";

export const metadata = {
  title: "3D Viewer — Flavorly",
  description:
    "Interactive 3D model viewer with material configurator. Drop any .glb to load your model.",
};

export default function ThreeDViewerPage() {
  return (
    <div className="min-h-screen bg-neutral-950 px-4 py-4 sm:px-6">
      <ViewerLoader />
    </div>
  );
}
