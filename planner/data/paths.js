/*
  paths.js: whole-degree plans across terms. Loading one fills every term's plan.
  Term ids must match the term files (sp27, su27, fa27, ...).
*/
window.PLANNER_PATHS = [
  {
    id: "five",
    name: "5 semesters: full wishlist",
    why: "Every course on the wishlist, one heavy course per semester (189, 170, 162, 164). Data 100 is the non-CS tech elective. Pol Sci online at De Anza/Foothill. Summers hold the CogSci minor if you keep it.",
    plan: {
      sp27: ["CS 61B", "CS 189", "DATA C8", "COGSCI C100"],
      su27: ["COGSCI 112", "COGSCI 116"],
      fa27: ["CS 61C", "CS 170", "DATA C100", "CC POLI"],
      sp28: ["CS 162", "CS 185", "CS 186", "RESEARCH"],
      su28: ["COGSCI 173", "COGSCI 139"],
      fa28: ["CS 164", "CS 182", "CS 161"]
    }
  },
  {
    id: "four",
    name: "4 semesters: core of the wishlist",
    why: "47B route. Fits 189, 170, 162, 161, 185, 186, Data 8 and 100. Drops 164 and 182: with only three semesters left, four heavy courses can't each get their own term. Pol Sci online.",
    plan: {
      sp27: ["CS 47B", "CS 189", "DATA C8", "COGSCI C100"],
      su27: ["COGSCI 112", "COGSCI 116"],
      fa27: ["CS 61C", "CS 170", "DATA C100", "CC POLI"],
      sp28: ["CS 162", "CS 161", "CS 185", "CS 186"],
      su28: ["COGSCI 173", "COGSCI 139"],
      fa28: []
    }
  }
];
