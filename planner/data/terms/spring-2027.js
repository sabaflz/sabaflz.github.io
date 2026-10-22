/*
  Spring 2027: what's offered this term. Course facts live in data/catalog.js;
  anything here (meet, location, instructor, seats, link, note, rec) overrides it.
  Sources: EECS CS Spring 2027 schedule, classes.berkeley.edu, CogSci courses-by-term.
  Pulled Oct 22, 2026. Re-check classes.berkeley.edu before enrolling.
*/
(window.PLANNER_TERMS = window.PLANNER_TERMS || []).push({
  id: "sp27",
  name: "Spring 2027",
  order: 20271,
  status: "Planning",
  dates: "Classes Jan 19 to May 7, 2027",
  intro: "Second semester. Every upper-div course except CS 189 needs 61B (or 47B) finished first, so this term is about the 61B route, CS 189, and clearing non-CS requirements while you can: AH&I, the tech elective, and the CogSci minor core.",

  courses: [
    { id: "CS 61B", instructor: "Manuel Sabin", meet: [{ days: "MWF", start: "15:00", end: "15:59" }], location: "Dwinelle 155",
      seats: "481 seats, no reserved seats", rec: "5-sem route",
      link: "https://classes.berkeley.edu/content/2027-spring-compsci-61b-001-lec-001" },
    { id: "CS 47B", instructor: "Manuel Sabin", meet: [], location: "Self-paced", rec: "4-sem route" },
    { id: "CS 61C", instructor: "Lisa Yan", meet: [{ days: "MWF", start: "13:00", end: "13:59" }], location: "Gateway 1210",
      seats: "252 seats, CE and CS majors only", verify: true,
      note: "Needs 61B (or 47B) finished first. Same-term enrollment only if cs-advising says yes; otherwise Fall 2027.",
      link: "https://classes.berkeley.edu/content/2027-spring-compsci-61c-001-lec-001" },

    { id: "CS 189", instructor: "Jonathan Shewchuk", meet: [{ days: "MW", start: "18:30", end: "19:59" }], location: "Wheeler 150",
      seats: "684 seats, CS/DS BA and Engineering majors", rec: "Take",
      link: "https://classes.berkeley.edu/content/2027-spring-compsci-189-001-lec-001" },
    { id: "CS 188", instructor: "Pieter Abbeel, Peyrin Kao", meet: [{ days: "TuTh", start: "12:30", end: "13:59" }], location: "Lewis 100" },
    { id: "CS 170", instructor: "Christian Borgs, Shafi Goldwasser", meet: [{ days: "TuTh", start: "14:00", end: "15:29" }], location: "Gateway 1210" },
    { id: "CS 160", instructor: "Amy Pavel, Björn Hartmann", meet: [{ days: "MW", start: "10:00", end: "11:29" }], location: "Jacobs Hall 310" },
    { id: "CS 184", instructor: "Ren Ng", meet: [{ days: "TuTh", start: "09:30", end: "10:59" }], location: "Gateway 1210" },
    { id: "CS 186", instructor: "Alvin Cheung", meet: [{ days: "MW", start: "09:30", end: "10:59" }], location: "Gateway 1210" },
    { id: "CS 161", instructor: "Raluca Ada Popa", meet: [{ days: "MW", start: "17:00", end: "18:29" }], location: "Undergrad Academic Bldg 100" },
    { id: "CS 162", instructor: "Matei Zaharia", meet: [{ days: "TuTh", start: "15:30", end: "16:59" }], location: "Gateway 1210" },
    { id: "CS 164", instructor: "Sarah Chasins", meet: [{ days: "TuTh", start: "14:00", end: "15:29" }], location: "Gateway 1220" },
    { id: "CS 169L", instructor: "Armando Fox, Michael Ball", meet: [{ days: "MF", start: "15:30", end: "17:00" }], location: "Gateway B1015",
      note: "Needs 169A, which isn't on the Spring 2027 schedule." },
    { id: "CS 185", instructor: "Sergey Levine", meet: [{ days: "WF", start: "08:00", end: "09:29" }], location: "Gateway 1210" },
    { id: "CS C176", instructor: "Allon Wagner", meet: [{ days: "TuTh", start: "15:30", end: "16:59" }], location: "Gateway B1023" },
    { id: "CS 172", instructor: "Alistair Sinclair", meet: [{ days: "TuTh", start: "11:00", end: "12:29" }], location: "Lewis 9" },
    { id: "CS C177", instructor: "Federico Echenique", meet: [{ days: "MWF", start: "10:00", end: "10:59" }], location: "Etcheverry 3106" },

    { id: "COGSCI C100", instructor: "Mariam Aly", meet: [], location: "Time TBA", rec: "Minor core",
      note: "Required core for the CogSci minor and the only minor course you can take during the regular year. Taking it now leaves only summer topical courses." },
    { id: "COGSCI 131", instructor: "Steven Piantadosi", meet: [], location: "Time TBA", rec: "Tech elective" },
    { id: "DATA C8", instructor: "TBA", meet: [], location: "Time TBA", verify: true },
    { id: "DATA C100", instructor: "TBA", meet: [], location: "Time TBA" },
    { id: "DATA C104", instructor: "TBA", meet: [], location: "Time TBA" },
    { id: "PUBHLTH 150A", instructor: "TBA", meet: [], location: "Time TBA" },
    { id: "INFO 159", instructor: "TBA", meet: [], location: "Time TBA" },

    { id: "POLSCI 1", instructor: "Hunter Rendleman", meet: [{ days: "TuTh", start: "17:00", end: "18:29" }], location: "Undergrad Academic Bldg 100",
      seats: "324 seats, no reserved seats", rec: "Take",
      note: "Clears the AH&I Institutions half. Plenty of seats, so it can wait for Phase 2 if Phase 1 gets tight.",
      link: "https://classes.berkeley.edu/content/2027-spring-polsci-1-001-lec-001" },
    { id: "CC HIST", instructor: "De Anza or Foothill", meet: [], location: "Online, Winter or Spring quarter", rec: "AH&I History" },
    { id: "HISTORY 7B", instructor: "TBA", meet: [{ days: "TuTh", start: "11:00", end: "12:29" }], location: "Dwinelle 155",
      link: "https://classes.berkeley.edu/content/2027-spring-history-7b-001-lec-001" },

    { id: "CS 198-GC", instructor: "Dan Garcia", meet: [{ days: "MWF", start: "11:00", end: "11:59" }], location: "Gateway B1016" },
    { id: "CS 195", instructor: "Joshua Hug", meet: [{ days: "Tu", start: "12:30", end: "13:59" }], location: "Physics Building 4" },
    { id: "FUNG-SP", instructor: "TBA", meet: [], location: "Confirm with the program" },
    { id: "RESEARCH", instructor: "Faculty mentor", meet: [], location: "Arranged" }
  ]
});
