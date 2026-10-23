# CS 61A Midterm 3 Practice

A practice environment for Midterm 3 (Tue 10/27, 8-10pm, 110 min, on paper).
Real Python runs in the browser via Pyodide, so you type a solution, run it, and
submit for an all-or-nothing grade against hidden tests. Your code, attempt
counts, and the timer are saved in your browser.

## What's inside
- `index.html`, `styles.css`, `app.js` the app
- `pyworker.js` runs Python in a Web Worker so an infinite loop times out instead of freezing the page
- `problems.js` 49 problems, all verified against a reference solution
- `.nojekyll` tells GitHub Pages to serve the files as-is

## Topics (49 problems)
- **Trees** (6) label/branches, is_leaf, build-new-tree, path reasoning, only_paths
- **Generators** (4) yield, yield from, recursive generators over sequences and trees
- **Mutation & Iterators** (3) in-place list mutation, dict building, next/iter
- **OOP** (3) classes, __init__, inheritance, super(), stateful objects, memoization
- **Recursion** (11), **Lists & Dicts** (13), **Linked Lists** (9) carried over from MT2

## Scope notes
Built for the FA26 MT3 scope: everything through Lecture 24 (Efficiency). It
deliberately avoids the topics staff excluded: orders of growth, linked-list
mutation, tree mutation, repr strings, and special method names
(`__add__`, `__iter__`, etc.).

## Run locally
    python3 -m http.server 8000
then open http://localhost:8000 (opening index.html via file:// will not work; Pyodide needs http).

## Deploy on GitHub Pages
Put this `cs61a-mt3` folder in your `sabaflz.github.io` repo, commit, and push.
It goes live at https://sabaflz.github.io/cs61a-mt3/.

## Features
- Run: executes your code and checks the visible doctests
- Submit: grades all-or-nothing against the full hidden test set and counts the attempt
- 110-minute timer, submission counter, saved code, reference solution after 3 submissions
- Separate saved progress from the MT2 app (different storage key), so both can coexist

## Adding or editing problems
All problems live in `problems.js`. Each has id, title, cat, source, exam, sol,
desc, setup (helper code), starter, solution, and tests (Python asserts). The
grader runs GLOBAL_SETUP + setup + your code + tests; if no assert fails, it is
correct. `Link`, `Tree`, `make_link`, `to_list`, and `is_leaf` are always available.
