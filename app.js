const STORAGE_KEY = 'notes';
const SETTINGS_KEY = 'noteAppSettings';

const noteInput = document.getElementById('noteInput');
const addNoteBtn = document.getElementById('addNoteBtn');
const notesList = document.getElementById('notesList');
const emptyState = document.getElementById('emptyState');
const notesView = document.getElementById('notesView');
const settingsView = document.getElementById('settingsView');
const settingsBtn = document.getElementById('settingsBtn');
const backBtn = document.getElementById('backBtn');
const darkModeToggle = document.getElementById('darkModeToggle');
const sortOrderSelect = document.getElementById('sortOrderSelect');
const clearNotesBtn = document.getElementById('clearNotesBtn');

const defaultSettings = {
  darkMode: false,
  sortOrder: 'newest',
};

const loadSettings = () => {
  const storedSettings = localStorage.getItem(SETTINGS_KEY);
  return storedSettings
    ? { ...defaultSettings, ...JSON.parse(storedSettings) }
    : { ...defaultSettings };
};

let settings = loadSettings();

const saveSettings = () => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

const loadNotes = () => {
  const storedNotes = localStorage.getItem(STORAGE_KEY);
  return storedNotes ? JSON.parse(storedNotes) : [];
};

let notes = loadNotes();

const saveNotes = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
};

const formatDate = (isoDate) => {
  return new Date(isoDate).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const createNoteId = () => {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};

const getSortedNotes = () => {
  const sorted = [...notes];
  if (settings.sortOrder === 'oldest') {
    sorted.reverse();
  }
  return sorted;
};

const toggleEmptyState = () => {
  emptyState.classList.toggle('notes__empty--hidden', notes.length > 0);
};

const createNoteElement = (note) => {
  const listItem = document.createElement('li');
  listItem.className = 'note-card';
  listItem.dataset.id = note.id;

  listItem.innerHTML = `
    <p class="note-card__content"></p>
    <p class="note-card__meta"></p>
    <div class="note-card__actions">
      <button type="button" class="btn btn--danger" data-action="delete">Delete</button>
    </div>
  `;

  listItem.querySelector('.note-card__content').textContent = note.content;
  listItem.querySelector('.note-card__meta').textContent = formatDate(note.createdAt);

  return listItem;
};

const renderNotes = () => {
  notesList.innerHTML = '';
  getSortedNotes().forEach((note) => {
    notesList.appendChild(createNoteElement(note));
  });
  toggleEmptyState();
};

const addNote = () => {
  const content = noteInput.value.trim();
  if (!content) {
    noteInput.focus();
    return;
  }

  notes.unshift({
    id: createNoteId(),
    content,
    createdAt: new Date().toISOString(),
  });

  saveNotes();
  renderNotes();
  noteInput.value = '';
  noteInput.focus();
};

const deleteNote = (noteId) => {
  notes = notes.filter((note) => note.id !== noteId);
  saveNotes();
  renderNotes();
};

const handleNotesListClick = (event) => {
  const deleteButton = event.target.closest('[data-action="delete"]');
  if (!deleteButton) return;

  const noteCard = deleteButton.closest('.note-card');
  if (!noteCard) return;

  deleteNote(noteCard.dataset.id);
};

const applyTheme = () => {
  document.body.classList.toggle('theme--dark', settings.darkMode);
};

const syncSettingsForm = () => {
  darkModeToggle.checked = settings.darkMode;
  sortOrderSelect.value = settings.sortOrder;
};

const showView = (viewName) => {
  const isSettings = viewName === 'settings';
  notesView.classList.toggle('view--hidden', isSettings);
  settingsView.classList.toggle('view--hidden', !isSettings);
};

const clearAllNotes = () => {
  const confirmed = window.confirm(
    'Delete all notes? This cannot be undone.'
  );
  if (!confirmed) return;

  notes = [];
  saveNotes();
  renderNotes();
};

const handleDarkModeChange = () => {
  settings.darkMode = darkModeToggle.checked;
  saveSettings();
  applyTheme();
};

const handleSortOrderChange = () => {
  settings.sortOrder = sortOrderSelect.value;
  saveSettings();
  renderNotes();
};

addNoteBtn.addEventListener('click', addNote);

noteInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
    event.preventDefault();
    addNote();
  }
});

notesList.addEventListener('click', handleNotesListClick);
settingsBtn.addEventListener('click', () => showView('settings'));
backBtn.addEventListener('click', () => showView('notes'));
darkModeToggle.addEventListener('change', handleDarkModeChange);
sortOrderSelect.addEventListener('change', handleSortOrderChange);
clearNotesBtn.addEventListener('click', clearAllNotes);

applyTheme();
syncSettingsForm();
renderNotes();
