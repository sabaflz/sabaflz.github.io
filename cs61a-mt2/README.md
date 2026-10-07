# CS 61A Midterm 2 Practice

A CBTF-style practice environment. Real Python runs in the browser (via Pyodide),
so you type a solution, run it, and submit for an all-or-nothing grade against
hidden tests, exactly like PrairieLearn. Your code, attempt counts, and the timer
are saved in your browser.

## What's inside
- `index.html`, `styles.css`, `app.js` the app
- `problems.js` all 33 problems (statements, starter code, tests, reference solutions)
- `.nojekyll` tells GitHub Pages to serve the files as-is

## Run it locally
Open a terminal in this folder and start any static server, for example:

    python3 -m http.server 8000

then visit http://localhost:8000. (Opening index.html directly with a file://
path will not work, because Pyodide needs http.)

## Deploy on GitHub Pages
Put this whole `cs61a-mt2` folder in your `sabaflz.github.io` repo, commit, and push.
It goes live at https://sabaflz.github.io/cs61a-mt2/ within a minute or so.

## Features
- Run: executes your code and checks the visible doctests
- Submit: grades all-or-nothing against the full hidden test set and counts the attempt
- 50-minute timer (optional), submission counter, saved code
- Reference solution unlocks after 3 submissions per problem
- Every problem links to the official exam and solution PDF

## Adding or editing problems
All problems live in `problems.js` as one array. Each entry has: `id`, `title`,
`cat` (Recursion / Lists & Dicts / Linked Lists), `source`, `exam`, `sol`, `desc`,
`setup` (helper code), `starter`, `solution`, and `tests` (Python asserts). The
grader runs `GLOBAL_SETUP + setup + yourCode + tests`; if no assert fails, it is
correct. The `Link` class, `make_link`, and `to_list` are always available.

## Updating Pyodide
The version is pinned in `index.html` (`v0.26.4`). If a future version is needed,
change that one URL.
