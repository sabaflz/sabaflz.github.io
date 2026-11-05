/*
  content.js — CS 70 Fall 2026 Quiz 8 study content.
  Topics: Conditional Probability & Bayes, Independence & the Product Rule,
  Inclusion-Exclusion & the Union Bound. Built from Notes 17 and 18.

  Each topic object:
    id, name, threshold (short "what it tests" line), allOrNothing,
    note[]      { h, body }     body is HTML
    formulas[]  { k, v }
    worked[]    { tag, q, a }   a is HTML
    quiz[]      { q, choices, answer, why } or { q, type:"sa", accept[], answer, why }
    learn[]     optional guided lesson { teach, check? }
    videos[]    optional { t, by, note, url }
*/

window.CS70 = {
  meta: {
    course: "CS 70",
    term: "Fall 2026",
    staff: "Hug, Sabin",
    examDate: "2026-11-06T18:00:00-08:00",
    examLabel: "Friday, Nov 6",
    notesUrl: "https://www.eecs70.org/",
    policiesUrl: "https://www.eecs70.org/policies/"
  },

  // Nothing passed yet: this is a fresh quiz. All six topics are live.
  passedTopics: [],

  topics: [
    /* =================== 1. CONDITIONAL PROBABILITY =================== */
    {
      id: "conditional", name: "Conditional Probability",
      threshold: "The definition everything else is built on", allOrNothing: false,
      note: [
        { h: "The definition", body: "For events A, B with ℙ[B] &gt; 0, the probability of A <b>given</b> B is ℙ[A | B] = ℙ[A ∩ B] / ℙ[B]. You restrict the world to B, then ask how much of that world is also in A." },
        { h: "Why divide by ℙ[B]", body: "Conditioning on B throws away every outcome outside B. The survivors keep their relative weights, but they have to sum to 1 again, so you rescale each one by 1/ℙ[B]. That single division is the whole idea." },
        { h: "Uniform shortcut", body: "In a uniform space every outcome is equally likely, so ℙ[A | B] = |A ∩ B| / |B|. Just count the outcomes in B that are also in A." },
        { h: "The order trap", body: "ℙ[A | B] and ℙ[B | A] are different questions and usually different numbers. Swapping them is the single most common mistake (the prosecutor's fallacy). Bayes' Rule, two topics down, is how you convert one into the other." }
      ],
      formulas: [
        { k: "ℙ[A | B]", v: "ℙ[A ∩ B] / ℙ[B]" },
        { k: "ℙ[A ∩ B]", v: "ℙ[B] · ℙ[A | B]" },
        { k: "Uniform space", v: "ℙ[A | B] = |A ∩ B| / |B|" },
        { k: "Not symmetric", v: "ℙ[A | B] ≠ ℙ[B | A]" }
      ],
      worked: [
        { tag: "Note 17 · card dealing", q: "Deal 2 cards. Given the first is an ace, what is the chance the second is also an ace?", a: "Let B = first is an ace, A = second is an ace. ℙ[A ∩ B] = (4·3)/(52·51) and ℙ[B] = 4/52. So ℙ[A | B] = ℙ[A ∩ B]/ℙ[B] = (12/(52·51)) / (4/52) = <b>3/51</b>. That is less than the unconditional ℙ[A] = 1/13, because using up an ace leaves fewer." },
        { tag: "Uniform die", q: "Roll one fair die. Given the roll is odd, what is ℙ[roll is 3]?", a: "Odd outcomes are {1, 3, 5}, and {3} is one of them. Uniform, so ℙ[3 | odd] = |{3}| / |{1,3,5}| = <b>1/3</b>." },
        { tag: "Two dice", q: "Roll two fair dice. Given the sum is 7, what is ℙ[first die is 3]?", a: "Sum 7 has 6 equally likely outcomes: (1,6),(2,5),(3,4),(4,3),(5,2),(6,1). Exactly one has first die 3. So ℙ = <b>1/6</b>." }
      ],
      quiz: [
        { q: "The conditional probability ℙ[A | B] is defined as:", choices: ["ℙ[A] · ℙ[B]", "ℙ[A ∩ B] / ℙ[B]", "ℙ[A ∪ B] / ℙ[B]", "ℙ[B] / ℙ[A ∩ B]"], answer: 1, why: "Restrict to B, then renormalize: ℙ[A | B] = ℙ[A ∩ B] / ℙ[B], valid when ℙ[B] > 0." },
        { q: "Deal two cards from a standard deck. Given the first is an ace, the probability the second is an ace is:", type: "sa", accept: ["3/51", "1/17", "3 / 51"], answer: "3/51 = 1/17", why: "One ace is gone, leaving 3 aces among 51 cards: 3/51." },
        { q: "Roll a fair die. ℙ[roll is 2 | roll is even] equals:", type: "sa", accept: ["1/3", "1 / 3"], answer: "1/3", why: "Even = {2,4,6}, and 2 is one of three equally likely outcomes." },
        { q: "Is ℙ[A | B] always equal to ℙ[B | A]?", choices: ["Yes, conditioning is symmetric", "No, they are different in general"], answer: 1, why: "They answer different questions. They agree only in special cases (for example when ℙ[A] = ℙ[B])." }
      ]
    },

    /* =================== 2. PRODUCT RULE / CHAIN RULE =================== */
    {
      id: "product-rule", name: "Product Rule (Chain Rule)",
      threshold: "Build a joint probability one stage at a time", allOrNothing: false,
      note: [
        { h: "The product rule", body: "Rearranging the definition of conditional probability gives ℙ[A ∩ B] = ℙ[A] · ℙ[B | A]. Instead of asking 'what fraction of the whole space is in both,' you walk it in stages: first A happens, then B happens given A." },
        { h: "The chain rule", body: "The same idea extends to any number of events: ℙ[A₁ ∩ ⋯ ∩ Aₙ] = ℙ[A₁] · ℙ[A₂ | A₁] · ℙ[A₃ | A₁ ∩ A₂] ⋯ ℙ[Aₙ | A₁ ∩ ⋯ ∩ Aₙ₋₁]. Each new factor conditions on <b>everything</b> that came before it." },
        { h: "Think in trees", body: "When the experiment is a sequence of choices, draw a tree and multiply the probabilities down a single root-to-leaf path. That product is exactly the chain rule in disguise." },
        { h: "When it collapses", body: "If the events are independent, every ℙ[Aₖ | earlier] drops to plain ℙ[Aₖ], and the chain rule becomes a plain product ℙ[A₁]·ℙ[A₂]⋯ℙ[Aₙ]. That is the next-but-one topic." }
      ],
      formulas: [
        { k: "Product rule", v: "ℙ[A ∩ B] = ℙ[A] · ℙ[B | A]" },
        { k: "Chain rule", v: "ℙ[A₁]·ℙ[A₂|A₁]⋯ℙ[Aₙ|A₁∩⋯∩Aₙ₋₁]" },
        { k: "Tree diagram", v: "multiply along one root-to-leaf path" },
        { k: "If independent", v: "factors become plain ℙ[Aₖ]" }
      ],
      worked: [
        { tag: "Note 18 · three heads", q: "Toss a fair coin three times. Probability all three are heads?", a: "ℙ[A₁ ∩ A₂ ∩ A₃] = ℙ[A₁]·ℙ[A₂ | A₁]·ℙ[A₃ | A₁ ∩ A₂] = ½ · ½ · ½ = <b>1/8</b>. (Here the flips are independent, so each factor is just ½.)" },
        { tag: "Note 18 · hearts flush", q: "Deal 5 cards. Probability they are all hearts?", a: "Chain the draws, conditioning each on the ones before: 13/52 · 12/51 · 11/50 · 10/49 · 9/48. Each numerator drops because hearts are being used up. That product is the probability of a hearts flush." },
        { tag: "Birthdays", q: "Three people, 365 equally likely birthdays. Probability all three differ?", a: "First person is free, then condition each new person on avoiding the earlier ones: 1 · (364/365) · (363/365) = <b>363·364 / 365²</b> ≈ 0.992." }
      ],
      quiz: [
        { q: "The product rule says ℙ[A ∩ B] equals:", choices: ["ℙ[A] + ℙ[B]", "ℙ[A] · ℙ[B | A]", "ℙ[A | B] · ℙ[A]", "ℙ[A] · ℙ[B]"], answer: 1, why: "It is the conditional-probability definition rearranged. ℙ[A]·ℙ[B] only holds when A and B are independent." },
        { q: "Draw 2 cards without replacement. The probability both are hearts is:", type: "sa", accept: ["(13/52)(12/51)", "13/52 * 12/51", "1/17", "156/2652"], answer: "(13/52)(12/51) = 1/17", why: "Chain rule: 13/52 for the first heart, then 12/51 conditioned on it." },
        { q: "In the chain rule, the factor for event Aₖ conditions on:", choices: ["nothing", "only Aₖ₋₁", "all earlier events A₁ … Aₖ₋₁", "all later events"], answer: 2, why: "Each factor conditions on the full intersection of everything that came before it." },
        { q: "Toss a fair coin 4 times. ℙ[all four heads] =", type: "sa", accept: ["1/16", "(1/2)^4", "0.0625"], answer: "1/16", why: "½ four times over, since the flips are independent: (½)⁴ = 1/16." }
      ]
    },

    /* =================== 3. TOTAL PROBABILITY & BAYES =================== */
    {
      id: "total-bayes", name: "Total Probability & Bayes",
      threshold: "The flip-it-around rule. Expect a word problem.", allOrNothing: false,
      note: [
        { h: "Partition into cases", body: "Events A₁, …, Aₙ <b>partition</b> the sample space if they are mutually exclusive (no overlap) and together cover everything. The smallest partition is just A and its complement Ā." },
        { h: "Total Probability Rule", body: "To find ℙ[B], split on which case happened and add the weighted conditionals: ℙ[B] = Σᵢ ℙ[B | Aᵢ] ℙ[Aᵢ]. The two-case version is ℙ[B] = ℙ[B | A]ℙ[A] + ℙ[B | Ā]ℙ[Ā]. This is how you compute the denominator you are about to need." },
        { h: "Bayes' Rule", body: "To turn ℙ[B | A] into ℙ[A | B], use ℙ[A | B] = ℙ[B | A] ℙ[A] / ℙ[B], and expand ℙ[B] by total probability. Bayes lets you reverse the direction of conditioning." },
        { h: "Prior and posterior", body: "ℙ[A] is the <b>prior</b>: your belief before the evidence. ℙ[A | B] is the <b>posterior</b>: your updated belief after observing B. Bayes is the update rule." },
        { h: "The base-rate trap", body: "A rare event (tiny prior) can stay unlikely even after a positive test, because false positives from the huge 'not A' group outnumber the true positives. Always weight by the prior, never read the sensitivity as the answer." }
      ],
      formulas: [
        { k: "Partition", v: "Aᵢ disjoint, ∪Aᵢ = Ω" },
        { k: "Total probability", v: "ℙ[B] = Σ ℙ[B | Aᵢ] ℙ[Aᵢ]" },
        { k: "Two cases", v: "ℙ[B] = ℙ[B|A]ℙ[A] + ℙ[B|Ā]ℙ[Ā]" },
        { k: "Bayes' Rule", v: "ℙ[A | B] = ℙ[B | A]ℙ[A] / ℙ[B]" }
      ],
      worked: [
        { tag: "Note 17 · medical test", q: "A disease affects 5% of people. The test is positive on 90% of sick people and on 20% of healthy people. A random person tests positive. Probability they are sick?", a: "Let A = sick, B = positive. ℙ[A] = 0.05, ℙ[B | A] = 0.9, ℙ[B | Ā] = 0.2. Total probability: ℙ[B] = 0.9·0.05 + 0.2·0.95 = 0.045 + 0.19 = 0.235. Bayes: ℙ[A | B] = 0.045 / 0.235 = <b>9/47 ≈ 0.19</b>. Even after a positive test it is only 19%, because the healthy group is so much larger." },
        { tag: "Note 17 · tennis", q: "You play X (chosen w.p. 0.6, you beat with 0.7) or Y (chosen w.p. 0.4, you beat with 0.3). Probability you win?", a: "Total probability: ℙ[win] = 0.7·0.6 + 0.3·0.4 = 0.42 + 0.12 = <b>0.54</b>." },
        { tag: "Note 17 · which bin", q: "Bin 1 is 2 white / 3 black, Bin 2 is 1 white / 1 black. Pick a bin at random, draw a white ball. Probability it came from Bin 1?", a: "ℙ[white | Bin1] = 2/5, ℙ[white | Bin2] = 1/2, each bin prior 1/2. ℙ[white] = 2/5·1/2 + 1/2·1/2 = 9/20. Bayes: ℙ[Bin1 | white] = (2/5·1/2) / (9/20) = (1/5)/(9/20) = <b>4/9</b>." }
      ],
      learn: [
        { teach: "<h3>Bayes in one line</h3><p>You know ℙ[B | A] (how the test behaves) but you want ℙ[A | B] (what a result tells you). Bayes flips it: ℙ[A | B] = ℙ[B | A] ℙ[A] / ℙ[B]. The only hard part is the denominator ℙ[B], and total probability builds it.</p>",
          check: { q: "Bayes' Rule writes ℙ[A | B] as:", choices: ["ℙ[A | B] = ℙ[A ∩ B]·ℙ[B]", "ℙ[A | B] = ℙ[B | A]ℙ[A] / ℙ[B]", "ℙ[A | B] = ℙ[B | A] / ℙ[A]"], answer: 1, why: "Numerator ℙ[B | A]ℙ[A] = ℙ[A ∩ B], divided by ℙ[B]." } },
        { teach: "<h3>Build the denominator</h3><p>ℙ[B] is the chance of the evidence over all cases. Split on A versus Ā: ℙ[B] = ℙ[B | A]ℙ[A] + ℙ[B | Ā]ℙ[Ā]. For the disease test: ℙ[B] = 0.9·0.05 + 0.2·0.95 = 0.045 + 0.19 = 0.235.</p>",
          check: { q: "With ℙ[A]=0.05, ℙ[B|A]=0.9, ℙ[B|Ā]=0.2, the value ℙ[B] is:", type: "sa", accept: ["0.235", ".235", "47/200"], answer: "0.235", why: "0.9·0.05 + 0.2·0.95 = 0.045 + 0.19 = 0.235." } },
        { teach: "<h3>Put it together</h3><p>Numerator is the 'true positive' weight ℙ[B | A]ℙ[A] = 0.045. Divide by ℙ[B] = 0.235 to get ℙ[A | B] = 0.045 / 0.235 = 9/47 ≈ 0.19.</p>",
          check: { q: "ℙ[A | B] = 0.045 / 0.235 is about:", choices: ["0.90", "0.19", "0.05", "0.47"], answer: 1, why: "9/47 ≈ 0.19. The positive test raised belief from 5% to 19%, not to 90%." } },
        { teach: "<h3>Why so low? The base rate</h3><p>Healthy people are 95% of the population, and 20% of them test positive, so false positives (0.19) swamp the true positives (0.045). The prior always matters. A big sensitivity cannot rescue a tiny prior. That is the whole lesson of Bayes, and the thing quizzes love to test.</p>" }
      ],
      videos: [
        { t: "Bayes theorem, the geometry of changing beliefs", by: "3Blue1Brown", note: "The clearest visual for prior, likelihood, and posterior", url: "https://www.youtube.com/watch?v=HZGCoVF3YvM" },
        { t: "The medical test paradox", by: "3Blue1Brown", note: "Exactly the base-rate trap in the disease-test example", url: "https://www.youtube.com/watch?v=lG4VkPoG3ko" }
      ],
      quiz: [
        { q: "The two-case Total Probability Rule for ℙ[B] is:", choices: ["ℙ[B|A] + ℙ[B|Ā]", "ℙ[B|A]ℙ[A] + ℙ[B|Ā]ℙ[Ā]", "ℙ[B|A]ℙ[Ā] + ℙ[B|Ā]ℙ[A]", "ℙ[A|B]ℙ[B]"], answer: 1, why: "Weight each case's conditional by that case's probability, then add." },
        { q: "Bayes' Rule expresses ℙ[A | B] as:", type: "sa", accept: ["ℙ[B|A]ℙ[A]/ℙ[B]", "P[B|A]P[A]/P[B]", "p[b|a]p[a]/p[b]"], answer: "ℙ[B | A]ℙ[A] / ℙ[B]", why: "Flip the conditioning; the numerator is ℙ[A ∩ B]." },
        { q: "Disease in 5% of people, test positive on 90% of sick and 20% of healthy. Given a positive test, ℙ[sick] ≈", type: "sa", accept: ["9/47", "0.19", ".19", "19%", "0.19148936"], answer: "9/47 ≈ 0.19", why: "0.045 / 0.235 = 9/47. False positives from the large healthy group dominate." },
        { q: "After a positive test, ℙ[sick | positive] came out far below the 90% sensitivity. The reason is:", choices: ["The test is broken", "The disease has a low prior (base rate)", "Bayes does not apply", "The events are independent"], answer: 1, why: "A small prior means most positives are false positives from the large healthy group." }
      ]
    },

    /* =================== 4. INDEPENDENCE =================== */
    {
      id: "independence", name: "Independence",
      threshold: "When you may multiply, and when you may not", allOrNothing: false,
      note: [
        { h: "The definition", body: "Events A and B are <b>independent</b> if ℙ[A ∩ B] = ℙ[A] · ℙ[B]. Equivalently (when ℙ[B] &gt; 0) ℙ[A | B] = ℙ[A]: knowing B happened tells you nothing about A." },
        { h: "Independent ≠ mutually exclusive", body: "These are opposites, not synonyms. If A and B are disjoint with ℙ[A], ℙ[B] &gt; 0, then ℙ[A ∩ B] = 0 ≠ ℙ[A]ℙ[B], so they are strongly <b>dependent</b>: one happening rules the other out." },
        { h: "Mutual independence", body: "A₁, …, Aₙ are mutually independent if ℙ[∩ᵢ∈ₛ Aᵢ] = ∏ᵢ∈ₛ ℙ[Aᵢ] for <b>every</b> subset S, not just pairs. This is what lets you multiply across many events at once." },
        { h: "Pairwise does not imply mutual", body: "Toss a fair coin twice. A = first is H, B = second is H, C = the two match. Every pair is independent (each has probability ¼ of co-occurring = ½·½), yet A ∩ B forces C, so the triple is not mutually independent: ℙ[A ∩ B ∩ C] = ¼ ≠ (½)³." }
      ],
      formulas: [
        { k: "Independent", v: "ℙ[A ∩ B] = ℙ[A] · ℙ[B]" },
        { k: "Equivalent form", v: "ℙ[A | B] = ℙ[A]" },
        { k: "Mutual", v: "ℙ[∩ₛ Aᵢ] = ∏ₛ ℙ[Aᵢ] for all S" },
        { k: "Disjoint (pos. prob)", v: "dependent, not independent" }
      ],
      worked: [
        { tag: "Two dice", q: "A = first die is 6, B = second die is even. Independent?", a: "ℙ[A] = 1/6, ℙ[B] = 1/2, ℙ[A ∩ B] = 1/12 = (1/6)(1/2). Equal, so <b>yes, independent</b>. Separate dice do not influence each other." },
        { tag: "Note 18 · pairwise but not mutual", q: "Fair coin twice. A = first H, B = second H, C = both match. Are A, B, C mutually independent?", a: "Pairwise yes: for example ℙ[A ∩ C] = ℙ[HH] = 1/4 = (1/2)(1/2) = ℙ[A]ℙ[C]. But ℙ[A ∩ B ∩ C] = ℙ[HH] = 1/4, while ℙ[A]ℙ[B]ℙ[C] = (1/2)³ = 1/8. Since 1/4 ≠ 1/8, they are <b>not mutually independent</b>." },
        { tag: "Disjoint check", q: "On one die roll, A = {roll is 1}, B = {roll is 2}. Independent?", a: "ℙ[A ∩ B] = ℙ[∅] = 0, but ℙ[A]ℙ[B] = (1/6)(1/6) = 1/36 ≠ 0. <b>Not independent.</b> Disjoint events with positive probability are always dependent." }
      ],
      learn: [
        { teach: "<h3>What independence means</h3><p>A and B are independent exactly when ℙ[A ∩ B] = ℙ[A]ℙ[B]. The everyday meaning: B carries no information about A, so ℙ[A | B] = ℙ[A]. This is the one condition that lets you multiply probabilities.</p>",
          check: { q: "A and B are independent iff:", choices: ["ℙ[A ∩ B] = 0", "ℙ[A ∩ B] = ℙ[A]ℙ[B]", "ℙ[A ∪ B] = ℙ[A] + ℙ[B]"], answer: 1, why: "That product rule is the definition; the middle option. The others describe disjointness, not independence." } },
        { teach: "<h3>The trap: disjoint is the opposite</h3><p>If A and B cannot both happen (disjoint) and each has positive probability, then learning A happened tells you B did <i>not</i>. That is maximal dependence. ℙ[A ∩ B] = 0 while ℙ[A]ℙ[B] > 0.</p>",
          check: { q: "Two disjoint events with positive probability are:", choices: ["independent", "dependent", "always equally likely"], answer: 1, why: "One rules the other out, so they are dependent, never independent." } },
        { teach: "<h3>Pairwise vs mutual</h3><p>Mutual independence needs the product rule to hold for every subset, not only pairs. Coin twice: A = first H, B = second H, C = match. Each pair checks out, but A and B together <i>determine</i> C, so the three are not mutually independent.</p>",
          check: { q: "Does every pair being independent force the whole set to be mutually independent?", choices: ["Yes", "No"], answer: 1, why: "The coin example is pairwise independent but not mutually independent." } },
        { teach: "<h3>Why it matters</h3><p>Mutual independence is exactly the license to write ℙ[A₁ ∩ ⋯ ∩ Aₙ] = ℙ[A₁]⋯ℙ[Aₙ]. Without it you must fall back on the chain rule with real conditionals. On the quiz, never multiply unless independence is given or provable.</p>" }
      ],
      quiz: [
        { q: "Events A and B are independent when:", choices: ["ℙ[A ∩ B] = 0", "ℙ[A ∩ B] = ℙ[A] · ℙ[B]", "ℙ[A] = ℙ[B]", "A ∪ B = Ω"], answer: 1, why: "The defining product rule. Independence is about multiplying, disjointness is about ℙ[A ∩ B] = 0." },
        { q: "A and B are disjoint with ℙ[A], ℙ[B] > 0. Are they independent?", choices: ["Yes", "No"], answer: 1, why: "ℙ[A ∩ B] = 0 but ℙ[A]ℙ[B] > 0, so they are dependent." },
        { q: "If every pair among A, B, C is independent, must A, B, C be mutually independent?", choices: ["Yes, pairwise implies mutual", "No, pairwise is weaker"], answer: 1, why: "Coin-twice example: pairwise independent, but the triple is not." },
        { q: "The condition ℙ[A | B] = ℙ[A] (with ℙ[B] > 0) is equivalent to saying A and B are:", type: "sa", accept: ["independent"], answer: "independent", why: "Multiply both sides by ℙ[B]: ℙ[A ∩ B] = ℙ[A]ℙ[B]." }
      ]
    },

    /* =================== 5. INCLUSION-EXCLUSION =================== */
    {
      id: "inclusion-exclusion", name: "Inclusion-Exclusion",
      threshold: "Probability of a union, counting overlaps once", allOrNothing: false,
      note: [
        { h: "Two events", body: "ℙ[A ∪ B] = ℙ[A] + ℙ[B] − ℙ[A ∩ B]. Adding ℙ[A] and ℙ[B] counts the overlap twice, so subtract it once. (Same formula for set sizes: |A ∪ B| = |A| + |B| − |A ∩ B|.)" },
        { h: "Three events", body: "ℙ[A ∪ B ∪ C] = ℙ[A] + ℙ[B] + ℙ[C] − ℙ[A∩B] − ℙ[A∩C] − ℙ[B∩C] + ℙ[A∩B∩C]. Add singles, subtract pairs, add the triple back." },
        { h: "The general pattern", body: "Alternate signs by the size of the intersection: ℙ[∪Aᵢ] = Σ (−1)^{k−1} Σ_{|S|=k} ℙ[∩_{i∈S} Aᵢ]. Odd-sized intersections add, even-sized subtract." },
        { h: "When it simplifies", body: "If the events are mutually exclusive, every intersection is empty and the formula collapses to just ℙ[∪Aᵢ] = Σ ℙ[Aᵢ]. For many events the full formula has 2ⁿ − 1 terms and is often replaced by the union bound (next topic)." }
      ],
      formulas: [
        { k: "Two events", v: "ℙ[A ∪ B] = ℙ[A]+ℙ[B]−ℙ[A∩B]" },
        { k: "Three events", v: "singles − pairs + triple" },
        { k: "General", v: "Σ(−1)^{k−1} Σ_{|S|=k} ℙ[∩ₛ Aᵢ]" },
        { k: "Disjoint", v: "ℙ[∪Aᵢ] = Σ ℙ[Aᵢ]" }
      ],
      worked: [
        { tag: "Note 18 · Las Vegas dice", q: "Pick a number 1 to 6, throw three dice, win if your number shows on at least one. Probability of winning?", a: "Let Aᵢ = your number on die i, ℙ[Aᵢ] = 1/6. The Aᵢ are independent, so ℙ[Aᵢ∩Aⱼ] = 1/36 and ℙ[A₁∩A₂∩A₃] = 1/216. Inclusion-exclusion: ℙ[A₁∪A₂∪A₃] = 3·(1/6) − 3·(1/36) + 1/216 = <b>91/216 ≈ 0.42</b>. The naive 3·(1/6) = 1/2 overcounts the overlaps." },
        { tag: "Counting", q: "How many integers from 1 to 100 are divisible by 2 or 3?", a: "|div by 2| = 50, |div by 3| = 33, |div by 6| = 16. So |2 or 3| = 50 + 33 − 16 = <b>67</b>." },
        { tag: "Direct", q: "ℙ[A] = 0.5, ℙ[B] = 0.4, ℙ[A ∩ B] = 0.2. Find ℙ[A ∪ B].", a: "0.5 + 0.4 − 0.2 = <b>0.7</b>." }
      ],
      quiz: [
        { q: "ℙ[A ∪ B] equals:", choices: ["ℙ[A] + ℙ[B]", "ℙ[A] + ℙ[B] − ℙ[A ∩ B]", "ℙ[A] · ℙ[B]", "ℙ[A] + ℙ[B] + ℙ[A ∩ B]"], answer: 1, why: "Subtract the overlap once, since adding the two counts it twice." },
        { q: "Pick a number, roll three dice, win if it appears at least once. ℙ[win] =", type: "sa", accept: ["91/216", "0.42", ".42"], answer: "91/216 ≈ 0.42", why: "3·1/6 − 3·1/36 + 1/216 = 91/216. Not the naive 1/2." },
        { q: "In the three-event formula, the sign on the triple intersection term ℙ[A ∩ B ∩ C] is:", choices: ["minus (subtract)", "plus (add)", "zero", "it depends"], answer: 1, why: "Odd-sized intersections (1 and 3) add; even-sized (2) subtract." },
        { q: "Integers 1 to 100 divisible by 2 or 3:", type: "sa", accept: ["67"], answer: "67", why: "50 + 33 − 16 = 67." }
      ]
    },

    /* =================== 6. UNION BOUND =================== */
    {
      id: "union-bound", name: "Union Bound",
      threshold: "A one-line upper bound on 'at least one'", allOrNothing: false,
      note: [
        { h: "The statement", body: "For any events A₁, …, Aₙ, ℙ[A₁ ∪ ⋯ ∪ Aₙ] ≤ ℙ[A₁] + ⋯ + ℙ[Aₙ]. Always true, no independence or any other assumption needed." },
        { h: "Why it holds", body: "Inclusion-exclusion subtracts all the pairwise and higher overlaps. Throwing those subtracted terms away can only make the estimate larger, so the plain sum is an upper bound. Overlaps get counted more than once, never less." },
        { h: "When it is exact", body: "Equality holds exactly when the events are mutually exclusive, because then there are no overlaps to subtract and the union probability really is the sum." },
        { h: "When to reach for it", body: "Use it to bound the chance that <b>at least one</b> bad event happens, especially with many events where full inclusion-exclusion is hopeless. It is crude but one line, and in computer science it is often tight enough to prove 'the failure probability is small.'" }
      ],
      formulas: [
        { k: "Union bound", v: "ℙ[∪Aᵢ] ≤ Σ ℙ[Aᵢ]" },
        { k: "Equality", v: "iff the Aᵢ are mutually exclusive" },
        { k: "Reading", v: "ℙ[some bad event] ≤ Σ ℙ[each]" },
        { k: "Assumptions", v: "none (independence not required)" }
      ],
      worked: [
        { tag: "Reliability", q: "Ten components each fail with probability 0.001. Bound the probability that at least one fails.", a: "Let Aᵢ = component i fails. Union bound: ℙ[∪Aᵢ] ≤ Σ ℙ[Aᵢ] = 10·0.001 = <b>0.01</b>. (The exact value for independent parts is 1 − 0.999¹⁰ ≈ 0.00996, so the bound is both simple and tight.)" },
        { tag: "Consistency with I-E", q: "In the Las Vegas dice game, what does the union bound give, and is it consistent?", a: "ℙ[win] ≤ 3·(1/6) = 1/2. The exact value was 91/216 ≈ 0.42, which is indeed below 1/2. The bound overshoots because it ignores the subtracted overlaps." },
        { tag: "Algorithms", q: "A randomized check fails on test i with probability at most 1/n². Bound the chance any of the n tests fails.", a: "ℙ[any failure] ≤ Σᵢ 1/n² = n·(1/n²) = <b>1/n</b>, which shrinks as n grows. This is the classic computer-science use of the union bound." }
      ],
      quiz: [
        { q: "The union bound states:", choices: ["ℙ[∪Aᵢ] = Σ ℙ[Aᵢ]", "ℙ[∪Aᵢ] ≤ Σ ℙ[Aᵢ]", "ℙ[∪Aᵢ] ≥ Σ ℙ[Aᵢ]", "ℙ[∩Aᵢ] ≤ Σ ℙ[Aᵢ]"], answer: 1, why: "The sum of individual probabilities is an upper bound on the union." },
        { q: "The union bound requires the events to be independent.", choices: ["True", "False"], answer: 1, why: "It needs no assumptions at all; it holds for any events." },
        { q: "The union bound is an equality exactly when the events are:", type: "sa", accept: ["mutually exclusive", "disjoint", "mutually exclusive (disjoint)"], answer: "mutually exclusive (disjoint)", why: "No overlaps to subtract, so the sum equals the union." },
        { q: "Ten parts each fail with probability 0.001. The union bound on 'at least one fails' is:", type: "sa", accept: ["0.01", ".01", "1/100", "10*0.001"], answer: "0.01", why: "Σ ℙ[Aᵢ] = 10 · 0.001 = 0.01." }
      ]
    }
  ],

  /* Synthesis: questions that braid several topics together, quiz-style. */
  synthesis: [
    { tag: "Two coins and a box · total probability + independence + Bayes",
      q: "A box holds 2 fair coins and 1 two-headed coin. You pick one at random and flip it twice, getting heads both times. What is the probability you picked the two-headed coin?",
      a: "Priors: ℙ[fair] = 2/3, ℙ[two-headed] = 1/3. The two flips are independent, so ℙ[HH | fair] = (1/2)² = 1/4 and ℙ[HH | two-headed] = 1. Total probability: ℙ[HH] = (2/3)(1/4) + (1/3)(1) = 1/6 + 1/3 = 1/2. Bayes: ℙ[two-headed | HH] = (1/3 · 1) / (1/2) = <b>2/3</b>.",
      lesson: "Independence gives each case's likelihood (square the per-flip probability), total probability builds the denominator, Bayes finishes. Name the three moves and the problem falls apart cleanly." },
    { tag: "At least one failure · three ways · inclusion-exclusion vs union bound",
      q: "Three independent servers each go down with probability 0.1. Find the exact probability that at least one is down, and compare it to the union bound.",
      a: "<b>Complement (cleanest):</b> ℙ[at least one down] = 1 − ℙ[all up] = 1 − 0.9³ = 1 − 0.729 = <b>0.271</b>. <b>Inclusion-exclusion agrees:</b> 3(0.1) − 3(0.01) + 0.001 = 0.3 − 0.03 + 0.001 = 0.271. <b>Union bound:</b> ≤ 3(0.1) = 0.3, a valid ceiling above 0.271.",
      lesson: "For 'at least one' with independent events, the complement 1 − ∏(1 − pᵢ) is almost always the fastest exact route. Inclusion-exclusion is the exact long way, and the union bound is the quick upper estimate. Know all three and pick the cheapest." }
  ]
};

