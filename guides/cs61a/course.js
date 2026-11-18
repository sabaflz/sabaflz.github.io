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
      { id: "abstraction", lecture: 6, title: "Abstraction", blurb: "Naming, splitting work into functions, and hiding detail.", est: 35 },
      { id: "function-examples", lecture: 7, title: "Function examples", blurb: "Worked problems that combine everything so far.", est: 30 }
    ]},
    { title: "Recursion and data", exam: "Midterm 2", topics: [
      { id: "recursion", lecture: 9, title: "Recursion", blurb: "Base cases, recursive calls, and trusting the smaller problem.", est: 45, pool: ["Recursion"] },
      { id: "tree-recursion", lecture: 10, title: "Tree recursion", blurb: "More than one recursive call: counting, partitions, paths.", est: 60, pool: ["Recursion"] },
      { id: "sequences", lecture: 11, title: "Sequences", blurb: "Lists, ranges, slicing and list comprehensions.", est: 45, pool: ["Lists & Dicts"], testOut: ["review"] },
      { id: "containers", lecture: 12, title: "Containers", blurb: "Dictionaries, strings, and built-in functions over sequences.", est: 40, pool: ["Lists & Dicts"], testOut: ["review"] },
      { id: "objects", lecture: 13, title: "Objects", blurb: "Values that carry their own behavior: methods and attributes.", est: 35 },
      { id: "linked-lists", lecture: 14, title: "Linked lists", blurb: "The Link class and recursion over linked lists.", est: 50, pool: ["Linked Lists"] },
      { id: "trees", lecture: 15, title: "Trees", blurb: "label, branches, and recursion over trees.", est: 55, pool: ["Trees"] },
      { id: "problem-solving", lecture: 17, title: "Problem solving", blurb: "How to attack an unfamiliar exam problem step by step.", est: 30 }
    ]},
    { title: "Mutation and objects", exam: "Midterm 3", topics: [
      { id: "mutation", lecture: 18, title: "Mutation", blurb: "Changing lists and dictionaries in place, identity versus equality.", est: 50, pool: ["Mutation & Iterators"] },
      { id: "classes", lecture: 19, title: "Classes", blurb: "class, __init__, instances and methods.", est: 45, pool: ["OOP"] },
      { id: "attributes", lecture: 20, title: "Attributes", blurb: "Instance versus class attributes, and how lookup works.", est: 40, pool: ["OOP"] },
      { id: "inheritance", lecture: 21, title: "Inheritance", blurb: "Subclasses, overriding, and super.", est: 45, pool: ["OOP"] },
      { id: "iterators", lecture: 22, title: "Iterators", blurb: "iter, next, and lazy sequences.", est: 40, pool: ["Mutation & Iterators"] },
      { id: "generators", lecture: 23, title: "Generators", blurb: "yield, yield from, recursive generators.", est: 50, pool: ["Generators"] },
      { id: "efficiency", lecture: 24, title: "Efficiency", blurb: "Counting steps and memoization.", est: 40 },
      { id: "object-examples", lecture: 25, title: "Object examples", blurb: "Worked problems with classes, trees and linked lists.", est: 30 }
    ]},
    { title: "Gleam, interpreters and applications", exam: "Final", topics: [
      { id: "functional-programming", lecture: 27, title: "Functional programming", blurb: "Gleam: functions, let, pipes, and no loops.", est: 50 },
      { id: "adts", lecture: 28, title: "Algebraic data types", blurb: "Custom types and pattern matching with case.", est: 45 },
      { id: "immutable-data", lecture: 29, title: "Immutable data", blurb: "Recursion over lists that never change, and tail calls.", est: 45 },
      { id: "interpreters", lecture: 30, title: "Interpreters", blurb: "eval and apply: programs that run programs.", est: 60 },
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
window.LESSONS = window.LESSONS || {};
