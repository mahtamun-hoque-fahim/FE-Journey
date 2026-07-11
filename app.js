/*
 * MANUAL TEST CHECKLIST — Settings Form Validation
 * =================================================
 * Run through each case after opening index.html in browser:
 *
 * [ ] 1. Open settings (gear icon) → form is empty on first visit
 * [ ] 2. Click "Save Settings" with empty form
 *        → "Name is required" AND "Email is required" both appear in red
 * [ ] 3. Enter name = "A" (1 char), valid email → "Name must be at least 2 characters"
 * [ ] 4. Enter name = "Ab" (2 chars), empty email → "Email is required"
 * [ ] 5. Enter name = "Ab", email = "ab" → "Enter a valid email address"
 * [ ] 6. Enter name = "Ab", email = "ab@" → "Enter a valid email address"
 * [ ] 7. Enter name = "Fahim", email = "fahim@test.com", theme = Light
 *        → Green "Settings saved!" appears, data in localStorage under "user-settings"
 * [ ] 8. Toggle theme to Dark, save → page switches to dark mode immediately
 * [ ] 9. Reload page → form pre-fills with saved name/email, theme re-applies
 * [ ] 10. Switch back to Light, save → page returns to light mode
 */

/* ── Constants ── */
const STORAGE_KEY = 'notes';
const SETTINGS_KEY = 'user-settings';

/* ── Notes DOM refs ── */
const noteInput   = document.getElementById('noteInput');
const addNoteBtn  = document.getElementById('addNoteBtn');
const notesList   = document.getElementById('notesList');
const emptyState  = document.getElementById('emptyState');

/* ── Settings DOM refs ── */
const settingsToggleBtn = document.getElementById('settingsToggleBtn');
const settingsBackBtn   = document.getElementById('settingsBackBtn');
const notesView         = document.getElementById('notesView');
const settingsView      = document.getElementById('settingsView');
const settingsForm      = document.getElementById('settingsForm');
const displayNameInput  = document.getElementById('displayName');
const emailInput        = document.getElementById('emailInput');
const displayNameError  = document.getElementById('displayNameError');
const emailError        = document.getElementById('emailError');
const settingsSuccess   = document.getElementById('settingsSuccess');

/* ── Notes logic ── */
const loadNotes = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

let notes = loadNotes();

const saveNotes = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));

const formatDate = (isoDate) =>
  new Date(isoDate).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

const createNoteId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const toggleEmptyState = () =>
  emptyState.classList.toggle('notes__empty--hidden', notes.length > 0);

const createNoteElement = (note) => {
  const li = document.createElement('li');
  li.className = 'note-card';
  li.dataset.id = note.id;
  li.innerHTML = `
    <p class="note-card__content"></p>
    <p class="note-card__meta"></p>
    <div class="note-card__actions">
      <button type="button" class="btn btn--danger" data-action="delete">Delete</button>
    </div>`;
  li.querySelector('.note-card__content').textContent = note.content;
  li.querySelector('.note-card__meta').textContent = formatDate(note.createdAt);
  return li;
};

const renderNotes = () => {
  notesList.innerHTML = '';
  notes.forEach((note) => notesList.appendChild(createNoteElement(note)));
  toggleEmptyState();
};

const addNote = () => {
  const content = noteInput.value.trim();
  if (!content) { noteInput.focus(); return; }
  notes.unshift({ id: createNoteId(), content, createdAt: new Date().toISOString() });
  saveNotes();
  renderNotes();
  noteInput.value = '';
  noteInput.focus();
};

const deleteNote = (noteId) => {
  notes = notes.filter((n) => n.id !== noteId);
  saveNotes();
  renderNotes();
};

const handleNotesListClick = (event) => {
  const btn = event.target.closest('[data-action="delete"]');
  if (!btn) return;
  const card = btn.closest('.note-card');
  if (card) deleteNote(card.dataset.id);
};

/* ── Settings: theme ── */
const applyTheme = (theme) => {
  document.documentElement.dataset.theme = theme;
};

/* ── Settings: load & prefill ── */
const loadSettings = () => {
  const stored = localStorage.getItem(SETTINGS_KEY);
  return stored ? JSON.parse(stored) : null;
};

const prefillSettingsForm = () => {
  const settings = loadSettings();
  if (!settings) return;
  displayNameInput.value = settings.displayName || '';
  emailInput.value = settings.email || '';
  const themeRadio = settingsForm.querySelector(`input[name="theme"][value="${settings.theme || 'light'}"]`);
  if (themeRadio) themeRadio.checked = true;
};

/* ── Settings: validation helpers ── */
const showError = (el, msg) => {
  el.textContent = msg;
  el.classList.remove('form__error--hidden');
};

const clearErrors = () => {
  [displayNameError, emailError].forEach((el) => {
    el.textContent = '';
    el.classList.add('form__error--hidden');
  });
  settingsSuccess.classList.add('form__success--hidden');
};

const validateDisplayName = (value) => {
  if (!value) return 'Name is required';
  if (value.length < 2) return 'Name must be at least 2 characters';
  return null;
};

const validateEmail = (value) => {
  if (!value) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address';
  return null;
};

/* ── Settings: form submit ── */
const handleSettingsSubmit = (event) => {
  event.preventDefault();
  clearErrors();

  const displayName = displayNameInput.value.trim();
  const email = emailInput.value.trim();
  const theme = settingsForm.querySelector('input[name="theme"]:checked').value;

  const nameErr  = validateDisplayName(displayName);
  const emailErr = validateEmail(email);

  if (nameErr)  showError(displayNameError, nameErr);
  if (emailErr) showError(emailError, emailErr);
  if (nameErr || emailErr) return;

  localStorage.setItem(SETTINGS_KEY, JSON.stringify({ displayName, email, theme }));
  applyTheme(theme);

  settingsSuccess.classList.remove('form__success--hidden');
  setTimeout(() => settingsSuccess.classList.add('form__success--hidden'), 3000);
};

/* ── View switching ── */
const showSettings = () => {
  notesView.classList.add('view--hidden');
  settingsView.classList.remove('view--hidden');
  prefillSettingsForm();
};

const showNotes = () => {
  settingsView.classList.add('view--hidden');
  notesView.classList.remove('view--hidden');
};

/* ── Event listeners ── */
addNoteBtn.addEventListener('click', addNote);

noteInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); addNote(); }
});

notesList.addEventListener('click', handleNotesListClick);
settingsToggleBtn.addEventListener('click', showSettings);
settingsBackBtn.addEventListener('click', showNotes);
settingsForm.addEventListener('submit', handleSettingsSubmit);

/* ── Init ── */
const init = () => {
  const settings = loadSettings();
  applyTheme(settings?.theme || 'light');
  renderNotes();
};

init();