# CS 70 lesson files

One file per topic: `lessons/<topic id>.js`, where the id matches `course.js`.
Each file sets `window.LESSONS["<id>"] = { ... }` and is listed in `index.html`.
`induction.js` is the model to copy.

## Shape

```js
window.LESSONS["<id>"] = {
  minutes: 20,                 // planned minutes for the lesson steps (about 1.2 min per step)
  boards: {                    // named lists of lines shown on the dark board, numbered from 1
    name: ["line 1", "line 2"] // math written in Unicode: ∀ ∃ ∈ ℕ ℤ ⟹ ⟺ ≡ ≤ ≥ ≠ ¬ ∧ ∨ Σ ∏ ⌊ ⌋ ² ³ ⁿ ₁ √ ∞ ℙ 𝔼 …
  },
  steps: [                     // 12 to 18 steps
    { board: "name",           // which board to show
      hl: [1, 2],              // board lines to highlight
      say: "…",                // the teaching text, 2 to 5 sentences, written to be read aloud
      basics: "…",             // optional: notation help, shown only to first-timers
      tip: "…",                // optional: exam tip, hidden for "reviewing" level
      facts: [["k", "v"]],     // optional side panel: key facts so far (factsTitle to rename)
      table: { name, cols: [], rows: [[]] },   // optional side panel table
      tree: ["ascii", "lines"],                // optional side panel picture (monospace)
      ask: { … }               // optional question; the learner must answer to continue
    }
  ],
  check: [ … ],                // 6 to 8 quick questions
  deepen: [ … ]                // 3 exam-style problems
};
```

Questions (`ask` and `check`):
- `{ type: "mc", q, choices: [..], answer: <index>, why, board? }`
- `{ type: "type", q, answer: "<string>", accept: ["other forms"], why, board? }`
  Typed answers ignore case, spaces, quotes and `*`. Numbers also match by value,
  so "0.5" matches ".5". Prefer answers that are a single number or a short word.
  `board` (check only) is a list of lines shown above the question.

Deepen problems:
```js
{ id: "<topic>_<short>",       // unique, never change once published
  title, source,               // source: "Original question" or "In the style of Discussion 4, problem 2"
  desc: ["paragraph", "…"],
  board: [..],                 // optional lines shown with the problem
  hints: ["…", "…", "…"],      // 2 to 3, each giving a bit more
  solution: ["line", "…"],     // a complete worked solution, one step per line
  answer: "…", accept: [..], answerLabel: "…",   // optional final answer, auto-checked
  explain: "…" }               // the takeaway in one or two sentences
```

## Rules
- Teach from the course notes and slides, in your own words. Don't paste paragraphs,
  and never copy official homework or discussion solutions: those problems are already
  linked in the Practice stage from `course.js`.
- Deepen problems are original, or clearly varied from a classic. Every number must be
  checked; work each problem fully before writing the solution.
- Plain, direct sentences. No em dashes. Say "you".
- Run the validator after editing: `node tools/check-lessons.js` from this folder.
