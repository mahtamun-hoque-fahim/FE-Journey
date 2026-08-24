# Capstone — Ship It: Your First Production AI Product

**Track:** Frontend AI Engineering · Week 8  
**Intern:** Mahtamun Hoque Fahim (mahtamunhoquefahim@gmail.com)  
**Submitted:** August 2026

---

## 1. Project Brief

Flavorly is an AI-powered recipe assistant for home cooks who know roughly what they want
to eat but need help adapting it — different ingredients, dietary restrictions, technique
questions, or just a second opinion on what to make tonight. Existing recipe sites are
static: you search, you get a list, and if nothing fits you open another tab. Flavorly
replaces that loop with a streaming conversation: the assistant searches TheMealDB live,
returns real recipe cards with images and ingredient lists, and answers follow-up questions
in the same thread without losing context. I chose this domain because it has a natural
tool-calling use case (search), produces enough variation to stress-test error states and
edge cases, and felt like something I would actually use.

---

## 2. Live Application

| | |
|---|---|
| **Live URL** | https://fe-journey-gamma.vercel.app |
| **Status** | Production — deployed on Vercel Hobby, auto-deploys from `master` |
| **Accessibility** | WCAG 2.1 AA — 100/100 Lighthouse Accessibility on all audited pages |

Key routes:

| Route | What it does |
|---|---|
| `/` | Fullscreen mouse-interactive GLSL shader hero + quick-access cards |
| `/assistant` | Streaming AI chat — Gemini Flash, tool calling, error states |
| `/search` | Live recipe search against TheMealDB |
| `/recipe/[id]` | Full recipe detail — ingredients, instructions, area, category |
| `/favorites` | Client-side saved recipes (localStorage) |
| `/playground/3d-viewer` | Drag-and-drop GLB viewer with material configurator (R3F) |
| `/playground/buttons` | SmartButton 5-state demo |

---

## 3. Repository & README

| | |
|---|---|
| **Repository** | https://github.com/mahtamun-hoque-fahim/FE-Journey |
| **README** | Architecture, key decisions, AI integration, setup, assignments, known limitations |

### Setup (one command after clone)

```bash
git clone https://github.com/mahtamun-hoque-fahim/FE-Journey.git
cd FE-Journey
npm install
# create .env.local with GOOGLE_GENERATIVE_AI_API_KEY=<your key>
npm run dev
```

The only environment variable is `GOOGLE_GENERATIVE_AI_API_KEY`. A free key is available
at aistudio.google.com. No database, no auth, no other secrets.

### AI integration

**Model:** Gemini 1.5 Flash via `@ai-sdk/google`  
**SDK:** AI SDK v7 (`ai@7` + `@ai-sdk/react@4`)  
**Integration point:** `POST /api/chat` (`app/api/chat/route.ts`) + `lib/tools.ts`

The assistant has one tool: `searchRecipes`. When the user asks for a recipe or ingredient,
the model decides to call `searchRecipes({ query: "..." })`. The route handler calls
TheMealDB, formats the results, and returns them as a `tool_result` message. The model
streams a natural-language response alongside the structured recipe cards.

**System prompt summary** (full prompt in `lib/chat-config.ts`):

> You are Flavorly's recipe assistant. When a user asks for a recipe or mentions an
> ingredient, call searchRecipes. Return results as recipe cards and follow up with
> practical cooking advice. Keep responses focused and useful.

**Why Gemini Flash:** Fast enough for token-by-token streaming in a chat interface,
stays on the Google AI Studio free tier at normal volume, and `@ai-sdk/google` gives it
the same provider interface as OpenAI or Anthropic — swapping models is a one-line change.

**Why tool calling over RAG:** The recipe corpus changes (TheMealDB is live data). A
static vector store would go stale. Tool calling fetches fresh results on every query with
no maintenance overhead.

---

## 4. Testing Evidence

| Suite | Count | Status |
|---|---|---|
| Vitest + React Testing Library | 29 tests | Passing |
| Playwright E2E | 1 critical flow (chat → tool result) | Passing |
| GitHub Actions CI | Both jobs run on every push to `master` | Green |

**Coverage:** Tests cover `SmartButton` (all 5 states + transitions), `RecipeToolResult`
(render, image fallback, link target), `ChatInput` (submit, disabled state, char limit),
`StatusAnnouncer` (aria-live content), and the `/api/chat` route handler (guard rejection
for message count and input length). Coverage targets ≥50% of components — the tested
components are the primary interactive surface of the app.

**How to run:**

```bash
npm test              # Vitest — 29 unit + integration tests
npm run test:e2e      # Playwright — E2E chat flow
```

CI workflow: `.github/workflows/ci.yml` — runs on `ubuntu-latest`, Node 22 (required for
jsdom/undici v6 compatibility).

---

## 5. Performance & Accessibility Audit

Full audit with before/after analysis, specific findings, and fix descriptions:
**[AUDIT.md](./AUDIT.md)**

### Lighthouse scores (PageSpeed Insights, Mobile, post-fix)

| Page | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| `/` (Home) | **97** | **100** | **100** | **100** |
| `/assistant` | **98** | **100** | **100** | **100** |

All scores exceed the rubric minimum of 85. Accessibility reached the maximum on both pages.
Screenshots: `audit-assets/after-home.png`, `audit-assets/after-assistant.png`.

### Accessibility tool used

PageSpeed Insights (runs Lighthouse 12 axe-core rules). No WCAG AA violations found
post-fix. The 10 specific fixes made are documented in AUDIT.md sections A1–A10.

### One concrete improvement made

