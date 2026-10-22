/*
  seed.js: starting data for the planner. On your first admin login it is copied into
  state.json (encrypted if you choose "Only me") and this file is deleted automatically.
*/
window.PLANNER_SEED = {
  "done": [
    "CS 61A",
    "CS 70",
    "ASAMST 128AC",
    "MATH 1A",
    "MATH 1B",
    "MATH 53",
    "MATH 54",
    "IGETC"
  ],
  "todos": [
    {
      "id": "t-47b",
      "text": "Confirm with cs-advising that CS 47B fully replaces 61B as a prereq, and whether CS 9G is also needed"
    },
    {
      "id": "t-tcr",
      "text": "Check the Transfer Credit Report shows Math 53 and 54 equivalents (CS 189 prereqs)"
    },
    {
      "id": "t-61c",
      "text": "Ask cs-advising whether 61C can be taken in the same term as 61B/47B"
    },
    {
      "id": "t-ahi",
      "text": "Confirm with CDSS (Course Equivalency Request) that De Anza/Foothill POLI 1 satisfies AH&I (or take POL SCI 1 at Berkeley)"
    },
    {
      "id": "t-cc",
      "text": "Re-enroll at De Anza or Foothill and register for online POLI 1; send the transcript to Berkeley after"
    },
    {
      "id": "t-cog",
      "text": "Declare the CogSci summer minor and check the Summer Minor Finances page"
    },
    {
      "id": "t-aid",
      "text": "Ask Financial Aid how summer terms and a possible 5th semester affect Pell and the Transfer Scholarship"
    },
    {
      "id": "t-5th",
      "text": "If going 5 semesters: request the 5th semester from CDSS"
    },
    {
      "id": "t-c8",
      "text": "Check ASSIST: does De Anza CIS 9 count as Data C8? If yes, skip Data 8 and go straight to Data 100"
    },
    {
      "id": "t-es",
      "text": "Check the Academic Progress Report: are Computational and Statistical Reasoning already met (De Anza stats, CS 61A, Data 8)? Ask CDSS if Data C104 can count for both the ethics requirement and the tech elective"
    },
    {
      "id": "t-cog-dec",
      "text": "CogSci minor plan: C100 + 112, 116 (Summer 2027) + 110, 173 (Summer 2028). Check each summer schedule when it posts"
    }
  ],
  "paths": [
    {
      "id": "five",
      "default": true,
      "name": "5 semesters: full wishlist (best pick)",
      "why": "Every course on the wishlist, balanced by workload: each semester gets one very heavy course, a project-heavy course next to a problem-set one, and a light course to absorb crunch weeks. Data 100 is the non-CS tech elective. Data C104 covers the CDSS ethics requirement. Pol Sci online over Summer 2027. CogSci minor in the summers.",
      "plan": {
        "sp27": [
          "CS 61B",
          "CS 189",
          "DATA C8",
          "COGSCI C100"
        ],
        "su27": [
          "COGSCI 112",
          "COGSCI 116",
          "CC POLI"
        ],
        "fa27": [
          "CS 61C",
          "CS 170",
          "DATA C100",
          "DATA C104"
        ],
        "sp28": [
          "CS 164",
          "CS 185",
          "CS 161",
          "RESEARCH"
        ],
        "su28": [
          "COGSCI 110",
          "COGSCI 173"
        ],
        "fa28": [
          "CS 162",
          "CS 182",
          "CS 186"
        ]
      }
    },
    {
      "id": "four",
      "name": "4 semesters: core of the wishlist",
      "why": "47B route. Fits 189, 170, 162, 161, 185, 186, Data 8 and 100. Drops 164 and 182: with only three semesters left, four heavy courses can't each get their own term. Pol Sci online. The last two minor courses land in Summer 2028, so this needs a summer degree term.",
      "plan": {
        "sp27": [
          "CS 47B",
          "CS 189",
          "DATA C8",
          "COGSCI C100"
        ],
        "su27": [
          "COGSCI 112",
          "COGSCI 116",
          "CC POLI"
        ],
        "fa27": [
          "CS 61C",
          "CS 170",
          "DATA C100",
          "DATA C104"
        ],
        "sp28": [
          "CS 162",
          "CS 161",
          "CS 185",
          "CS 186"
        ],
        "su28": [
          "COGSCI 110",
          "COGSCI 173"
        ],
        "fa28": []
      }
    }
  ],
  "plans": {
    "sp27": [
      "CS 61B",
      "CS 189",
      "DATA C8",
      "COGSCI C100"
    ],
    "su27": [
      "COGSCI 112",
      "COGSCI 116",
      "CC POLI"
    ],
    "fa27": [
      "CS 61C",
      "CS 170",
      "DATA C100",
      "DATA C104"
    ],
    "sp28": [
      "CS 164",
      "CS 185",
      "CS 161",
      "RESEARCH"
    ],
    "su28": [
      "COGSCI 110",
      "COGSCI 173"
    ],
    "fa28": [
      "CS 162",
      "CS 182",
      "CS 186"
    ]
  },
  "manual": {}
};
