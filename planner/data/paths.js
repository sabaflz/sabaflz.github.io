/*
  paths.js: whole-degree plans across terms. Loading one fills every term's plan.
  Term ids must match the term files (sp27, su27, fa27, ...).
*/
window.PLANNER_PATHS = [
  {
    id: "four",
    name: "4 semesters + CogSci minor",
    why: "47B route. Both AH&I courses online at De Anza or Foothill (history in Winter/Spring quarter, POLI 1 in Fall quarter), so every Berkeley slot goes to CS, the minor, or the tech elective. Minor courses two per summer, graduating after Summer 2028.",
    plan: {
      sp27: ["CS 47B", "CS 189", "COGSCI C100", "COGSCI 131", "CC HIST"],
      su27: ["COGSCI 112", "COGSCI 116"],
      fa27: ["CS 61C", "CS 170", "CS 188", "CC POLI"],
      sp28: ["CS 160", "CS 186", "CS C176"],
      su28: ["COGSCI 173", "COGSCI 139"],
      fa28: []
    }
  },
  {
    id: "five",
    name: "5 semesters + CogSci minor",
    why: "Full 61B and 12 to 13 unit semesters. Both AH&I courses online at De Anza or Foothill. Minor courses two per summer, so pair each summer with a part-time or remote internship. Finishes Fall 2028 with room for extra electives.",
    plan: {
      sp27: ["CS 61B", "CS 189", "COGSCI C100", "RESEARCH", "CC HIST"],
      su27: ["COGSCI 112", "COGSCI 116"],
      fa27: ["CS 61C", "CS 170", "COGSCI 131", "CC POLI"],
      sp28: ["CS 160", "CS 188", "CS 161"],
      su28: ["COGSCI 173", "COGSCI 139"],
      fa28: ["CS 186", "CS C176", "PUBHLTH 150A"]
    }
  }
];
