/*
  course.js: the course map for the CS 70 learning app.

  Topics follow the Fall 2026 lecture calendar at eecs70.org, grouped into
  units by the exam they lead up to. Order in this file = order on the map.
  A topic becomes playable once lessons/<id>.js exists and is listed in
  index.html.

  Topic fields:
    id        short name used in the address, like "induction"
    lecture   lecture number (the order on the course calendar)
    date      day it was taught, as shown on the calendar
    note      course note number(s) it follows
    title     shown on the map
    blurb     one line about what the topic covers
    quiz      the weekly quiz that tests it, if any
    est       planned minutes before the lesson is written. Once a lesson file
              exists, the app works the time out from the lesson itself.
    practice  official discussion and homework problems on this topic:
              [file, problem number, title]. file is "dis05" or "hw04".
              The app links the problem PDF and, when posted, its solutions.
    testOut   levels that may skip this topic
*/
window.COURSE = {
  title: "CS 70",
  term: "Fall 2026",
  site: "https://www.eecs70.org/",
  /* Exams in date order. The first one still ahead is the default exam date. */
  exams: [
    { name: "Midterm", date: "2026-10-15" },
    { name: "Final", date: "2026-12-18" }
  ],
  levels: [
    { id: "first", label: "Learning it for the first time", desc: "Every idea from the start, with extra notes on notation and on how to write a proof." },
    { id: "refresh", label: "I've seen it before", desc: "The full lessons, without the extra notes on notation." },
    { id: "review", label: "Reviewing for an exam", desc: "Go straight to questions. Lessons are there if you need them." }
  ],
  defaultLevel: "first",
  /* minutes used for the time estimates */
  pace: { perCheckQuestion: 1.5, perDeepenProblem: 12, perPracticeProblem: 20 },
  /* Problems whose official solutions are not posted yet (no link shown). */
  noSolutions: ["dis11", "hw11", "dis12", "hw12", "dis13", "hw13"],
  units: [
    { title: "Proofs and logic", exam: "Midterm", topics: [
      { id: "direct-proofs", lecture: 1, date: "Thu 8/27", note: "0, 1", title: "Direct proofs", blurb: "Sets and notation, quantifiers, and proving a claim straight from the definitions.", quiz: "Quiz 0", est: 45,
        practice: [["dis00", 1, "Squaring Fives"], ["hw00", 4, "If, Then"], ["hw00", 5, "Divisibility! Rules?"], ["hw00", 6, "The Tell of the Digits"]] },
      { id: "logic", lecture: 2, date: "Tue 9/1", note: "2", title: "Propositional logic", blurb: "Propositions, connectives, implication and its relatives, truth tables and quantifiers.", quiz: "Quiz 1", est: 45,
        practice: [["dis01", 1, "Propositional Practice"], ["dis01", 2, "Implication"]] },
      { id: "proof-techniques", lecture: 3, date: "Thu 9/3", note: "3", title: "Proof techniques", blurb: "Contraposition, contradiction, cases, and how to tell a real proof from a fake one.", quiz: "Quiz 1", est: 45,
        practice: [["dis01", 3, "Proofs Intro"], ["dis01", 4, "Pebbles"], ["dis01", 5, "Minimum of Two Reals"]] },
      { id: "induction", lecture: 4, date: "Tue 9/8", note: "4", title: "Induction", blurb: "Base case, inductive step, strengthening the hypothesis, and strong induction.", quiz: "Quiz 2", est: 50,
        practice: [["dis02", 3, "Induction Intro"], ["dis02", 4, "Weak is Strong"], ["dis02", 5, "A Coin Game"], ["hw02", 1, "Induction Starter"]] }
    ]},
    { title: "Number theory and cryptography", exam: "Midterm", topics: [
      { id: "modular", lecture: 5, date: "Thu 9/10", note: "5", title: "Modular arithmetic", blurb: "Congruences, arithmetic mod m, inverses, and when an inverse exists.", quiz: "Quiz 2", est: 45,
        practice: [["dis02", 1, "Buzzer Tournament"], ["dis02", 2, "Modular Inverses"], ["hw02", 2, "A Number Theoretic Warm-Up"], ["hw02", 3, "Modular Arithmetic Foundations"], ["hw02", 4, "Check Digits: ISBN"], ["hw02", 7, "Wilson's Theorem"]] },
      { id: "euclid-crt", lecture: 6, date: "Tue 9/15", note: "6", title: "Euclid, FLT and CRT", blurb: "gcd and extended Euclid, Fermat's little theorem, and the Chinese remainder theorem.", quiz: "Quiz 3", est: 55,
        practice: [["dis03", 1, "Music Video"], ["dis03", 2, "Sparsity of Primes"], ["dis03", 3, "Debugging the Chinese Remainder Theorem"], ["dis03", 4, "Euclid's Gallons"], ["hw02", 5, "Fibonacci GCD"], ["hw03", 1, "Introduction to Chinese Remainder Theorem"], ["hw03", 2, "Introduction to Extended Euclid's Algorithm"], ["hw03", 3, "Resetting Counters"]] },
      { id: "rsa", lecture: 7, date: "Thu 9/17", note: "7", title: "RSA", blurb: "Public-key encryption: keys, encrypting, decrypting, and why it works.", quiz: "Quiz 3", est: 45,
        practice: [["dis03", 5, "RSA"], ["dis03", 6, "RSA with Multiple Keys"], ["hw03", 4, "RSA and Fermat's Little Theorem Warm-Up"], ["hw03", 5, "RSA with a Smaller Exponent Modulus"], ["hw03", 6, "RSA Key Recovery"], ["hw03", 7, "Bob's automorphic numbers"]] }
    ]},
    { title: "Polynomials and codes", exam: "Midterm", topics: [
      { id: "polynomials", lecture: 8, date: "Tue 9/22", note: "8", title: "Polynomials", blurb: "Roots, the d + 1 points property, Lagrange interpolation and polynomials over GF(p).", quiz: "Quiz 4", est: 50,
        practice: [["dis04", 1, "Polynomial Fill in the Blank"], ["dis04", 2, "How Many Polynomials?"], ["dis04", 3, "Lagrange Interpolation in Finite Fields"], ["hw04", 2, "A Matter of Degree"], ["hw04", 3, "Lagrange Interpolation"], ["hw04", 5, "Equivalent Polynomials"]] },
      { id: "secret-sharing", lecture: 9, date: "Thu 9/24", note: "8, 9", title: "Secret sharing and error-correcting codes", blurb: "Splitting a secret with a polynomial, erasure errors, general errors and Berlekamp-Welch.", quiz: "Quiz 4", est: 55,
        practice: [["dis04", 4, "Error Correcting Codes and Secret Sharing Intro"], ["dis04", 5, "Berlekamp-Welch Algorithm"], ["dis04", 6, "Secrets in the United Nations"], ["hw04", 1, "Secret Sharing"], ["hw04", 4, "Error Locator"], ["hw04", 6, "Alice and Bob"], ["hw04", 7, "Mixed Signals"], ["hw04", 8, "Unshackled Agents"]] }
    ]},
    { title: "Graphs and stable matching", exam: "Midterm", topics: [
      { id: "graphs", lecture: 10, date: "Tue 9/29", note: "10", title: "Graphs", blurb: "Vertices, edges, degree, paths and cycles, connectivity, and Eulerian tours.", quiz: "Quiz 5", est: 45,
        practice: [["dis05", 1, "Short Graph Proofs"], ["dis05", 4, "Counting Edges"], ["hw05", 2, "Graph Basics"], ["hw05", 3, "Short Answers"]] },
      { id: "graphs-ii", lecture: 11, date: "Thu 10/1", note: "10", title: "Graphs II", blurb: "Trees, planar graphs and Euler's formula, coloring, hypercubes, and induction on graphs.", quiz: "Quiz 5", est: 55,
        practice: [["dis05", 2, "Build-Up Error?"], ["dis05", 3, "Hypercubes"], ["dis05", 5, "Proofs in Graphs"], ["dis05", 6, "Not Everything is Normal: Odd-Degree Vertices"], ["hw05", 4, "Properties of Trees"]] },
      { id: "stable-matching", lecture: 12, date: "Tue 10/6", note: "11", title: "Stable matching", blurb: "The propose and reject algorithm, why it ends in a stable matching, and who it favors.", est: 50,
        practice: [["dis06", 1, "Reverse Preference Stable Matching"], ["hw06", 1, "Stable Matching Basics"], ["hw06", 2, "Universal Preference"], ["hw06", 3, "Pairing Up"], ["hw06", 4, "The Lattice of Stable Matchings"]] }
    ]},
    { title: "Countability and computability", exam: "Final", topics: [
      { id: "countability", lecture: 13, date: "Thu 10/8", note: "12", title: "Countability", blurb: "Bijections, countable sets, Cantor's diagonal argument, and sizes of infinity.", quiz: "Quiz 6", est: 50,
        practice: [["dis07", 1, "Countability Intro"], ["dis07", 2, "Counting Cartesian Products"], ["dis07", 3, "Counting Functions"], ["hw07", 1, "Countability Basics"], ["hw07", 4, "Count It!"]] },
      { id: "computability", lecture: 14, date: "Tue 10/13", note: "13", title: "Computability", blurb: "The halting problem, self-reference, and reductions to show a program cannot exist.", quiz: "Quiz 6", est: 45,
        practice: [["dis07", 4, "Computability Intro"], ["dis07", 5, "Hello World!"], ["dis07", 6, "Code Reachability"], ["hw07", 2, "Computability Basics"], ["hw07", 3, "Countability and the Halting Problem"], ["hw07", 5, "Unprogrammable Programs"]] }
    ]},
    { title: "Counting and probability", exam: "Final", topics: [
      { id: "counting", lecture: 15, date: "Tue 10/20", note: "15", title: "Counting", blurb: "The rules of counting, permutations and combinations, stars and bars, and combinatorial proofs.", quiz: "Quiz 7", est: 55,
        practice: [["dis08", 1, "Intro to Counting"], ["dis08", 3, "Picking Teams"], ["dis08", 5, "Grids and Trees!"], ["hw08", 1, "Counting Basics"], ["hw08", 6, "Don't Copy My Drip"]] },
      { id: "probability", lecture: 16, date: "Thu 10/22", note: "16", title: "Discrete probability", blurb: "Sample spaces, events, uniform probability and computing probabilities by counting.", quiz: "Quiz 7", est: 45,
        practice: [["dis08", 2, "Halloweekend"], ["dis08", 4, "Easter Eggs"], ["hw08", 2, "Probability Basics"], ["hw08", 3, "Counting Your Chances"], ["hw08", 4, "Minesweeper"], ["hw08", 5, "Parking Lots"]] },
      { id: "conditional", lecture: 17, date: "Tue 10/27", note: "17", title: "Conditional probability", blurb: "Conditioning, the product rule, total probability and Bayes' rule.", quiz: "Quiz 8", est: 50,
        practice: [["dis09", 5, "Disease Diagnosis"], ["hw09", 2, "Ghostly Conditions on Your Probability"], ["hw09", 3, "Box of Marbles"]] },
      { id: "events", lecture: 18, date: "Thu 10/29", note: "18", title: "Combinations of events", blurb: "Independence, inclusion-exclusion and the union bound.", quiz: "Quiz 8", est: 50,
        practice: [["dis09", 1, "Movie Archive"], ["dis09", 2, "Pairwise Independence"], ["dis09", 3, "Bag of Coins"], ["dis09", 4, "Balls and Bins, All Day Every Day"], ["dis09", 6, "Boy or Girl Paradox"], ["hw09", 1, "Conditional Probability and Combinations of Events Basics"], ["hw09", 4, "Independent Complements"], ["hw09", 5, "Balls and Bins"], ["hw09", 6, "Last Dining Hall Visit"], ["hw09", 7, "Socks"]] }
    ]},
    { title: "Random variables", exam: "Final", topics: [
      { id: "random-variables", lecture: 19, date: "Tue 11/3", note: "19", title: "Random variables", blurb: "Random variables, distributions, Bernoulli, binomial and expectation.", quiz: "Quiz 9", est: 50,
        practice: [["dis10", 1, "E[1/X] versus 1/E[X]"], ["dis10", 2, "Head Count II"], ["hw10", 1, "Random Variables and Discrete Distributions Basics"], ["hw10", 4, "Distributions Warm-Up"], ["hw10", 5, "Fishy Computations"]] },
      { id: "linearity", lecture: 20, date: "Thu 11/5", note: "20", title: "Linearity of expectation", blurb: "Linearity, indicator variables, joint distributions and independence of random variables.", quiz: "Quiz 9", est: 55,
        practice: [["dis10", 3, "Shuttles and Taxis at Airport"], ["dis10", 4, "Linearity"], ["dis10", 5, "Throwing Frisbees"], ["dis10", 6, "Family Planning"], ["dis10", 7, "Pairwise and Mutual Independence"], ["hw10", 2, "Expectation and Linearity of Expectation Basics"], ["hw10", 3, "Joint Distributions and Independence of RVs Basics"], ["hw10", 6, "Box of Chocolates"], ["hw10", 7, "Testing Model Planes"], ["hw10", 8, "Such High Expectations"], ["hw10", 9, "Swaps and Cycles"], ["hw10", 10, "The CS70 Office Hour Queue"]] },
      { id: "variance", lecture: 21, date: "Tue 11/10", note: "21", title: "Variance", blurb: "Geometric and Poisson distributions, coupon collecting, and variance.", quiz: "Quiz 10", est: 55,
        practice: [["dis11", 1, "Binomial Variance"], ["dis11", 2, "Diversify Your Hand"], ["dis11", 5, "Coupon Collector Variance"], ["hw11", 2, "Independent Indicators Warm-Up"], ["hw11", 3, "Dice Intro"], ["hw11", 5, "Elevator Variance"]] },
      { id: "covariance", lecture: 22, date: "Thu 11/12", note: "22", title: "Covariance and correlation", blurb: "Standardizing, covariance, correlation, and the variance of a sum.", quiz: "Quiz 10", est: 50,
        practice: [["dis11", 3, "Covariance and Correlation Warm-Up"], ["dis11", 4, "Correlation and Independence"], ["hw11", 1, "Variance, Covariance, and Correlation Warm-Up"], ["hw11", 4, "Covariance"], ["hw11", 6, "Double-Check Your Intuition Again"], ["hw11", 7, "Various Variance Problems"], ["hw11", 8, "Indicators, Probabilities, and Positivity"]] },
      { id: "concentration", lecture: 23, date: "Tue 11/17", note: "23", title: "Concentration inequalities", blurb: "Markov's and Chebyshev's inequalities, confidence intervals and the law of large numbers.", quiz: "Quiz 11", est: 50 }
    ]},
    { title: "Continuous probability and Markov chains", exam: "Final", topics: [
      { id: "continuous", lecture: 24, date: "Thu 11/19", note: "slides", title: "Continuous probability", blurb: "Densities and CDFs, the uniform and exponential distributions, and joint densities.", quiz: "Quiz 11", est: 50 },
      { id: "gaussian", lecture: 25, date: "Tue 11/24", note: "slides", title: "Gaussian distribution and the CLT", blurb: "The normal distribution, standardizing, and the central limit theorem.", quiz: "Quiz 11", est: 50 },
      { id: "markov-chains", lecture: 26, date: "Tue 12/1", note: "slides", title: "Markov chains", blurb: "States and transition matrices, hitting times, and the stationary distribution.", est: 55 }
    ]},
    { title: "Final review", exam: "Final", topics: [
      { id: "final-review", title: "Mixed review", blurb: "Mixed exam-style questions across the whole course.", est: 60 }
    ]}
  ]
};

