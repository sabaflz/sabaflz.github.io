/*
  paths.js: whole-degree plans across terms. Loading one fills every term's plan.
  Term ids must match the term files (sp27, su27, fa27, ...).
*/
window.PLANNER_PATHS = [
  {
    id: "four",
    name: "4 semesters + CogSci minor",
    why: "47B route frees Spring for the tech elective and the minor core. Two minor courses each summer, graduating after Summer 2028. Busiest path: Summer 2027 is the only pre-graduation summer, and it has two online courses.",
    plan: {
      sp27: ["CS 47B", "CS 189", "COGSCI C100", "COGSCI 131"],
      su27: ["COGSCI 112", "COGSCI 116"],
      fa27: ["CS 61C", "CS 170", "POLSCI 1"],
      sp28: ["CS 160", "CS 188", "CS 186", "HISTORY 7B"],
      su28: ["COGSCI 173", "COGSCI 139"],
      fa28: []
    }
  },
  {
    id: "five",
    name: "5 semesters + CogSci minor",
    why: "Full 61B and lighter semesters. The four summer-only minor courses split two per summer, so pair each summer with a part-time or remote internship. Finishes Fall 2028.",
    plan: {
      sp27: ["CS 61B", "CS 189", "POLSCI 1"],
      su27: ["COGSCI 112", "COGSCI 116"],
      fa27: ["CS 61C", "CS 170", "HISTORY 7B"],
      sp28: ["CS 160", "CS 188", "COGSCI 131"],
      su28: ["COGSCI 173", "COGSCI 139"],
      fa28: ["CS 186", "CS 161", "COGSCI C100", "RESEARCH"]
    }
  }
];
