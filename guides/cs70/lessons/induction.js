/*
  lessons/induction.js: Lecture 4, Induction (Note 4).
  Follows the note: the domino picture, the sum of the first n numbers,
  divisibility (n³ − n), strengthening the hypothesis (sum of odd numbers,
  Σ 1/i² ≤ 2 − 1/n), strong induction (postage, prime factorization), and
  the common ways an induction proof goes wrong.

  Shape of every lesson file (see lessons/README.md):
    minutes  planned minutes for the lesson
    boards   named lists of lines shown on the left (math, proof steps)
    steps    { board, hl, say, basics?, tip?, facts?, table?, tree?, ask? }
    check    quick questions: { type "mc" | "type", board?, q, choices?, answer, accept?, why }
    deepen   exam-style problems: { id, title, source, desc, board?, hints, solution, answer?, accept?, explain }
*/
window.LESSONS["induction"] = {
  minutes: 22,
  boards: {
    dominoes: [
      "Goal:  ∀n ∈ ℕ, P(n)",
      "",
      "Base case:       prove P(0)",
      "Inductive step:  prove ∀k ∈ ℕ, P(k) ⟹ P(k + 1)",
      "",
      "P(0) ⟹ P(1) ⟹ P(2) ⟹ P(3) ⟹ …"
    ],
    gauss: [
      "Claim:  ∀n ∈ ℕ,  0 + 1 + 2 + … + n = n(n + 1) / 2",
      "",
      "Base case (n = 0):  left side is 0, right side is 0·1/2 = 0. ✓",
      "Hypothesis:  assume 0 + 1 + … + k = k(k + 1)/2 for some k ≥ 0",
      "Step:  0 + 1 + … + k + (k + 1)",
      "     = k(k + 1)/2 + (k + 1)          (by the hypothesis)",
      "     = (k + 1)(k + 2)/2              (factor out k + 1)",
      "This is the claim for n = k + 1, so P(k) ⟹ P(k + 1). ∎"
    ],
    cube: [
      "Claim:  ∀n ∈ ℕ,  3 | (n³ − n)",
      "",
      "Base case (n = 0):  0³ − 0 = 0, and 3 | 0. ✓",
      "Hypothesis:  3 | (k³ − k)",
      "Step:  (k + 1)³ − (k + 1)",
      "     = k³ + 3k² + 3k + 1 − k − 1",
      "     = (k³ − k) + 3(k² + k)",
      "Both parts are multiples of 3, so 3 | (k + 1)³ − (k + 1). ∎"
    ],
    odd: [
      "Claim:  for n ≥ 1, the sum of the first n odd numbers is n²",
      "1 = 1      1 + 3 = 4      1 + 3 + 5 = 9      1 + 3 + 5 + 7 = 16",
      "",
      "The k-th odd number is 2k − 1.",
      "Hypothesis:  1 + 3 + … + (2k − 1) = k²",
      "Step:  k² + (2k + 1) = (k + 1)²  ✓"
    ],
    strengthen: [
      "Claim:  for n ≥ 1,  Σ_{i=1}^{n} 1/i²  ≤  2",
      "",
      "Try it directly:  assume Σ_{i=1}^{k} 1/i² ≤ 2.",
      "Then Σ_{i=1}^{k+1} 1/i² ≤ 2 + 1/(k + 1)²   … which is more than 2. Stuck.",
      "",
      "Stronger claim:  Σ_{i=1}^{n} 1/i²  ≤  2 − 1/n",
      "Step:  Σ_{i=1}^{k+1} 1/i² ≤ 2 − 1/k + 1/(k + 1)²",
      "       and 1/k − 1/(k + 1)² ≥ 1/(k + 1),  so this is ≤ 2 − 1/(k + 1). ✓"
    ],
    strong: [
      "Strong induction:",
      "Base case:  P(0)",
      "Step:  [P(0) ∧ P(1) ∧ … ∧ P(k)] ⟹ P(k + 1)",
      "",
      "Claim:  every n > 1 is a product of primes",
      "Case 1:  k + 1 is prime. Then it is a product of one prime.",
      "Case 2:  k + 1 = a · b with 2 ≤ a, b ≤ k.",
      "         By the hypothesis, a and b are products of primes,",
      "         so k + 1 = a · b is too. ∎"
    ],
    postage: [
      "Claim:  every n ≥ 12 equals 4x + 5y for some x, y ∈ ℕ",
      "",
      "Base cases:  12 = 4·3     13 = 4·2 + 5     14 = 4 + 5·2     15 = 5·3",
      "Step (k + 1 ≥ 16):  k − 3 ≥ 12, so by the hypothesis k − 3 = 4x + 5y.",
      "                    Then k + 1 = 4(x + 1) + 5y. ∎"
    ],
    pitfalls: [
      "Common mistakes:",
      "1. No base case, or the wrong one (the step alone proves nothing).",
      "2. Assuming what you want to prove: the hypothesis is P(k), not ∀n P(n).",
      "3. The step uses a case the base case does not cover.",
      "4. Building P(k + 1) from P(k) instead of starting from P(k + 1)",
      "   (the build-up error: you may miss some size-(k + 1) cases)."
    ]
  },
  steps: [
    { board: "dominoes", hl: [1],
      say: "Induction is the tool for proving that a statement P of n holds for every natural number n. You cannot check infinitely many cases one at a time, so instead you prove two finite things that together cover all of them.",
      basics: "ℕ is the natural numbers 0, 1, 2, 3 and so on. In CS 70, ℕ starts at 0. P(n) is a statement about n that is either true or false, like \"n² ≥ n\"." },
    { board: "dominoes", hl: [3, 4],
      say: "First the base case: show P of 0 is true. Then the inductive step: show that for every k, if P of k is true, then P of k plus 1 is true. Notice the step does not claim P of k is true. It only says truth passes from one number to the next.",
      tip: "Write the words \"Base case\", \"Inductive hypothesis\" and \"Inductive step\" in your proof. Graders look for all three." },
    { board: "dominoes", hl: [6],
      say: "Picture an infinite row of dominoes. The base case knocks over the first one. The inductive step says each falling domino knocks over the next. Together, every domino falls. That is exactly why the two pieces prove P of n for all n.",
      ask: { type: "mc", q: "Suppose you prove the inductive step P(k) ⟹ P(k + 1) for all k, but P(0) is false. What can you conclude?",
        choices: ["P(n) is true for all n ≥ 1", "Nothing about any particular P(n)", "P(n) is false for all n"], answer: 1,
        why: "The step only moves truth forward. With no domino knocked over first, nothing falls, so you learn nothing about any single P(n). It also does not make them false: P(n) could still be true for some n." } },
    { board: "gauss", hl: [1, 3],
      say: "Here is the first example from the note: the sum 0 plus 1 plus up to n equals n times n plus 1, over 2. The base case is n equals 0, where both sides are 0.",
      facts: [["P(n)", "0 + 1 + … + n = n(n + 1)/2"], ["Checked", "n = 0"]] },
    { board: "gauss", hl: [4, 5, 6],
      say: "For the inductive step, assume the formula holds for some k. That assumption is the inductive hypothesis. Now look at the sum up to k plus 1. Its first part is exactly the sum up to k, which the hypothesis lets you replace with k times k plus 1 over 2.",
      tip: "Point to the exact line where you use the inductive hypothesis, and say so. If you never use it, the proof is not by induction." },
    { board: "gauss", hl: [7, 8],
      say: "Factor out k plus 1 and you get k plus 1, times k plus 2, over 2. That is the formula with n equal to k plus 1. So P of k implies P of k plus 1, and with the base case, the claim holds for every n.",
      ask: { type: "type", q: "Use the formula: what is 1 + 2 + … + 100?", answer: "5050",
        why: "n(n + 1)/2 with n = 100 gives 100 · 101 / 2 = 5050." } },
    { board: "cube", hl: [1, 3, 4],
      say: "Induction also proves divisibility. Claim: 3 divides n cubed minus n for every natural number n. The base case is 0, and 3 divides 0 since 0 is 3 times 0.",
      basics: "a | b, read \"a divides b\", means b = a·q for some integer q. So 3 | 0 is true." },
    { board: "cube", hl: [5, 6, 7, 8],
      say: "Expand k plus 1, cubed, minus k plus 1. Regroup it into k cubed minus k, which is a multiple of 3 by the hypothesis, plus 3 times k squared plus k, which is clearly a multiple of 3. A sum of multiples of 3 is a multiple of 3.",
      ask: { type: "mc", q: "In line 7, which part needs the inductive hypothesis?",
        choices: ["k³ − k", "3(k² + k)", "Both parts"], answer: 0,
        why: "3(k² + k) is a multiple of 3 by its form. Only k³ − k needs the hypothesis 3 | (k³ − k)." } },
    { board: "odd", hl: [1, 2],
      say: "Before proving anything, try small cases. 1, then 1 plus 3 is 4, then 9, then 16. The pattern is perfect squares. Finding the pattern is often the real work, and the proof comes after.",
      tip: "On an exam, writing out n = 1, 2, 3 takes a minute and often shows you both the claim and how the step works." },
    { board: "odd", hl: [4, 5, 6],
      say: "The k plus first odd number is 2k plus 1. Add it to k squared, the hypothesis, and you get k squared plus 2k plus 1, which is k plus 1 squared. The base case here is n equals 1, because the claim starts at 1. Induction can start at any number, as long as the base case matches.",
      ask: { type: "type", q: "What is the sum of the first 12 odd numbers?", answer: "144",
        why: "The claim says it is n² with n = 12, so 144." } },
    { board: "strengthen", hl: [1, 3, 4],
      say: "Sometimes the direct approach gets stuck. Claim: the sum of 1 over i squared, for i from 1 to n, is at most 2. Assume the sum up to k is at most 2. Adding the next term gives something at most 2 plus a bit, and that does not show it stays at most 2. The hypothesis is too weak to carry forward." },
    { board: "strengthen", hl: [6, 7, 8],
      say: "The fix feels backwards: prove something stronger. Claim the sum is at most 2 minus 1 over n. Now the hypothesis gives you room, the 1 over k, to absorb the next term. A stronger hypothesis is easier to use in the step, as long as the stronger statement is still true.",
      tip: "If your step is stuck because the hypothesis gives you too little, look for a stronger statement that implies the one you want. Then prove that one instead.",
      ask: { type: "mc", q: "Why does proving Σ 1/i² ≤ 2 − 1/n also prove Σ 1/i² ≤ 2?",
        choices: ["Because 2 − 1/n ≤ 2 for every n ≥ 1", "Because both have the same base case", "It does not; they are different claims"], answer: 0,
        why: "If the sum is at most 2 − 1/n, and 2 − 1/n is at most 2, then the sum is at most 2." } },
    { board: "strong", hl: [1, 2, 3],
      say: "Strong induction changes the hypothesis: in the step, you may assume P holds for every number from the base up to k, not just for k. It is no more powerful than ordinary induction. The note shows each can be turned into the other. But it is much more convenient when k plus 1 breaks into pieces that are not just k." },
    { board: "strong", hl: [5, 6, 7, 8, 9],
      say: "Every n bigger than 1 is a product of primes. If k plus 1 is prime, done. If not, it is a times b, with both a and b between 2 and k. Ordinary induction only tells you about k, which does not help. Strong induction tells you about a and b, so both are products of primes, and multiplying them gives k plus 1.",
      ask: { type: "mc", q: "Why is ordinary induction (assuming only P(k)) awkward for this proof?",
        choices: ["The factors a and b are usually not equal to k", "Primes are not natural numbers", "There is no base case"], answer: 0,
        why: "You need the claim for a and b, which can be any numbers from 2 to k. Ordinary induction gives it only for k itself." } },
    { board: "postage", hl: [1, 3, 4, 5],
      say: "Strong induction can use more than one base case. Any amount of postage from 12 cents up can be made from 4 and 5 cent stamps. Check 12, 13, 14 and 15 directly. For anything 16 or bigger, k minus 3 is at least 12, so it can be made, and one more 4-cent stamp makes k plus 1.",
      ask: { type: "type", q: "The step jumps back from k + 1 to k − 3. How many base cases does that require?", answer: "4", accept: ["four"],
        why: "The step for k + 1 uses k − 3, which is 4 below it. So the step only works from 16 on, and the four values 12, 13, 14, 15 must be checked by hand." } },
    { board: "pitfalls", hl: [1, 2, 3, 4, 5, 6],
      say: "To finish, the mistakes that cost points most often. Skipping or mismatching the base case. Assuming the whole claim instead of just P of k. Using a fact in the step that the base cases do not cover. And in graph problems, building a bigger object from a smaller one, which may not reach every bigger object. Start from an arbitrary size k plus 1 object and shrink it instead." }
  ],

  check: [
    { type: "mc", q: "In a proof of ∀n ∈ ℕ, P(n) by ordinary induction, what is the inductive hypothesis?",
      choices: ["P(n) is true for all n", "P(k) is true, for one arbitrary k", "P(k + 1) is true"], answer: 1,
      why: "You assume the statement for one arbitrary k and use it to prove P(k + 1). Assuming it for all n would be assuming what you want to prove." },
    { type: "type", q: "Using the formula 0 + 1 + … + n = n(n + 1)/2, what is 1 + 2 + … + 20?", answer: "210",
      why: "20 · 21 / 2 = 210." },
    { type: "mc", board: ["Claim: 2ⁿ ≥ n² for all n ≥ 4", "Step: 2^(k+1) = 2·2ᵏ ≥ 2k² ≥ (k + 1)²"],
      q: "The last inequality 2k² ≥ (k + 1)² holds when…", choices: ["k ≥ 0", "k ≥ 3", "k ≥ 4 only"], answer: 1,
      why: "2k² ≥ (k + 1)² is k² ≥ 2k + 1, which holds for k ≥ 3 (9 ≥ 7). Since the step is used for k ≥ 4, it is fine." },
    { type: "mc", q: "You need P(k − 1) and P(k) to prove P(k + 1). What do you need?",
      choices: ["One base case and ordinary induction", "Two base cases and strong induction", "No base case"], answer: 1,
      why: "The step reaches back two values, so you check the first two values by hand, and you need a hypothesis about more than just k: strong induction." },
    { type: "mc", q: "Which is true about strong induction?",
      choices: ["It proves more theorems than ordinary induction", "Anything provable with it is provable with ordinary induction", "It does not need a base case"], answer: 1,
      why: "The note shows the two are equivalent: strong induction on P is ordinary induction on Q(n) = P(0) ∧ … ∧ P(n)." },
    { type: "mc", q: "Your inductive step is stuck because P(k) does not give enough to prove P(k + 1). A standard fix is…",
      choices: ["Drop the base case", "Prove a stronger statement instead", "Assume P(k + 1) too"], answer: 1,
      why: "Strengthening the hypothesis gives you more to work with in the step, as with Σ 1/i² ≤ 2 − 1/n." },
    { type: "type", q: "Which value of n is the smallest base case for the claim n! > 2ⁿ? (It is false for smaller n ≥ 1.)", answer: "4",
      why: "3! = 6 < 8 = 2³, but 4! = 24 > 16 = 2⁴. So the claim holds from n = 4." }
  ],

  deepen: [
    { id: "ind_geom", title: "A sum of powers of 2", source: "Original question, in the style of Note 4",
      desc: ["Prove by induction that for all n ∈ ℕ, 1 + 2 + 4 + … + 2ⁿ = 2ⁿ⁺¹ − 1.", "Then use it: what is 1 + 2 + 4 + … + 2¹⁰?"],
      answer: "2047", answerLabel: "1 + 2 + … + 2¹⁰ =",
      hints: ["Base case n = 0: the left side is just 1. What is the right side?", "In the step, the sum up to 2ᵏ⁺¹ is the sum up to 2ᵏ, plus 2ᵏ⁺¹.", "2ᵏ⁺¹ − 1 + 2ᵏ⁺¹ = 2 · 2ᵏ⁺¹ − 1."],
      solution: [
        "Let P(n): 1 + 2 + … + 2ⁿ = 2ⁿ⁺¹ − 1.",
        "Base case (n = 0):  left side 1, right side 2¹ − 1 = 1. ✓",
        "Inductive hypothesis:  assume P(k) for some k ∈ ℕ.",
        "Inductive step:  1 + 2 + … + 2ᵏ + 2ᵏ⁺¹",
        "   = (2ᵏ⁺¹ − 1) + 2ᵏ⁺¹        by the hypothesis",
        "   = 2 · 2ᵏ⁺¹ − 1 = 2ᵏ⁺² − 1, which is P(k + 1).",
        "By induction, P(n) holds for all n ∈ ℕ. ∎",
        "With n = 10:  2¹¹ − 1 = 2047."
      ],
      explain: "The same shape as the n(n + 1)/2 proof: split off the last term, use the hypothesis on the rest, simplify." },
    { id: "ind_div", title: "Divisible by 5", source: "Original question, in the style of Theorem 4.2",
      desc: ["Prove that for all n ∈ ℕ, 5 divides 6ⁿ − 1."],
      hints: ["Base case: 6⁰ − 1 = 0.", "Write 6ᵏ⁺¹ − 1 as 6 · 6ᵏ − 1, then add and subtract something to make 6ᵏ − 1 appear.", "6 · 6ᵏ − 1 = 6(6ᵏ − 1) + 5."],
      solution: [
        "Let P(n): 5 | 6ⁿ − 1.",
        "Base case (n = 0):  6⁰ − 1 = 0 = 5 · 0. ✓",
        "Hypothesis:  5 | 6ᵏ − 1, so 6ᵏ − 1 = 5q for some integer q.",
        "Step:  6ᵏ⁺¹ − 1 = 6 · 6ᵏ − 1 = 6(6ᵏ − 1) + 6 − 1 = 6 · 5q + 5 = 5(6q + 1).",
        "So 5 | 6ᵏ⁺¹ − 1. By induction, P(n) holds for all n. ∎"
      ],
      explain: "The trick is to rewrite the k + 1 expression so the k expression appears inside it. You will see the same move with modular arithmetic: 6 ≡ 1 (mod 5), so 6ⁿ ≡ 1." },
    { id: "ind_tromino", title: "Tiling with trominoes", source: "Classic induction problem (also in past CS 70 discussions)",
      desc: ["A 2ⁿ × 2ⁿ grid has one square removed, anywhere. Prove that for every n ≥ 1 the rest can be tiled with L-shaped trominoes (pieces made of 3 squares in an L).",
        "Hint for getting started: split the grid into four 2ⁿ⁻¹ × 2ⁿ⁻¹ quarters."],
      hints: ["Base case n = 1: a 2 × 2 grid with one square missing is exactly one L-tromino.", "In the step, the missing square lies in one of the four quarters. That quarter is handled by the hypothesis. The other three quarters are complete, so they don't fit the hypothesis yet.", "Place one tromino at the center so it covers one corner square of each of the three complete quarters. Now each of those quarters is missing one square."],
      solution: [
        "P(n): every 2ⁿ × 2ⁿ grid with any one square removed can be tiled by L-trominoes.",
        "Base case (n = 1):  the 2 × 2 grid minus one square is one L-tromino. ✓",
        "Hypothesis:  assume P(k) for some k ≥ 1.",
        "Step:  take a 2ᵏ⁺¹ × 2ᵏ⁺¹ grid with one square removed. Split it into four 2ᵏ × 2ᵏ quarters.",
        "The removed square is in one quarter, which can be tiled by the hypothesis.",
        "Place one L-tromino at the center, covering the corner square nearest the center in each of the other three quarters.",
        "Each of those three quarters is now a 2ᵏ × 2ᵏ grid with one square removed, so each can be tiled by the hypothesis.",
        "All four quarters and the center piece tile the grid, so P(k + 1) holds. By induction, P(n) for all n ≥ 1. ∎"
      ],
      explain: "Notice the direction: the proof starts from an arbitrary size-(k + 1) grid and breaks it into smaller grids. That avoids the build-up error." }
  ]
};
