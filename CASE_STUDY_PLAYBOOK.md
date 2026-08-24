# Case Study Playbook

**Portfolio:** mahtamunhoquefahim.vercel.app  
**Case study location:** `/clients/[slug]` — dynamic pages driven by the admin dashboard (Next.js 16, Neon/Drizzle, Cloudinary, Better Auth)

---

## How to add the next case (concrete steps)

1. Log into `mahtamunhoquefahim.vercel.app/admin` with the Better Auth session
2. Navigate to **Clients** — click **Add Project**, fill in: slug, title, cover image (Cloudinary upload)
3. Write the three-beat body — no more, no less:
   - **Problem** — one sentence: what was broken, missing, or needed before this project existed?
   - **What I did** — two or three sentences: the approach, the key stack choices, the hardest constraint solved
   - **What came of it** — one sentence: the outcome, the metric, or the live URL
4. Add tags, set visibility to **Published**, hit Save
5. The `/clients/[slug]` page is live immediately via server-rendered dynamic routing — no redeploy required

With notes already in hand, this takes roughly 20 minutes.  
With the Claude Project that already holds the voice, stack, and identity kit, the copy step is a single prompt — not a rebuild.

---

## Next piece to add

**ImageSmith** — browser-only batch image converter (WebP, AVIF, PNG, JPEG)

> **Problem:** Converting images between formats means installing native tools or uploading to third-party sites that keep your files. There was no fast, private, browser-native option that handled batches without a server.
>
> **What I did:** Built ImageSmith: a fully client-side converter using WebAssembly — files never leave the device. Batch processing runs sequentially via `for...of` (not `Promise.all`) to prevent WASM heap collisions, with a `.slice()` copy before each encode and no manual `free()` call. Shipped v0.2.0 at image-smith-nine.vercel.app with a star rating system, Clash Display font via Fontshare CDN, and a dark `#0A0D15` palette.
>
> **What came of it:** v0.2.0 live. Zero server, zero file uploads, batch-converts any number of images entirely in the browser.

---

## Reminder set

GitHub Issue — "Add ImageSmith case study to mahtamunhoquefahim.vercel.app" — created in this repo as a pinned reminder. Link below.

---

*Claude Project preserved. Stack, voice, and identity kit are intact. The next case is a conversation, not a rebuild.*
