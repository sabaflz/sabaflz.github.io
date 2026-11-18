/*
  lessons/concentration.js: Lecture 23, Concentration inequalities (Note 23).
  Follows the note and the lecture: estimating the bias of a coin, Markov's
  inequality (thought experiments, proof with an indicator, the 3n/4 heads
  example), Chebyshev's inequality (proof through Markov, the kσ form, the
  4/n bound), the sample size n ≥ 1/(4ε²δ), estimating a general mean,
  confidence intervals, and the weak law of large numbers.
*/
window.LESSONS["concentration"] = {
  minutes: 21,
  boards: {
    goal: [
      "Coin with unknown bias p.  Toss it n times.",
      "Sₙ = number of heads,   p̂ = Sₙ / n",
      "𝔼[p̂] = p   (always the right average)",
      "",
      "You can never promise |p̂ − p| < ε for sure (all n tosses could be heads).",
      "Instead ask for:   ℙ[|p̂ − p| ≥ ε] ≤ δ",
      "ε = how much error you allow,   δ = how often you allow to miss"
    ],
    markov: [
      "Markov's inequality.  If X ≥ 0 always, then for every c > 0:",
      "      ℙ[X ≥ c] ≤ 𝔼[X] / c",
      "",
      "Proof:  X ≥ c · I{X ≥ c}  for every outcome",
      "        (right side is 0 when X < c, and c when X ≥ c)",
      "Take expectations:  𝔼[X] ≥ c · 𝔼[I{X ≥ c}] = c · ℙ[X ≥ c]. ∎"
    ],
    markovEx: [
      "Class average 45, scores ≥ 0:   at most 1/2 can score ≥ 90",
      "Average balance $5,000:   at most 1/3 can have ≥ $15,000",
      "",
      "Fair coin, n tosses, X = heads, 𝔼[X] = n/2:",
      "      ℙ[X ≥ 3n/4] ≤ (n/2) / (3n/4) = 2/3",
      "True value for n = 100:  about 2.8 × 10⁻⁷.  Markov is very loose here.",
      "",
      "Markov can be tight:  X = 10μ with prob 1/10, else 0  ⟹  ℙ[X ≥ 10μ] = 1/10"
    ],
    cheb: [
      "Chebyshev's inequality.  For any X with mean μ and every c > 0:",
      "      ℙ[|X − μ| ≥ c] ≤ Var(X) / c²",
      "",
      "Proof:  let Y = (X − μ)².  Then Y ≥ 0 and 𝔼[Y] = Var(X).",
      "        |X − μ| ≥ c  is the same event as  Y ≥ c².",
      "        Markov on Y:  ℙ[Y ≥ c²] ≤ 𝔼[Y] / c² = Var(X) / c². ∎",
      "",
      "With c = kσ:   ℙ[|X − μ| ≥ kσ] ≤ 1/k²",
      "k = 2: ≤ 1/4      k = 3: ≤ 1/9 ≈ 11.1%      k = 1: ≤ 1 (says nothing)"
    ],
    chebCoin: [
      "Fair coin again:  𝔼[X] = n/2,  Var(X) = n · ½ · ½ = n/4",
      "ℙ[X ≥ 3n/4] = ℙ[X − n/2 ≥ n/4]",
      "            ≤ ℙ[|X − n/2| ≥ n/4]        (one side ⊆ both sides)",
      "            ≤ (n/4) / (n/4)² = 4/n",
      "",
      "n = 1000:  Markov says ≤ 2/3,  Chebyshev says ≤ 0.004"
    ],
    sample: [
      "p̂ = (X₁ + … + Xₙ)/n,   Xᵢ ~ Bernoulli(p), independent",
      "Var(p̂) = (1/n²) · n · p(1 − p) = p(1 − p)/n",
      "Chebyshev:  ℙ[|p̂ − p| ≥ ε] ≤ p(1 − p)/(nε²) ≤ 1/(4nε²)",
      "            because p(1 − p) ≤ 1/4 for every p",
      "Want 1/(4nε²) ≤ δ:      n ≥ 1/(4ε²δ)",
      "",
      "ε = 0.1,  δ = 0.05:   n ≥ 500",
      "ε = 0.05, δ = 0.01:   n ≥ 10,000",
      "ε = 0.01, δ = 0.05:   n ≥ 50,000"
    ],
    general: [
      "Estimate any mean μ:   μ̂ = (X₁ + … + Xₙ)/n,  Xᵢ i.i.d.,  Var(Xᵢ) = σ²",
      "𝔼[μ̂] = μ,    Var(μ̂) = σ²/n",
      "ℙ[|μ̂ − μ| ≥ ε] ≤ σ²/(nε²)      so   n ≥ σ²/(ε²δ)  is enough",
      "",
      "Relative error (within εμ):   n ≥ (σ²/μ²) · 1/(ε²δ)",
      "In practice: plug in an upper bound on σ² and a lower bound on μ."
    ],
    ci: [
      "Confidence interval:  [a, b] is a 1 − δ confidence interval for p if",
      "      ℙ[p ∈ [a, b]] ≥ 1 − δ",
      "a and b come from the data, so they are random.  p is a fixed number.",
      "",
      "From Chebyshev:  [p̂ − ε, p̂ + ε]  with  δ = 1/(4nε²)",
      "n = 1,000,000 tosses, 35% heads, ε = 0.05:",
      "      δ = 1/(4 · 10⁶ · 0.0025) = 1/10,000",
      "      so (0.30, 0.40) is a 99.99% confidence interval"
    ],
    lln: [
      "Weak law of large numbers.  X₁, X₂, … i.i.d.,  𝔼[Xᵢ] = μ,  Var(Xᵢ) = σ² < ∞:",
      "      for every ε > 0,   ℙ[ |Sₙ/n − μ| ≥ ε ] → 0  as n → ∞",
      "",
      "Proof:  𝔼[Sₙ/n] = μ,   Var(Sₙ/n) = σ²/n",
      "        Chebyshev:  ℙ[|Sₙ/n − μ| ≥ ε] ≤ σ²/(nε²) → 0. ∎"
    ],
    pitfalls: [
      "Common mistakes:",
      "1. Markov on a variable that can be negative (it fails).",
      "2. Using σ where Chebyshev needs Var(X) = σ², or c where it needs c².",
      "3. Forgetting Chebyshev is two-sided: a one-sided event is a subset of it.",
      "4. Treating a bound as the exact probability.",
      "5. Var(Sₙ) = nσ² needs independence (or at least pairwise uncorrelated)."
    ]
  },
  steps: [
    { board: "goal", hl: [1, 2, 3],
      say: "Here is the question for this lecture. You have a coin with an unknown bias p, and you estimate it by tossing it n times and taking the fraction of heads, p hat. The estimate always has the right expected value, since the expected number of heads is n p. But how close is p hat to p on an actual run?",
      basics: "p̂ is read \"p hat\". A hat marks an estimate computed from data. Sₙ is the number of heads in n tosses, so Sₙ ~ Binomial(n, p)." },
    { board: "goal", hl: [5, 6, 7],
      say: "You can never be certain. Every toss could come up heads, which would make p hat equal to 1. So you ask for something weaker: the chance of being off by ε or more is at most δ. You pick ε, the error you allow, and δ, how often you are willing to miss. The goal is to find how large n must be.",
      tip: "Exam questions often say \"with 95% confidence\". That means δ = 0.05, not 0.95." },
    { board: "markov", hl: [1, 2],
      say: "The first tool is Markov's inequality. If X is never negative, then the probability that X is at least c is at most the expectation of X divided by c. It needs only one number about X, its mean, and it works for every nonnegative random variable.",
      ask: { type: "type", q: "X ≥ 0 and 𝔼[X] = 12. What upper bound does Markov give for ℙ[X ≥ 48]?", answer: "1/4", accept: ["0.25", ".25", "25%"],
        why: "𝔼[X]/c = 12/48 = 1/4." } },
    { board: "markov", hl: [4, 5, 6],
      say: "The proof from the note uses an indicator. For every outcome, X is at least c times the indicator of the event X is at least c. When X is below c the right side is 0, and X is nonnegative. When X is at least c the right side is exactly c. Take the expectation of both sides, and the expectation of an indicator is the probability of its event.",
      basics: "I{X ≥ c} is the indicator of the event X ≥ c: it equals 1 when the event happens and 0 when it does not. Its expectation is ℙ[X ≥ c]." },
    { board: "markovEx", hl: [1, 2],
      say: "The lecture's thought experiments show why this is true. If a class averages 45 and nobody scores below 0, at most half the class can score 90 or more. You make that happen by giving half the class 0 and half exactly 90. In the same way, if the average balance is 5,000 dollars, at most a third of people can have 15,000 or more." },
    { board: "markovEx", hl: [4, 5, 6, 8],
      say: "Now the coin. With n fair tosses, the number of heads has mean n over 2, so Markov says the chance of at least three quarters heads is at most 2 thirds, no matter how large n is. The real probability for 100 tosses is about 3 in 10 million. Markov is very loose here. It is not always loose, though: a variable that is 10 μ with probability one tenth and 0 otherwise makes it an equality.",
      ask: { type: "mc", q: "Why can't you use Markov's inequality on X − 𝔼[X]?",
        choices: ["It can be negative", "Its mean is 0, so you would divide by 0", "It is not a random variable"], answer: 0,
        why: "Markov requires X ≥ 0 for every outcome. X − 𝔼[X] is negative whenever X is below its mean, and the inequality can fail for such variables." } },
    { board: "cheb", hl: [1, 2],
      say: "Chebyshev's inequality uses the variance too. For any random variable with mean μ, the probability of landing c or more away from μ, on either side, is at most the variance over c squared. Small variance means the variable rarely strays far from its mean. It works for every distribution with a finite variance, not just nonnegative ones." },
    { board: "cheb", hl: [4, 5, 6],
      say: "The proof is a trick worth remembering: apply Markov to a new variable. Let Y be X minus μ, squared. Y is never negative, and its expectation is exactly the variance of X. Being c or more away from μ is the same event as Y being at least c squared. Markov on Y finishes it.",
      tip: "If a question asks you to prove a new bound, try what Chebyshev does: find a nonnegative function of X whose expectation you know, and apply Markov to it." },
    { board: "cheb", hl: [8, 9],
      say: "Put c equal to k standard deviations and the variance cancels: the chance of being k or more standard deviations from the mean is at most 1 over k squared. So for any distribution at all, at most a quarter of the mass is 2 or more standard deviations out, and at most a ninth is 3 or more out. With k equal to 1 the bound is 1, which tells you nothing.",
      ask: { type: "type", q: "By Chebyshev, at most what fraction of any distribution can lie 4 or more standard deviations from the mean?", answer: "1/16", accept: ["0.0625", ".0625", "6.25%"],
        why: "1/k² with k = 4 gives 1/16." } },
    { board: "chebCoin", hl: [1, 2, 3, 4],
      say: "Back to three quarters heads. The binomial variance is n times a half times a half, so n over 4. Getting 3n over 4 or more heads means being n over 4 above the mean. That one-sided event is contained in the two-sided event of being n over 4 away in either direction, so Chebyshev applies and gives 4 over n.",
      basics: "If event A is contained in event B, then ℙ[A] ≤ ℙ[B]. Here \"X − μ ≥ c\" implies \"|X − μ| ≥ c\"." },
    { board: "chebCoin", hl: [6],
      say: "Unlike Markov, this bound shrinks as n grows. For 1000 tosses Markov says at most 2 thirds, and Chebyshev says at most 0.004. Knowing the variance buys a lot.",
      ask: { type: "type", q: "Fair coin, n = 400 tosses. What upper bound does Chebyshev give for ℙ[X ≥ 300]?", answer: "0.01", accept: ["1/100", ".01", "1%"],
        why: "300 = 3n/4, so the bound is 4/n = 4/400 = 0.01. Directly: Var = 100, and 300 is 100 above the mean 200, so 100/100² = 0.01." } },
    { board: "sample", hl: [1, 2, 3, 4],
      say: "Now estimate p. Write p hat as the average of n independent indicators. Because they are independent, the variance of the sum is n times p times 1 minus p, and dividing by n squared gives p times 1 minus p over n. Chebyshev then bounds the chance of error ε or more. There is a catch: the bound depends on p, which you do not know. The fix is to use the largest value p times 1 minus p can take, which is a quarter, at p equal to a half." },
    { board: "sample", hl: [5, 7, 8, 9],
      say: "Setting 1 over 4 n ε squared at most δ gives the sample size: n at least 1 over 4 ε squared δ. With ε 0.1 and δ 0.05 that is 500 tosses. To be within 0.01 with 95% confidence you need 50,000. Notice the answer does not depend on the size of the population you are polling.",
      tip: "Memorize the derivation, not only n ≥ 1/(4ε²δ). If a problem tells you p ≤ 0.2, you can use p(1 − p) ≤ 0.16 instead of 1/4 and get a smaller n.",
      ask: { type: "type", q: "How many tosses does Chebyshev say are enough to be within ε = 0.05 of p with probability at least 0.9?", answer: "1000", accept: ["1,000"],
        why: "δ = 0.1, so n ≥ 1/(4 · 0.0025 · 0.1) = 1/0.001 = 1000." } },
    { board: "general", hl: [1, 2, 3, 5, 6],
      say: "The same argument estimates any mean. Average n independent samples. The average has mean μ and variance σ squared over n, so n at least σ squared over ε squared δ is enough. When μ could be any size, ask for relative error instead, within ε times μ. In practice you plug in an upper bound on the variance and a lower bound on the mean. The note's warning: for something like wealth, a few huge values make the variance enormous, and the needed n blows up." },
    { board: "ci", hl: [1, 2, 3],
      say: "The lecture phrases the result as a confidence interval. An interval from a to b is a 1 minus δ confidence interval for p if it contains p with probability at least 1 minus δ. The endpoints come from your data, so they are the random part. The true p is a fixed number that is either inside or not." },
    { board: "ci", hl: [5, 6, 7, 8],
      say: "Chebyshev says p hat plus or minus ε works, with δ equal to 1 over 4 n ε squared. In the lecture's example, a million tosses come up 35% heads. With ε 0.05, δ is 1 over 10,000, so the interval from 0.30 to 0.40 is a 99.99% confidence interval.",
      ask: { type: "mc", q: "You toss a coin 10,000 times and get p̂ = 0.55. Chebyshev with ε = 0.01 gives δ = 1/(4 · 10,000 · 0.0001) = 0.25. What can you say?",
        choices: ["(0.54, 0.56) is at least a 75% confidence interval", "p is in (0.54, 0.56) with probability exactly 25%", "p = 0.55 with probability 75%"], answer: 0,
        why: "δ = 0.25 means the procedure misses by 0.01 or more with probability at most 0.25. So the interval p̂ ± 0.01 is at least a 75% confidence interval. Chebyshev only gives bounds, never exact values." } },
    { board: "lln", hl: [1, 2, 4, 5],
      say: "The weak law of large numbers is the same calculation with n going to infinity. For i.i.d. samples with finite variance, the chance that the sample average is ε or more away from μ goes to 0, for every ε, however small. The proof is one line of Chebyshev: the bound σ squared over n ε squared goes to 0.",
      basics: "i.i.d. means independent and identically distributed: the samples do not affect each other and all have the same distribution." },
    { board: "pitfalls", hl: [1, 2, 3, 4, 5, 6],
      say: "To finish, the mistakes that cost points. Markov needs a nonnegative variable. Chebyshev uses the variance and c squared, not the standard deviation and c. A one-sided question still goes through the two-sided bound, because the one-sided event is inside it. A bound is not the probability. And the variance of a sum is the sum of the variances only for independent, or at least uncorrelated, terms." }
  ],

  check: [
    { type: "type", q: "X ≥ 0 with 𝔼[X] = 3. What is the Markov bound on ℙ[X ≥ 15]?", answer: "1/5", accept: ["0.2", ".2", "20%"],
      why: "𝔼[X]/c = 3/15 = 1/5." },
    { type: "type", q: "X has mean 50 and variance 16. What is the Chebyshev bound on ℙ[|X − 50| ≥ 8]?", answer: "1/4", accept: ["0.25", ".25", "25%"],
      why: "Var(X)/c² = 16/64 = 1/4. Equivalently, 8 is 2 standard deviations (σ = 4), and 1/2² = 1/4." },
    { type: "mc", q: "X has mean 50 and variance 16. Which is a correct lower bound on ℙ[42 < X < 58]?",
      choices: ["At least 3/4", "At least 1/4", "Exactly 0.95"], answer: 0,
      why: "The complement is |X − 50| ≥ 8, which has probability at most 1/4 by Chebyshev. So the event inside has probability at least 1 − 1/4 = 3/4." },
    { type: "mc", q: "In the proof of Chebyshev's inequality, Markov's inequality is applied to which variable?",
      choices: ["X", "|X − μ|", "(X − μ)²"], answer: 2,
      why: "(X − μ)² is nonnegative and its expectation is Var(X), which is exactly what the bound needs. Using |X − μ| would need 𝔼|X − μ|, which is hard to compute." },
    { type: "type", q: "Using n ≥ 1/(4ε²δ), how many samples suffice to estimate p within ε = 0.1 with 99% confidence?", answer: "2500", accept: ["2,500"],
      why: "δ = 0.01: n ≥ 1/(4 · 0.01 · 0.01) = 1/0.0004 = 2500." },
    { type: "mc", q: "To halve the error ε while keeping δ the same, the Chebyshev sample size n…",
      choices: ["doubles", "is multiplied by 4", "stays the same"], answer: 1,
      why: "n is proportional to 1/ε², so halving ε multiplies n by 4. Accuracy is expensive." },
    { type: "mc", q: "Which assumption does the proof of the weak law of large numbers in the note use?",
      choices: ["The Xᵢ are nonnegative", "The Xᵢ are i.i.d. with finite variance", "The Xᵢ are Bernoulli"], answer: 1,
      why: "The proof needs Var(Sₙ/n) = σ²/n, which uses independence and a finite σ². Nonnegativity and the Bernoulli shape are not needed." },
    { type: "mc", q: "For a nonnegative X with mean μ, which is always true?",
      choices: ["ℙ[X ≥ 2μ] ≤ 1/2", "ℙ[X ≥ 2μ] = 1/2", "ℙ[X ≤ 2μ] ≤ 1/2"], answer: 0,
      why: "Markov with c = 2μ gives at most 1/2. It is a bound, and it can be far below 1/2. The third choice is backwards: ℙ[X < 2μ] is at least 1/2." }
  ],

  deepen: [
    { id: "conc_server", title: "Markov versus Chebyshev on a server", source: "Original question",
      desc: ["The number of requests X a server gets in a minute is a nonnegative random variable with 𝔼[X] = 20 and Var(X) = 25.",
        "(a) Use Markov's inequality to bound ℙ[X ≥ 40].",
        "(b) Use Chebyshev's inequality to bound ℙ[X ≥ 40].",
        "(c) Give a lower bound on ℙ[10 < X < 30]."],
      answer: "1/16", accept: ["0.0625", ".0625"], answerLabel: "Chebyshev bound in (b):",
      hints: ["Markov only needs 𝔼[X] and the threshold.", "For Chebyshev, X ≥ 40 means X − 20 ≥ 20, which is inside |X − 20| ≥ 20.", "For (c), the complement of 10 < X < 30 is |X − 20| ≥ 10."],
      solution: [
        "(a) X ≥ 0, so Markov gives ℙ[X ≥ 40] ≤ 𝔼[X]/40 = 20/40 = 1/2.",
        "(b) X ≥ 40 ⟹ X − 20 ≥ 20 ⟹ |X − 20| ≥ 20.",
        "    So ℙ[X ≥ 40] ≤ ℙ[|X − 20| ≥ 20] ≤ Var(X)/20² = 25/400 = 1/16.",
        "(c) The complement of 10 < X < 30 is |X − 20| ≥ 10.",
        "    Chebyshev: ℙ[|X − 20| ≥ 10] ≤ 25/100 = 1/4.",
        "    So ℙ[10 < X < 30] ≥ 1 − 1/4 = 3/4."
      ],
      explain: "Markov uses only the mean, so it is weak. Chebyshev uses the variance and is much stronger here. For an event near the mean, bound its complement and subtract from 1." },
    { id: "conc_poll", title: "How many people to poll", source: "Original question, in the style of Note 23, section 3.1",
      desc: ["You want to estimate the fraction p of students who prefer a new exam format. You ask n students chosen independently and uniformly at random (with replacement), and use p̂ = (number who say yes)/n.",
        "(a) Using Chebyshev's inequality, how large must n be so that ℙ[|p̂ − p| ≥ 0.02] ≤ 0.1, with no information about p?",
        "(b) Suppose you somehow know that p ≤ 0.2. How large must n be now?"],
      answer: "6250", accept: ["6,250"], answerLabel: "n in part (a) =",
      hints: ["Var(p̂) = p(1 − p)/n, so Chebyshev gives ℙ[|p̂ − p| ≥ ε] ≤ p(1 − p)/(nε²).", "With no information, use p(1 − p) ≤ 1/4.", "For (b), p(1 − p) is increasing on [0, 1/2], so on [0, 0.2] it is at most 0.2 · 0.8."],
      solution: [
        "p̂ is an average of n independent Bernoulli(p) indicators, so 𝔼[p̂] = p and Var(p̂) = p(1 − p)/n.",
        "Chebyshev: ℙ[|p̂ − p| ≥ ε] ≤ p(1 − p)/(nε²).",
        "(a) p(1 − p) ≤ 1/4, so it is enough that 1/(4nε²) ≤ δ, that is n ≥ 1/(4ε²δ).",
        "    With ε = 0.02, δ = 0.1:  n ≥ 1/(4 · 0.0004 · 0.1) = 1/0.00016 = 6250.",
        "(b) For p ≤ 0.2, p(1 − p) ≤ 0.2 · 0.8 = 0.16.",
        "    Need 0.16/(nε²) ≤ δ:  n ≥ 0.16/(0.0004 · 0.1) = 4000."
      ],
      explain: "The 1/4 in the formula is the worst case of p(1 − p). Any extra knowledge about p lowers that worst case and the sample size with it." },
    { id: "conc_dice", title: "Averaging dice rolls", source: "Original question",
      desc: ["You roll a fair six-sided die n times and compute the average A of the rolls.",
        "Use Chebyshev's inequality to find the smallest n that guarantees ℙ[|A − 3.5| ≥ 0.5] ≤ 0.05."],
      answer: "234", answerLabel: "smallest n =",
      hints: ["First find the variance of one roll: 𝔼[D²] − 𝔼[D]².", "𝔼[D²] = (1 + 4 + 9 + 16 + 25 + 36)/6 = 91/6.", "Var(A) = Var(D)/n. Then require Var(A)/0.5² ≤ 0.05 and round up."],
      solution: [
        "One roll D:  𝔼[D] = 7/2,  𝔼[D²] = 91/6,  so Var(D) = 91/6 − 49/4 = 35/12.",
        "The rolls are independent, so Var(A) = (1/n²) · n · Var(D) = 35/(12n), and 𝔼[A] = 7/2.",
        "Chebyshev: ℙ[|A − 3.5| ≥ 0.5] ≤ (35/(12n)) / 0.25 = 35/(3n).",
        "Need 35/(3n) ≤ 0.05, that is n ≥ 35/(3 · 0.05) = 700/3 ≈ 233.3.",
        "n must be an integer, so the smallest n Chebyshev guarantees is 234."
      ],
      explain: "This is the weak law of large numbers with numbers in it: the average's variance is σ²/n, and Chebyshev turns that into a sample size. Always round a required n up." }
  ]
};
