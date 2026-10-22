/*
  Spring 2027 offerings that matter for my CS BA.
  Sources: EECS CS/EE Spring 2027 schedules and classes.berkeley.edu, pulled Oct 22, 2026.
  Schedules can still change; re-check classes.berkeley.edu before enrolling.

  Course fields:
    id        unique id, also used for prereqs ("CS 61B")
    title, units, instructor, location
    meet      [{ days: "MWF", start: "15:00", end: "15:59" }] or [] if TBA
    cat       core | ud | design | te | ahi | small   (filters; can list several)
    ud        upper-div buckets it can fill: design, cs, cseecs, te
    prereq    AND of ORs: [["CS 61A"], ["MATH 54", "MATH 56"]]
    prereqNote  text shown when the rule isn't simple
    verify    true if something still needs checking (shown as a flag)
    rec       my recommendation tag for this term (optional)
    note      why it matters for me
    seats     capacity / reserved-seat notes
    link      class page
*/
(window.PLANNER_TERMS = window.PLANNER_TERMS || []).push({
  id: "sp27",
  name: "Spring 2027",
  order: 20271,
  status: "Planning",
  dates: "Classes Jan 19 to May 7, 2027",
  intro: "Second semester at Berkeley. CS 61B is the unlock: nearly every upper-div course needs it, so it anchors every plan below. CS 189 is the one upper-div CS course I can take now without 61B.",

  presets: [
    {
      name: "Balanced (my pick)",
      ids: ["CS 61B", "CS 189", "POLSCI 1"],
      why: "61B unlocks next year, 189 starts the upper-div count with the AI/ML direction I want for health tech, and Pol Sci 1 clears half of AH&I. Two technical courses, 12 units, all fit in Phase 1."
    },
    {
      name: "Data path",
      ids: ["CS 61B", "DATA C100", "POLSCI 1"],
      why: "Swaps 189 for Data 100, which counts toward the upper-div CS units and is lighter on math. Only works if De Anza CIS 9 clears the Data 8 prereq."
    },
    {
      name: "Systems push",
      ids: ["CS 61B", "CS 61C", "POLSCI 1"],
      why: "Finishes the lower-div core fastest. Only if CS advising confirms 61B and 61C can be taken together, since 61C lists 61B as a prereq."
    }
  ],

  courses: [
    /* ---------- Core ---------- */
    { id: "CS 61B", title: "Data Structures", units: 4, instructor: "Manuel Sabin",
      meet: [{ days: "MWF", start: "15:00", end: "15:59" }], location: "Dwinelle 155",
      cat: ["core"], prereq: [["CS 61A"]], rec: "Take",
      seats: "481 seats, no reserved seats",
      note: "Gate course. Unlocks 61C, 160, 170, 184, 188 and most design options. CIS 22C was C++, so taking the full course here beats the 47B petition route.",
      link: "https://classes.berkeley.edu/content/2027-spring-compsci-61b-001-lec-001" },

    { id: "CS 61C", title: "Great Ideas of Computer Architecture", units: 4, instructor: "Lisa Yan",
      meet: [{ days: "MWF", start: "13:00", end: "13:59" }], location: "Gateway 1210",
      cat: ["core"], prereq: [["CS 61A"], ["CS 61B"]], verify: true,
      seats: "252 seats, CE and CS majors only, time conflicts allowed",
      note: "Listed prereq is 61B. Taking both together only works if cs-advising@cs.berkeley.edu says yes. Otherwise it's a Fall 2027 course.",
      link: "https://classes.berkeley.edu/content/2027-spring-compsci-61c-001-lec-001" },

    { id: "CS 47B", title: "Completion of Work in CS 61B (self-paced)", units: 1, instructor: "Manuel Sabin",
      meet: [], location: "Self-paced",
      cat: ["core", "small"], prereq: [], prereqNote: "Needs a prior data structures course, CS 9G, and instructor consent.",
      note: "The petition route for 61B using CIS 22C. Only worth it if the petition is approved; skip if taking full 61B.",
      link: "https://www2.eecs.berkeley.edu/Courses/CS47B/" },

    /* ---------- Upper-division CS ---------- */
    { id: "CS 189", title: "Introduction to Machine Learning", units: 4, instructor: "Jonathan Shewchuk",
      meet: [{ days: "MW", start: "18:30", end: "19:59" }], location: "Wheeler 150",
      cat: ["ud"], ud: ["cs", "cseecs"], prereq: [["MATH 53"], ["MATH 54"], ["CS 70"]], rec: "Strong",
      seats: "684 seats, CS/DS BA and Engineering majors",
      note: "Eligible now (CS 70 + Calc IV + linear algebra). Core of the AI direction for health tech and directly useful for research. Heavy and math-dense; don't pair with 170.",
      link: "https://classes.berkeley.edu/content/2027-spring-compsci-189-001-lec-001" },

    { id: "CS 188", title: "Introduction to Artificial Intelligence", units: 4, instructor: "Pieter Abbeel, Peyrin Kao",
      meet: [{ days: "TuTh", start: "12:30", end: "13:59" }], location: "Lewis 100",
      cat: ["ud"], ud: ["cs", "cseecs"], prereq: [["CS 61A"], ["CS 61B"], ["CS 70"]],
      note: "Needs 61B first. Great Fall 2027 pick after 61B.",
      link: "https://www2.eecs.berkeley.edu/Courses/CS188/" },

    { id: "CS 170", title: "Efficient Algorithms and Intractable Problems", units: 4, instructor: "Christian Borgs, Shafi Goldwasser",
      meet: [{ days: "TuTh", start: "14:00", end: "15:29" }], location: "Gateway 1210",
      cat: ["ud"], ud: ["cs", "cseecs"], prereq: [["CS 61B"], ["CS 70"]],
      note: "Needs 61B. The interview-prep course; also unlocks C176 (computational biology).",
      link: "https://www2.eecs.berkeley.edu/Courses/CS170/" },

    { id: "CS 160", title: "User Interface Design and Development", units: 4, instructor: "Amy Pavel, Björn Hartmann",
      meet: [{ days: "MW", start: "10:00", end: "11:29" }], location: "Jacobs Hall 310",
      cat: ["ud", "design"], ud: ["design", "cs", "cseecs"], prereq: [["CS 61B", "CS 61BL"]],
      note: "Best design-course fit for human-centered and accessibility work. Needs 61B, so plan it for a later term.",
      link: "https://www2.eecs.berkeley.edu/Courses/CS160/" },

    { id: "CS 184", title: "Foundations of Computer Graphics", units: 4, instructor: "Ren Ng",
      meet: [{ days: "TuTh", start: "09:30", end: "10:59" }], location: "Gateway 1210",
      cat: ["ud", "design"], ud: ["design", "cs", "cseecs"], prereq: [["CS 61B"], ["MATH 54", "MATH 110"]],
      note: "Design course with a game-dev and visual angle. Needs 61B and medium-to-large C++ programs.",
      link: "https://www2.eecs.berkeley.edu/Courses/CS184/" },

    { id: "CS 186", title: "Introduction to Database Systems", units: 4, instructor: "Alvin Cheung",
      meet: [{ days: "MW", start: "09:30", end: "10:59" }], location: "Gateway 1210",
      cat: ["ud", "design"], ud: ["design", "cs", "cseecs"], prereq: [["CS 61C", "CS 47C"]],
      note: "Design course. Needs 61C (transfers may take 47C as a co-req). Practical for backend/health-data work.",
      link: "https://www2.eecs.berkeley.edu/Courses/CS186/" },

    { id: "CS 161", title: "Computer Security", units: 4, instructor: "Raluca Ada Popa",
      meet: [{ days: "MW", start: "17:00", end: "18:29" }], location: "Undergrad Academic Bldg 100",
      cat: ["ud", "design"], ud: ["design", "cs", "cseecs"], prereq: [["CS 61C"], ["CS 70"]],
      note: "Design course, fits my AI security interests. Needs 61C.",
      link: "https://www2.eecs.berkeley.edu/Courses/CS161/" },

    { id: "CS 162", title: "Operating Systems and System Programming", units: 4, instructor: "Matei Zaharia",
      meet: [{ days: "TuTh", start: "15:30", end: "16:59" }], location: "Gateway 1210",
      cat: ["ud", "design"], ud: ["design", "cs", "cseecs"], prereq: [["CS 61B"], ["CS 61C"], ["CS 70"]],
      note: "Design course, very heavy. Needs 61C.",
      link: "https://www2.eecs.berkeley.edu/Courses/CS162/" },

    { id: "CS 164", title: "Programming Languages and Compilers", units: 4, instructor: "Sarah Chasins",
      meet: [{ days: "TuTh", start: "14:00", end: "15:29" }], location: "Gateway 1220",
      cat: ["ud", "design"], ud: ["design", "cs", "cseecs"], prereq: [["CS 61B"], ["CS 61C"]],
      note: "Design course, heavy. Needs 61C.",
      link: "https://www2.eecs.berkeley.edu/Courses/CS164/" },

    { id: "CS 169L", title: "Software Engineering Team Project", units: 4, instructor: "Armando Fox, Michael Ball",
      meet: [{ days: "MF", start: "15:30", end: "17:00" }], location: "Gateway B1015",
      cat: ["ud", "design"], ud: ["design", "cs", "cseecs"], prereq: [["CS 169A", "CS W169A"]],
      note: "Needs 169A, which isn't on the Spring 2027 schedule.",
      link: "https://www2.eecs.berkeley.edu/Courses/CS169L/" },

    { id: "CS 185", title: "Deep Reinforcement Learning, Decision Making, and Control", units: 4, instructor: "Sergey Levine",
      meet: [{ days: "WF", start: "08:00", end: "09:29" }], location: "Gateway 1210",
      cat: ["ud", "design"], ud: ["design", "cs", "cseecs"], prereq: [["CS 189", "CS 188"]], verify: true,
      note: "Design course. Prereq shown is my best read (prior ML/AI); confirm on the course page.",
      link: "https://www2.eecs.berkeley.edu/Courses/CS185/" },

    { id: "CS C176", title: "Algorithms for Computational Biology", units: 4, instructor: "Allon Wagner",
      meet: [{ days: "TuTh", start: "15:30", end: "16:59" }], location: "Gateway B1023",
      cat: ["ud"], ud: ["cs", "cseecs"], prereq: [["CS 70"], ["CS 170"]],
      note: "Lines up with the DNA research. Needs 170, so it's a senior-year option.",
      link: "https://www2.eecs.berkeley.edu/Courses/CS176/" },

    { id: "CS 172", title: "Computability and Complexity", units: 4, instructor: "Alistair Sinclair",
      meet: [{ days: "TuTh", start: "11:00", end: "12:29" }], location: "Lewis 9",
      cat: ["ud"], ud: ["cs", "cseecs"], prereq: [["CS 170"]],
      note: "Theory follow-up to 170.",
      link: "https://www2.eecs.berkeley.edu/Courses/CS172/" },

    { id: "CS C177", title: "Algorithmic Economics", units: 4, instructor: "Federico Echenique",
      meet: [{ days: "MWF", start: "10:00", end: "10:59" }], location: "Etcheverry 3106",
      cat: ["ud"], ud: ["cs", "cseecs"], prereq: [], prereqNote: "Prereqs not confirmed; check the catalog.", verify: true,
      note: "Newer cross-listed course. Confirm prereqs before counting on it.",
      link: "https://www2.eecs.berkeley.edu/Scheduling/CS/schedule-next.html" },

    /* ---------- Data and non-CS technical electives ---------- */
    { id: "DATA C100", title: "Principles and Techniques of Data Science", units: 4, instructor: "TBA",
      meet: [], location: "Time TBA",
      cat: ["ud", "te"], ud: ["cs", "cseecs", "te"], prereq: [["DATA C8"], ["CS 61A", "DATA C88C"], ["MATH 54", "MATH 56"]], verify: true,
      note: "Counts toward the upper-div CS units even though it's not CS-titled. Data 8 prereq: check if De Anza CIS 9 articulates on ASSIST, or ask ds-advising. Confirm Spring time on classes.berkeley.edu.",
      link: "https://undergraduate.catalog.berkeley.edu/courses/1480473" },

    { id: "DATA C104", title: "Human Contexts and Ethics of Data", units: 4, instructor: "TBA",
      meet: [], location: "Time TBA",
      cat: ["te"], ud: ["te"], prereq: [], verify: true,
      note: "Approved non-CS technical elective. Ethics and real-world impact of data systems, a good match for health-tech goals. Confirm it's offered this spring.",
      link: "https://cdss.berkeley.edu/dsus/academics/courses" },

    { id: "PUBHLTH 150A", title: "Introduction to Epidemiology and Human Disease", units: 4, instructor: "TBA",
      meet: [], location: "Time TBA",
      cat: ["te"], ud: ["te"], prereq: [], prereqNote: "Check prereqs in the catalog.", verify: true,
      note: "Approved non-CS technical elective with a direct health-tech connection. Confirm offering and prereqs.",
      link: "https://eecs.berkeley.edu/academics/courses/tech-electives/" },

    { id: "INFO 159", title: "Natural Language Processing", units: 4, instructor: "TBA",
      meet: [], location: "Time TBA",
      cat: ["ud", "te"], ud: ["cs", "cseecs", "te"], prereq: [], prereqNote: "Likely needs 61B; check the catalog.", verify: true,
      note: "One of the few non-CS courses allowed in the upper-div CS units. Probably a later-term option.",
      link: "https://eecs.berkeley.edu/academics/courses/tech-electives/" },

    /* ---------- American History & Institutions ---------- */
    { id: "POLSCI 1", title: "Introduction to American Politics", units: 4, instructor: "Hunter Rendleman",
      meet: [{ days: "TuTh", start: "17:00", end: "18:29" }], location: "Undergrad Academic Bldg 100",
      cat: ["ahi"], prereq: [], rec: "Take",
      seats: "324 seats, no reserved seats",
      note: "Clears the AH&I Institutions half. Plenty of open seats, so it can wait for Phase 2 if Phase 1 gets tight.",
      link: "https://classes.berkeley.edu/content/2027-spring-polsci-1-001-lec-001" },

    { id: "HISTORY 7B", title: "U.S. History: Civil War to Present", units: 4, instructor: "TBA",
      meet: [{ days: "TuTh", start: "11:00", end: "12:29" }], location: "Dwinelle 155",
      cat: ["ahi"], prereq: [],
      note: "Clears the AH&I History half (also AC, which is already done). Taking both AH&I courses in one term is 8 non-technical units; better split across two terms.",
      link: "https://classes.berkeley.edu/content/2027-spring-history-7b-001-lec-001" },

    /* ---------- Small / P-NP ---------- */
    { id: "CS 198-GC", title: "GamesCrafters: Computational Game Theory R&D", units: 2, instructor: "Dan Garcia",
      meet: [{ days: "MWF", start: "11:00", end: "11:59" }], location: "Gateway B1016",
      cat: ["small"], prereq: [], verify: true,
      note: "P/NP, variable units (2 is a placeholder). Game dev with Dan Garcia's group; typically needs an application.",
      link: "https://www2.eecs.berkeley.edu/Scheduling/CS/schedule-next.html" },

    { id: "CS 195", title: "Social Implications of Computer Technology", units: 1, instructor: "Joshua Hug",
      meet: [{ days: "Tu", start: "12:30", end: "13:59" }], location: "Physics Building 4",
      cat: ["small"], prereq: [],
      note: "1 unit P/NP. Doesn't count toward the major, but it's a light way to round out units.",
      link: "https://www2.eecs.berkeley.edu/Scheduling/CS/schedule-next.html" },

    { id: "FUNG-SP", title: "Fung Fellows, spring course", units: 2, instructor: "TBA",
      meet: [], location: "Confirm with the program",
      cat: ["small"], prereq: [], verify: true,
      note: "If the fellowship continues into spring, add the real course number and units here once the program confirms.",
      link: "" },

    { id: "RESEARCH", title: "Research units (Research 001 / URAP / CS 199)", units: 2, instructor: "Faculty mentor",
      meet: [], location: "Arranged",
      cat: ["small"], prereq: [], verify: true,
      note: "Optional credit for ongoing research if a faculty sponsor signs off. Units vary.",
      link: "https://research.berkeley.edu/urap/" }
  ]
});
