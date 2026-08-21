# Flavorly

A recipe discovery app built with Next.js 16, powered by TheMealDB API. This is the capstone project for the FlyRank.ai Frontend AI Engineering internship.

## Current status

Capstone skeleton (routing, layout, design tokens, health-check) is scaffolded and deployable. Streaming AI chat interface and server-side tool calling are implemented. Full favorites persistence and auth land in later assignments.

## Routes

| Route | Purpose |
|---|---|
| `/` | Home, featured recipes |
| `/search` | Search and filter recipes |
| `/recipe/[id]` | Recipe detail |
| `/favorites` | Saved recipes (placeholder, auth pending) |
| `/health` | Health-check page, confirms live TheMealDB fetch |
| `/assistant` | Streaming AI recipe assistant with tool calling |

## Tech stack

- Next.js 16 (App Router, Turbopack)
- TypeScript
- Tailwind CSS v4
- TheMealDB API (free, no key required)
- Vercel AI SDK v4 (`ai@7`, `@ai-sdk/google`, `@ai-sdk/react`)
- Zod (tool schema validation)
- streamdown (streaming markdown renderer)

## AI tool contract

### `searchRecipes`

Defined in `lib/tools.ts`. Registered in `app/api/chat/route.ts` via `streamText({ tools })`.

**Description:** Searches TheMealDB by ingredient or meal name. The model calls this when the user asks what to cook, requests recipes for a specific ingredient, or names a dish.

**Input schema:**

| Field | Type | Description |
|---|---|---|
| `query` | `string` | Ingredient or meal name (e.g. `"chicken"`, `"tikka masala"`) |

**Return shape:**

```ts
{
  meals: Array<{
    id:        string;   // TheMealDB meal ID — links to /recipe/[id]
    name:      string;   // Display name
    thumbnail: string;   // CDN image URL (aspect-ratio 1:1)
    category:  string;   // e.g. "Chicken", "Vegetarian"
    area:      string;   // e.g. "Indian", "Italian"
  }>;
  error: string | null;  // null on success; human-readable message on failure
}
```

**UI lifecycle states** (rendered in `app/assistant/page.tsx`):

| State | Trigger | Rendered as |
|---|---|---|
| `partial-call` | Args streaming in | Spinner + "Preparing search…" |
| `call` | Args ready, awaiting execute | Spinner + "Searching for \"{query}\"…" |
| `result` (success) | execute returned meals | `RecipeToolResult` grid component |
| `result` (error) | execute returned non-null error | Red error card with message |

## FE-AA2: 3D Viewer (`/playground/3d-viewer`)

An interactive 3D scene built with React Three Fiber and `@react-three/drei`.

**What's in the scene:**
- Animated procedural torus (donut) with 8 orbiting ingredient particles — no external model asset, zero network requests for the default view
- Drag-and-drop any `.glb` / `.gltf` file onto the viewport to replace the default scene; the model is auto-centered and scaled via `<Bounds fit clip observe>`
- Material configurator: color presets + custom picker, metalness, roughness, wireframe toggle
- Environment lighting: 7 HDR presets (studio, city, forest, dawn, sunset, park, night) via `@react-three/drei`'s `Environment`
- Auto-rotate toggle with speed control; OrbitControls with damping for orbit/zoom/pan
- `prefers-reduced-motion: reduce` → Canvas unmounts, static SVG fallback renders instead

**Performance notes:**
- Three.js + R3F chunk is ~480 KB gzipped. The Canvas is wrapped in `next/dynamic` with `ssr: false` so it is code-split from every other route — zero cost to LCP on Home, Search, or Assistant pages.
- Default scene is fully procedural; no GLB/HDR fetches until the user interacts with the environment selector or drops a file.
- `dpr={[1, 2]}` caps pixel ratio at 2× retina. `performance={{ min: 0.5 }}` enables R3F's adaptive DPR, halving resolution under frame-rate pressure on mid-range mobile.
- Object URLs created from dropped files are revoked when a new file is loaded or the component unmounts.

**What I'd add with more time:**
- DRACO/meshopt-compressed default model so users see a recognisable 3D object without uploading one
- Post-processing bloom on high-metalness surfaces (`@react-three/postprocessing`)
- Canvas `toDataURL` screenshot button
- Per-mesh material editing (click to select a mesh, tweak independently)
- Progress overlay during large GLB loads using `useProgress`

## Getting started

```bash
git clone https://github.com/mahtamun-hoque-fahim/FE-Journey.git
cd FE-Journey
npm install
npm run dev
```

Copy `.env.local.example` to `.env.local` and add your `GOOGLE_GENERATIVE_AI_API_KEY` to use the assistant.

Open `http://localhost:3000`.

## Project history

This repo also contains earlier internship assignments on separate branches:

- `feat/settings-vague`, `feat/settings-precise` — AI-assisted workflow drill (vague vs. precise prompting comparison)
- `feat/recipe-app-v1` — original Vite/React recipe finder prototype, superseded by this Next.js build

## License

This project is licensed under the [MIT License](LICENSE).
