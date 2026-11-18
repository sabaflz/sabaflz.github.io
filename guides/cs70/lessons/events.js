/*
  lessons/events.js: Lecture 18, Inclusion-Exclusion and Combinations of Events (Note 18).
  Follows the note and handout: inclusion-exclusion for sets and why it counts
  each element once, independence, mutual independence and the pairwise but
  not mutual example, intersections with the product rule (coins, flush, Monty
  Hall), unions (the Las Vegas dice game), mutually exclusive events, the union
  bound, and truncating inclusion-exclusion.
  Every number checked with exact fractions and enumeration in Python.
*/
window.LESSONS["events"] = {
  minutes: 20,
  boards: {
    pie: [
      "Two sets:   |A₁ ∪ A₂| = |A₁| + |A₂| − |A₁ ∩ A₂|",
      "Three sets: |A₁ ∪ A₂ ∪ A₃| = |A₁| + |A₂| + |A₃|",
      "                          − |A₁ ∩ A₂| − |A₁ ∩ A₃| − |A₂ ∩ A₃|",
      "                          + |A₁ ∩ A₂ ∩ A₃|",
      "General: add singles, subtract pairs, add triples, …, sign (−1)ᵏ⁻¹ for k-way terms",
      "",
      "1 to 100 divisible by 2, 3 or 5:",
      "  50 + 33 + 20 − 16 − 10 − 6 + 3 = 74"
    ],
    why: [
      "Why each element is counted exactly once:",
      "Say x is in exactly m of the sets (m ≥ 1).",
      "x is in a k-way intersection for C(m, k) choices of k sets.",
      "Times counted = C(m, 1) − C(m, 2) + C(m, 3) − … ± C(m, m)",
      "             = 1 − Σ_{k=0}^{m} (−1)ᵏ C(m, k) = 1 − (1 − 1)ᵐ = 1",
      "",
      "Example m = 3:  3 − 3 + 1 = 1 ✓"
    ],
    indep: [
      "A and B are independent if  ℙ[A ∩ B] = ℙ[A] · ℙ[B]",
      "Same thing (ℙ[B] > 0):  ℙ[A | B] = ℙ[A]",
      "",
      "Two dice: A = sum is 7, B = first die is 4",
      "  ℙ[A ∩ B] = ℙ[(4,3)] = 1/36 = (6/36)(6/36) ✓ independent",
      "Two dice: C = sum is 8, B = first die is 4",
      "  ℙ[C ∩ B] = 1/36,  but  ℙ[C]ℙ[B] = (5/36)(1/6) = 5/216 ✗ not independent",
      "Disjoint A, B with ℙ[A], ℙ[B] > 0:  ℙ[A ∩ B] = 0 ≠ ℙ[A]ℙ[B]  → NOT independent"
    ],
    mutual: [
      "A₁, …, Aₙ are mutually independent if for EVERY subset I with |I| ≥ 2:",
      "  ℙ[∩_{i ∈ I} Aᵢ] = ∏_{i ∈ I} ℙ[Aᵢ]",
      "Number of conditions: 2ⁿ − n − 1   (n = 3: 4 conditions, n = 4: 11)",
      "",
      "Flip a fair coin twice. A = 1st is H, B = 2nd is H, C = both flips match",
      "  ℙ[A] = ℙ[B] = ℙ[C] = 1/2",
      "  ℙ[A ∩ B] = ℙ[A ∩ C] = ℙ[B ∩ C] = 1/4 ✓   pairwise independent",
      "  ℙ[A ∩ B ∩ C] = ℙ[HH] = 1/4 ≠ 1/8 ✗       NOT mutually independent"
    ],
    inter: [
      "Intersections:",
      "  Mutually independent:  ℙ[A₁ ∩ … ∩ Aₙ] = ℙ[A₁] · … · ℙ[Aₙ]",
      "  In general (product rule):",
      "  ℙ[A₁ ∩ … ∩ Aₙ] = ℙ[A₁] ℙ[A₂ | A₁] ℙ[A₃ | A₁ ∩ A₂] ⋯ ℙ[Aₙ | A₁ ∩ … ∩ Aₙ₋₁]",
      "",
      "Biased coin (heads p), any sequence with k heads in n flips:  pᵏ (1 − p)ⁿ⁻ᵏ",
      "Heart flush:  (13/52)(12/51)(11/50)(10/49)(9/48);  any flush: 4 times that",
      "Monty Hall:  ℙ[C₁ ∩ P₂ ∩ H₃] = (1/3)(1/3)(1) = 1/9"
    ],
    vegas: [
      "Pick a number 1 to 6. Roll 3 dice. You win if your number shows at least once.",
      "Aᵢ = your number on die i,  ℙ[Aᵢ] = 1/6",
      "Casino: ℙ[win] = 1/6 + 1/6 + 1/6 = 1/2   ✗ (the Aᵢ overlap!)",
      "",
      "PIE: ℙ[A₁ ∪ A₂ ∪ A₃] = 3·(1/6) − 3·(1/36) + 1/216 = 91/216 ≈ 0.42",
      "     (pairs and triples by independence: (1/6)², (1/6)³)",
      "Complement: 1 − ℙ[no die shows it] = 1 − (5/6)³ = 91/216 ✓"
    ],
    bound: [
      "Mutually exclusive (Aᵢ ∩ Aⱼ = ∅ for i ≠ j):  ℙ[∪ Aᵢ] = Σ ℙ[Aᵢ]",
      "",
      "Union bound (any events at all):  ℙ[A₁ ∪ … ∪ Aₙ] ≤ ℙ[A₁] + … + ℙ[Aₙ]",
      "  Vegas game: ℙ[win] ≤ 1/2 (true: 91/216 ≤ 1/2)",
      "  100 parts, each fails w.p. at most 1/10,000:  ℙ[some part fails] ≤ 1/100",
      "",
      "Truncating PIE: first k terms over-estimate for k odd, under-estimate for k even.",
      "  Vegas: 1 term 1/2 ≥ 91/216,  2 terms 5/12 ≤ 91/216"
    ],
    summary: [
      "Intersections of independent events: multiply.",
      "Intersections otherwise: product rule (chain of conditionals).",
      "Unions of disjoint events: add.",
      "Unions of independent events: 1 − ∏ (1 − ℙ[Aᵢ]) via the complement.",
      "Unions in general: inclusion-exclusion, or the union bound as an upper bound.",
      "",
      "Don't confuse: disjoint (can't both happen) vs independent (don't affect each other)."
    ]
  },
  steps: [
    { board: "pie", hl: [1],
      say: "Note 18 starts with a counting tool. To count the elements in a union of two sets, add their sizes. But elements in both sets were counted twice, so subtract the size of the intersection once. This is the principle of inclusion-exclusion, or PIE, for two sets.",
      basics: "A ∪ B (union) is everything in A or B or both. A ∩ B (intersection) is everything in both. |A| is the number of elements of A." },
    { board: "pie", hl: [2, 3, 4, 5],
      say: "For three sets, add the three sizes, subtract the three pairwise intersections, then add back the triple intersection. Elements in all three were added 3 times and subtracted 3 times, so they need to be added once more. In general you alternate: add the singles, subtract the pairs, add the triples, and so on.",
      tip: "The sign of a k-way intersection term is + when k is odd and − when k is even." },
    { board: "pie", hl: [7, 8],
      say: "Example: how many numbers from 1 to 100 are divisible by 2, 3 or 5? There are 50 multiples of 2, 33 of 3, and 20 of 5. Multiples of both 2 and 3 are multiples of 6, and there are 16. Similarly 10 multiples of 10, 6 of 15, and 3 of 30. So the answer is 50 plus 33 plus 20, minus 16, 10 and 6, plus 3, which is 74.",
      ask: { type: "type", q: "How many integers from 1 to 100 are divisible by 2 or by 3?", answer: "67",
        why: "50 multiples of 2, plus 33 multiples of 3, minus 16 multiples of 6: 50 + 33 − 16 = 67." } },
    { board: "why", hl: [1, 2, 3, 4, 5],
      say: "Why does the formula work? Take an element x that lies in exactly m of the sets. It shows up in a k-way intersection once for every choice of k of its m sets, which is m choose k. So the formula counts it m choose 1, minus m choose 2, plus m choose 3, and so on. By the binomial theorem with a equal to minus 1 and b equal to 1, that total is exactly 1. Elements in none of the sets are never counted.",
      basics: "The step uses Σₖ (−1)ᵏ C(m, k) = (1 − 1)ᵐ = 0 from Note 15. Moving the k = 0 term, which is 1, to the other side gives the 1." },
    { board: "indep", hl: [1, 2],
      say: "Now back to probability. Two events are independent if the probability that both happen is the product of their probabilities. When ℙ of B is positive, that is the same as saying ℙ of A given B equals ℙ of A: learning that B happened doesn't change your belief about A.",
      tip: "To show independence on an exam, compute all three numbers ℙ[A], ℙ[B] and ℙ[A ∩ B] and check the product. Intuition about \"not affecting each other\" is not a proof." },
    { board: "indep", hl: [4, 5, 6, 7],
      say: "Roll two dice. Sum is 7 and first die is 4 are independent: both happen only for 4 then 3, probability 1 over 36, and that equals 1 sixth times 1 sixth. But sum is 8 and first die is 4 are not independent: the product would be 5 over 216, not 1 over 36. With sum 7, every first value leaves exactly one way to finish. With sum 8, a first die of 1 leaves no way.",
      ask: { type: "mc", q: "Draw one card from a standard deck. A = the card is an ace, B = the card is a heart. Are A and B independent?",
        choices: ["No: they can happen together", "Yes: ℙ[A ∩ B] = 1/52 = (1/13)(1/4)", "No: ℙ[A] ≠ ℙ[B]"], answer: 1,
        why: "ℙ[A] = 4/52 = 1/13, ℙ[B] = 13/52 = 1/4, and ℙ[A ∩ B] = ℙ[ace of hearts] = 1/52 = 1/13 × 1/4. So they are independent." } },
    { board: "indep", hl: [8],
      say: "A trap: disjoint events are not independent, unless one of them has probability 0. If A and B can't both happen, then learning that B happened tells you for sure that A did not. In symbols, ℙ of A and B is 0, but the product of two positive numbers is not.",
      ask: { type: "mc", q: "Roll one die. A = {roll is 1}, B = {roll is 2}. Are A and B independent?",
        choices: ["Yes, because they are disjoint", "Yes, because they have the same probability", "No, because ℙ[A ∩ B] = 0 but ℙ[A]ℙ[B] = 1/36"], answer: 2,
        why: "A and B are disjoint with positive probabilities, so they are dependent. If you know the roll is 2, you know it is not 1." } },
    { board: "mutual", hl: [1, 2, 3],
      say: "For more than two events, mutual independence asks for the product rule on every subset of at least two of them: every pair, every triple, and so on up to all n. That is 2 to the n, minus n, minus 1 conditions. For three events, that is the three pairs plus the one triple." },
    { board: "mutual", hl: [5, 6, 7, 8],
      say: "Checking only the pairs is not enough. Flip a fair coin twice. Let A be first flip heads, B be second flip heads, and C be the two flips match. Each pair is independent: for example, A and C both happen only for HH, probability 1 quarter, which is 1 half times 1 half. But if A and B both happen, C is certain. So ℙ of all three is 1 quarter, not 1 eighth. These events are pairwise independent but not mutually independent.",
      ask: { type: "type", q: "How many conditions (equations) does mutual independence of 4 events require?", answer: "11", accept: ["eleven"],
        why: "2⁴ − 4 − 1 = 11: six pairs, four triples, and one four-way condition." } },
    { board: "inter", hl: [1, 2, 3, 4],
      say: "Combinations of events. Intersections are easy for mutually independent events: just multiply. For events that are not independent, use the product rule from the last lecture. Each factor is a conditional probability given everything before it." },
    { board: "inter", hl: [6, 7, 8],
      say: "This is why a biased coin's sequence with k heads has probability p to the k times 1 minus p to the n minus k: flips are mutually independent. A heart flush uses the chain: 13 over 52, then 12 over 51, and so on, and times 4 for the suits. In Monty Hall, picking door 1, car behind door 2 and host opening door 3 has probability 1 third, times 1 third, times 1, which is 1 ninth. Multiplying three 1 thirds, which gives 1 over 27, would be wrong because the host's choice depends on the others.",
      ask: { type: "type", q: "Three independent servers each go down with probability 0.1. What is ℙ[all three go down]? Give a decimal.", answer: "0.001", accept: ["1/1000", ".001"],
        why: "By mutual independence: 0.1 × 0.1 × 0.1 = 0.001." } },
    { board: "vegas", hl: [1, 2, 3],
      say: "Now unions. In a casino game, you pick a number and three dice are rolled. You win if your number shows on at least one die. The casino claims you win half the time: 1 sixth for each die, three dice. That can't be right, since with 6 dice the same reasoning would give probability 1. The events overlap: your number can show on two dice at once." },
    { board: "vegas", hl: [5, 6, 7],
      say: "Inclusion-exclusion works for probabilities too, with ℙ in place of the counts. The dice are independent, so each pair has probability 1 over 36 and the triple has 1 over 216. That gives 91 over 216, about 0.42, worse than the casino says. The complement is faster here: you lose only if no die shows your number, which is 5 sixths cubed.",
      tip: "For a union of independent events, the complement is almost always faster: ℙ[at least one] = 1 − ∏ (1 − ℙ[Aᵢ]).",
      ask: { type: "type", q: "Same game with 4 dice. What is ℙ[you win]? Give a fraction.", answer: "671/1296", accept: ["0.5177", "0.518"],
        why: "1 − (5/6)⁴ = 1 − 625/1296 = 671/1296 ≈ 0.518. Inclusion-exclusion gives the same: 4/6 − 6/36 + 4/216 − 1/1296." } },
    { board: "bound", hl: [1, 3, 4, 5],
      say: "Two special cases need only the first term. If the events are mutually exclusive, there are no overlaps, so the probability of the union is the sum. And for any events at all, the union bound says the probability of the union is at most the sum. It needs no independence. It is crude, but in computer science you often only need to show that the chance of anything going wrong is small.",
      basics: "Mutually exclusive means disjoint: no two of the events can happen at the same time." },
    { board: "bound", hl: [7, 8],
      say: "Inclusion-exclusion has 2 to the n, minus 1, terms, which is too many when n is large. If you stop after an odd number of term groups, you get an upper bound, and after an even number, a lower bound. The union bound is just stopping after the first group. In the dice game, one group gives 1 half and two give 5 twelfths, and the true value 91 over 216 is in between.",
      ask: { type: "type", q: "A program runs 20 checks, and each fails with probability at most 0.001. What upper bound does the union bound give on ℙ[at least one check fails]? Give a decimal.", answer: "0.02", accept: ["1/50", ".02", "2/100"],
        why: "ℙ[∪ Fᵢ] ≤ 20 × 0.001 = 0.02, and this needs no independence between the checks." } },
    { board: "summary", hl: [1, 2, 3, 4, 5, 7],
      say: "To sum up: for intersections, multiply if the events are independent, and use the product rule if not. For unions, add if they are disjoint. If they are independent, use the complement. Otherwise use inclusion-exclusion, or the union bound when an upper bound is enough. And keep disjoint and independent apart: they are almost opposites.",
      tip: "Before computing, write which case you are in: \"these events are disjoint, so…\" or \"by mutual independence…\". It shows the grader you know why the step is allowed." }
  ],

  check: [
    { type: "type", q: "ℙ[A] = 0.5, ℙ[B] = 0.4, and A and B are independent. What is ℙ[A ∪ B]? Give a decimal.", answer: "0.7", accept: ["7/10", ".7", "0.70"],
      why: "ℙ[A ∩ B] = 0.5 × 0.4 = 0.2, so ℙ[A ∪ B] = 0.5 + 0.4 − 0.2 = 0.7." },
    { type: "mc", q: "In the inclusion-exclusion formula for 4 events, what is the sign of the term ℙ[A₁ ∩ A₂ ∩ A₃ ∩ A₄]?",
      choices: ["−", "+", "It depends on the events"], answer: 0,
      why: "A k-way term has sign (−1)ᵏ⁻¹. For k = 4 that is −1." },
    { type: "mc", q: "A and B are disjoint, with ℙ[A] = 0.3 and ℙ[B] = 0.2. Which is true?",
      choices: ["ℙ[A ∪ B] = 0.44 and A, B are independent", "ℙ[A ∪ B] = 0.5 and A, B are not independent", "ℙ[A ∪ B] = 0.5 and A, B are independent"], answer: 1,
      why: "Disjoint means ℙ[A ∩ B] = 0, so ℙ[A ∪ B] = 0.3 + 0.2 = 0.5. Independence would need ℙ[A ∩ B] = 0.06, which fails." },
    { type: "mc", q: "A, B, C satisfy ℙ[A ∩ B] = ℙ[A]ℙ[B], ℙ[A ∩ C] = ℙ[A]ℙ[C] and ℙ[B ∩ C] = ℙ[B]ℙ[C]. Must they be mutually independent?",
      choices: ["No: you also need ℙ[A ∩ B ∩ C] = ℙ[A]ℙ[B]ℙ[C]", "Yes: pairwise independence implies mutual", "Yes, if all three have probability 1/2"], answer: 0,
      why: "The two-coin example (first H, second H, flips match) is pairwise independent with each probability 1/2, but ℙ[A ∩ B ∩ C] = 1/4 ≠ 1/8." },
    { type: "type", q: "Each of 3 independent alarms fails to ring with probability 0.2. What is ℙ[at least one alarm rings]? Give a decimal.", answer: "0.992", accept: ["124/125", ".992"],
      why: "Complement: all three fail with probability 0.2³ = 0.008, so 1 − 0.008 = 0.992." },
    { type: "type", q: "How many integers from 1 to 60 are divisible by 4 or by 6? (Careful with the intersection.)", answer: "20",
      why: "15 multiples of 4 and 10 multiples of 6. Numbers divisible by both are multiples of lcm(4, 6) = 12, not 24: there are 5. So 15 + 10 − 5 = 20." },
    { type: "mc", q: "When is the union bound ℙ[A₁ ∪ … ∪ Aₙ] ≤ Σ ℙ[Aᵢ] an equality?",
      choices: ["When the events are independent", "Never", "When the events are mutually exclusive (more precisely, when overlaps have probability 0)"], answer: 2,
      why: "The sum counts overlapping outcomes more than once. With no overlap, nothing is double counted." },
    { type: "type", q: "Roll two fair dice. A = first die is even, B = sum is even. What is ℙ[A ∩ B]? Give a fraction.", answer: "1/4", accept: ["9/36", "0.25"],
      why: "Both happen when both dice are even: 3 × 3 = 9 outcomes, so 9/36 = 1/4. Since ℙ[A] = ℙ[B] = 1/2, A and B are independent." }
  ],

  deepen: [
    { id: "events_lcm", title: "Divisible by 4, 6 or 15", source: "Original question, in the style of Note 18 (inclusion-exclusion)",
      desc: ["Pick an integer uniformly at random from 1 to 600.",
        "What is the probability that it is divisible by at least one of 4, 6 and 15?"],
      answer: "11/30", accept: ["220/600", "0.3667", "0.367"], answerLabel: "ℙ =",
      hints: ["Let D₄, D₆, D₁₅ be the events. Use inclusion-exclusion with three sets, counting multiples in 1 to 600.",
        "A number divisible by both 4 and 6 is a multiple of lcm(4, 6) = 12, not of 24.",
        "The pairwise lcms are 12, 60, 30, and the lcm of all three is 60."],
      solution: [
        "Singles: ⌊600/4⌋ = 150, ⌊600/6⌋ = 100, ⌊600/15⌋ = 40.",
        "Pairs: divisible by 4 and 6 means by lcm 12: 50. By 4 and 15 means by 60: 10. By 6 and 15 means by 30: 20.",
        "Triple: divisible by 4, 6 and 15 means by lcm 60: 10.",
        "|D₄ ∪ D₆ ∪ D₁₅| = 150 + 100 + 40 − 50 − 10 − 20 + 10 = 220.",
        "ℙ = 220/600 = 11/30 ≈ 0.367.",
        "Common mistake: multiplying (4·6 = 24, 6·15 = 90, 4·6·15 = 360) gives 150 + 100 + 40 − 25 − 10 − 6 + 1 = 250, which is wrong because 4, 6 and 15 share factors."
      ],
      explain: "Inclusion-exclusion needs the true intersections. For divisibility, an intersection is the multiples of the lcm, which equals the product only when the numbers are coprime." },
    { id: "events_system", title: "A system of components", source: "Original question, in the style of Note 18 (independence)",
      desc: ["A system has three components that work or fail independently. Component 1 works with probability 0.9, component 2 with probability 0.8, and component 3 with probability 0.95.",
        "Components 1 and 2 are backups for each other (the pair works if at least one of them works). The system works if the pair works and component 3 works.",
        "What is ℙ[the system works]? Give the exact fraction."],
      answer: "931/1000", accept: ["0.931", ".931"], answerLabel: "ℙ[system works] =",
      hints: ["Write S = (W₁ ∪ W₂) ∩ W₃, where Wᵢ is the event that component i works.",
        "The pair fails only if both fail. Independence lets you multiply the failure probabilities.",
        "ℙ[W₁ ∪ W₂] = 1 − (0.1)(0.2). The pair depends only on components 1 and 2, so it is independent of W₃."],
      solution: [
        "Let Wᵢ be the event that component i works. The system works on S = (W₁ ∪ W₂) ∩ W₃.",
        "Pair: ℙ[W₁ ∪ W₂] = 1 − ℙ[W̄₁ ∩ W̄₂] = 1 − (0.1)(0.2) = 0.98, using independence of the failures.",
        "(Or by inclusion-exclusion: 0.9 + 0.8 − 0.9 · 0.8 = 0.98.)",
        "The pair's event is determined by components 1 and 2, which are independent of component 3, so ℙ[S] = 0.98 × 0.95 = 0.931 = 931/1000.",
        "(Checked by listing all 8 work/fail patterns with their probabilities.)",
        "Follow-up: given that the system works, ℙ[component 1 failed] = (0.1 · 0.8 · 0.95) / 0.931 = 0.076/0.931 = 4/49 ≈ 0.082."
      ],
      explain: "Backups (OR) use the complement: the group fails only if all fail. Chains (AND) multiply. Both steps use mutual independence, which you have to be given or justify." },
    { id: "events_hash", title: "How many keys before a collision?", source: "Original question, in the style of Note 18 (union bound)",
      desc: ["You hash k keys into a table with 1,000,000 slots. Each key lands in a uniformly random slot, independently of the others.",
        "Use the union bound to find the largest k for which you can guarantee ℙ[some two keys land in the same slot] ≤ 0.01."],
      answer: "141", answerLabel: "Largest k =",
      hints: ["Make one event for each pair of keys: C_{ij} = keys i and j land in the same slot. A collision is the union of all of these.",
        "ℙ[C_{ij}] = 1/1,000,000, and there are C(k, 2) pairs. The union bound gives ℙ[collision] ≤ C(k, 2)/1,000,000.",
        "You need k(k − 1)/2 ≤ 10,000, that is k(k − 1) ≤ 20,000. Try k near √20,000 ≈ 141."],
      solution: [
        "For keys i < j, let C_{ij} be the event that they land in the same slot. Whatever slot key i lands in, key j matches it with probability 1/10⁶.",
        "{some collision} = the union of all C_{ij}, over C(k, 2) pairs.",
        "Union bound: ℙ[collision] ≤ C(k, 2) · 10⁻⁶ = k(k − 1) / (2 · 10⁶). The events overlap, but the union bound does not care.",
        "We need k(k − 1)/2 ≤ 10,000.",
        "k = 141: 141 · 140 / 2 = 9870 ≤ 10,000 ✓.   k = 142: 142 · 141 / 2 = 10,011 > 10,000 ✗.",
        "So the union bound guarantees ℙ ≤ 0.01 for k up to 141. (The exact value at k = 141 is about 0.00982, just below the bound of 0.00987.)"
      ],
      explain: "To bound \"something goes wrong\", write it as a union of simple bad events and add their probabilities. Pairs of keys are the classic choice, which is why collisions start around √(number of slots) keys." }
  ]
};
