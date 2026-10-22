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
    { id: "t-47b", text: "Confirm with cs-advising that CS 47B fully replaces 61B as a prereq, and whether CS 9G is also needed" },
    { id: "t-tcr", text: "Check the Transfer Credit Report shows Math 53 and 54 equivalents (CS 189 prereqs)" },
    { id: "t-61c", text: "Ask cs-advising whether 61C can be taken in the same term as 61B/47B" },
    { id: "t-ahi", text: "Confirm with CDSS (Course Equivalency Request) which De Anza/Foothill courses cover AH&I (U.S. history for History, POLI 1 for Institutions)" },
    { id: "t-cc", text: "Re-enroll at De Anza or Foothill and register for the online history and POLI 1 courses; send the transcript to Berkeley after" },
    { id: "t-cog", text: "Declare the CogSci summer minor and check the Summer Minor Finances page" },
    { id: "t-aid", text: "Ask Financial Aid how summer terms and a possible 5th semester affect Pell and the Transfer Scholarship" },
    { id: "t-5th", text: "If going 5 semesters: request the 5th semester from CDSS" },
    { id: "t-c8", text: "Only if adding Data 100: check ASSIST for De Anza CIS 9 to Data C8" }
  ],

  heavy: ["EECS 151", "CS 152", "CS 162", "CS 164", "CS 169A", "CS 169L", "CS 170", "CS 184", "CS 189"],
  minUnits: 12,
  phase1Cap: 13.5,
  maxUnits: 17.5
};
