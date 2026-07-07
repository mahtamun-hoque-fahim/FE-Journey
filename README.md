# My Note App

A lightweight, browser-based note-taking app built with vanilla HTML, CSS, and JavaScript. Notes are saved locally in your browser using `localStorage` — no backend or account required.

Built as part of an internship project at [FlyRank.ai](https://flyrank.ai).

## Features

- Add notes from a simple textarea form
- Delete notes individually
- Automatic persistence with `localStorage`
- Responsive, card-based UI
- Keyboard shortcut: `Ctrl+Enter` / `Cmd+Enter` to add a note

## Tech Stack

| Layer       | Technology              |
|-------------|-------------------------|
| Markup      | HTML5                   |
| Styling     | CSS3                    |
| Logic       | Vanilla JavaScript (ES6+) |
| Persistence | Browser `localStorage`  |

No frameworks or build tools — open the files and run.

## Project Structure

```
my-note-app/
├── index.html   # App layout and markup
├── style.css    # Component-based styles
├── app.js       # Note logic and event handling
└── README.md    # Project documentation
```

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, or Edge)
- [Git](https://git-scm.com/) (optional, for cloning)
- [Node.js](https://nodejs.org/) (optional, only if using `npx serve`)

### Run locally

1. Clone the repository:

```bash
git clone https://github.com/mahtamun-hoque-fahim/FE-my-note-app.git
cd FE-my-note-app
```

2. Open `index.html` in your browser, or serve the folder with a local server:

```bash
npx serve .
```

3. Type a note and click **Add Note**. Your notes are saved automatically and will still be there when you reload the page.

## Usage

| Action    | How                                      |
|-----------|------------------------------------------|
| Add note  | Enter text and click **Add Note**        |
| Quick add | Press `Ctrl+Enter` (Windows) or `Cmd+Enter` (Mac) |
| Delete    | Click **Delete** on any note card        |

## License

This project is licensed under the [MIT License](LICENSE).
