/*
  Fall 2026: my first semester at Berkeley. `enrolled` is what I'm actually taking,
  so this term shows as a fixed record (not a plan) and can't be changed by accident.
  Once the term ends (`ends`), the daily schedule refresh stops touching it too.
*/
(window.PLANNER_TERMS = window.PLANNER_TERMS || []).push({
  id: "fa26",
  name: "Fall 2026",
  order: 20263,
  starts: "2026-08-19",
  ends: "2026-12-18",
  dates: "Classes Aug 26 to Dec 4, finals Dec 14 to 18, 2026",
  intro: "First semester at Berkeley. Two technical courses (61A and 70), as CDSS recommends for new transfers, plus American Cultures, CS 198, and the Fung Fellowship.",
  enrolled: ["CS 61A", "CS 70", "ASAMST 128AC", "CS 198", "FUNG 188"],
  courses: [
    { id: "CS 61A", instructor: "John DeNero, Kay Ousterhout" },
    { id: "CS 70", instructor: "Joshua Hug, Manuel Sabin" },
    { id: "ASAMST 128AC", instructor: "Hatem Bazian", location: "Schedule TBA" },
    { id: "CS 198", instructor: "Student-led", location: "See section" },
    { id: "FUNG 188", instructor: "David Haddad", location: "See course site" }
  ]
});
