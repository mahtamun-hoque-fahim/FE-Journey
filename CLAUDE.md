# Project: Note Taking App

## Stack
- Vanilla HTML, CSS, JavaScript
- No frameworks (keeping it simple)
- localStorage for data persistence

## Conventions
- Use camelCase for variable and function names
- Keep functions under 30 lines
- Use semantic HTML5 elements (header, main, section, etc.)
- Comment complex logic
- Commit messages: Conventional Commits (feat:, fix:, docs:, chore:, refactor:, etc.)
- Organize CSS by component/module
- Use ES6+ syntax (arrow functions, template literals, etc.)
- File structure:
  - index.html
  - style.css
  - app.js (all logic)

## Rules Learned from FE-03 (AI Workflow Drill)

1. **Always use plan mode for multi-file changes.** Review the plan before
   approving the build. Catches scope creep and wrong assumptions early.

2. **Specify validation behavior with exact examples in the prompt.** Saying
   "validate the form" is not enough. Write "empty name → show Name is required"
   so the AI has no room to guess.

3. **Check that CSS foundations exist before asking AI to wire JS behavior.**
   The vague prompt generated a dark mode toggle that did nothing because the
   CSS variables it depended on didn't exist yet.

4. **Agent mode is expensive — scope your prompts tightly.** Each multi-file
   Agent session costs 5–10 premium requests. One precise prompt beats three
   vague correction rounds both for quality and quota.