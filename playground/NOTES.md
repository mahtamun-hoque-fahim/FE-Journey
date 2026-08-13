# NOTES.md — playground vs shadcn/ui

Comparing the hand-rolled Modal, Tabs, and Disclosure in this folder against shadcn's `dialog` and `tabs` (installed by pulling the component source directly from the shadcn-ui GitHub repo and wiring it up by hand — the CLI's `init` couldn't reach `ui.shadcn.com` from this environment, so `lib/utils.ts`, `radix-ui`, `class-variance-authority`, `clsx`, and `tailwind-merge` were added manually instead).

## Gap 1: shadcn's components contain almost no accessibility logic — Radix does it

Reading `components/ui/tabs.tsx`, there's no `ArrowRight`/`ArrowLeft`/`Home`/`End` handling anywhere, no roving-tabindex code, nothing. My `playground/tabs.tsx` hand-writes about 15 lines for exactly that (the `handleKeyDown` function plus `tabIndex={activeIndex === index ? 0 : -1}`). shadcn's `Tabs`/`TabsList`/`TabsTrigger` are just `TabsPrimitive` from `radix-ui` with Tailwind classes attached via `data-slot`. All the keyboard behavior lives inside Radix, invisible in the "generated source." Same story for `Dialog`: my `playground/modal.tsx` manually queries focusable elements and traps `Tab` in a keydown handler; shadcn's `DialogContent` is just `DialogPrimitive.Content` styled — the trap is Radix's, not shadcn's.

## Gap 2: Radix's Dialog locks body scroll and hides the background from assistive tech — mine doesn't

My modal blocks the backdrop click and traps focus, but the page behind it can still be scrolled (wheel or touch) while it's open, and nothing marks the rest of the page `aria-hidden` for screen readers. Radix's `Dialog.Root` does both automatically. Matching it would mean toggling `document.body.style.overflow` on open/close and wiring `aria-hidden` onto sibling content myself.

## Gap 3: shadcn gives every interactive element a deliberate focus-visible ring — mine relies on the browser default

`buttonVariants` and `TabsTrigger` both carry `focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1` as a base class, applied consistently through one shared `cva` definition. My modal's close button and tab triggers have hover states but no explicit `focus-visible:` styling at all — keyboard-only users get whatever the browser ships by default, not something I actually chose. Same gap we caught and fixed on the assistant page's buttons in FE-06 — shadcn just enforces it structurally instead of relying on remembering to add it per component.

## Note on integration

These files typecheck and build, but they're not wired into any page. shadcn's classes reference tokens this project doesn't define (`--primary`, `--secondary`, `--destructive`, `--ring`, `--input`), so rendering `<Dialog>` or `<Tabs>` for real would need Flavorly's actual palette (`--accent`, `--surface`, `--border`) mapped onto shadcn's token names first. Out of scope here — the goal was reading the source, not shipping it.
