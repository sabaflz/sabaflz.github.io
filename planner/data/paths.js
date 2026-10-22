/*
  paths.js: whole-degree plans across terms. Loading one fills every term's plan.
  Term ids must match the term files (sp27, su27, fa27, ...).
*/
window.PLANNER_PATHS = [
  {
    id: "five",
    default: true,      // my best pick: pre-loaded on the page and marked "Best pick" on course cards
    name: "5 semesters: full wishlist (best pick)",
    why: "Every course on the wishlist, balanced by workload: each semester gets one very heavy course, a project-heavy course next to a problem-set one, and a light course to absorb crunch weeks. Data 100 is the non-CS tech elective. Pol Sci online. CogSci minor in the summers.",
    plan: {
      sp27: ["CS 61B", "CS 189", "DATA C8", "COGSCI C100"],
      su27: ["COGSCI 112", "COGSCI 116"],
      fa27: ["CS 61C", "CS 170", "DATA C100", "CC POLI"],
      sp28: ["CS 164", "CS 185", "CS 161", "RESEARCH"],
      su28: ["COGSCI 110", "COGSCI 173"],
      fa28: ["CS 162", "CS 182", "CS 186"]
    }
  },
  {
    id: "four",
    name: "4 semesters: core of the wishlist",
    why: "47B route. Fits 189, 170, 162, 161, 185, 186, Data 8 and 100. Drops 164 and 182: with only three semesters left, four heavy courses can't each get their own term. Pol Sci online. The last two minor courses land in Summer 2028, so this needs a summer degree term.",
    plan: {
      sp27: ["CS 47B", "CS 189", "DATA C8", "COGSCI C100"],
      su27: ["COGSCI 112", "COGSCI 116"],
      fa27: ["CS 61C", "CS 170", "DATA C100", "CC POLI"],
      sp28: ["CS 162", "CS 161", "CS 185", "CS 186"],
      su28: ["COGSCI 110", "COGSCI 173"],
      fa28: []
    }
  }
];
