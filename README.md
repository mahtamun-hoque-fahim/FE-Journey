# Flavorly

AI-powered recipe assistant built as the FlyRank Frontend AI Engineering internship capstone.

**Live URL:** https://fe-journey-gamma.vercel.app

---

## What it does

Flavorly connects to [TheMealDB](https://www.themealdb.com/) and wraps it with a streaming AI assistant. The assistant can search for recipes, suggest substitutions, explain techniques, and adapt meals for dietary needs — all in a real-time streaming chat interface.

| Page | What happens |
|---|---|
| `/` | Fullscreen GLSL shader hero (mouse-interactive aurora) + quick-access cards |
| `/search` | Live recipe search against TheMealDB API |
| `/recipe/[id]` | Recipe detail — ingredients, instructions, category, area |
| `/favorites` | Client-side saved recipes (localStorage) |
| `/assistant` | Streaming AI chat with tool calling (searchRecipes) |
| `/playground/3d-viewer` | Drag-and-drop GLB viewer with material configurator |
| `/health` | API health-check endpoint status page |

---

## Screenshots

> Replace paths below with actual screenshots after taking them.

| | |
|---|---|
| ![Home](./docs/screenshots/home.png) | ![Assistant](./docs/screenshots/assistant.png) |
| Home — shader hero | Assistant — streaming chat with tool result |
| ![Recipe](./docs/screenshots/recipe.png) | ![3D Viewer](./docs/screenshots/3d-viewer.png) |
| Recipe detail | 3D Viewer with configurator |

---

## Running locally

### Prerequisites

- Node.js 22+
- A Google AI Studio API key (free): https://aistudio.google.com/app/apikey

### Steps

```bash
git clone https://github.com/mahtamun-hoque-fahim/FE-Journey.git
cd FE-Journey
npm install
```

Create `.env.local`:

```env
GOOGLE_GENERATIVE_AI_API_KEY=your_key_here
```

```bash
npm run dev
# → http://localhost:3000
```

### Other scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start Next.js dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run test` | Vitest unit tests (29 tests) |
| `npm run test:e2e` | Playwright end-to-end tests |
| `npm run test:watch` | Vitest in watch mode |

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `GOOGLE_GENERATIVE_AI_API_KEY` | Yes | Google AI Studio key for Gemini. Get one free at aistudio.google.com |

No database, no auth, no other secrets. The app is stateless except for localStorage favorites.

---

## Architecture

```
fe-journey/
├── app/
│   ├── api/chat/route.ts      # Streaming AI route — POST /api/chat
│   ├── assistant/page.tsx     # AI chat UI
│   ├── recipe/[id]/page.tsx   # Dynamic recipe detail
│   ├── search/page.tsx        # TheMealDB search
│   ├── playground/
│   │   ├── 3d-viewer/         # React Three Fiber GLB viewer (FE-AA2)
│   │   └── buttons/           # SmartButton demo (FE-AA1)
│   └── layout.tsx             # Root layout — NavBar, skip link, shader hero
├── components/
│   ├── shader-hero.tsx        # WebGL fullscreen GLSL canvas (FE-AA3)
│   ├── smart-button.tsx       # 5-state button (idle/loading/success/error)
│   ├── recipe-tool-result.tsx # Tool result card for searchRecipes
│   ├── nav-bar.tsx            # Site nav with aria-current
│   └── nav-link.tsx           # Active link client component
├── lib/
│   ├── chat-config.ts         # Model (Gemini Flash) + system prompt
│   └── tools.ts               # searchRecipes Zod-typed tool definition
├── __tests__/                 # Vitest + RTL unit tests (29 tests)
├── e2e/                       # Playwright E2E tests
├── audit-assets/              # FE-10 Lighthouse before/after screenshots
└── AUDIT.md                   # Accessibility and performance audit
```

### Key decisions

**AI SDK v7 (`ai@7`)** — The SDK changed its API significantly between v3 and v7 during the build. Breaking changes hit mid-assignment: `parameters` → `inputSchema`, `maxSteps` → `stopWhen: isStepCount(n)`, and `toDataStreamResponse()` → `toUIMessageStreamResponse()`. Each was debugged in production.

**Gemini Flash** — Chosen over GPT-4 because it's fast enough for token-by-token streaming, stays on the Google AI Studio free tier at normal chat volume, and the `@ai-sdk/google` package gives it the same interface as any other provider.

**React Three Fiber over raw Three.js** — R3F integrates with React's lifecycle so canvas state (drag-and-drop GLB, material config) lives in useState hooks rather than mutable refs. Lazy-loaded via `next/dynamic + ssr:false` so the ~480 KB chunk never touches non-3D routes.

**Raw WebGL for the shader hero** — A fullscreen quad shader only needs a vertex shader, a fragment shader, and six vertices. Adding Three.js or R3F on top would be 100× the overhead. The GLSL itself is domain-warped FBM with `u_time`, `u_resolution`, and `u_mouse`.

**No database** — Favorites use localStorage. The capstone scope didn't need persistence across devices, and cutting the database removes one failure point and keeps the free-tier deployment clean.

**`next/font` for Google Sans** — Inlines the font-face CSS and preloads the WOFF2 file at build time. Zero render-blocking font requests.

---

## API route — abuse protection

`POST /api/chat` has two stateless guards:

- **Message count cap:** requests with more than 20 turns are rejected with `400` before reaching Gemini.
- **Input length cap:** if the latest user message exceeds 1 000 characters, the request is rejected with `400`.
- **`maxDuration = 30`:** Vercel serverless timeout raised from the default 10 s so long generations aren't cut mid-stream, but the function can't run indefinitely.

No rate limiting per IP is implemented (would require Redis/Upstash). For a production product this would be the next addition.

---

## How AI tools built this

This section documents actual AI assistance, not platitudes.

**Claude (Anthropic) — primary assistant throughout:**

- Debugged the AI SDK v7 breaking changes. When `parameters` was renamed to `inputSchema` and `maxSteps` to `stopWhen: isStepCount(n)`, Claude read the SDK source in `node_modules` directly and identified the exact renamed exports. This saved hours of reading a partially-updated changelog.
- Wrote the Vitest + RTL test suite, including the React 19 async `act()` pattern. The key insight — that state updates from un-awaited async handlers require `await act(async () => { await Promise.resolve(); })` to flush — came from Claude reading the `@testing-library/react` internals.
- Wrote the Playwright E2E tests including the UI Message Stream mock response format. Claude read `default-chat-transport.ts` and `ui-message-chunks.ts` in the `ai` package to get the exact SSE format that `DefaultChatTransport` expects.
- Diagnosed the Node.js 22 requirement for jsdom/undici v6 in the CI workflow by reading the error trace and cross-referencing `webidl.util.markAsUncloneable` to Node.js internals.
- Wrote the GLSL fragment shader (`components/shader-hero.tsx`) with full explanations of domain-warped FBM and explained each block on demand.

**What Claude could not do:**

- Run Lighthouse or WAVE (requires a browser). All audit scores were obtained by running PageSpeed Insights manually against the live URL.
- Take screenshots. All visual verification was done by the developer in a real browser.
- Cross-browser test. Safari-specific Mobile Safari bugs (the `100vh` keyboard-resize issue) were identified by Claude from known patterns and fixed with `dvh`, but only the developer could verify the fix on a real device.

**Pattern:** Claude was most valuable for tasks with deterministic correct answers — API formats, type errors, ARIA spec compliance, WebGL boilerplate. It was less useful for aesthetic decisions (the shader palette, layout proportions) which were iterated manually.

---

## Assignments completed

| Code | Title | Status |
|---|---|---|
| FE-01 | Repo setup | Done |
| FE-03 | AI workflow drill | Done |
| FE-04 | Capstone skeleton | Done |
| FE-05 | Accessible components | Done |
| FE-06 | Streaming AI chat | Done |
| FE-07 | Tool calling | Done |
| FE-08 | Error states | Done |
| FE-AA1 | Buttons with a Brain | Done |
| FE-09 | Testing pass | Done |
| FE-AA2 | 3D Viewer | Done |
| FE-10 | Accessibility & performance audit | Done — 100 a11y on both pages |
| FE-AA3 | Signature shader hero | Done |
| FE-11 | Production deployment & README | Done |

---

## Deployment

Deployed on Vercel (Hobby, free tier). Auto-deploys on push to `master`.

CI: GitHub Actions runs Vitest (Node 22) and Playwright on every push and pull request to `master`. Both jobs must pass before merging.

---

## Known limitations & future improvements

### Current limitations

| Area | Limitation |
|---|---|
| Rate limiting | No per-IP request cap — guards are stateless (message count + input length only). A sustained flood could exhaust the Gemini free-tier quota. Mitigation: Upstash Redis would add token-bucket limiting in ~30 lines. |
| Favorites | `localStorage` only — not synced across devices or browsers. Clearing browser storage silently wipes all saved recipes. |
| Recipe data | TheMealDB is the only source. No ingredient-based search ("what can I cook with eggs and spinach?"), no nutritional data, no user-submitted recipes. |
| 3D viewer safety | The GLB drag-and-drop endpoint has no file-size cap. A large model file will exhaust browser memory without a graceful error. |
| 3D viewer accessibility | The viewer content (3D model) is not described to screen reader users. A visually-hidden description of the current model is the correct fix. |
| Shader on low-end devices | The GLSL hero runs at the display's native resolution. On mobile Safari with a high-DPI screen, `devicePixelRatio` can push fragment workload high. A resolution cap (`Math.min(devicePixelRatio, 2)`) would help. |
| No monitoring | No error tracking (Sentry, Axiom) in production. Failures surface only in Vercel function logs, which expire after 7 days. |

### Future improvements

1. **Upstash Redis rate limiting** — token bucket per IP on `/api/chat`, so the Gemini key survives a public demo link going viral
2. **Ingredient-based search** — TheMealDB supports filtering by ingredient; wiring it up via a second tool (`findRecipesByIngredients`) would double the assistant's usefulness
3. **Persistent favorites** — replace `localStorage` with a Neon/Drizzle table behind Better Auth; users keep their list across devices
4. **Voice input** — the Web Speech API works in modern browsers; a mic button on the chat input would make mobile use significantly faster
5. **Export to PDF** — a single recipe should be printable in a clean format; `react-pdf` is the obvious path
6. **Model description for 3D viewer** — add a `<p aria-live="polite">` that updates with the current model name and material state when a file is loaded

