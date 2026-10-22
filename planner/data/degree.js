/*
  degree.js: the requirement structure (public, generic). Your personal data
  (finished courses, plans, check-offs, to-dos) lives in state.json and is edited
  on the page in admin mode.
*/
window.PLANNER_DEGREE = {
  // Checklist. A row is met when `need` distinct courses from `any` are done or planned.
  checklist: [
    { id: "cs61a", group: "CS lower division", name: "CS 61A", any: ["CS 61A"] },
    { id: "cs61b", group: "CS lower division", name: "CS 61B (or 47B route)", any: ["CS 61B", "CS 47B"] },
    { id: "cs61c", group: "CS lower division", name: "CS 61C", any: ["CS 61C", "CS 47C"] },
    { id: "cs70", group: "CS lower division", name: "CS 70", any: ["CS 70"] },
    { id: "calc", group: "CS lower division", name: "Calculus (Math 1A, 1B)", any: ["MATH 1B"] },
    { id: "linalg", group: "CS lower division", name: "Linear algebra (Math 54)", any: ["MATH 54", "MATH 56"] },

    { id: "ac", group: "University", name: "American Cultures", any: ["ASAMST 128AC", "HISTORY 7B"] },
    { id: "ahi", group: "University", name: "AH&I (one course: Pol Sci)", any: ["POLSCI 1", "CC POLI", "HISTORY 7A", "HISTORY 7B", "CC HIST"] },

    { id: "es-rc", group: "CDSS Essential Skills", name: "Reading & Composition (IGETC)", any: ["IGETC"] },
    { id: "es-hsd", group: "CDSS Essential Skills", name: "Human & Social Dynamics of Data and Technology (ethics)", any: ["DATA C104", "DATA C4AC", "CDSS 94"] },
    { id: "es-comp", group: "CDSS Essential Skills", name: "Computational Reasoning (check APR)", any: [] },
    { id: "es-stat", group: "CDSS Essential Skills", name: "Statistical Reasoning (check APR)", any: [] },

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

  heavy: ["EECS 151", "CS 152", "CS 162", "CS 164", "CS 169A", "CS 169L", "CS 170", "CS 184", "CS 189"],
  minUnits: 12,
  phase1Cap: 13.5,
  maxUnits: 17.5
};
