/*
  Template for a new semester. Copy to e.g. fall-2029.js, fill it in, then add
  <script src="data/terms/fall-2029.js"></script> in planner/index.html above planner.js.

  order: YYYY + term digit (Spring 1, Summer 2, Fall 3), so Fall 2029 = 20293.
  Course facts (title, units, prereqs, what it counts for) live in data/catalog.js.
  Here, list only what's offered: times, room, instructor. Any catalog field can be
  overridden here. A course not in the catalog needs its full details here.
*/
(window.PLANNER_TERMS = window.PLANNER_TERMS || []).push({
  id: "fa29",
  name: "Fall 2029",
  order: 20293,
  starts: "2029-08-15",        // first day of the term (roughly)
  ends: "2029-12-14",          // last day of finals: after this the term locks as Completed
  status: "Planning",          // Planning | Future (Completed / In progress are automatic)
  // enrolled: ["CS 61C"],     // once you're actually enrolled: fixes the term to these courses
  // summer: true,             // turns off the 12-unit minimum checks
  dates: "",
  intro: "",
  courses: [
    // { id: "CS 61C", instructor: "", meet: [{ days: "MWF", start: "13:00", end: "13:59" }], location: "", link: "" }
  ]
});
