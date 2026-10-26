/*
  gradplan.js: the Grad Plan tab. Two full routes to graduation, built from the
  course ids in data/terms/*.js so "Load into planner" can drop them straight into
  each term. Edit the text or swap a course id here; ids must match a term file.
  Public file (like the term files), so keep it to courses and tradeoffs only.
*/
window.PLANNER_GRADPLAN = {
  updated: "Oct 25, 2026",
  lead: "Two routes to the CS BA. Plan A finishes in four semesters (May 2028). Plan B takes the full five-semester transfer limit (Dec 2028) to fit the CogSci minor and a second internship summer.",

  left: [
    { req: "CS 61B or CS 47B", units: "4 or 1 units", how: "47B is the 1-unit, self-paced finish for students who covered part of 61B. Email cs-advising@cs.berkeley.edu for permission." },
    { req: "CS 61C", units: "4 units", how: "Prereq is 61A plus 61B or equivalent programming experience, so it can pair with 47B in Spring 2027." },
    { req: "UD design course", units: "4 units", how: "CS 161 (Computer Security)" },
    { req: "UD CS + UD CS/EE/EECS", units: "16 units", how: "Four from 188, 170, 186, 189, 182, 162, 164" },
    { req: "Non-CS technical elective", units: "4 units", how: "COGSCI 131 (Computational Models of Cognition), once you confirm it's on the approved list" },
    { req: "AH&I", units: "~4 units", how: "POLI 1 online at De Anza or Foothill, over summer" },
    { req: "Human & Social Dynamics", units: "4 units", how: "DATA C104" },
    { req: "CogSci minor (summer)", units: "5 courses", how: "C100, 110, 112, 116, 173" }
  ],

  plans: [
    {
      id: "plan-a",
      name: "Plan A: 4 semesters",
      grad: "Graduate May 2028",
      blurb: "Every CS requirement done by Spring 2028, one heavy course per term. Only CogSci C100 fits, so the minor doesn't finish.",
      terms: [
        { term: "fa26", label: "Fall 2026", note: "In progress", fixed: ["CS 61A", "CS 70", "ASAMST 128AC", "CS 198", "Fung 188"] },
        { term: "sp27", courses: ["CS 47B", "CS 61C", "CS 188", "DATA C104"], note: "Full 61B instead of 47B: move CS 188 to Fall 2027." },
        { term: "su27", courses: ["CC POLI"], note: "Internship summer" },
        { term: "fa27", courses: ["CS 161", "CS 170", "COGSCI C100"] },
        { term: "sp28", courses: ["CS 189", "CS 186", "COGSCI 131"] }
      ]
    },
    {
      id: "plan-b",
      name: "Plan B: 5 semesters",
      grad: "Graduate Dec 2028",
      blurb: "About 12 units every term, the full CogSci minor, and two internship summers. Five semesters is the CDSS max for transfers, so there's no slack.",
      terms: [
        { term: "fa26", label: "Fall 2026", note: "In progress", fixed: ["CS 61A", "CS 70", "ASAMST 128AC", "CS 198", "Fung 188"] },
        { term: "sp27", courses: ["CS 47B", "CS 61C", "DATA C104", "DATA C100"], note: "Data 100 keeps you at 12+ units with 47B." },
        { term: "su27", courses: ["CC POLI", "COGSCI 116"], note: "Internship 1" },
        { term: "fa27", courses: ["CS 161", "CS 188", "COGSCI C100"] },
        { term: "sp28", courses: ["CS 170", "CS 186", "COGSCI 131"] },
        { term: "su28", courses: ["COGSCI 110", "COGSCI 112", "COGSCI 173"], note: "Internship 2. Three summer courses is a lot next to an internship; split across sessions." },
        { term: "fa28", courses: ["CS 189", "CS 182", "PUBHLTH 150A"] }
      ]
    }
  ],

  compare: [
    ["Graduation", "May 2028", "Dec 2028"],
    ["Internship summers before graduating", "1 (2027)", "2 (2027, 2028)"],
    ["CogSci minor", "1 course", "All 5 courses"],
    ["Workload", "Two heavy terms back to back", "About 12 units each term"],
    ["Room for a rough week", "Thin", "More"],
    ["Full-time job search", "Starts Fall 2027", "Starts Fall 2028, two internships in"]
  ],

  questions: [
    "Does CIS 22C qualify me for CS 47B, or should I take full CS 61B?",
    "Can I take CS 61C in Spring 2027 with 47B, given my C++ and x86 assembly background?",
    "Is Fall 2027 (161 + 170) then Spring 2028 (189 + 186) realistic for a transfer?",
    "Does COGSCI 131 count as my non-CS technical elective?",
    "Could a Summer 2028 graduation let me finish the CogSci minor on Plan A?",
    "Besides CS 161, which courses are on the current design list?"
  ]
};
