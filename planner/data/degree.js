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
    "MATH 1A", "MATH 1B", "MATH 53", "MATH 54", "IGETC"  // De Anza (confirm on your Transfer Credit Report)
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

  // Things to do that aren't courses. Check them off on the page.
  todos: [
    { id: "t-47b", text: "Confirm with cs-advising that CS 47B fully replaces 61B as a prereq, and whether CS 9G is also needed" },
    { id: "t-tcr", text: "Check the Transfer Credit Report shows Math 53 and 54 equivalents (CS 189 prereqs)" },
    { id: "t-61c", text: "Ask cs-advising whether 61C can be taken in the same term as 61B/47B" },
    { id: "t-ahi", text: "Confirm with CDSS (Course Equivalency Request) that De Anza/Foothill POLI 1 satisfies AH&I (or take POL SCI 1 at Berkeley)" },
    { id: "t-cc", text: "Re-enroll at De Anza or Foothill and register for online POLI 1; send the transcript to Berkeley after" },
    { id: "t-cog", text: "Declare the CogSci summer minor and check the Summer Minor Finances page" },
    { id: "t-aid", text: "Ask Financial Aid how summer terms and a possible 5th semester affect Pell and the Transfer Scholarship" },
    { id: "t-5th", text: "If going 5 semesters: request the 5th semester from CDSS" },
    { id: "t-c8", text: "Check ASSIST: does De Anza CIS 9 count as Data C8? If yes, skip Data 8 and go straight to Data 100" },
    { id: "t-es", text: "Check the Academic Progress Report: are Computational and Statistical Reasoning already met (De Anza stats, CS 61A, Data 8)? Ask CDSS if Data C104 can count for both the ethics requirement and the tech elective" },
    { id: "t-cog-dec", text: "CogSci minor plan: C100 + 112, 116 (Summer 2027) + 110, 173 (Summer 2028). Check each summer schedule when it posts" }
  ],

  heavy: ["EECS 151", "CS 152", "CS 162", "CS 164", "CS 169A", "CS 169L", "CS 170", "CS 184", "CS 189"],
  minUnits: 12,
  phase1Cap: 13.5,
  maxUnits: 17.5
};
