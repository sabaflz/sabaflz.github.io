/*
  degree.js: what I've finished and everything the degree (and minor) still asks for.
  At the end of each term, move passed courses into `done`.
  Anything can also be checked off by hand on the page (saved in this browser).
*/
window.PLANNER_DEGREE = {
  // Finished, in progress, or satisfied by De Anza transfer credit.
  // Fall 2026 courses are listed so later prereqs unlock; remove one if it doesn't pass.
  done: [
    "CS 61A", "CS 70", "ASAMST 128AC",          // Berkeley, Fall 2026
    "MATH 1A", "MATH 1B", "MATH 53", "MATH 54"  // De Anza (confirm on your Transfer Credit Report)
  ],

  // Checklist. A row is met when `need` distinct courses from `any` are done or planned.
  checklist: [
    { id: "cs61a", group: "CS lower division", name: "CS 61A", any: ["CS 61A"] },
    { id: "cs61b", group: "CS lower division", name: "CS 61B (or 47B route)", any: ["CS 61B", "CS 47B"] },
    { id: "cs61c", group: "CS lower division", name: "CS 61C", any: ["CS 61C", "CS 47C"] },
    { id: "cs70", group: "CS lower division", name: "CS 70", any: ["CS 70"] },
    { id: "calc", group: "CS lower division", name: "Calculus (Math 1A, 1B)", any: ["MATH 1B"] },
    { id: "linalg", group: "CS lower division", name: "Linear algebra (Math 54)", any: ["MATH 54", "MATH 56"] },

    { id: "ac", group: "University", name: "American Cultures", any: ["ASAMST 128AC", "HISTORY 7B"] },
    { id: "ahi-h", group: "University", name: "AH&I: History", any: ["HISTORY 7A", "HISTORY 7B", "CC HIST"] },
    { id: "ahi-i", group: "University", name: "AH&I: Institutions", any: ["POLSCI 1", "CC POLI"] },

    { id: "cog-core", group: "CogSci minor (summer)", name: "Core: CogSci C100 / Psych C120", minor: "cogsci-core", need: 1 },
    { id: "cog-topic", group: "CogSci minor (summer)", name: "Topical courses", minor: "cogsci-topic", need: 4 }
  ],

  // Upper-division structure (Fall 2022+ admits): 4 design + 8 CS + 8 CS/EE/EECS + 4 non-CS tech elective.
  // Every course must be 3+ units and letter-graded; the tech elective must total 4+ units.
  upperDiv: [
    { key: "design", name: "Design course", units: 4 },
    { key: "cs", name: "Upper-div CS", units: 8 },
    { key: "cseecs", name: "Upper-div CS/EE/EECS", units: 8 },
    { key: "te", name: "Non-CS technical elective", units: 4 }
  ],

  // Things to do that aren't courses. Check them off on the page.
  todos: [
    { id: "t-47b", text: "[removed]" },
    { id: "t-tcr", text: "[removed]" },
    { id: "t-61c", text: "[removed]" },
    { id: "t-ahi", text: "[removed]" },
    { id: "t-cc", text: "[removed]" },
    { id: "t-cog", text: "[removed]" },
    { id: "t-aid", text: "[removed]" },
    { id: "t-5th", text: "[removed]" },
    { id: "t-c8", text: "[removed]" }
  ],

  heavy: ["EECS 151", "CS 152", "CS 162", "CS 164", "CS 169A", "CS 169L", "CS 170", "CS 184", "CS 189"],
  minUnits: 12,
  phase1Cap: 13.5,
  maxUnits: 17.5
};