/* This guide's own practice problems, in quiz style. Try, then reveal. */
window.CS70.practice = {
  "conditional": [
    { q: "A family has two children (each independently a boy or girl, equally likely). Given that at least one is a girl, what is the probability both are girls?", sol: "Equally likely outcomes {BB, BG, GB, GG}. Condition on 'at least one girl' = {BG, GB, GG}. Both girls is {GG}, one of three. Answer 1/3." },
    { q: "Draw 2 cards without replacement. Given the first is a heart, what is ℙ[second is a heart]?", sol: "One heart is gone, 12 hearts remain among 51 cards: 12/51 = 4/17." },
    { q: "Roll two fair dice. Given the sum is even, what is ℙ[both dice are odd]?", sol: "Sum even splits into both-odd or both-even, each with 9 of the 18 even-sum outcomes. So 9/18 = 1/2." }
  ],
  "product-rule": [
    { q: "An urn has 3 red and 2 blue balls. Draw 2 without replacement. Probability both are red?", sol: "Chain rule: 3/5 · 2/4 = 6/20 = 3/10." },
    { q: "Probability a 5-card hand is all spades?", sol: "13/52 · 12/51 · 11/50 · 10/49 · 9/48 ≈ 0.000495." },
    { q: "Four people, 365 equally likely birthdays. Probability all four are different?", sol: "1 · 364/365 · 363/365 · 362/365 ≈ 0.984." }
  ],
  "total-bayes": [
    { q: "Spam filter: 40% of mail is spam. The word 'free' appears in 50% of spam and 10% of real mail. An email contains 'free'. Probability it is spam?", sol: "ℙ[free] = 0.5·0.4 + 0.1·0.6 = 0.2 + 0.06 = 0.26. Bayes: ℙ[spam | free] = 0.2 / 0.26 = 10/13 ≈ 0.77." },
    { q: "Two factories make a part: A (60% of output, 2% defective) and B (40%, 5% defective). A part is defective. Probability it came from B?", sol: "ℙ[defective] = 0.02·0.6 + 0.05·0.4 = 0.012 + 0.02 = 0.032. ℙ[B | defective] = 0.02 / 0.032 = 5/8 = 0.625." },
    { q: "A test is 99% sensitive and 99% specific for a disease that affects 1 in 1000. You test positive. Probability you have it?", sol: "ℙ[pos] = 0.99·0.001 + 0.01·0.999 = 0.00099 + 0.00999 = 0.01098. ℙ[disease | pos] = 0.00099 / 0.01098 ≈ 0.09. Still only about 9%, the base-rate trap again." }
  ],
  "independence": [
    { q: "Roll two dice. A = sum is 7, B = first die is 4. Independent?", sol: "ℙ[A] = 6/36 = 1/6, ℙ[B] = 1/6, ℙ[A ∩ B] = ℙ[(4,3)] = 1/36 = (1/6)(1/6). Yes, independent (sum 7 is the one special total that stays independent of either die)." },
    { q: "Draw one card. A = it is a heart, B = it is a king. Independent?", sol: "ℙ[A] = 13/52 = 1/4, ℙ[B] = 4/52 = 1/13, ℙ[A ∩ B] = ℙ[king of hearts] = 1/52 = (1/4)(1/13). Yes, independent." },
    { q: "Roll two dice. A = sum is 6, B = first die is 3. Independent?", sol: "ℙ[A] = 5/36, ℙ[B] = 1/6, ℙ[A ∩ B] = ℙ[(3,3)] = 1/36. But (5/36)(1/6) = 5/216 ≠ 1/36 = 6/216. Not independent." }
  ],
  "inclusion-exclusion": [
    { q: "Integers 1 to 100 divisible by 2, 3, or 5. How many?", sol: "50 + 33 + 20 − 16 − 10 − 6 + 3 = 74." },
    { q: "ℙ[A] = 0.6, ℙ[B] = 0.5, A and B independent. Find ℙ[A ∪ B].", sol: "Independent so ℙ[A ∩ B] = 0.3. Then ℙ[A ∪ B] = 0.6 + 0.5 − 0.3 = 0.8." },
    { q: "In a class, 70% like tea, 60% like coffee, 50% like both. What fraction like at least one?", sol: "0.7 + 0.6 − 0.5 = 0.8." }
  ],
  "union-bound": [
    { q: "A program has 50 independent assertions, each failing with probability at most 0.0002. Bound the probability any assertion fails.", sol: "Union bound: ≤ 50 · 0.0002 = 0.01." },
    { q: "You union-bound ℙ[A ∪ B] ≤ ℙ[A] + ℙ[B] = 0.9. Later you learn A and B are disjoint with ℙ[A] = 0.5, ℙ[B] = 0.4. What is the exact value?", sol: "Disjoint means equality: ℙ[A ∪ B] = 0.5 + 0.4 = 0.9. The bound was tight here." },
    { q: "n events each have probability 1/(2n). Upper bound the probability that at least one occurs.", sol: "Union bound: ≤ n · 1/(2n) = 1/2, regardless of overlaps or dependence." }
  ]
};