**A4 — Streaming AI output not announced to screen readers.**  
Before: the chat message area had no `aria-live` region. Screen reader users heard nothing
when the assistant responded.  
After: changed the scroll container to `role="log"` (implies `aria-live="polite"`) and
added a `<StatusAnnouncer>` with `role="status"` that fires once when streaming completes,
reading the first 160 characters of the response. Per-character streaming updates inside
an existing bubble are not re-announced, preventing queue flooding.

---

## 6. Deployment & Operation

### Deployment checklist

#### Pre-deploy

- [x] `npx tsc --noEmit` — zero type errors
- [x] `npm run build` — production build passes locally
- [x] `npm test` — 29/29 Vitest tests passing
- [x] `npm run test:e2e` — Playwright chat flow passes
- [x] `GOOGLE_GENERATIVE_AI_API_KEY` set in Vercel environment variables
- [x] `maxDuration = 30` set in `app/api/chat/route.ts`
- [x] `MAX_MESSAGES = 20` guard active and tested
- [x] `MAX_INPUT_CHARS = 1000` guard active and tested
- [x] No emojis in production UI (lucide-react icons only)
- [x] GitHub Actions CI green on `master`

#### Post-deploy

- [x] Live URL responds: https://fe-journey-gamma.vercel.app
- [x] `/assistant` — AI streaming chat works end-to-end
- [x] `/assistant` — `searchRecipes` tool call returns recipe cards with images
- [x] `/assistant` — error state (network off) shows retry + clear buttons
- [x] `/search` — TheMealDB query returns results
- [x] `/recipe/[id]` — recipe detail page loads with ingredients and instructions
- [x] `/playground/3d-viewer` — 3D viewer loads (lazy chunk, `ssr: false`)
- [x] Lighthouse Accessibility ≥ 100 on primary pages

### How it fails safely

| Failure | Behaviour |
|---|---|
| Gemini API returns an error | `useChat` error handler activates. Error panel appears with `role="alert"`. User sees "Response failed" + Retry + Clear Chat buttons. The chat is not broken — retrying works. |
| Message count > 20 | `/api/chat` returns `400`. `useChat` triggers the same error UI. |
| Input > 1 000 characters | Same `400` path. |
| TheMealDB is down | `searchRecipes` throws. AI SDK surfaces a tool error; the assistant responds in prose ("I couldn't reach the recipe database") rather than crashing. |
| Vercel cold start timeout (>30 s) | Vercel cuts the stream at `maxDuration = 30`. Partial response is already streamed to the client. |

### Rollback plan

Vercel auto-deploys on every push to `master`. To roll back:

1. **Vercel dashboard** → Deployments → click any earlier deployment → "Promote to Production" → ~60 seconds
2. **Git revert** → `git revert HEAD && git push origin master` → triggers a new deploy with the reverted commit

No database means no migration to undo. A rollback is always clean.

### Monitoring

No dedicated error tracker is set up (known limitation). Vercel function logs capture
runtime errors and are accessible in the dashboard for 7 days. For a production product,
the next addition would be Axiom or Sentry on the `/api/chat` route.

---

## 7. Reflection

### What was hardest

The AI SDK v7 breaking changes, arriving mid-build. Between the FE-06 and FE-07 commits,
`@ai-sdk/react` renamed `parameters` to `inputSchema`, `maxSteps` to
`stopWhen: isStepCount(n)`, and `toDataStreamResponse()` to `toUIMessageStreamResponse()`.
None of these were in the changelog visible at the time — they were found by reading
`node_modules` source. The hard part wasn't fixing them (each was a one-line change once
identified) — it was that the TypeScript errors were vague ("argument of type X is not
assignable to…") and didn't point at the real cause. I learned to read the actual SDK
interfaces in `node_modules/ai/dist` rather than trusting the error message to tell me
what changed.

A second hard moment: the Node.js 22 requirement for CI. Vitest uses jsdom, which uses
undici for fetch. Undici v6 uses `webidl.util.markAsUncloneable`, which wasn't added
until Node 20.13 / Node 22. On Node 20.0–20.12, the test suite hung silently — no
error, no timeout, no output. Tracing that through three layers of transitive dependencies
took about an hour.

### What I would do differently

**Lock exact SDK versions from day one.** Using `"^7.x.x"` instead of `"7.0.0"` meant
the SDK could silently change between `npm install` runs. For a production codebase I'd
pin everything and only upgrade deliberately.

**Write tests before writing the component, not after.** The Vitest suite was retrofitted
onto existing components. That meant going back to add `data-testid` attributes to
elements I'd already built, and realizing mid-test that some components had side effects
that made them hard to isolate. Starting with a failing test and writing the component to
pass it would have produced cleaner, more testable code from the start.

**Put the GLSL shader in its own route.** It's the most visually interesting part of the
project and the hardest for a new contributor to understand. Burying it in the root layout
means anyone reading the code encounters WebGL before they encounter the AI feature that
the project is actually about.

### One thing that surprised me

How much the accessibility fixes changed the feel of the app — not for screen reader
users, but in the browser. Adding `role="log"` to the chat container, `role="alert"` to
the error panel, and `role="status"` to the thinking indicator forced me to think about
the *sequence* of UI states rather than just the final rendered appearance. The error
panel with `role="alert"` had to exist in the DOM from load (hidden, not absent) so the
alert announcement fires on state change rather than element insertion. That structural
constraint made the error handling code cleaner, not just more accessible. I expected
accessibility to be a checklist of attributes. It turned out to be a different way of
thinking about UI state machines.
