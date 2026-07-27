# NOTES.md — shadcn Comparison (FE-05)

## How I read shadcn's source
shadcn `init` with the Custom preset didn't scaffold files locally (requires
a preset built at ui.shadcn.com/create first). Read the implementation from
the shadcn/ui GitHub repo and the Base UI docs instead.

---

## Dialog (Modal)

### Gap 1 — Portal rendering
My implementation renders the modal inline in the React tree inside a
`fixed inset-0` div. shadcn wraps its DialogContent in a `<DialogPortal>`
which mounts directly to `document.body` via React's `createPortal`. This
matters in practice: inline rendering can inherit unwanted CSS transforms or
overflow:hidden from ancestor elements, breaking the fixed positioning.
Portal rendering sidesteps this entirely.

### Gap 2 — Background content is not inert
My focus trap uses `querySelectorAll` to cycle Tab between focusable elements
inside the dialog. It prevents keyboard users from leaving, but screen readers
can still navigate to content behind the modal using virtual cursor mode
(arrow keys in NVDA/VoiceOver). shadcn's underlying Radix/Base UI primitive
sets the `inert` attribute on everything outside the dialog when it opens,
making background content completely unreachable to all assistive technology —
not just keyboard Tab order.

### Gap 3 — No enter/exit animation
My modal unmounts immediately (`if (!isOpen) return null`). shadcn uses
`data-[state=open]` and `data-[state=closed]` attributes driven by the
Radix state machine to run CSS animations on both open and close, including
an exit animation before unmounting. My version has no exit animation.

---

## Tabs

### Gap 1 — No manual activation mode
My tabs auto-activate on ArrowKey focus: moving focus with ArrowRight
immediately shows that tab's panel. shadcn (via Radix) supports an
`activationMode="manual"` prop where arrow keys move focus but the panel
doesn't switch until the user presses Enter or Space. The ARIA spec calls
this the "manual" pattern and recommends it when tab panels contain forms
or load data, to avoid triggering expensive operations on every keypress.
My implementation has no equivalent.

### Gap 2 — No orientation support
My ArrowLeft/ArrowRight handler is hardcoded for horizontal tab lists.
shadcn passes an `orientation` prop to Radix which switches the active
arrow keys to ArrowUp/ArrowDown for vertical tab lists and sets
`aria-orientation` on the tablist accordingly. My component would be
broken if rendered vertically.

---

## Summary
The biggest practical gap in both components is that shadcn delegates
ARIA state, keyboard handling, and focus management entirely to a
headless primitive (Radix or Base UI). Building by hand forced me to
understand exactly what those primitives are doing — but it also showed
where my hand-rolled versions fall short: no portal, no inert, no exit
animation, no manual activation mode, no orientation support.