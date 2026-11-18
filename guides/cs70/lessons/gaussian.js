/*
  lessons/gaussian.js: Lecture 25, Gaussian distribution and the CLT (slides).
  Follows the slides: the density of Y = aX + b, sums that look like bells,
  the N(μ, σ²) density, Φ and the 68-95-99.7 rule, standardizing, affine
  transformations, mean and variance, sums of independent Gaussians (the
  rotation argument), and the central limit theorem with the fixed-points
  example. Ends with the CLT version of the polling sample size from Lecture 23.
*/
window.LESSONS["gaussian"] = {
  minutes: 20,
  boards: {
    lemma: [
      "Warm-up:  X has density f_X.  Y = aX + b with a > 0.",
      "F_Y(y) = ℙ[aX + b ≤ y] = ℙ[X ≤ (y − b)/a] = F_X((y − b)/a)",
      "Differentiate (chain rule):",
      "   f_Y(y) = f_X((y − b)/a) · (1/a)",
      "",
      "Sum of 4 dice:  𝔼 = 14,  σ ≈ 3.42.   Its PMF already looks like a bell."
    ],
    normal: [
      "X ~ N(μ, σ²)   (Gaussian, normal)  has density",
      "   f(x) = 1/√(2πσ²) · e^(−(x − μ)²/(2σ²))",
      "Bell shaped, symmetric around μ.  The second parameter is the VARIANCE.",
      "",
      "No closed form for the CDF: you look it up.",
      "N(5, 25) has σ = 5:   ℙ[X ≤ 0] = ℙ[X ≤ μ − σ] ≈ 0.1587"
    ],
    rule: [
      "68-95-99.7 rule for any Gaussian:",
      "   ℙ[|X − μ| ≤ σ]  ≈ 0.68",
      "   ℙ[|X − μ| ≤ 2σ] ≈ 0.95",
      "   ℙ[|X − μ| ≤ 3σ] ≈ 0.997",
      "",
      "Chebyshev, for ANY distribution:  ℙ[|X − μ| ≥ 3σ] ≤ 1/9 ≈ 11%",
      "Gaussian:                        ℙ[|X − μ| ≥ 3σ] ≈ 0.3%"
    ],
    phi: [
      "Standard normal:  Z ~ N(0, 1),   f(z) = (1/√(2π)) e^(−z²/2)",
      "Φ(z) = ℙ[Z ≤ z]   (the standard normal CDF)",
      "",
      "Symmetry:   Φ(−z) = 1 − Φ(z),    Φ(0) = 1/2",
      "Values:  Φ(1) ≈ 0.8413   Φ(1.645) ≈ 0.95   Φ(1.96) ≈ 0.975",
      "         Φ(2) ≈ 0.9772   Φ(3) ≈ 0.9987",
      "Two-sided:  ℙ[|Z| ≤ z] = 2Φ(z) − 1"
    ],
    standardize: [
      "Standardize:  X ~ N(μ, σ²)  ⟹  Z = (X − μ)/σ ~ N(0, 1)",
      "So  ℙ[X ≤ x] = Φ((x − μ)/σ)      (x − μ)/σ is the z-score",
      "",
      "Heights ~ N(69, 3²) inches:",
      "   ℙ[height ≤ 64] = Φ(−5/3) ≈ 0.048",
      "   ℙ[height ≥ 76] = 1 − Φ(7/3) ≈ 0.0098 ≈ 1%"
    ],
    affine: [
      "Z ~ N(0, 1)  ⟹  Y = σZ + μ ~ N(μ, σ²)       (by the warm-up lemma)",
      "Y ~ N(μ, σ²) ⟹  (Y − μ)/σ ~ N(0, 1)",
      "Any aX + b of a Gaussian (a ≠ 0) is Gaussian, N(aμ + b, a²σ²).",
      "",
      "𝔼[Z] = 0 (the density is symmetric),   Var(Z) = 𝔼[Z²] = 1 (by parts)",
      "So 𝔼[Y] = σ · 0 + μ = μ,   Var(Y) = σ² · 1 = σ²",
      "",
      "Not true for most families:  Geometric + 1 is not geometric."
    ],
    sum: [
      "X, Y independent N(0, 1).  Joint density (1/(2π)) e^(−(x² + y²)/2)",
      "depends only on the distance from the origin: it is rotation symmetric.",
      "",
      "ℙ[X + Y ≤ z]:  the line x + y = z is at distance z/√2 from the origin.",
      "Rotate it to the vertical line x = z/√2:  ℙ[X ≤ z/√2] = ℙ[√2 X ≤ z]",
      "So X + Y ~ N(0, 2).   Same idea:  aX + bY ~ N(0, a² + b²)",
      "",
      "General:  X₁ ~ N(μ₁, σ₁²), X₂ ~ N(μ₂, σ₂²) independent",
      "   X₁ + X₂ ~ N(μ₁ + μ₂, σ₁² + σ₂²)       (variances add, not σ's)"
    ],
    clt: [
      "Central limit theorem.  X₁, X₂, … i.i.d.,  mean μ,  variance σ² < ∞.",
      "Sₙ = X₁ + … + Xₙ.   As n → ∞:",
      "   (Sₙ − nμ) / (σ√n)  →  N(0, 1)",
      "So for large n:   Sₙ ≈ N(nμ, nσ²),    Sₙ/n ≈ N(μ, σ²/n)",
      "",
      "LLN:  Sₙ/n gets close to μ.",
      "CLT:  says how the error is spread: like a Gaussian, of size σ/√n."
    ],
    fixed: [
      "Shuffle homework, X = number of students who get their own back.",
      "𝔼[X] = 1,  Var(X) = 1   (any class size n ≥ 2)",
      "1000 classes report a total S = 1231.",
      "𝔼[S] = 1000,  Var(S) = 1000,  σ(S) = √1000 ≈ 31.6",
      "z = (1231 − 1000)/31.6 ≈ 7.3",
      "ℙ[S ≥ 1231] ≈ 1 − Φ(7.3) ≈ 1.4 × 10⁻¹³      Something is off with the data."
    ],
    poll: [
      "Polling with the CLT:  p̂ ≈ N(p, p(1 − p)/n)",
      "ℙ[|p̂ − p| ≤ ε] ≈ 2Φ(ε√n / √(p(1 − p))) − 1",
      "95% needs  ε√n / √(p(1 − p)) ≥ 1.96.   Worst case p(1 − p) = 1/4:",
      "   √n ≥ 1.96 / (2ε)",
      "ε = 0.01:   CLT says n ≈ 9604     Chebyshev says n ≥ 50,000",
      "",
      "Chebyshev is a guarantee for every distribution. The CLT is an",
      "approximation for large n, and much less conservative."
    ]
  },
  steps: [
    { board: "lemma", hl: [1, 2, 3, 4],
      say: "The lecture opens with a lemma you will use right away. If Y is a times X plus b, with a positive, go through the CDF. Y at most y is the same event as X at most y minus b, over a. Differentiate both sides, and the chain rule gives the density of Y: the density of X at y minus b over a, times 1 over a.",
      basics: "F is a CDF, f is a density, and f is the derivative of F. The chain rule: d/dy of F((y − b)/a) is f((y − b)/a) · (1/a)." },
    { board: "lemma", hl: [6],
      say: "Now the motivation. Add four dice and the distribution of the sum is a bell shape. Add up the number of fixed points from many random homework shuffles and you see the same bell. Very different starting distributions, same shape once you add many of them. That shape is the Gaussian, and the central limit theorem at the end of this lesson explains why." },
    { board: "normal", hl: [1, 2, 3],
      say: "A Gaussian, or normal, random variable with parameters μ and σ squared has this density. It is a bell centered at μ and symmetric around it. Be careful with the notation: the second parameter is the variance, σ squared, not the standard deviation.",
      ask: { type: "type", q: "X ~ N(5, 25). What is the standard deviation of X?", answer: "5",
        why: "The second parameter is the variance, 25, so σ = √25 = 5." } },
    { board: "normal", hl: [5, 6],
      say: "There is no formula for the area under a Gaussian density, so the CDF has no closed form. You use a table or a calculator. For N of 5 and 25, the value 0 is exactly one standard deviation below the mean, and the chance of being below it is about 0.1587." },
    { board: "rule", hl: [1, 2, 3, 4],
      say: "A rule to memorize: for any Gaussian, about 68% of the probability lies within one standard deviation of the mean, 95% within two, and 99.7% within three. The z-score of a value is how many standard deviations it is from the mean." },
    { board: "rule", hl: [6, 7],
      say: "Compare with Chebyshev from Lecture 23. Chebyshev says at most about 11% can be 3 or more standard deviations out, and that holds for every distribution. For a Gaussian the true figure is about 0.3%. Chebyshev is loose because it has to cover the worst possible distribution.",
      ask: { type: "mc", q: "X ~ N(μ, σ²). About what is ℙ[X > μ + 2σ]?",
        choices: ["About 2.5%", "About 5%", "About 25%"], answer: 0,
        why: "About 95% is within 2σ, so 5% is outside, split equally between the two tails by symmetry: about 2.5% on each side. (More precisely 1 − Φ(2) ≈ 0.0228.)" } },
    { board: "phi", hl: [1, 2, 4],
      say: "The standard normal has mean 0 and variance 1. Its CDF is written capital Phi. By symmetry, Phi of minus z is 1 minus Phi of z, and Phi of 0 is a half. Most exam questions come down to computing a Phi value.",
      basics: "Φ is the Greek capital letter phi. Φ(z) = ℙ[Z ≤ z] for Z ~ N(0, 1)." },
    { board: "phi", hl: [5, 6, 7],
      say: "Keep these values in mind: Phi of 1 is about 0.84, Phi of 1.96 is about 0.975, Phi of 2 is about 0.977, Phi of 3 is about 0.9987. A two-sided probability is 2 Phi of z minus 1. For z equal to 1.96 that gives 0.95, which is where the familiar 1.96 comes from.",
      tip: "One slide writes Φ(3) = 0.997. That number is the two-sided ℙ[|Z| ≤ 3]. The one-sided Φ(3) = ℙ[Z ≤ 3] is about 0.9987. Watch which one a question asks for.",
      ask: { type: "type", q: "Using Φ(1) ≈ 0.8413, what is ℙ[−1 ≤ Z ≤ 1] for Z ~ N(0, 1)? (4 decimal places)", answer: "0.6826", accept: [".6826", "0.683", ".683", "68.26%"],
        why: "2Φ(1) − 1 = 2(0.8413) − 1 = 0.6826, the 68% in the rule." } },
    { board: "standardize", hl: [1, 2],
      say: "To use Phi for any Gaussian, standardize: subtract the mean and divide by the standard deviation. The result is a standard normal. So the probability that X is at most x is Phi of the z-score of x." },
    { board: "standardize", hl: [4, 5, 6],
      say: "The lecture's example: heights are roughly normal with mean 69 inches and standard deviation 3. Being 64 inches or shorter is a z-score of minus 5 thirds, which gives about 4.8%. Being 76 or taller is a z-score of 7 thirds, which gives about 1%.",
      ask: { type: "type", q: "X ~ N(100, 16). Using Φ(1.5) ≈ 0.9332, what is ℙ[X > 106]?", answer: "0.0668", accept: [".0668", "0.067", ".067", "6.68%"],
        why: "σ = 4, so the z-score is (106 − 100)/4 = 1.5, and ℙ[X > 106] = 1 − Φ(1.5) ≈ 1 − 0.9332 = 0.0668." } },
    { board: "affine", hl: [1, 2, 3],
      say: "Why does standardizing give a standard normal? Apply the warm-up lemma to sigma Z plus mu, and you get exactly the N of mu, sigma squared density. Going backwards, subtracting the mean and dividing by sigma returns you to N of 0 and 1. So any scaling and shifting of a Gaussian is still Gaussian." },
    { board: "affine", hl: [5, 6, 8],
      say: "The standard normal has mean 0, because its density is symmetric around 0, and variance 1, by integration by parts. Then linearity gives mean mu and variance sigma squared for sigma Z plus mu. So the two parameters really are the mean and the variance. This is special: a geometric plus 1 is not geometric, and its mean and variance cannot be set separately.",
      ask: { type: "mc", q: "X ~ N(3, 4). What is the distribution of 2X − 1?",
        choices: ["N(5, 16)", "N(5, 8)", "N(6, 16)"], answer: 0,
        why: "Mean 2 · 3 − 1 = 5. Variance 2² · 4 = 16. And an affine function of a Gaussian is Gaussian." } },
    { board: "sum", hl: [1, 2, 4, 5, 6],
      say: "Sums of independent Gaussians are Gaussian, and the proof in the lecture is lovely. The joint density of two independent standard normals depends only on the distance from the origin, so you can rotate any region without changing its probability. The half-plane x plus y at most z has its edge at distance z over root 2. Rotate it to x at most z over root 2. So X plus Y has the same distribution as root 2 times X, which is N of 0 and 2." },
    { board: "sum", hl: [8, 9],
      say: "Shift and scale, and the general rule follows: independent Gaussians add to a Gaussian whose mean is the sum of the means and whose variance is the sum of the variances. Standard deviations do not add.",
      tip: "Var(X + X) = Var(2X) = 4Var(X), but for independent X₁, X₂ with the same distribution, Var(X₁ + X₂) = 2Var(X). Know which situation you are in.",
      ask: { type: "type", q: "X ~ N(1, 9) and Y ~ N(2, 16) are independent. What is the standard deviation of X + Y?", answer: "5",
        why: "Var(X + Y) = 9 + 16 = 25, so σ = 5. Adding the standard deviations, 3 + 4 = 7, is the classic mistake." } },
    { board: "clt", hl: [1, 2, 3, 4],
      say: "Now the central limit theorem. Take i.i.d. random variables with any distribution, as long as the mean and variance are finite. Subtract n mu from the sum and divide by sigma root n, and the result approaches a standard normal. In practice: for large n, the sum is approximately N of n mu, n sigma squared, and the average is approximately N of mu, sigma squared over n.",
      basics: "\"Approaches N(0, 1)\" means ℙ[(Sₙ − nμ)/(σ√n) ≤ z] → Φ(z) for every z." },
    { board: "clt", hl: [6, 7],
      say: "Compare it to the law of large numbers. The law of large numbers says the average gets close to mu. The central limit theorem says how the remaining error is shaped: like a Gaussian with standard deviation sigma over root n.",
      ask: { type: "type", q: "You flip a fair coin 100 times. Using the CLT and Φ(2) ≈ 0.9772, about what is ℙ[heads ≥ 60]?", answer: "0.0228", accept: [".0228", "0.023", ".023", "2.28%"],
        why: "Heads has mean 50 and σ = √(100 · 1/4) = 5. 60 is 2σ above the mean, so the chance is about 1 − Φ(2) ≈ 0.0228." } },
    { board: "fixed", hl: [1, 2, 3, 4, 5, 6],
      say: "The lecture uses this to catch bad data. The number of students who get their own homework back after a shuffle has mean 1 and variance 1. A thousand classes report a total of 1231. By the central limit theorem the total is roughly N of 1000 and 1000, so 1231 has a z-score of about 7.3. The chance of a total that high is around 10 to the minus 13. The data are almost certainly not from honest shuffles." },
    { board: "poll", hl: [1, 2, 3, 4, 5, 7, 8],
      say: "Last, revisit polling. The CLT says p hat is about N of p, p times 1 minus p over n. To be within 0.01 with 95% confidence, you need the z-score of 0.01 to be at least 1.96, and in the worst case that means about 9604 people. Chebyshev demanded 50,000. Chebyshev's answer is a guarantee for any distribution and any n. The CLT's is an approximation, but a much sharper one.",
      tip: "If a question says \"use the CLT\", standardize and use Φ. If it says \"bound\" or \"guarantee\", it wants Markov or Chebyshev." }
  ],

  check: [
    { type: "mc", q: "X ~ N(10, 4). Which is ℙ[X ≤ 13]?",
      choices: ["Φ(1.5)", "Φ(3/4)", "Φ(3)"], answer: 0,
      why: "σ = √4 = 2, so the z-score is (13 − 10)/2 = 1.5." },
    { type: "type", q: "Using Φ(1.96) ≈ 0.975, what is ℙ[Z > 1.96] for Z ~ N(0, 1)?", answer: "0.025", accept: [".025", "2.5%"],
      why: "1 − Φ(1.96) = 1 − 0.975 = 0.025." },
    { type: "type", q: "Using Φ(1) ≈ 0.8413, what is ℙ[Z < −1]?", answer: "0.1587", accept: [".1587", "0.159", ".159"],
      why: "Φ(−1) = 1 − Φ(1) = 0.1587." },
    { type: "mc", q: "X ~ N(0, 1) and Y ~ N(0, 1) are independent. What is the distribution of X − Y?",
      choices: ["N(0, 2)", "N(0, 0)", "N(0, 1)"], answer: 0,
      why: "X − Y = X + (−Y), and −Y ~ N(0, 1). Variances add: 1 + 1 = 2. Subtracting does not subtract variances." },
    { type: "mc", q: "The CLT says (Sₙ − nμ)/(σ√n) is approximately N(0, 1). What is needed?",
      choices: ["X₁, X₂, … i.i.d. with finite mean and variance, and n large", "Each Xᵢ is Gaussian", "Each Xᵢ is nonnegative"], answer: 0,
      why: "The CLT works for any distribution with finite mean and variance. If each Xᵢ were already Gaussian, the sum would be exactly Gaussian for every n." },
    { type: "type", q: "Sₙ is the sum of 400 i.i.d. variables with mean 2 and variance 9. What is the standard deviation of Sₙ?", answer: "60",
      why: "Var(Sₙ) = 400 · 9 = 3600, so σ(Sₙ) = 60." },
    { type: "mc", q: "Which statement about Chebyshev and the Gaussian is right?",
      choices: ["Chebyshev's 1/k² holds for every distribution; the Gaussian tail is much smaller", "The Gaussian tail is always larger than 1/k²", "They give the same number for k = 3"], answer: 0,
      why: "For k = 3, Chebyshev gives at most 1/9 ≈ 11%, while a Gaussian has about 0.3% that far out." },
    { type: "type", q: "X ~ N(μ, σ²). How many standard deviations above the mean is the value μ + 2.5σ? (Give its z-score.)", answer: "2.5",
      why: "z = (x − μ)/σ = 2.5σ/σ = 2.5." }
  ],

  deepen: [
    { id: "gauss_race", title: "Which runner is faster", source: "Original question",
      desc: ["Alice's time for a race is X ~ N(10, 9) minutes and Bob's is Y ~ N(6, 16) minutes, independent of each other.",
        "What is the probability that Bob takes longer than Alice, that is ℙ[Y > X]?",
        "Use Φ(0.8) ≈ 0.7881."],
      answer: "0.2119", accept: [".2119", "0.212", ".212", "21.19%"], answerLabel: "ℙ[Y > X] ≈",
      hints: ["Look at the difference D = X − Y. The event Y > X is D < 0.", "D is a sum of independent Gaussians (X and −Y), so it is Gaussian. Find its mean and variance.", "D ~ N(4, 25), so σ = 5. Standardize 0."],
      solution: [
        "Let D = X − Y. Then Y > X exactly when D < 0.",
        "−Y ~ N(−6, 16), and X, −Y are independent Gaussians, so D ~ N(10 − 6, 9 + 16) = N(4, 25).",
        "σ(D) = 5. Standardize: ℙ[D < 0] = Φ((0 − 4)/5) = Φ(−0.8).",
        "Φ(−0.8) = 1 − Φ(0.8) ≈ 1 − 0.7881 = 0.2119."
      ],
      explain: "Comparing two independent Gaussians always reduces to one Gaussian: their difference. Means subtract, but variances add." },
    { id: "gauss_queue", title: "A hundred customers", source: "Original question",
      desc: ["A help desk serves 100 customers one after another. Service times are i.i.d. Exponential with mean 1 minute.",
        "(a) Find the mean and standard deviation of the total time S.",
        "(b) Use the CLT to approximate ℙ[S > 120]. Use Φ(2) ≈ 0.9772.",
        "(c) What upper bound does Chebyshev give for the same event?"],
      answer: "0.0228", accept: [".0228", "0.023", ".023", "2.28%"], answerLabel: "CLT estimate of ℙ[S > 120] ≈",
      hints: ["An Exponential with mean 1 has λ = 1 and variance 1/λ² = 1.", "S has mean 100 and variance 100, so σ(S) = 10. Then 120 is how many standard deviations above the mean?", "For Chebyshev, S > 120 is inside |S − 100| ≥ 20."],
      solution: [
        "(a) Each Xᵢ ~ Exponential(1): 𝔼[Xᵢ] = 1, Var(Xᵢ) = 1.",
        "    By independence, 𝔼[S] = 100 and Var(S) = 100, so σ(S) = 10.",
        "(b) CLT: S ≈ N(100, 100). ℙ[S > 120] ≈ 1 − Φ((120 − 100)/10) = 1 − Φ(2) ≈ 0.0228.",
        "(c) ℙ[S > 120] ≤ ℙ[|S − 100| ≥ 20] ≤ Var(S)/20² = 100/400 = 1/4."
      ],
      explain: "The CLT turns a sum of 100 non-Gaussian pieces into one Φ lookup. Chebyshev's 1/4 is true but much weaker, because it must hold for every distribution." },
    { id: "gauss_poll", title: "Sample size: CLT versus Chebyshev", source: "Original question, building on Note 23",
      desc: ["You want to estimate a proportion p to within ε = 0.02 with 95% confidence, and you know nothing about p.",
        "(a) Using the CLT approximation p̂ ≈ N(p, p(1 − p)/n) and Φ(1.96) ≈ 0.975, how large should n be?",
        "(b) How large does Chebyshev's inequality require n to be?"],
      answer: "2401", accept: ["2,401"], answerLabel: "CLT sample size n =",
      hints: ["ℙ[|p̂ − p| ≤ ε] ≈ 2Φ(ε / σ(p̂)) − 1, where σ(p̂) = √(p(1 − p)/n). For 95% you need ε / σ(p̂) ≥ 1.96.", "Use the worst case p(1 − p) = 1/4, so σ(p̂) ≤ 1/(2√n).", "For Chebyshev, use n ≥ 1/(4ε²δ) with δ = 0.05."],
      solution: [
        "(a) σ(p̂) = √(p(1 − p)/n) ≤ 1/(2√n).",
        "    95% two-sided means 2Φ(z) − 1 = 0.95, so z = 1.96.",
        "    Need ε ≥ 1.96 · σ(p̂); it is enough that 0.02 ≥ 1.96/(2√n), so √n ≥ 1.96/0.04 = 49.",
        "    n ≥ 49² = 2401.",
        "(b) Chebyshev: n ≥ 1/(4ε²δ) = 1/(4 · 0.0004 · 0.05) = 12,500."
      ],
      explain: "Both methods use the same mean and variance of p̂. Chebyshev is a guarantee for every distribution, so it asks for about 5 times as many samples as the Gaussian approximation does." }
  ]
};
