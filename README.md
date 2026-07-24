# Flavorly

A recipe discovery app built with Next.js 16, powered by TheMealDB API. This is the capstone project for the FlyRank.ai Frontend AI Engineering internship.

## Current status

Capstone skeleton (routing, layout, design tokens, health-check) is scaffolded and deployable. Full data wiring, favorites persistence, and auth land in later assignments.

## Routes

| Route | Purpose |
|---|---|
| `/` | Home, featured recipes |
| `/search` | Search and filter recipes |
| `/recipe/[id]` | Recipe detail |
| `/favorites` | Saved recipes (placeholder, auth pending) |
| `/health` | Health-check page, confirms live TheMealDB fetch |

## Tech stack

- Next.js 16 (App Router, Turbopack)
- TypeScript
- Tailwind CSS v4
- TheMealDB API (free, no key required)

## Getting started

```bash
git clone https://github.com/mahtamun-hoque-fahim/FE-Journey.git
cd FE-Journey
npm install
npm run dev
```

Open `http://localhost:3000`.

## Project history

This repo also contains earlier internship assignments on separate branches:

- `feat/settings-vague`, `feat/settings-precise` — AI-assisted workflow drill (vague vs. precise prompting comparison)
- `feat/recipe-app-v1` — original Vite/React recipe finder prototype, superseded by this Next.js build

## License

This project is licensed under the [MIT License](LICENSE).
