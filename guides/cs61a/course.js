/*
  course.js: the course map for the CS 61A learning app.

  Topics follow the Fall 2026 lecture order from the course calendar
  (cs61a.org/fa26), grouped by the exam they lead up to. Review lectures,
  Welcome, Ethics and Conclusion are left out.

  Order in this file = order on the map. To add a topic, add an object to a
  unit's `topics` list. A topic becomes fully playable once a lesson file
  exists for it (lessons/<id>.js) and it is listed in index.html.

  Topic fields:
    id        short name used in the address, like "recursion"
    lecture   the lecture number it was taught in
    title     shown on the map
    blurb     one line about what the topic covers
    est       planned minutes for the lesson, check and exam-style problems
              together. Once a lesson file exists, the app works the time out
              from the lesson itself and ignores this number.
    pool      categories from the existing practice problem set to use in the
              Practice stage (see ../cs61a-mt3-practice/problems.js)
    testOut   levels that may skip this topic: "python" and/or "review"
*/
window.COURSE = {
  title: "CS 61A",
  levels: [
    { id: "new", label: "New to programming", desc: "Every idea from zero, with extra notes on the basics." },
    { id: "programmer", label: "I've programmed, but not in Python", desc: "Python syntax explained as it comes up. Nothing about this course assumed." },
    { id: "python", label: "I know Python", desc: "Skip the syntax notes and test out of the early topics." },
    { id: "review", label: "Reviewing for an exam", desc: "Go straight to questions. Lessons are there if you need them." }
  ],
  defaultLevel: "programmer",
  /* minutes used for the time estimates */
  pace: { perCheckQuestion: 1, perDeepenProblem: 10, perPracticeProblem: 15 },
  units: [
    { title: "Functions", exam: "Midterm 1", topics: [
      { id: "functions", lecture: 2, title: "Functions", blurb: "Expressions, names, def, and print versus return.", est: 40, testOut: ["python", "review"] },
      { id: "control", lecture: 3, title: "Control", blurb: "if, while, boolean operators and short-circuiting.", est: 40, testOut: ["python", "review"] },
      { id: "hof", lecture: 4, title: "Higher-order functions", blurb: "Functions as arguments and return values, lambda.", est: 50 },
      { id: "environments", lecture: 5, title: "Environments", blurb: "Frames, parents, and how names are looked up.", est: 50 },
      { id: "abstraction", lecture: 6, title: "Abstraction", blurb: "Lambda expressions, currying, and zero-argument functions.", est: 35 },
      { id: "function-examples", lecture: 7, title: "Function examples", blurb: "A method for implementation problems, plus mixed Midterm 1 practice.", est: 30 }
    ]},
    { title: "Recursion and data", exam: "Midterm 2", topics: [
      { id: "recursion", lecture: 9, title: "Recursion", blurb: "Base cases, recursive calls, and trusting the smaller problem.", est: 45, pool: ["Recursion"] },
      { id: "tree-recursion", lecture: 10, title: "Tree recursion", blurb: "More than one recursive call: counting, partitions, paths.", est: 60, pool: ["Recursion"] },
      { id: "sequences", lecture: 11, title: "Sequences", blurb: "Lists, for statements, ranges, list comprehensions, and recursion on lists.", est: 45, pool: ["Lists & Dicts"], testOut: ["review"] },
      { id: "containers", lecture: 12, title: "Containers", blurb: "Slicing, strings, and sum, max, all and any.", est: 40, pool: ["Lists & Dicts"], testOut: ["review"] },
      { id: "objects", lecture: 13, title: "Objects", blurb: "Dictionaries, objects and methods, data classes, tuples, and tracking state in tree recursion.", est: 35, pool: ["Recursion"] },
      { id: "linked-lists", lecture: 14, title: "Linked lists", blurb: "The Link class, the empty list (), and recursion over linked lists.", est: 50, pool: ["Linked Lists"] },
      { id: "trees", lecture: 15, title: "Trees", blurb: "The Tree class, leaves and branches, and recursion over trees.", est: 55, pool: ["Trees"] },
      { id: "problem-solving", lecture: 17, title: "Problem solving", blurb: "How to attack an unfamiliar exam problem step by step.", est: 30 }
    ]},
    { title: "Mutation and objects", exam: "Midterm 3", topics: [
      { id: "mutation", lecture: 18, title: "Mutation", blurb: "Changing lists and dictionaries in place, is versus ==, and functions with state.", est: 50, pool: ["Mutation & Iterators"] },
      { id: "classes", lecture: 19, title: "Classes", blurb: "The class statement, __init__ and self, methods, and object identity.", est: 45, pool: ["OOP"] },
      { id: "attributes", lecture: 20, title: "Attributes", blurb: "Class attributes, how a dot looks a name up, and assigning to an instance versus a class.", est: 40, pool: ["OOP"] },
      { id: "inheritance", lecture: 21, title: "Inheritance", blurb: "Subclasses, overriding, reusing the base class, and is-a versus has-a.", est: 45, pool: ["OOP"] },
      { id: "iterators", lecture: 22, title: "Iterators", blurb: "iter and next, iterables versus iterators, and lazy map, filter, zip and reversed.", est: 40, pool: ["Mutation & Iterators"] },
      { id: "generators", lecture: 23, title: "Generators", blurb: "yield, pausing and resuming, yield from, and recursive generators.", est: 50, pool: ["Generators"] },
      { id: "efficiency", lecture: 24, title: "Efficiency", blurb: "Counting calls, memoization, and how work grows with the input.", est: 40 },
      { id: "object-examples", lecture: 25, title: "Object examples", blurb: "List mutation in detail, and short data problems with comprehensions.", est: 30, pool: ["Lists & Dicts"] }
    ]},
    { title: "Gleam, interpreters and applications", exam: "Final", topics: [
      { id: "functional-programming", lecture: 27, title: "Functional programming", blurb: "Gleam: functions, case, let, lists, and recursion in place of loops.", est: 50 },
      { id: "adts", lecture: 28, title: "Algebraic data types", blurb: "Types with variants, Result, and data that makes bad states impossible.", est: 45 },
      { id: "immutable-data", lecture: 29, title: "Immutable data", blurb: "Memoizing without mutation, external functions, and how programs run.", est: 45 },
      { id: "interpreters", lecture: 30, title: "Interpreters", blurb: "Programs as trees, environments as frames, and eval and apply.", est: 60 },
      { id: "browsers", lecture: 32, title: "Browsers", blurb: "The Document Object Model and how pages are built.", est: 35 },
      { id: "applications", lecture: 33, title: "Applications", blurb: "Structuring a single-page app: model, view, update.", est: 35 }
    ]},
    { title: "SQL and software practice", exam: "Final", topics: [
      { id: "sql", lecture: 34, title: "SQL", blurb: "Declarative programming: select, where, order by.", est: 40 },
      { id: "tables", lecture: 35, title: "Tables", blurb: "Creating tables and joining them.", est: 40 },
      { id: "aggregation", lecture: 36, title: "Aggregation", blurb: "group by, having, and aggregate functions.", est: 40 },
      { id: "testing", lecture: 37, title: "Software testing", blurb: "Writing tests that catch real mistakes.", est: 30 },
      { id: "tracing", lecture: 38, title: "Software tracing", blurb: "Following a program's execution to find a bug.", est: 30 }
    ]},
    { title: "Final review", exam: "Final", topics: [
      { id: "final-review", title: "Mixed review", blurb: "Mixed practice across every unit.", est: 60 }
    ]}
  ]
};
/* Official course materials for each topic, from the Fall 2026 calendar at
   cs61a.org/fa26. These open in a new tab so the app stays where it is.
   video = the lecture's YouTube playlist, slides = the PDF, page = lecture page. */
