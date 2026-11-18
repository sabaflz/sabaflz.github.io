/*
  lessons/probability.js: Lecture 16, Introduction to Discrete Probability (Note 16).
  Follows the note and handout: random experiments, sample spaces and
  probability spaces, events, uniform spaces (probability = counting), biased
  coins (non-uniform), two dice, why yOyR beats nOyR for dice, poker hands
  (order or no order both work without replacement), balls and bins, the
  birthday paradox, and the four-step recipe.
  Every probability checked by enumeration in Python with exact fractions.
*/
window.LESSONS["probability"] = {
  minutes: 19,
  boards: {
    space: [
      "Random experiment: e.g. flip a coin 4 times.",
      "Sample space Ω = all outcomes:  {HHHH, HHHT, …, TTTT},  |Ω| = 2⁴ = 16",
      "",
      "Probability space: Ω plus a number ℙ[ω] for each outcome ω, with",
      "  0 ≤ ℙ[ω] ≤ 1  for every ω",
      "  Σ_{ω ∈ Ω} ℙ[ω] = 1",
      "",
      "Uniform space: ℙ[ω] = 1/|Ω| for every ω.  Fair coin, 4 flips: each outcome 1/16."
    ],
    event: [
      "Event A = a subset of Ω.   ℙ[A] = Σ_{ω ∈ A} ℙ[ω]",
      "",
      "A = exactly 2 heads in 4 fair flips",
      "  = {HHTT, HTHT, HTTH, THHT, THTH, TTHH},  |A| = C(4, 2) = 6",
      "  ℙ[A] = 6 × 1/16 = 3/8",
      "",
      "Uniform space:  ℙ[A] = |A| / |Ω|        (probability is counting!)",
      "Complement Ā = outcomes not in A:   ℙ[Ā] = 1 − ℙ[A]"
    ],
    coins: [
      "Biased coin:  ℙ[H] = p,  ℙ[T] = 1 − p,  flipped n times",
      "A sequence with r heads has probability  pʳ (1 − p)ⁿ⁻ʳ",
      "",
      "p = 2/3, n = 4:   ℙ[HHHH] = (2/3)⁴ = 16/81     ℙ[TTHH] = (1/3)²(2/3)² = 4/81",
      "All four the same:  (2/3)⁴ + (1/3)⁴ = 17/81",
      "Exactly 2 heads:  C(4, 2) (2/3)²(1/3)² = 6 × 4/81 = 8/27",
      "",
      "Exactly r heads in n flips:  C(n, r) pʳ (1 − p)ⁿ⁻ʳ"
    ],
    dice: [
      "Two fair dice:  Ω = {(i, j) : 1 ≤ i, j ≤ 6},  |Ω| = 36, uniform",
      "Sum ≥ 10:  (4,6) (5,5) (6,4) (5,6) (6,5) (6,6)  →  6/36 = 1/6",
      "At least one 6:  36 − 25 = 11 outcomes  →  11/36",
      "",
      "nOyR view: Ω' = {{1,1}, {1,2}, …, {6,6}}, only 21 outcomes, but NOT uniform:",
      "  ℙ[{1,1}] = 1/36   while   ℙ[{1,2}] = 2/36",
      "Use ordered outcomes (yOyR) with replacement, so the space is uniform."
    ],
    poker: [
      "5-card hand from 52.  Unordered: |Ω| = C(52, 5) = 2,598,960, uniform",
      "Flush (all one suit):  |A| = 4 × C(13, 5) = 4 × 1287 = 5148",
      "  ℙ[flush] = 5148 / 2,598,960 ≈ 0.002",
      "",
      "Ordered: |Ω| = 52·51·50·49·48,  |A| = 4 × 13·12·11·10·9",
      "  Same ratio: the extra 5! cancels top and bottom.",
      "Without replacement, ordered and unordered both give uniform spaces."
    ],
    bins: [
      "Throw m labeled balls into n labeled bins, each uniformly, independently",
      "Ω = sequences (b₁, …, bₘ),  |Ω| = nᵐ,  uniform",
      "",
      "20 balls, 10 bins:  ℙ[bin 1 empty] = 9²⁰ / 10²⁰ = (9/10)²⁰ ≈ 0.12",
      "ℙ[bin 1 not empty] = 1 − (9/10)²⁰ ≈ 0.88",
      "In general:  ℙ[bin 1 empty] = (1 − 1/n)ᵐ"
    ],
    birthday: [
      "n people, 365 equally likely birthdays:  |Ω| = 365ⁿ",
      "A = some two share a birthday.   Easier: Ā = all birthdays different",
      "|Ā| = 365 × 364 × … × (365 − n + 1)       (ordered, no repeats)",
      "ℙ[A] = 1 − 365 × 364 × … × (365 − n + 1) / 365ⁿ",
      "",
      "n = 23:  ℙ[A] ≈ 0.507        n = 60:  ℙ[A] ≈ 0.994"
    ],
    recipe: [
      "Every probability problem:",
      "1. What is the sample space Ω?  (the experiment and its outcomes)",
      "2. What is ℙ[ω] for each outcome?  (uniform or not?)",
      "3. Which subset of Ω is the event A?",
      "4. Add up ℙ[ω] over ω ∈ A.  (if uniform: |A| / |Ω|)"
    ]
  },
  steps: [
    { board: "space", hl: [1, 2],
      say: "Probability starts with a random experiment, like flipping a coin 4 times. The sample space, written Ω, is the set of all possible outcomes. Each outcome is called a sample point. For 4 flips there are 2 to the 4, which is 16, outcomes, from HHHH to TTTT.",
      basics: "Ω is the Greek capital letter omega, and ω (lowercase omega) is one outcome. |Ω| means the number of outcomes in Ω." },
    { board: "space", hl: [4, 5, 6, 8],
      say: "A probability space gives every outcome a probability. Each one must be between 0 and 1, and together they must add up to 1. The simplest choice is uniform: every outcome gets 1 over the size of Ω. A fair coin flipped 4 times gives each of the 16 sequences probability 1 over 16.",
      basics: "ℙ[ω] is read \"the probability of ω\". The slides write P(ω) and the notes write ℙ[ω]; they mean the same thing." },
    { board: "event", hl: [1, 3, 4, 5],
      say: "An event is just a subset of the sample space: the outcomes where something you care about happens. Its probability is the sum of the probabilities of its outcomes. Exactly 2 heads in 4 fair flips is a set of 4 choose 2, which is 6, outcomes. Each has probability 1 over 16, so the event has probability 6 over 16, which is 3 over 8.",
      ask: { type: "type", q: "Flip a fair coin 5 times. What is ℙ[exactly 2 heads]? Give a fraction.", answer: "5/16", accept: ["10/32", "0.3125"],
        why: "There are C(5, 2) = 10 outcomes with exactly 2 heads, out of 2⁵ = 32 equally likely outcomes: 10/32 = 5/16." } },
    { board: "event", hl: [7, 8],
      say: "When the space is uniform, the probability of an event is just its size over the size of Ω. So in a uniform space, probability is counting, and everything from the last lecture applies. Also remember the complement: the outcomes not in A. Its probability is 1 minus ℙ of A, which is often much easier to find.",
      tip: "\"At least one\" is the signal to try the complement: ℙ[at least one] = 1 − ℙ[none]." },
    { board: "coins", hl: [1, 2, 4],
      say: "Now a space that is not uniform: a biased coin with heads probability p. A specific sequence with r heads and n minus r tails has probability p to the r times 1 minus p to the n minus r. With p equal to 2 thirds, HHHH has probability 16 over 81, while TTHH has only 4 over 81. Different outcomes, different weights.",
      tip: "In a non-uniform space, |A| / |Ω| is wrong. You must add up the weights ℙ[ω] of the outcomes in A." },
    { board: "coins", hl: [5, 6, 8],
      say: "To get exactly 2 heads with p equal to 2 thirds, notice that every sequence with 2 heads has the same weight, 4 over 81. There are 4 choose 2, which is 6, such sequences, so the answer is 6 times 4 over 81, which is 8 over 27. The same idea gives the general formula: n choose r, times p to the r, times 1 minus p to the n minus r.",
      ask: { type: "type", q: "A coin has ℙ[H] = 1/3. You flip it 3 times. What is ℙ[exactly one head]? Give a fraction.", answer: "4/9", accept: ["12/27", "0.444", "0.4444"],
        why: "C(3, 1) = 3 sequences, each with probability (1/3)(2/3)² = 4/27. Total 3 × 4/27 = 12/27 = 4/9." } },
    { board: "dice", hl: [1, 2, 3],
      say: "Roll two fair dice. Treat the outcomes as ordered pairs, first die then second, so there are 36 of them and the space is uniform. Sum at least 10 has 6 outcomes, so probability 1 over 6. At least one 6 is easiest by complement: 25 pairs have no 6, so 11 do, giving 11 over 36.",
      ask: { type: "type", q: "Roll two fair dice. What is ℙ[the sum is 8]? Give a fraction.", answer: "5/36", accept: ["0.1389", "0.139"],
        why: "The pairs (2,6), (3,5), (4,4), (5,3), (6,2) give 5 outcomes out of 36." } },
    { board: "dice", hl: [5, 6, 7],
      say: "Why ordered pairs? You could list outcomes as unordered multisets instead, which gives only 21 of them. But they are not equally likely: a double one happens 1 way out of 36, while a one and a two happens 2 ways. If you treat those 21 as equally likely, you get wrong answers. With replacement, pretend order matters so the space is uniform.",
      ask: { type: "mc", q: "Someone says: \"There are 21 unordered results for two dice, so ℙ[double six] = 1/21.\" What is wrong?",
        choices: ["There are really 36 unordered results", "The 21 unordered results are not equally likely", "Nothing; 1/21 is right"], answer: 1,
        why: "{6,6} can happen only one way, but {5,6} can happen two ways. The true ℙ[double six] is 1/36." } },
    { board: "poker", hl: [1, 2, 3],
      say: "Poker hands are 5 cards drawn without replacement, and the order you got them in does not matter. So Ω has 52 choose 5 equally likely hands. A flush, all one suit, has 13 choose 5 ways in each of the 4 suits. That gives 5148 flushes, and a probability of about 0.002.",
      basics: "A standard deck has 52 cards: 13 ranks (A, 2, …, 10, J, Q, K) in each of 4 suits (♠ ♥ ♦ ♣)." },
    { board: "poker", hl: [5, 6, 7],
      say: "You could also count ordered hands. Then Ω has 52 times 51 down to 48 outcomes and the flushes number 4 times 13 times 12 down to 9. Both counts carry an extra 5 factorial, which cancels. Without replacement, ordered and unordered spaces are both uniform, so pick whichever is easier. With replacement, use ordered.",
      tip: "Whatever you choose, use the same view for the top and the bottom. Ordered numerator over unordered denominator is a classic way to lose points." },
    { board: "bins", hl: [1, 2, 4, 5],
      say: "Balls and bins is a model you will see all through the course. Throw 20 labeled balls into 10 bins. Each ball picks a bin, so there are 10 to the 20 equally likely outcomes. Bin 1 is empty exactly when every ball picks one of the other 9 bins, which is 9 to the 20 outcomes. That gives 9 tenths to the 20th, about 0.12.",
      ask: { type: "type", q: "You throw 3 balls into 4 bins, each ball uniformly and independently. What is ℙ[bin 1 is empty]? Give a fraction.", answer: "27/64", accept: ["0.4219", "0.422"],
        why: "Each ball avoids bin 1 in 3 of 4 ways: 3³ / 4³ = 27/64." } },
    { board: "bins", hl: [6],
      say: "In general, with m balls and n bins, bin 1 stays empty with probability 1 minus 1 over n, to the m. Coin flipping is the special case of 2 bins, and rolling dice is 6 bins. In computer science, the bins are servers or hash table slots, and the balls are jobs or keys." },
    { board: "birthday", hl: [1, 2, 3, 4],
      say: "The birthday paradox: how likely is it that two people in a group share a birthday? The complement is easier. All different means the first person has 365 options, the next 364, and so on, which is an ordered count without repeats. Divide by 365 to the n, and subtract from 1." },
    { board: "birthday", hl: [6],
      say: "The answer is surprising. With just 23 people, the chance of a shared birthday is already a bit over one half, and with 60 it is over 99 percent. The reason is that 23 people make 253 pairs, and each pair is a chance for a match.",
      ask: { type: "mc", q: "For n people, why is |Ā| = 365 × 364 × … × (365 − n + 1) and not C(365, n)?",
        choices: ["Birthdays can repeat in Ā", "C(365, n) is bigger than 365ⁿ", "Outcomes are ordered: person 1's birthday, person 2's, …"], answer: 2,
        why: "Ω = 365ⁿ treats the people as labeled, so outcomes are ordered sequences. The numerator must also be ordered: ordered with no repeats." } },
    { board: "recipe", hl: [1, 2, 3, 4, 5],
      say: "Every problem in this unit uses the same four steps. Name the sample space. Give each outcome its probability, and decide whether the space is uniform. Write down which outcomes make up the event. Then add up their probabilities, or divide counts if the space is uniform. When intuition and the recipe disagree, trust the recipe.",
      tip: "On exams, write Ω and |Ω| explicitly before counting the event. It forces you to pick ordered or unordered once, and use it on both sides." }
  ],

  check: [
    { type: "type", q: "A fair coin is flipped 6 times. What is ℙ[all six flips are the same]? Give a fraction.", answer: "1/32", accept: ["2/64", "0.03125"],
      why: "Only HHHHHH and TTTTTT, so 2 outcomes out of 2⁶ = 64: 2/64 = 1/32." },
    { type: "type", q: "Roll two fair dice. What is ℙ[the two dice show different numbers]? Give a fraction.", answer: "5/6", accept: ["30/36", "0.8333", "0.833"],
      why: "Complement: 6 doubles out of 36, so 1 − 6/36 = 30/36 = 5/6." },
    { type: "mc", q: "For a non-uniform probability space, which formula always gives ℙ[A]?",
      choices: ["Σ_{ω ∈ A} ℙ[ω]", "|A| / |Ω|", "1 / |A|"], answer: 0,
      why: "The probability of an event is always the sum of its outcomes' probabilities. |A| / |Ω| only works when every outcome has the same probability." },
    { type: "type", q: "A coin has ℙ[H] = 1/3. What is ℙ[HHT] for three flips in that order? Give a fraction.", answer: "2/27", accept: ["0.0741", "0.074"],
      why: "(1/3)(1/3)(2/3) = 2/27." },
    { type: "type", q: "A 5-card hand is dealt from a shuffled 52-card deck. What is ℙ[all five cards are hearts]? Give a fraction in lowest terms.", answer: "33/66640", accept: ["1287/2598960", "0.000495", "0.0005"],
      why: "C(13, 5) / C(52, 5) = 1287 / 2,598,960 = 33/66640 ≈ 0.000495. (A flush in any suit is 4 times this.)" },
    { type: "type", q: "You throw 5 balls into 2 bins (each ball uniformly and independently). What is ℙ[some bin is empty]? Give a fraction.", answer: "1/16", accept: ["2/32", "0.0625"],
      why: "Some bin is empty only if all 5 balls go to bin 1 or all go to bin 2: 2 outcomes out of 2⁵ = 32, so 2/32 = 1/16." },
    { type: "mc", q: "Two people pick birthdays uniformly from 365 days. Which is ℙ[they match]?",
      choices: ["2/365", "1/365", "1/365²"], answer: 1,
      why: "Whatever day the first person has, the second matches it with probability 1/365. Counting: 365 matching pairs out of 365²." },
    { type: "mc", q: "When drawing cards without replacement, can you count hands as ordered sequences instead of sets?",
      choices: ["Yes, if you also count the event as ordered; the k! cancels", "No, it always gives the wrong answer", "Only for flushes"], answer: 0,
      why: "Both framings give uniform spaces. Every set of k cards matches exactly k! sequences, so the ratio is the same." }
  ],

  deepen: [
    { id: "prob_fullhouse", title: "Full house", source: "Classic poker hand, in the style of Note 16",
      desc: ["A full house is a 5-card hand with three cards of one rank and two cards of another rank, like K♠ K♥ K♦ 7♣ 7♥.",
        "You are dealt 5 cards from a shuffled standard deck. What is ℙ[full house]? Give the exact fraction."],
      answer: "6/4165", accept: ["3744/2598960", "0.00144", "0.0014", "0.001441"], answerLabel: "ℙ[full house] =",
      hints: ["The space is uniform with |Ω| = C(52, 5). Build a full house by a sequence of choices.",
        "Choose the rank of the triple, then which 3 of its 4 suits. Then choose the rank of the pair, then 2 of its 4 suits.",
        "The pair's rank must differ from the triple's rank, so it has 12 options. The two ranks play different roles, so don't divide by 2."],
      solution: [
        "Ω: all 5-card hands, |Ω| = C(52, 5) = 2,598,960, each equally likely.",
        "Build a full house: rank of the triple (13 ways), suits for the triple C(4, 3) = 4, rank of the pair (12 ways, any other rank), suits for the pair C(4, 2) = 6.",
        "Each full house is built exactly once this way, since the triple and the pair are told apart by size.",
        "|A| = 13 × 4 × 12 × 6 = 3744.",
        "ℙ[full house] = 3744 / 2,598,960 = 6/4165 ≈ 0.00144.",
        "Common mistake: C(13, 2) × 4 × 6 = 1872 picks the two ranks together and loses which one is the triple. It undercounts by a factor of 2."
      ],
      explain: "Build the hand by an ordered list of choices and check that each hand is made exactly once. Divide only when two choices are truly interchangeable." },
    { id: "prob_max", title: "The largest of four dice", source: "Original question",
      desc: ["You roll 4 fair six-sided dice. What is the probability that the largest number showing is exactly 4?"],
      answer: "175/1296", accept: ["0.135", "0.1350", "0.13503"], answerLabel: "ℙ[max = 4] =",
      hints: ["Counting \"max is exactly 4\" directly is messy. What about \"max is at most 4\"?",
        "\"Max ≤ 4\" means every die shows 1 to 4. How many such outcomes are there?",
        "Max = 4 exactly means max ≤ 4 but not max ≤ 3."],
      solution: [
        "Ω: ordered 4-tuples of die values, |Ω| = 6⁴ = 1296, uniform.",
        "Max ≤ 4: every die is in {1, 2, 3, 4}, so 4⁴ = 256 outcomes.",
        "Max ≤ 3: every die is in {1, 2, 3}, so 3⁴ = 81 outcomes.",
        "{max = 4} = {max ≤ 4} minus {max ≤ 3}, and {max ≤ 3} is inside {max ≤ 4}.",
        "So |A| = 256 − 81 = 175, and ℙ[max = 4] = 175/1296 ≈ 0.135.",
        "(Checked by listing all 1296 outcomes.)"
      ],
      explain: "\"Exactly\" is often \"at most\" minus \"at most one less\". The \"at most\" events are easy products." },
    { id: "prob_onto", title: "No empty bin", source: "Original question, in the style of Note 16 (balls and bins)",
      desc: ["You throw 5 labeled balls into 3 labeled bins, each ball landing in a uniformly random bin, independently.",
        "What is the probability that no bin is empty? Count by cases (no inclusion-exclusion needed)."],
      answer: "50/81", accept: ["150/243", "0.617", "0.6173"], answerLabel: "ℙ[no bin empty] =",
      hints: ["|Ω| = 3⁵ = 243. If no bin is empty, how can 5 balls be split among 3 bins? List the possible bin sizes.",
        "The sizes are 3, 1, 1 or 2, 2, 1 in some order. Count each shape separately.",
        "For 2, 2, 1: pick the bin with 1 ball, pick its ball, then split the other 4 balls into the two remaining bins, 2 each."],
      solution: [
        "Ω: each ball picks a bin, |Ω| = 3⁵ = 243, uniform.",
        "With no empty bin, the bin sizes are {3, 1, 1} or {2, 2, 1}.",
        "Shape 3, 1, 1: pick the bin with 3 balls (3 ways), pick its balls C(5, 3) = 10, give the other 2 balls to the 2 other bins one each (2 ways). Total 3 × 10 × 2 = 60.",
        "Shape 2, 2, 1: pick the bin with 1 ball (3 ways), pick its ball (5 ways), choose which 2 of the other 4 balls go to the lower-numbered remaining bin C(4, 2) = 6. Total 3 × 5 × 6 = 90.",
        "|A| = 60 + 90 = 150, so ℙ[no bin empty] = 150/243 = 50/81 ≈ 0.617.",
        "(Checked by listing all 243 outcomes. You will see a faster route with inclusion-exclusion in Lecture 18: 3⁵ − 3·2⁵ + 3·1⁵ = 150.)"
      ],
      explain: "When an event has a few shapes, split it into disjoint cases and count each with the first rule. Make sure each outcome falls in exactly one case." }
  ]
};
