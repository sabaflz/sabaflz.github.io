/*
  course.js: the course map for the CS 61A learning app.

  Order in this file = order on the map. To add a topic, add an object to a
  unit's `topics` list. A topic becomes fully playable once a lesson file
  exists for it (lessons/<id>.js) and it is listed in index.html.

  Topic fields:
    id        short name used in the address, like "recursion"
    title     shown on the map
    blurb     one line about what the topic covers
    pool      categories from the existing practice problem set to use in the
              Practice stage (see ../cs61a-mt3-practice/problems.js)
    testOut   levels that may skip this topic: "python" and/or "review"

  The unit order follows my Fall 2026 guides. Check it against the official
  course calendar before filling in each unit.
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
  units: [
    { title: "Functions", topics: [
      { id: "functions", title: "Expressions, names and functions", blurb: "Call expressions, def, print versus return.", testOut: ["python", "review"] },
      { id: "control", title: "Control", blurb: "if, while, boolean operators and short-circuiting.", testOut: ["python", "review"] },
      { id: "hof", title: "Higher-order functions", blurb: "Functions as arguments and return values, lambda, currying." },
      { id: "environments", title: "Environment diagrams", blurb: "Frames, parents, and how names are looked up." }
    ]},
    { title: "Recursion", topics: [
      { id: "recursion", title: "Recursion", blurb: "Base cases, recursive calls, and trusting the smaller problem.", pool: ["Recursion"] },
      { id: "tree-recursion", title: "Tree recursion", blurb: "More than one recursive call: counting, partitions, paths.", pool: ["Recursion"] }
    ]},
    { title: "Data", topics: [
      { id: "sequences", title: "Lists, slicing and comprehensions", blurb: "Lists, ranges, list comprehensions, dictionaries.", pool: ["Lists & Dicts"], testOut: ["review"] },
      { id: "data-abstraction", title: "Data abstraction", blurb: "Constructors, selectors, and abstraction barriers." },
      { id: "trees", title: "Trees", blurb: "label, branches, and recursion over trees.", pool: ["Trees"] }
    ]},
    { title: "Mutation", topics: [
      { id: "mutability", title: "Mutability", blurb: "Mutating lists and dictionaries, identity versus equality.", pool: ["Mutation & Iterators"] },
      { id: "iterators", title: "Iterators", blurb: "iter, next, and lazy sequences.", pool: ["Mutation & Iterators"] },
      { id: "generators", title: "Generators", blurb: "yield, yield from, recursive generators.", pool: ["Generators"] }
    ]},
    { title: "Objects", topics: [
      { id: "oop", title: "Classes and objects", blurb: "Classes, instances, attributes, methods.", pool: ["OOP"] },
      { id: "inheritance", title: "Inheritance and representation", blurb: "Subclasses, super, repr and str.", pool: ["OOP"] },
      { id: "linked-lists", title: "Linked lists", blurb: "The Link class and recursion over linked lists.", pool: ["Linked Lists"] },
      { id: "mutable-trees", title: "Mutable trees", blurb: "The Tree class and changing trees in place." },
      { id: "efficiency", title: "Efficiency", blurb: "Orders of growth and memoization." }
    ]},
    { title: "Gleam and interpreters", topics: [
      { id: "gleam", title: "Gleam: the language", blurb: "A new language, read through what you know from Python." },
      { id: "gleam-recursion", title: "Gleam: recursion and lists", blurb: "Pattern matching and recursive list processing." },
      { id: "tail-calls", title: "Tail calls", blurb: "Recursion that runs in constant space." },
      { id: "interpreters", title: "Interpreters", blurb: "eval and apply: programs that run programs." }
    ]},
    { title: "Declarative programming", topics: [
      { id: "sql", title: "SQL", blurb: "select, where, joins, and aggregation." }
    ]},
    { title: "Final review", topics: [
      { id: "final-review", title: "Mixed review", blurb: "Mixed practice across every unit." }
    ]}
  ]
};
window.LESSONS = window.LESSONS || {};
