# Case Study Playbook

**Portfolio:** mahtamundesigns.com  
**Case study location:** `/clients/[slug]` — dynamic pages driven by the admin dashboard (Next.js 16, Neon/Drizzle, Cloudinary, Better Auth)

---

## How to add the next case (concrete steps)

1. Log into `mahtamundesigns.com/admin` with the Better Auth session
2. Navigate to **Clients** — click **Add Project**, fill in: slug, title, cover image (Cloudinary upload)
3. Write the three-beat body — no more, no less:
   - **Problem** — one sentence: what was broken, missing, or needed before this project existed?
   - **What I did** — two or three sentences: the approach, the key stack choices, the hardest constraint solved
   - **What came of it** — one sentence: the outcome, the metric, or the live URL
4. Add tags, set visibility to **Published**, hit Save
5. The `/clients/[slug]` page is live immediately via server-rendered dynamic routing — no redeploy needed

Total time per case: roughly 20 minutes with notes already in hand.  
With the Claude Project that already holds the voice, stack, and identity kit, the copy step is a single prompt — not a rebuild.

---

## Next piece to add

**Blacksmith** — AI-powered Android Studio Kotlin project generator SaaS

> **Problem:** Bootstrapping a new Android Studio project means 30+ minutes of boilerplate — manifest wiring, Gradle config, dependency declarations, base architecture files — before a single line of real app logic gets written.
>
> **What I did:** Built Blacksmith: a Next.js 16 SaaS where Gemini 2.0 Flash generates the full Kotlin project tree server-side via Server Actions, JSZip packages it into a downloadable `.zip`, and Lemon Squeezy handles billing. Auth via Better Auth, per-user rate limiting via Upstash Redis, project schema in Neon/Drizzle. Full POST-BUILD pipeline complete — Waterborne, Motion Hive, Airborne, Sentinel all passed.
>
> **What came of it:** Pre-launch. Smoke testing and payment config are the only remaining gates. The generator produces a ready-to-open Android Studio project in under 10 seconds.

---

## Reminder set

GitHub Issue opened in this repo: **"Add Blacksmith case study to mahtamundesigns after launch"**  
See: [Issues tab](https://github.com/mahtamun-hoque-fahim/FE-Journey/issues)

The issue carries the full three-beat draft above so the actual add step is a copy-paste, not a memory exercise.

---

## Claude Project preserved

This project's Claude conversation holds:

- Voice and tone (direct, no filler, lucide-react only, no emojis)
- Full stack defaults (Next.js 16, Tailwind v4, Neon/Drizzle, Better Auth, Vercel + Cloudflare)
- Identity kit (brand: Mahtamun, palette, font choices per project)
- The Citadel pipeline sequence (Singularity → Council → Waterborne → Motion Hive → Airborne → Sentinel → …)

The next case study is a short conversation, not a rebuild.