/* Official course materials for each topic. They open in a new tab.
   lecture = recording on bCourses (needs a Berkeley login), note = course note PDF,
   slides = lecture slides, handout = slide handout PDF. */
(function () {
  var A = "https://www.eecs70.org/assets/", B = "https://bcourses.berkeley.edu/courses/1557634/pages/", S = "https://cs70.github.io/fa26-slides/";
  function n(x) { return A + "pdf/notes/n" + x + ".pdf"; }
  window.COURSE.links = {
    "direct-proofs": { lecture: B + "lecture-1-fa25-recording", slides: A + "lec/lecture1.pdf", note: n(1), note2: n(0) },
    "logic": { lecture: B + "lecture-2", note: n(2) },
    "proof-techniques": { lecture: B + "lecture-3", note: n(3) },
    "induction": { lecture: B + "lecture-4", note: n(4) },
    "modular": { lecture: B + "lecture-5", note: n(5) },
    "euclid-crt": { lecture: B + "lecture-6", note: n(6) },
    "rsa": { lecture: B + "lecture-7", note: n(7) },
    "polynomials": { lecture: B + "lecture-8", note: n(8) },
    "secret-sharing": { lecture: B + "lecture-9", slides: A + "lec/lecture9.pdf", note: n(9) },
    "graphs": { lecture: B + "lecture-10", note: n(10) },
    "graphs-ii": { lecture: B + "lecture-11", note: n(10) },
    "stable-matching": { lecture: B + "lecture-12", note: n(11) },
    "countability": { lecture: B + "lecture-13", note: n(12) },
    "computability": { lecture: B + "lecture-14", note: n(13) },
    "counting": { lecture: B + "lecture-15", slides: S + "lec15/", note: n(15) },
    "probability": { lecture: B + "lecture-16", slides: S + "lec16/", handout: A + "lec/lecture16-handout.pdf", note: n(16) },
    "conditional": { lecture: B + "lecture-17", slides: S + "lec17/", handout: A + "lec/lecture17-handout.pdf", note: n(17) },
    "events": { lecture: B + "lecture-18", slides: S + "lec18/", handout: A + "lec/lecture18-handout.pdf", note: n(18) },
    "random-variables": { lecture: B + "lecture-19", slides: S + "lec19/", handout: A + "lec/lecture19-handout.pdf", note: n(19) },
    "linearity": { lecture: B + "lecture-20", slides: S + "lec20/", handout: A + "lec/lecture20-handout.pdf", note: n(20) },
    "variance": { lecture: B + "lecture-21", slides: S + "lec21/", handout: A + "lec/lecture21-handout.pdf", note: n(21) },
    "covariance": { lecture: B + "lecture-22", slides: S + "lec22/", handout: A + "lec/lecture22-handout.pdf", note: n(22) },
    "concentration": { slides: S + "lec23/", handout: A + "lec/lecture23-handout.pdf", note: n(23) },
    "continuous": { slides: S + "lec24/" },
    "gaussian": { slides: S + "lec25/" },
    "markov-chains": { slides: S + "lec26/" }
  };
})();
window.LESSONS = window.LESSONS || {};
