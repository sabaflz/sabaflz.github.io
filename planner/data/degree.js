/*
  degree.js: what I've finished and what the CS BA (CDSS) still asks for.
  Update `done` at the end of each semester. Course ids must match the ids
  used in the term files (e.g. "CS 61B", "POLSCI 1").
*/
window.PLANNER_DEGREE = {
  // Finished, in progress, or satisfied by De Anza transfer credit.
  // Fall 2026 courses are listed so Spring prereqs unlock; remove one if it doesn't pass.
  done: [
    "CS 61A", "CS 70", "ASAMST 128AC",          // Berkeley, Fall 2026
    "MATH 1A", "MATH 1B", "MATH 53", "MATH 54"  // De Anza (confirm on your Transfer Credit Report)
  ],

  // Requirement checklist. `any` = any one of these courses satisfies it.
  checklist: [
    { group: "Lower division", name: "CS 61A", any: ["CS 61A"] },
    { group: "Lower division", name: "CS 61B", any: ["CS 61B", "CS 47B"] },
    { group: "Lower division", name: "CS 61C", any: ["CS 61C", "CS 47C"] },
    { group: "Lower division", name: "CS 70", any: ["CS 70"] },
    { group: "Lower division", name: "Calculus (Math 1A, 1B)", any: ["MATH 1B"] },
    { group: "Lower division", name: "Linear algebra (Math 54)", any: ["MATH 54", "MATH 56"] },
    { group: "University", name: "American Cultures", any: ["ASAMST 128AC", "HISTORY 7B"] },
    { group: "University", name: "AH&I: History", any: ["HISTORY 7A", "HISTORY 7B"] },
    { group: "University", name: "AH&I: Institutions", any: ["POLSCI 1"] }
  ],

  // Upper-division structure (Fall 2022+ admits): 4 design + 8 CS + 8 CS/EE/EECS + 4 non-CS tech elective.
  upperDiv: [
    { key: "design", name: "Design course", units: 4 },
    { key: "cs", name: "Upper-div CS", units: 8 },
    { key: "cseecs", name: "Upper-div CS/EE/EECS", units: 8 },
    { key: "te", name: "Non-CS technical elective", units: 4 }
  ],

  // Courses the EECS page says not to stack in one semester.
  heavy: ["EECS 151", "CS 152", "CS 162", "CS 164", "CS 169A", "CS 169L", "CS 170", "CS 184", "CS 189"],

  minUnits: 12,          // CDSS minimum per semester
  phase1Cap: 13.5,       // continuing undergrads, Phase 1
  maxUnits: 17.5         // Phase 2 cap
};
