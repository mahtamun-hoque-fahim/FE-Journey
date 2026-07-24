# Project: Flavorly (Recipe Capstone)

## Stack
- Next.js 16 (App Router, Turbopack)
- TypeScript
- Tailwind CSS v4 (design tokens in app/globals.css)
- TheMealDB API (free, no key required)
- Deployed on Vercel

## Conventions
- Server Components by default; add "use client" only where interactivity
  is required (forms, local state, event handlers)
- Async params/searchParams/cookies/headers — always await them (Next.js 16
  requirement, not optional)
- Use design tokens (bg-background, bg-surface, text-muted, bg-accent, etc.)
  from globals.css — never hardcode hex colors or text-black/text-white
  directly in components
- Commit messages: Conventional Commits (feat:, fix:, docs:, chore:,
  refactor:, etc.)
- File structure:
  - app/ — routes (App Router, no src directory)
  - components/ — shared UI (NavBar, BottomGlow, etc.)
  - CLAUDE.md — kept current with every stack or convention change, not
    left describing a retired version of the app

## Rules Learned from FE-03 (AI Workflow Drill)

1. **Always use plan mode for multi-file changes.** Review the plan before
   approving the build. Catches scope creep and wrong assumptions early.

2. **Specify validation behavior with exact examples in the prompt.** Saying
   "validate the form" is not enough. Write "empty name → show Name is
   required" so the AI has no room to guess.

3. **Check that CSS foundations exist before asking AI to wire JS behavior.**
   The vague prompt generated a dark mode toggle that did nothing because the
   CSS variables it depended on didn't exist yet.

4. **Agent mode is expensive — scope your prompts tightly.** Each multi-file
   Agent session costs 5–10 premium requests. One precise prompt beats three
   vague correction rounds both for quality and quota.

## Rules Learned from FE-04 (Capstone Skeleton)

5. **Verify against the real reference before styling.** Don't guess a color
   palette or interaction pattern — read the actual source/CSS of the app
   being extended before writing new UI.

6. **Match placeholder scope to the actual brief.** FE-04 asks for
   placeholder screens, not working features. A static skeleton with real
   data only on the required health-check page is correct — building live
   fetches everywhere else is unnecessary scope creep for this stage.
