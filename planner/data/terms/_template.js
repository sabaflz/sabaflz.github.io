/*
  Template for a new semester. Copy to e.g. fall-2027.js, fill it in,
  then add <script src="data/terms/fall-2027.js"></script> in planner/index.html
  (before planner.js). Field meanings are documented in spring-2027.js.

  order: YYYY + term digit (Spring 1, Summer 2, Fall 3), so Fall 2027 = 20273.
  Prereqs automatically count courses you planned in earlier terms.
*/
(window.PLANNER_TERMS = window.PLANNER_TERMS || []).push({
  id: "fa27",
  name: "Fall 2027",
  order: 20273,
  status: "Planning",
  dates: "",
  intro: "",
  presets: [
    // { name: "My pick", ids: ["CS 61C", "CS 170"], why: "" }
  ],
  courses: [
    // { id: "CS 61C", title: "", units: 4, instructor: "",
    //   meet: [{ days: "MWF", start: "13:00", end: "13:59" }], location: "",
    //   cat: ["core"], ud: [], prereq: [["CS 61B"]], note: "", link: "" }
  ]
});
