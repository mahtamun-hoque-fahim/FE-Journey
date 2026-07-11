# WORKFLOW.md — AI-Assisted Workflow Drill (FE-03)

## What I Built
A user Settings form with Display Name, Email, and Theme (light/dark) fields,
with submit-only validation and localStorage persistence — added to an existing
vanilla JS note-taking app. Built twice: once with a vague prompt, once with a
precise prompt.

## Branch Comparison

### feat/settings-vague
Prompt used: `"Add a settings page to this note app."`

Cursor generated a settings panel with three sections: Appearance (dark mode
toggle), Notes (sort order dropdown), and Data (clear all notes button). The UI
looked reasonable and matched the card style. However:
- No form fields for user data (name, email)
- Zero validation logic
- No localStorage persistence for settings
- Dark mode toggle was wired but the CSS variables didn't exist, so it had no
  visible effect
- The AI guessed what "settings" meant rather than asking or following a spec

### feat/settings-precise
Prompt used: detailed spec with file references, field list, constraint list,
example behaviors, and a verification checklist. Plan mode was used first.

The output matched the spec exactly:
- Display Name field with required + min-length validation
- Email field with required + regex validation
- Errors shown inline in red, only on submit (not on keystroke)
- Green "Settings saved!" confirmation auto-hides after 3 seconds
- Data saved to localStorage under `user-settings`
- Theme toggle applies `data-theme` to `<html>`, CSS variables handle the rest
- Form pre-fills from localStorage on re-open
- 10-case manual test checklist written as a comment block in app.js

## Key Diffs
| Concern | vague | precise |
|---|---|---|
| Correct fields | No | Yes |
| Validation | None | Full (required, minlength, regex) |
| localStorage | No | Yes (`user-settings`) |
| Dark mode works | No | Yes (CSS variables) |
| Test coverage | None | 10 manual cases documented |
| Review effort | High (needs full rewrite) | Low (minor style tweaks only) |

## AI Mistake I Caught
In the vague version, the AI wired a dark mode toggle in JavaScript but the
existing `style.css` had no CSS variables — all colors were hardcoded. So the
toggle set a `data-theme` attribute on `<html>` that nothing responded to. The
UI showed no change at all. The AI confidently generated broken behavior without
flagging the missing CSS foundation.

## What I Learned
1. A vague prompt gets you a plausible-looking UI, not a correct one.
2. Specifying example behaviors ("empty form → show this exact error message")
   removes all ambiguity and the AI has nothing to guess.
3. Plan mode is genuinely useful — reviewing the plan before building caught the
   scope early and avoided wasted iterations.
4. Agent mode on Cursor's free tier burns through quota fast (5–10 requests per
   session). Hitting the limit mid-task forced a switch to Claude.ai to generate
   the code — which worked fine. The tool matters less than the prompt quality.