window.COURSE.links = {
  "functions": {"video": "https://www.youtube.com/watch?v=gNv81_4X0uU&list=PL6BsET-8jgYULSxiV2garZ0FxbnXR08MP&index=1", "slides": "https://cs61a.org/fa26/assets/lec/02-Functions.pdf", "page": "https://cs61a.org/fa26/lectures/02-functions/"},
  "control": {"video": "https://www.youtube.com/watch?v=IPec2A7j2bY&list=PL6BsET-8jgYVCz97Y75GRXSWbb4sTpDIR", "slides": "https://cs61a.org/fa26/assets/lec/03-Control.pdf", "page": "https://cs61a.org/fa26/lectures/03-control/"},
  "hof": {"video": "https://www.youtube.com/watch?v=pveIuZT0GJE&list=PL6BsET-8jgYXvcnnEX7x2_USaYug9xZFv", "slides": "https://cs61a.org/fa26/assets/lec/04-Higher-Order_Functions.pdf", "page": "https://cs61a.org/fa26/lectures/04-higher-order-functions/"},
  "environments": {"video": "https://www.youtube.com/watch?v=1P2UgdAWwYg&list=PL6BsET-8jgYXTuSlJNYQS740YMCRHT79g", "slides": "https://cs61a.org/fa26/assets/lec/05-Environments.pdf", "page": "https://cs61a.org/fa26/lectures/05-environments/"},
  "abstraction": {"video": "https://www.youtube.com/watch?v=PKlgS5eofNY&list=PL6BsET-8jgYVSwKGjsM9y1j8RQsRwtDy3", "slides": "https://cs61a.org/fa26/assets/lec/06-Functional_Abstraction.pdf", "page": "https://cs61a.org/fa26/lectures/06-abstraction/"},
  "function-examples": {"video": "https://www.youtube.com/watch?v=guc-Q1x2vAY&list=PL6BsET-8jgYX6yuG9s7zO8GA1xHwHARFX", "slides": "https://cs61a.org/fa26/assets/lec/07-Midterm_1_Review_Part_1.pdf", "page": "https://cs61a.org/fa26/lectures/07-function-examples/"},
  "recursion": {"video": "https://www.youtube.com/watch?v=B2_8t2jyvX0&list=PL6BsET-8jgYUUBHIgUAqjrMUoPCGQcYdl", "slides": "https://cs61a.org/fa26/assets/lec/09-Recursion.pdf", "page": "https://cs61a.org/fa26/lectures/09-recursion/"},
  "tree-recursion": {"video": "https://www.youtube.com/watch?v=VYYkJ1OLXBw&list=PL6BsET-8jgYUUWPap4etQjZVWlWUeFxn0", "slides": "https://cs61a.org/fa26/assets/lec/10-Tree_Recursion.pdf", "page": "https://cs61a.org/fa26/lectures/10-tree-recursion/"},
  "sequences": {"video": "https://www.youtube.com/watch?v=-Q45UcQ2XJk&list=PL6BsET-8jgYVfI7chdrXciKy8CP10tOcl", "slides": "https://cs61a.org/fa26/assets/lec/11-Sequences.pdf", "page": "https://cs61a.org/fa26/lectures/11-sequences/"},
  "containers": {"video": "https://www.youtube.com/watch?v=aSqOiUZg7kQ&list=PL6BsET-8jgYW50w7isVJS3YumstvFX1LY", "slides": "https://cs61a.org/fa26/assets/lec/12-Containers.pdf", "page": "https://cs61a.org/fa26/lectures/12-containers/"},
  "objects": {"video": "https://www.youtube.com/watch?v=Q-CewobDFZM&list=PLF3WGnKY88iQ", "slides": "https://cs61a.org/fa26/assets/lec/13-Objects.pdf", "page": "https://cs61a.org/fa26/lectures/13-objects/"},
  "linked-lists": {"video": "https://www.youtube.com/watch?v=LbqHl278hcQ&list=PLO9sS0wuGDK0", "slides": "https://cs61a.org/fa26/assets/lec/14-Linked_Lists.pdf", "page": "https://cs61a.org/fa26/lectures/14-linked-lists/"},
  "trees": {"video": "https://www.youtube.com/watch?v=pTPDmMH9dbs&list=PLCWEE1T0BmmA", "slides": "https://cs61a.org/fa26/assets/lec/15-Trees.pdf", "page": "https://cs61a.org/fa26/lectures/15-trees/"},
  "problem-solving": {"slides": "https://cs61a.org/fa26/assets/lec/17-Problem_Solving.pdf", "page": "https://cs61a.org/fa26/lectures/17-problem-solving/"},
  "mutation": {"video": "https://www.youtube.com/watch?v=qwO1AMKpKDY&list=PLPrA7aKz8SYg", "slides": "https://cs61a.org/fa26/assets/lec/18-Mutation.pdf", "page": "https://cs61a.org/fa26/lectures/18-mutation/"},
  "classes": {"video": "https://www.youtube.com/watch?v=XdRZkeCRXs4&list=PL6BsET-8jgYVz2dLlWRsktOrtqO8wWRsy", "slides": "https://cs61a.org/fa26/assets/lec/19-Classes.pdf", "page": "https://cs61a.org/fa26/lectures/19-classes/"},
  "attributes": {"video": "https://www.youtube.com/watch?v=mimP7cNrSHA&list=PL6BsET-8jgYVhCKr4EHUE9mw9kcH7Kg7Y", "slides": "https://cs61a.org/fa26/assets/lec/20-Attributes.pdf", "page": "https://cs61a.org/fa26/lectures/20-attributes/"},
  "inheritance": {"video": "https://www.youtube.com/watch?v=Bqpe1iyq5vE&list=PLH902kY1ixw8", "slides": "https://cs61a.org/fa26/assets/lec/21-Inheritance.pdf", "page": "https://cs61a.org/fa26/lectures/21-inheritance/"},
  "iterators": {"video": "https://www.youtube.com/watch?v=On-kFyFp8HY&list=PL6BsET-8jgYW7stiut93PHxGP6_QgBzVQ", "slides": "https://cs61a.org/fa26/assets/lec/22-Iterators.pdf", "page": "https://cs61a.org/fa26/lectures/22-iterators/"},
  "generators": {"video": "https://www.youtube.com/watch?v=DyXPnQuaa0w&list=PL6BsET-8jgYXnY-7vDJXIv2N5xW98rJTZ", "slides": "https://cs61a.org/fa26/assets/lec/23-Generators.pdf", "page": "https://cs61a.org/fa26/lectures/23-generators/"},
  "efficiency": {"video": "https://www.youtube.com/watch?v=DWhsOSHjY98&list=PLEIWw8-Yt9yo", "slides": "https://cs61a.org/fa26/assets/lec/24-Efficiency.pdf", "page": "https://cs61a.org/fa26/lectures/24-efficiency/"},
  "object-examples": {"video": "https://www.youtube.com/watch?v=tpfpNR3u4zk&list=PLKBLCkthVkYU", "slides": "https://cs61a.org/fa26/assets/lec/25-Data_Examples.pdf", "page": "https://cs61a.org/fa26/lectures/25-object-examples/"},
  "functional-programming": {"video": "https://www.youtube.com/watch?v=6kL4Hf4tMOg&list=PLae30RgoM-C4", "slides": "https://cs61a.org/fa26/assets/lec/27-Functional_Programming.pdf", "page": "https://cs61a.org/fa26/lectures/27-functional-programming/"},
  "adts": {"video": "https://www.youtube.com/watch?v=ANuCSNT9Iq0&list=PLZnD6lXEx3MI", "slides": "https://cs61a.org/fa26/assets/lec/28-Algebraic_Data_Types.pdf", "page": "https://cs61a.org/fa26/lectures/28-algebraic-data-types/"},
  "immutable-data": {"video": "https://www.youtube.com/watch?v=8RqnvcHEsW4&list=PLFUbuZx7kyQU", "slides": "https://cs61a.org/fa26/assets/lec/29-Immutable-Data.pdf", "page": "https://cs61a.org/fa26/lectures/29-immutable-data/"},
  "interpreters": {"video": "https://www.youtube.com/watch?v=eWdsyVIALQ8&list=PLTyzwiLR_TYg", "slides": "https://cs61a.org/fa26/assets/lec/30-Interpreters.pdf", "page": "https://cs61a.org/fa26/lectures/30-interpreters/"},
  "browsers": {"video": "https://www.youtube.com/watch?v=F14KIs5T_Kw&list=PLfjnIJLIo0e4", "slides": "https://cs61a.org/fa26/assets/lec/32-Browsers.pdf", "page": "https://cs61a.org/fa26/lectures/32-browsers/"},
  "applications": {"slides": "https://cs61a.org/fa26/assets/lec/33-Applications.pdf", "page": "https://cs61a.org/fa26/lectures/33-applications/"},
  "sql": {"video": "https://www.youtube.com/watch?v=lombSNkvRR4&list=PL6BsET-8jgYXiGEfLQkDfkGOBqOfb_up7", "slides": "https://cs61a.org/fa26/assets/lec/34-SQL.pdf", "page": "https://cs61a.org/fa26/lectures/34-sql/"},
  "tables": {"video": "https://www.youtube.com/watch?v=iVhtiPdOSOU&list=PL6BsET-8jgYXDgyR3XJj9T8XS5nDp2nt6"},
  "aggregation": {"video": "https://www.youtube.com/watch?v=gkAZMbzO5L8&list=PL6BsET-8jgYXazaYcmadXIjJApjL-DFET"}
};
window.LESSONS = window.LESSONS || {};