/* Reread the source material. Links point to the official course site. */
window.CS70.exams = [
  { sem: "Note 17 · Conditional Probability & Bayes' Rule", exam: "https://www.eecs70.org/assets/pdf/notes/n17.pdf", sol: "https://www.eecs70.org/" },
  { sem: "Note 18 · Inclusion-Exclusion & Combinations of Events", exam: "https://www.eecs70.org/assets/pdf/notes/n18.pdf", sol: "https://www.eecs70.org/" }
];
window.CS70.resourceLinks = [
  { label: "Course notes (all)", url: "https://www.eecs70.org/" },
  { label: "Homework & solutions", url: "https://www.eecs70.org/" },
  { label: "Discussion worksheets", url: "https://www.eecs70.org/discussions/" },
  { label: "Resources page", url: "https://www.eecs70.org/resources/" }
];

/* Practice queue topics (used by the queue view). */
window.CS70.queue = [
  { id: "conditional",         name: "Conditional Probability" },
  { id: "product-rule",        name: "Product Rule (Chain Rule)" },
  { id: "total-bayes",         name: "Total Probability & Bayes" },
  { id: "independence",        name: "Independence" },
  { id: "inclusion-exclusion", name: "Inclusion-Exclusion" },
  { id: "union-bound",         name: "Union Bound" }
];
