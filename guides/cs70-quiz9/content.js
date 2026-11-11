/*
  content.js — CS 70 Fall 2026 Quiz 9 study content.
  Scope: Random variables and distributions, expectation and linearity,
  joint distributions and independence. Built from Notes 19 and 20
  (Discussion 10, "Random Variables and Expectation Intro").

  Schema matches the Quiz 8 guide:
    topics[] { id, name, threshold, allOrNothing, note[], formulas[], worked[], quiz[], learn?[], videos?[] }
    synthesis[], practice{}, exams[], resourceLinks[], queue[]
*/

window.CS70 = {
  meta: {
    course: "CS 70",
    term: "Fall 2026",
    staff: "Hug, Sabin",
    examDate: "2026-11-13T18:00:00-08:00",
    examLabel: "Friday, Nov 13",
    notesUrl: "https://www.eecs70.org/",
    policiesUrl: "https://www.eecs70.org/policies/"
  },

  passedTopics: [],

  topics: [
    /* =================== 1. RANDOM VARIABLES & DISTRIBUTIONS =================== */
    {
      id: "rv-distributions", name: "Random Variables & Distributions",
      threshold: "The object the whole quiz is about", allOrNothing: false,
      note: [
        { h: "What a random variable is", body: "A random variable X is a <b>function</b> X : Ω → ℝ that attaches a number to every outcome. The function is not random; what is random is which outcome ω occurs. So “X = a” is shorthand for the event { ω : X(ω) = a }." },
        { h: "The distribution (PMF)", body: "The distribution of X lists every value X can take together with its probability: { (a, ℙ[X = a]) }. Because the events { X = a } partition Ω, the probabilities must sum to 1: Σₐ ℙ[X = a] = 1. A quick sanity check on any distribution is that its probabilities add to one." },
        { h: "Reading a value off", body: "To compute ℙ[X = a], collect every outcome ω with X(ω) = a and add their probabilities: ℙ[X = a] = Σ over those ω of ℙ[ω]." },
        { h: "Same distribution, different variable", body: "Two random variables can have the same distribution without being the same function. The number of heads and the number of tails in n fair flips share a distribution but are different variables." }
      ],
      formulas: [
        { k: "Random variable", v: "X : Ω → ℝ" },
        { k: "Event form", v: "{X = a} = { ω : X(ω) = a }" },
        { k: "Read a value", v: "ℙ[X = a] = Σ_{ω: X(ω)=a} ℙ[ω]" },
        { k: "Valid distribution", v: "Σₐ ℙ[X = a] = 1" }
      ],
      worked: [
        { tag: "Two coins", q: "Flip a fair coin twice. X = number of heads. Give the distribution.", a: "Outcomes {HH, HT, TH, TT} each 1/4. So ℙ[X = 0] = 1/4, ℙ[X = 1] = 1/2, ℙ[X = 2] = 1/4. Check: 1/4 + 1/2 + 1/4 = <b>1</b>." },
        { tag: "Sum of two dice", q: "Roll two fair dice, X = the sum. What is ℙ[X = 7], and why is it the peak?", a: "Sum 7 has outcomes (1,6),(2,5),(3,4),(4,3),(5,2),(6,1): 6 of 36. So ℙ[X = 7] = 6/36 = <b>1/6</b>. It is the most likely sum because 7 has the most ways to be formed." },
        { tag: "Indicator", q: "Roll one die. X = 1 if the roll is even, else 0. Distribution?", a: "ℙ[X = 1] = 3/6 = 1/2 and ℙ[X = 0] = 1/2. This X is an <b>indicator</b> random variable, worth remembering for the linearity topic." }
      ],
      quiz: [
        { q: "A random variable is best described as:", choices: ["A random number", "A function from outcomes to real numbers", "An event in the sample space", "A probability"], answer: 1, why: "X : Ω → ℝ. The randomness is in which outcome occurs, not in the function." },
        { q: "For any distribution, the sum Σₐ ℙ[X = a] equals:", type: "sa", accept: ["1", "one"], answer: "1", why: "The events {X = a} partition the sample space, so their probabilities sum to 1." },
        { q: "Flip a fair coin twice, X = number of heads. ℙ[X = 1] =", type: "sa", accept: ["1/2", "2/4", "0.5", ".5"], answer: "1/2", why: "HT and TH out of four equally likely outcomes." },
        { q: "The notation “X = a” denotes:", choices: ["a number", "an event", "a function", "a probability"], answer: 1, why: "It is the event { ω : X(ω) = a }, which is why ℙ[X = a] makes sense." }
      ]
    },

    /* =================== 2. COMMON DISTRIBUTIONS =================== */
    {
      id: "common-distributions", name: "Common Distributions",
      threshold: "Recognize the five, know each mean", allOrNothing: false,
      note: [
        { h: "The five to know cold", body: "Throughout, “success” is an event of probability p and trials are independent. <b>Bernoulli(p)</b>: one trial, 1 on success, E = p. <b>Binomial(n, p)</b>: number of successes in n trials, ℙ[X = k] = C(n,k) pᵏ (1−p)ⁿ⁻ᵏ, E = np. <b>Uniform{1,…,n}</b>: each value equally likely 1/n, E = (n+1)/2. <b>Geometric(p)</b>: number of trials up to and including the first success, ℙ[X = k] = (1−p)ᵏ⁻¹ p, E = 1/p. <b>Poisson(λ)</b>: count of rare events, its own topic, E = λ." },
        { h: "Pick the right one", body: "Count of successes in a fixed number of trials → <b>Binomial</b>. Wait until the first success → <b>Geometric</b>. Every value equally likely → <b>Uniform</b>. One yes/no trial → <b>Bernoulli</b>. Rare events over time or space → <b>Poisson</b>." },
        { h: "Geometric tail and memorylessness", body: "For Geometric(p), ℙ[X > k] = (1−p)ᵏ (the first k trials all fail). This gives the <b>memoryless property</b>: ℙ[X > n + m | X > m] = ℙ[X > n]. Past failures do not change how much longer you wait." }
      ],
      formulas: [
        { k: "Bernoulli(p)", v: "ℙ[1] = p, ℙ[0] = 1−p; E = p" },
        { k: "Binomial(n,p)", v: "C(n,k) pᵏ (1−p)ⁿ⁻ᵏ; E = np" },
        { k: "Uniform{1..n}", v: "1/n; E = (n+1)/2" },
        { k: "Geometric(p)", v: "(1−p)ᵏ⁻¹ p; E = 1/p" },
        { k: "Geometric tail", v: "ℙ[X > k] = (1−p)ᵏ (memoryless)" }
      ],
      worked: [
        { tag: "Binomial", q: "Flip a fair coin 10 times. ℙ[exactly 3 heads]? Expected number of heads?", a: "X ~ Binomial(10, 1/2). ℙ[X = 3] = C(10,3)(1/2)³(1/2)⁷ = C(10,3)/2¹⁰ = <b>120/1024 ≈ 0.117</b>. E[X] = np = 10·(1/2) = <b>5</b>." },
        { tag: "Geometric", q: "Roll a fair die until the first 6. ℙ[first 6 on roll 3]? Expected rolls?", a: "X ~ Geometric(1/6). ℙ[X = 3] = (5/6)²(1/6) = <b>25/216</b>. E[X] = 1/p = <b>6</b>." },
        { tag: "Memoryless", q: "You have rolled the die four times with no 6. How many more rolls do you expect until a 6?", a: "By memorylessness the count resets: still <b>6</b> more expected rolls. The die does not remember the misses." }
      ],
      learn: [
        { teach: "<h3>Read the story, name the distribution</h3><p>The exam rarely says “Binomial.” It describes an experiment. Your job is to match the story to one of the five. Start with the question: is it counting something, or waiting for something?</p>",
          check: { q: "“Number of heads in 20 flips” is which distribution?", choices: ["Geometric", "Binomial", "Poisson"], answer: 1, why: "A count of successes in a fixed number of independent trials is Binomial(20, p)." } },
        { teach: "<h3>Counting vs waiting</h3><p>Counting successes in a fixed number of trials is <b>Binomial</b>. Waiting for the first success, with the number of trials unknown, is <b>Geometric</b>. The tell is whether n is fixed in advance.</p>",
          check: { q: "“Rolls until the first 6” is which distribution?", choices: ["Binomial(6, 1/6)", "Geometric(1/6)", "Uniform{1..6}"], answer: 1, why: "You wait for the first success, so Geometric(1/6), with E = 6." } },
        { teach: "<h3>Rare events get Poisson</h3><p>When events happen at a steady average rate over time or space and you count how many occur (typos per page, calls per minute), that is <b>Poisson(λ)</b>, where λ is the average. More on it in the next topic.</p>",
          check: { q: "“Number of typos on a page, averaging 2 per page” is:", choices: ["Poisson(2)", "Binomial(2, 1/2)", "Geometric(1/2)"], answer: 0, why: "A rare-event count with average rate λ = 2 is Poisson(2)." } },
        { teach: "<h3>Lock in the means</h3><p>Bernoulli p, Binomial np, Uniform (n+1)/2, Geometric 1/p, Poisson λ. These five are the highest-value facts on the quiz. If you remember nothing else, remember the means.</p>" }
      ],
      quiz: [
        { q: "The number of successes in n independent trials follows a:", choices: ["Geometric distribution", "Binomial distribution", "Uniform distribution", "Poisson distribution"], answer: 1, why: "Count of successes in a fixed n of independent trials is Binomial(n, p)." },
        { q: "X ~ Geometric(p). Then E[X] =", type: "sa", accept: ["1/p", "1 / p"], answer: "1/p", why: "Expected number of trials to the first success." },
        { q: "X ~ Binomial(n, p). Then E[X] =", type: "sa", accept: ["np", "n*p", "n p"], answer: "np", why: "Each of n trials contributes p in expectation (linearity of indicators)." },
        { q: "The number of die rolls until the first 6 is distributed as:", type: "sa", accept: ["geometric", "geometric(1/6)", "geometric 1/6"], answer: "Geometric(1/6)", why: "Waiting for the first success with p = 1/6, so E = 6." }
      ]
    },

    /* =================== 3. POISSON DISTRIBUTION =================== */
    {
      id: "poisson", name: "The Poisson Distribution",
      threshold: "Rare-event counts, and why E = λ", allOrNothing: false,
      note: [
        { h: "Definition", body: "X ~ Poisson(λ) means ℙ[X = k] = λᵏ e⁻λ / k! for k = 0, 1, 2, … The single parameter λ is the average rate, and it completely determines the distribution." },
        { h: "What it models", body: "Poisson is the standard model for <b>rare events</b>: clicks of a Geiger counter, typos per page, calls to a network per minute, cases of a disease. It fits whenever occurrences happen at a constant density λ over time or space and are independent in disjoint regions." },
        { h: "Expectation", body: "E[X] = λ. The parameter is the mean. This is the fact to memorize, and it also makes λ easy to estimate from data: the average count is your λ." },
        { h: "Poisson as a limit of Binomial", body: "Poisson(λ) is the limit of Binomial(n, λ/n) as n → ∞. It counts the heads in a very long sequence of coin flips where each flip is very unlikely but the expected total λ stays fixed. That is why it models rare events." },
        { h: "Sum of independent Poissons", body: "If X ~ Poisson(λ) and Y ~ Poisson(μ) are independent, then X + Y ~ Poisson(λ + μ). Rates simply add." }
      ],
      formulas: [
        { k: "PMF", v: "ℙ[X = k] = λᵏ e⁻λ / k!" },
        { k: "Mean", v: "E[X] = λ" },
        { k: "Limit", v: "Binomial(n, λ/n) → Poisson(λ)" },
        { k: "Sum (independent)", v: "Poisson(λ) + Poisson(μ) = Poisson(λ + μ)" }
      ],
      worked: [
        { tag: "Note 20 · typos", q: "An article averages 1 typo per page, modeled Poisson(λ = 1). Probability a page has exactly 5 typos?", a: "ℙ[X = 5] = 1⁵ e⁻¹ / 5! = e⁻¹ / 120 = <b>1/(120e) ≈ 1/326</b>." },
        { tag: "Note 20 · at least one", q: "Over 200 independent pages, probability at least one page has exactly 5 typos?", a: "Each page misses with probability 1 − 1/(120e). So ℙ[at least one] = 1 − (1 − 1/(120e))²⁰⁰ ≈ <b>0.46</b>." },
        { tag: "Sum", q: "A shop gets Poisson(3) calls in the morning and Poisson(5) in the afternoon, independently. Distribution and mean of the daily total?", a: "Total ~ Poisson(3 + 5) = <b>Poisson(8)</b>, so E = <b>8</b>." }
      ],
      quiz: [
        { q: "For X ~ Poisson(λ), the mean E[X] is:", type: "sa", accept: ["λ", "lambda"], answer: "λ", why: "The parameter is the mean." },
        { q: "The Poisson(λ) probability ℙ[X = k] equals:", choices: ["λᵏ e⁻λ / k!", "C(n,k) λᵏ (1−λ)ⁿ⁻ᵏ", "(1−λ)ᵏ⁻¹ λ", "λ / k"], answer: 0, why: "The defining Poisson PMF, valid for k = 0, 1, 2, …" },
        { q: "Poisson(λ) arises as the limit of which distribution?", choices: ["Geometric(λ)", "Binomial(n, λ/n) as n → ∞", "Uniform{1,…,n}", "Bernoulli(λ)"], answer: 1, why: "Many rare trials with expected total λ held fixed." },
        { q: "Independent X ~ Poisson(2) and Y ~ Poisson(3). Then X + Y ~", type: "sa", accept: ["poisson(5)", "poisson 5", "5", "poisson(2+3)"], answer: "Poisson(5)", why: "Rates add: Poisson(2 + 3) = Poisson(5)." }
      ]
    },

    /* =================== 4. EXPECTATION =================== */
    {
      id: "expectation", name: "Expectation",
      threshold: "The weighted-average definition and its shortcuts", allOrNothing: false,
      note: [
        { h: "Definition", body: "The expectation of X is the probability-weighted average of its values: E[X] = Σₐ a·ℙ[X = a], equivalently E[X] = Σ_ω X(ω)·ℙ[ω]. It is the long-run average value." },
        { h: "It need not be attainable", body: "E[X] is not a value X has to take. A fair die has E[X] = 3.5, which is not a face. Expectation is a summary of the distribution, not a prediction of a single roll." },
        { h: "Tail-sum formula", body: "For a random variable taking values in {0, 1, 2, …}, E[X] = Σ_{i ≥ 1} ℙ[X ≥ i]. Useful when the tail probabilities ℙ[X ≥ i] are easier than the full PMF, as with a geometric wait." },
        { h: "Expectation of a function", body: "E[f(X)] = Σₐ f(a)·ℙ[X = a]. In particular E[X²] = Σₐ a²·ℙ[X = a]. <b>Warning:</b> E[X²] ≠ (E[X])², and more generally E[f(X)] ≠ f(E[X])." }
      ],
      formulas: [
        { k: "Definition", v: "E[X] = Σₐ a·ℙ[X = a]" },
        { k: "Over outcomes", v: "E[X] = Σ_ω X(ω)·ℙ[ω]" },
        { k: "Tail sum", v: "E[X] = Σ_{i≥1} ℙ[X ≥ i]" },
        { k: "Of a function", v: "E[f(X)] = Σₐ f(a)ℙ[X = a]; E[X²] ≠ (E[X])²" }
      ],
      worked: [
        { tag: "Fair die", q: "Expected value of one fair die roll?", a: "E[X] = (1 + 2 + 3 + 4 + 5 + 6)/6 = 21/6 = <b>3.5</b>, a value the die never shows." },
        { tag: "Tail sum", q: "X = number of die rolls until the first 6. Use the tail-sum formula for E[X].", a: "ℙ[X ≥ i] = (5/6)ⁱ⁻¹ (the first i−1 rolls miss). So E[X] = Σ_{i≥1}(5/6)ⁱ⁻¹ = 1/(1 − 5/6) = <b>6</b>, matching 1/p." },
        { tag: "E[X²] vs (E[X])²", q: "For a fair die, compare E[X²] and (E[X])².", a: "E[X²] = (1 + 4 + 9 + 16 + 25 + 36)/6 = 91/6 ≈ 15.17, while (E[X])² = 3.5² = 12.25. They are <b>different</b>." }
      ],
      quiz: [
        { q: "The expectation E[X] is defined as:", choices: ["the most likely value of X", "Σₐ a·ℙ[X = a]", "the middle value of X", "ℙ[X = a]"], answer: 1, why: "A probability-weighted average of the values." },
        { q: "The expected value of one fair die roll is:", type: "sa", accept: ["3.5", "7/2", "3,5"], answer: "3.5", why: "(1+2+3+4+5+6)/6 = 21/6 = 3.5, which the die never actually shows." },
        { q: "Is E[X²] always equal to (E[X])²?", choices: ["Yes", "No"], answer: 1, why: "E[f(X)] ≠ f(E[X]) in general; for a fair die 91/6 ≠ 12.25." },
        { q: "For a nonnegative integer X, the tail-sum formula says E[X] =", choices: ["Σ_{i≥1} ℙ[X = i]", "Σ_{i≥1} ℙ[X ≥ i]", "Σ_{i≥1} i·ℙ[X ≥ i]", "ℙ[X ≥ 1]"], answer: 1, why: "Sum of the upper-tail probabilities gives the mean." }
      ]
    },

    /* =================== 5. LINEARITY OF EXPECTATION & INDICATORS =================== */
    {
      id: "linearity", name: "Linearity of Expectation & Indicators",
      threshold: "The most useful tool on the quiz", allOrNothing: false,
      note: [
        { h: "The rule", body: "For any random variables X and Y and constants a, b, E[aX + bY] = a·E[X] + b·E[Y]. It extends to any number of terms: E[Σ Xᵢ] = Σ E[Xᵢ]. Crucially this holds <b>whether or not</b> the variables are independent." },
        { h: "Why it is powerful", body: "You can break a hard random variable into simple pieces and add their expectations, even when the pieces are tangled together. You never need the joint distribution to add expectations." },
        { h: "The indicator method", body: "To find the expected count of something, write X = I₁ + ⋯ + Iₙ where Iᵢ is the <b>indicator</b> of event Aᵢ (1 if Aᵢ happens, else 0). Since E[Iᵢ] = ℙ[Aᵢ], linearity gives E[X] = Σ ℙ[Aᵢ]. This turns a messy count into a sum of easy probabilities." },
        { h: "The caveat", body: "Linearity covers sums, differences, and constant multiples only. It does <b>not</b> say E[XY] = E[X]·E[Y] (that needs independence), nor E[1/X] = 1/E[X]. Those are false in general." }
      ],
      formulas: [
        { k: "Linearity", v: "E[aX + bY] = a·E[X] + b·E[Y]" },
        { k: "Any number of terms", v: "E[Σ Xᵢ] = Σ E[Xᵢ] (always)" },
        { k: "Indicator", v: "E[I_A] = ℙ[A]; X = Σ Iᵢ ⇒ E[X] = Σ ℙ[Aᵢ]" },
        { k: "Not a product rule", v: "E[XY] ≠ E[X]E[Y] in general" }
      ],
      worked: [
        { tag: "Sum of dice", q: "Two fair dice, X = the sum. Find E[X] without the full distribution.", a: "Write X = Y₁ + Y₂ with Yᵢ the i-th die. E[Yᵢ] = 3.5, so E[X] = 3.5 + 3.5 = <b>7</b>. No need to list all 11 sums." },
        { tag: "Note 20 · fixed points", q: "Shuffle n labeled items among n people. X = number of people who get their own item. Find E[X].", a: "Let Iᵢ = 1 if person i gets their own item. ℙ[Iᵢ = 1] = 1/n, so E[X] = Σ ℙ[Iᵢ = 1] = n·(1/n) = <b>1</b>, for every n. The pieces are dependent, yet linearity still adds them." },
        { tag: "Note 20 · coin heads", q: "Flip a p-coin n times. Expected number of heads?", a: "X = I₁ + ⋯ + Iₙ with Iᵢ the indicator that flip i is heads, E[Iᵢ] = p. So E[X] = <b>np</b>, recovering the Binomial mean with no binomial coefficients." }
      ],
      learn: [
        { teach: "<h3>Why indicators work</h3><p>An indicator Iₐ is 1 when event A happens and 0 otherwise. Its expectation is just the probability of the event: E[Iₐ] = 1·ℙ[A] + 0·ℙ[not A] = ℙ[A]. That one fact is the engine of the whole method.</p>",
          check: { q: "For an indicator I_A, E[I_A] equals:", choices: ["1", "ℙ[A]", "0", "½"], answer: 1, why: "E[I_A] = 1·ℙ[A] + 0·ℙ[not A] = ℙ[A]." } },
        { teach: "<h3>Write the count as a sum</h3><p>Any “how many” quantity is a sum of indicators, one per thing that might be counted. Number of heads = Σ (flip i is heads). Number of fixed points = Σ (person i gets their own). Number of empty bins = Σ (bin i is empty).</p>",
          check: { q: "To count fixed points of a permutation of n items, you sum how many indicators?", type: "sa", accept: ["n", "n indicators"], answer: "n", why: "One indicator per position: X = I₁ + ⋯ + Iₙ." } },
        { teach: "<h3>Add the probabilities</h3><p>By linearity, E[X] = Σ E[Iᵢ] = Σ ℙ[Aᵢ]. You never need to know how the indicators interact, which is what makes this beat computing the distribution directly.</p>",
          check: { q: "For n fixed points with ℙ[I_i = 1] = 1/n, E[X] =", type: "sa", accept: ["1", "one"], answer: "1", why: "n·(1/n) = 1, independent of n." } },
        { teach: "<h3>Mind the caveat</h3><p>Linearity is for sums, not products. E[XY] = E[X]E[Y] needs independence, and E[1/X] is not 1/E[X]. If a problem asks for the expectation of a product or a reciprocal, linearity alone will not get you there.</p>" }
      ],
      quiz: [
        { q: "E[X + Y] = E[X] + E[Y] requires X and Y to be independent.", choices: ["True", "False"], answer: 1, why: "Linearity of expectation holds for any X and Y, independent or not." },
        { q: "Shuffle n items among n people. Expected number who get their own item:", type: "sa", accept: ["1", "one"], answer: "1", why: "Sum of n indicators each with probability 1/n: n·(1/n) = 1." },
        { q: "To compute the expectation of a count, write the count as a sum of:", type: "sa", accept: ["indicators", "indicator random variables", "indicator variables", "indicator rvs"], answer: "indicators", why: "Then E[X] = Σ ℙ[Aᵢ] by linearity." },
        { q: "Flip a p-coin n times. Expected number of heads:", type: "sa", accept: ["np", "n*p", "n p"], answer: "np", why: "Sum of n indicators each with mean p." }
      ]
    },

    /* =================== 6. JOINT DISTRIBUTIONS & INDEPENDENCE =================== */
    {
      id: "joint-independence", name: "Joint Distributions & Independence",
      threshold: "Two variables at once, and when they factor", allOrNothing: false,
      note: [
        { h: "Joint distribution", body: "The joint distribution of X and Y is the collection of probabilities ℙ[X = a, Y = b] for all a, b. It describes the two variables <b>together</b>, including how they move with each other." },
        { h: "Marginals", body: "Recover one variable by summing the joint over the other: ℙ[X = a] = Σ_b ℙ[X = a, Y = b], and likewise for Y. Going from the joint to a single variable is called taking a <b>marginal</b>." },
        { h: "Independence of random variables", body: "X and Y are independent iff ℙ[X = a, Y = b] = ℙ[X = a]·ℙ[Y = b] for <b>all</b> a, b. To show they are not independent, it is enough to find one pair (a, b) where this fails." },
        { h: "i.i.d. and the product rule for E", body: "Variables that are independent and share a distribution are called <b>i.i.d.</b> (independent and identically distributed); indicators of independent coin tosses are a standard example. For independent X and Y only, E[XY] = E[X]·E[Y]. Note the contrast: linearity needs no independence, but this product rule does." }
      ],
      formulas: [
        { k: "Joint", v: "ℙ[X = a, Y = b]" },
        { k: "Marginal", v: "ℙ[X = a] = Σ_b ℙ[X = a, Y = b]" },
        { k: "Independent", v: "ℙ[X=a, Y=b] = ℙ[X=a]ℙ[Y=b] ∀ a,b" },
        { k: "Independent ⇒ product", v: "E[XY] = E[X]·E[Y]" }
      ],
      worked: [
        { tag: "Two dice", q: "Independent dice X, Y. Find ℙ[X = 3, Y = 5].", a: "By independence ℙ[X = 3, Y = 5] = ℙ[X = 3]·ℙ[Y = 5] = (1/6)(1/6) = <b>1/36</b>." },
        { tag: "Marginal", q: "A joint table gives ℙ[X=0,Y=0] = 0.1, ℙ[X=0,Y=1] = 0.3. What is ℙ[X = 0]?", a: "Sum over Y: ℙ[X = 0] = 0.1 + 0.3 = <b>0.4</b>." },
        { tag: "Product of means", q: "Independent dice X, Y. Find E[XY].", a: "Independence gives E[XY] = E[X]·E[Y] = 3.5·3.5 = <b>12.25</b>. Without independence this step would not be allowed." }
      ],
      quiz: [
        { q: "Random variables X and Y are independent iff:", choices: ["E[XY] = E[X] + E[Y]", "ℙ[X = a, Y = b] = ℙ[X = a]·ℙ[Y = b] for all a, b", "ℙ[X = a] = ℙ[Y = b]", "they have the same distribution"], answer: 1, why: "The joint must factor into the product of marginals for every pair." },
        { q: "The marginal ℙ[X = a] is obtained from the joint by:", choices: ["multiplying over b", "summing over b: Σ_b ℙ[X = a, Y = b]", "dividing by ℙ[Y = b]", "taking a maximum"], answer: 1, why: "Sum the joint over all values of the other variable." },
        { q: "For independent X and Y, E[XY] =", type: "sa", accept: ["e[x]e[y]", "e[x]*e[y]", "e[x] e[y]", "ex*ey", "e[x]·e[y]"], answer: "E[X]·E[Y]", why: "Independence lets the expectation of the product factor." },
        { q: "The abbreviation i.i.d. stands for:", type: "sa", accept: ["independent and identically distributed", "independent identically distributed", "independent, identically distributed"], answer: "independent and identically distributed", why: "Same distribution, mutually independent, as with indicators of independent coin tosses." }
      ]
    }
  ],

  /* Synthesis: questions that braid several topics together, quiz-style. */
  synthesis: [
    { tag: "Distinct birthdays · indicators + independence + linearity",
      q: "In a class of 20 students, each has a birthday independently and uniformly over 365 days. What is the expected number of distinct days that are some student’s birthday?",
      a: "Index by <b>day</b>, not by student. Let I_d = 1 if day d is at least one student’s birthday. ℙ[day d is used] = 1 − (364/365)²⁰ (nobody picks it with probability (364/365)²⁰). By linearity over the 365 days, E[distinct days] = 365·(1 − (364/365)²⁰) ≈ <b>19.46</b>.",
      lesson: "The clever move is choosing what to put an indicator on. One indicator per day, not per student, because “distinct days used” is a count over days. Then complement gives each probability and linearity adds them, dependence and all." },
    { tag: "Call center · Poisson + sum of Poissons + indicators",
      q: "Calls arrive Poisson(λ = 4) per minute, independently across minutes. Over a 10-minute window, give the distribution and mean of the total number of calls, and the expected number of minutes with zero calls.",
      a: "<b>Total calls:</b> independent Poissons add, so the total ~ Poisson(10·4) = <b>Poisson(40)</b>, with mean <b>40</b>. <b>Empty minutes:</b> let I_m = 1 if minute m has zero calls; ℙ[zero in a minute] = e⁻⁴ (Poisson(4) at k = 0). By linearity, E[empty minutes] = 10·e⁻⁴ ≈ <b>0.18</b>.",
      lesson: "Two tools in one problem: sum-of-Poissons for the total, and the indicator method for the count of empty minutes. The Poisson PMF at k = 0 gives e⁻λ, the probability an interval is empty." }
  ]
};

/* This guide's own practice problems, in quiz style. Try, then reveal. */
window.CS70.practice = {
  "rv-distributions": [
    { q: "Flip a fair coin 3 times, X = number of heads. Write the full distribution.", sol: "ℙ[X=0] = 1/8, ℙ[X=1] = 3/8, ℙ[X=2] = 3/8, ℙ[X=3] = 1/8. They sum to 1." },
    { q: "Roll two dice, X = the larger of the two values. What is ℙ[X = 6]?", sol: "X = 6 unless both dice are ≤ 5, which happens with probability (5/6)² = 25/36. So ℙ[X = 6] = 1 − 25/36 = 11/36." },
    { q: "A bag has 3 red and 2 blue chips. Draw one, X = 1 if red else 0. Distribution and E[X]?", sol: "ℙ[X=1] = 3/5, ℙ[X=0] = 2/5. E[X] = 3/5 (it is a Bernoulli(3/5))." }
  ],
  "common-distributions": [
    { q: "A free-throw shooter makes each shot with p = 0.8, independently. ℙ[exactly 4 of 5 made]?", sol: "Binomial(5, 0.8): C(5,4)(0.8)⁴(0.2)¹ = 5·(0.4096)(0.2) = 0.4096." },
    { q: "You draw cards with replacement until the first ace. Expected number of draws?", sol: "Geometric(4/52) = Geometric(1/13). E = 1/p = 13 draws." },
    { q: "X ~ Uniform{1,…,10}. Find E[X] and ℙ[X > 7].", sol: "E[X] = (10+1)/2 = 5.5. ℙ[X > 7] = ℙ[X ∈ {8,9,10}] = 3/10." }
  ],
  "poisson": [
    { q: "A website gets Poisson(λ = 3) sign-ups per hour. ℙ[exactly 0 sign-ups in an hour]?", sol: "ℙ[X = 0] = 3⁰ e⁻³ / 0! = e⁻³ ≈ 0.0498." },
    { q: "Emails arrive Poisson(2) in the morning and Poisson(6) in the afternoon, independently. Distribution and mean of the daily total?", sol: "Poisson(2 + 6) = Poisson(8), mean 8." },
    { q: "A page averages λ = 0.5 typos. ℙ[at least one typo on a page]?", sol: "1 − ℙ[X = 0] = 1 − e⁻⁰·⁵ ≈ 1 − 0.6065 = 0.3935." }
  ],
  "expectation": [
    { q: "A game pays $5 on heads and costs $3 on tails, fair coin. Expected net payoff?", sol: "E = (1/2)(5) + (1/2)(−3) = 2.5 − 1.5 = $1." },
    { q: "X = number of fair-coin flips until the first heads. Use the tail sum to find E[X].", sol: "ℙ[X ≥ i] = (1/2)ⁱ⁻¹. E[X] = Σ_{i≥1}(1/2)ⁱ⁻¹ = 1/(1 − 1/2) = 2 = 1/p." },
    { q: "For X ~ Uniform{1,2,3}, compute E[X] and E[X²], and confirm they differ from each other's square.", sol: "E[X] = 2, E[X²] = (1 + 4 + 9)/3 = 14/3 ≈ 4.67, while (E[X])² = 4. So E[X²] ≠ (E[X])²." }
  ],
  "linearity": [
    { q: "Roll three dice. Expected sum?", sol: "Each die has mean 3.5, so by linearity E[sum] = 3·3.5 = 10.5." },
    { q: "Throw n balls into n bins uniformly and independently. Expected number of empty bins?", sol: "Let I_i = 1 if bin i is empty. ℙ[bin i empty] = (1 − 1/n)ⁿ. E[empty] = n(1 − 1/n)ⁿ ≈ n/e for large n." },
    { q: "In a class of 30, each student independently forgets their pencil with probability 0.1. Expected number who forget?", sol: "Sum of 30 indicators each with mean 0.1: E = 30·0.1 = 3." }
  ],
  "joint-independence": [
    { q: "Independent X ~ Uniform{1,2} and Y ~ Uniform{1,2,3}. Find ℙ[X = 2, Y = 3].", sol: "By independence (1/2)(1/3) = 1/6." },
    { q: "A joint table: ℙ[(0,0)] = 0.2, ℙ[(0,1)] = 0.1, ℙ[(1,0)] = 0.3, ℙ[(1,1)] = 0.4. Are X and Y independent?", sol: "ℙ[X=0] = 0.3, ℙ[Y=0] = 0.5, so the product is 0.15, but ℙ[X=0,Y=0] = 0.2 ≠ 0.15. Not independent." },
    { q: "Independent dice X, Y. Find E[X + Y] and E[XY].", sol: "E[X + Y] = 3.5 + 3.5 = 7 (linearity, no independence needed). E[XY] = E[X]E[Y] = 12.25 (uses independence)." }
  ]
};

/* Reread the source material. Links point to the official course site. */
window.CS70.exams = [
  { sem: "Note 19 · Random Variables, Distributions, Expectation", exam: "https://www.eecs70.org/", sol: "https://www.eecs70.org/" },
  { sem: "Note 20 · Random Variables II, Linearity of Expectation", exam: "https://www.eecs70.org/", sol: "https://www.eecs70.org/" }
];
window.CS70.resourceLinks = [
  { label: "Course notes (all)", url: "https://www.eecs70.org/" },
  { label: "Homework & solutions", url: "https://www.eecs70.org/" },
  { label: "Discussion worksheets", url: "https://www.eecs70.org/discussions/" },
  { label: "Resources page", url: "https://www.eecs70.org/resources/" }
];

/* Practice queue topics (used by the queue view). */
window.CS70.queue = [
  { id: "rv-distributions",    name: "Random Variables & Distributions" },
  { id: "common-distributions", name: "Common Distributions" },
  { id: "poisson",             name: "The Poisson Distribution" },
  { id: "expectation",         name: "Expectation" },
  { id: "linearity",           name: "Linearity of Expectation & Indicators" },
  { id: "joint-independence",  name: "Joint Distributions & Independence" }
];
