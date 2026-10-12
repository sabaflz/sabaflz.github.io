/*
  content.js — CS 70 Fall 2026 midterm study content.
  All topic notes, formulas, worked examples, and quiz questions live here.
  Edit this file to change what the guide teaches.

  Each topic object:
    id        slug, used in URL hash and progress storage
    name      display name
    passed    optional: true if Saffron already passed it (dimmed, "done")
    threshold short line on how many questions pass the topic on the exam
    allOrNothing  true if you must get every question right
    note      array of sections: { h, body } where body is HTML
    formulas  array of { k, v } quick-reference rows
    worked    array of { tag, q, a } fully worked examples (HTML in a)
    quiz      array of questions for the interactive self-test:
                { q, choices:[...], answer:index, why }  (multiple choice)
              or
                { q, type:"sa", accept:[...], answer, why }  (short answer, string match)
*/

window.CS70 = {
  meta: {
    course: "CS 70",
    term: "Fall 2026",
    staff: "Hug, Sabin",
    examDate: "2026-10-15T19:00:00-07:00",
    examLabel: "Thursday Oct 15, 7–9pm",
    room: "A–K: Dwinelle 155 · L–U: Pimentel 1 · V–Z: Mulford 159",
    notesUrl: "https://www.eecs70.org/",
    policiesUrl: "https://www.eecs70.org/policies/"
  },

  // Saffron's current state, drives the "what to attempt" view
  passedTopics: ["direct-proofs", "prop-logic", "induction", "modular", "crt", "rsa"],

  topics: [
    /* ---------------- PASSED TOPICS (reference only) ---------------- */
    {
      id: "direct-proofs", name: "Direct Proofs", passed: true,
      threshold: "2 of 3 on the midterm", allOrNothing: false,
      note: [
        { h: "The move", body: "Assume the hypothesis, expand definitions, chain forward to the conclusion. State the technique in line one." },
        { h: "Definitions you expand", body: "<b>Odd:</b> n = 2k+1. <b>Even:</b> n = 2k. <b>Divides</b> (a|b): b = ka for some integer k. Always name the integer you introduce and note it stays an integer." }
      ],
      formulas: [
        { k: "Odd", v: "n = 2k + 1, k ∈ ℤ" },
        { k: "Even", v: "n = 2k, k ∈ ℤ" },
        { k: "a | b", v: "b = ka, k ∈ ℤ" }
      ],
      worked: [
        { tag: "Mock MT 1(b)", q: "a | b and b | c ⟹ a | c.", a: "b = k₁a, c = k₂b. Then c = k₂(k₁a) = (k₂k₁)a, and k₂k₁ ∈ ℤ, so a | c." }
      ],
      quiz: [
        { q: "To prove 'if n is odd then 3n+4 is odd' directly, what's your first substitution?", choices: ["n = 2k", "n = 2k+1", "3n+4 = 2k", "n = k/2"], answer: 1, why: "Odd hypothesis means n = 2k+1. Then 3n+4 = 6k+7 = 2(3k+3)+1, odd." },
        { q: "In a direct proof of a|b ∧ b|c ⟹ a|c, after writing b=k₁a and c=k₂b, what do you conclude?", type: "sa", accept: ["c=(k1k2)a", "c = (k2k1)a", "a|c", "c=k1k2a"], answer: "c = (k₁k₂)a, so a | c", why: "Substitute b into c: c = k₂(k₁a) = (k₁k₂)a, a product of integers times a." }
      ]
    },
    {
      id: "prop-logic", name: "Propositional Logic", passed: true,
      threshold: "4 of 6 on the midterm", allOrNothing: false,
      note: [
        { h: "Implication", body: "P ⟹ Q is false only when P true, Q false. Equivalent to ¬P ∨ Q. Vacuously true when P is false." },
        { h: "Contrapositive vs converse", body: "Contrapositive ¬Q ⟹ ¬P is <b>equivalent</b>. Converse Q ⟹ P is <b>not</b>. This is the most common trap." },
        { h: "Negating", body: "¬(P ⟹ Q) ≡ P ∧ ¬Q. Pushing ¬ through quantifiers flips each: ¬∀x P(x) ≡ ∃x ¬P(x), and ¬∃x P(x) ≡ ∀x ¬P(x)." },
        { h: "Quantifier order", body: "∀x∃y ≢ ∃y∀x. Order matters." }
      ],
      formulas: [
        { k: "P ⟹ Q", v: "≡ ¬P ∨ Q" },
        { k: "Contrapositive", v: "¬Q ⟹ ¬P (equivalent)" },
        { k: "¬(P ⟹ Q)", v: "≡ P ∧ ¬Q" },
        { k: "¬∀x P(x)", v: "≡ ∃x ¬P(x)" },
        { k: "¬∃x P(x)", v: "≡ ∀x ¬P(x)" },
        { k: "'Not every'", v: "∃x(S(x) ∧ ¬P(x))" }
      ],
      worked: [
        { tag: "Mock MT 2(a)", q: "Translate: 'Not every student who studies passes.'", a: "¬∀x(S(x) ⟹ P(x)) ≡ ∃x(S(x) ∧ ¬P(x))." },
        { tag: "Mock MT 2(f)", q: "Is ∃x(P(x) ∧ ¬Q(x)) ≡ ¬∀x(P(x) ⟹ Q(x))?", a: "Yes. ¬∀x(P⟹Q) ≡ ∃x¬(P⟹Q) ≡ ∃x(P ∧ ¬Q)." }
      ],
      quiz: [
        { q: "P ⟹ Q is logically equivalent to:", choices: ["P ∧ ¬Q", "¬P ∨ Q", "Q ⟹ P", "¬P ∧ Q"], answer: 1, why: "The implication identity. It fails only when P true and Q false, exactly when ¬P∨Q is false." },
        { q: "Which is equivalent to P ⟹ Q?", choices: ["Its converse Q⟹P", "Its contrapositive ¬Q⟹¬P", "Both", "Neither"], answer: 1, why: "Contrapositive is equivalent; converse is not. Classic trap." },
        { q: "¬(P ⟹ Q) simplifies to:", type: "sa", accept: ["p and not q", "p ∧ ¬q", "p^¬q", "p and ~q"], answer: "P ∧ ¬Q", why: "The only way an implication is false is a true hypothesis with a false conclusion." },
        { q: "Is ∀x∃y R(x,y) the same as ∃y∀x R(x,y)?", choices: ["Yes, quantifiers commute", "No, order matters"], answer: 1, why: "∀x∃y lets y depend on x; ∃y∀x forces one y for all x. Different statements." }
      ]
    },
    {
      id: "induction", name: "Induction", passed: true,
      threshold: "1 of 1 on the midterm", allOrNothing: true,
      note: [
        { h: "Structure", body: "Base case, inductive hypothesis (assume P(k)), inductive step (show P(k+1)). <b>Strong induction</b> assumes P(1)…P(k) all hold." },
        { h: "Game/strategy proofs", body: "For 'player X can guarantee a win' problems, induct on the game-state size and show X can always hand the opponent a losing position." }
      ],
      formulas: [
        { k: "Weak IH", v: "assume P(k), show P(k+1)" },
        { k: "Strong IH", v: "assume P(1)…P(k), show P(k+1)" }
      ],
      worked: [
        { tag: "Pattern", q: "When do you need strong induction?", a: "When P(k+1) depends on a case smaller than k, not just k itself (e.g. splitting into two smaller subproblems, or the raisin-pile game where the next even pile can be any size < k)." }
      ],
      quiz: [
        { q: "Strong induction differs from weak how?", choices: ["It skips the base case", "It assumes all of P(1)…P(k), not just P(k)", "It proves P(k-1)", "It needs two base cases always"], answer: 1, why: "Strong induction's hypothesis covers every case up to k, useful when the step reaches back further than one." }
      ]
    },
    {
      id: "modular", name: "Modular Arithmetic", passed: true,
      threshold: "4 of 5 on the midterm", allOrNothing: false,
      note: [
        { h: "Inverses", body: "a⁻¹ mod m exists iff gcd(a,m) = 1. Find it with the extended Euclidean algorithm. Over GF(prime), every nonzero element has an inverse." },
        { h: "Reducing powers", body: "Use a ≡ small (mod m) first. 67 ≡ −1 (mod 68), so 67^odd ≡ −1. 98·99·100 ≡ (−3)(−2)(−1) (mod 101)." }
      ],
      formulas: [
        { k: "Inverse exists", v: "iff gcd(a, m) = 1" },
        { k: "# invertibles mod m", v: "count of a with gcd(a,m)=1" },
        { k: "a ≡ b (mod m)", v: "m | (a − b)" }
      ],
      worked: [
        { tag: "Mock MT 4(a)", q: "67^6767 (mod 68).", a: "67 ≡ −1, exponent odd, so ≡ −1 ≡ 67 (mod 68)." },
        { tag: "Mock MT 4(e)", q: "How many a ∈ {0..15} have an inverse mod 16?", a: "Those coprime to 16: the 8 odd numbers 1,3,5,7,9,11,13,15." }
      ],
      quiz: [
        { q: "a⁻¹ exists mod m exactly when:", choices: ["a is prime", "gcd(a,m) = 1", "m is even", "a < m"], answer: 1, why: "Coprimality is necessary and sufficient; extended Euclid then produces the inverse." },
        { q: "98·99·100 (mod 101) =", type: "sa", accept: ["95", "-6", "−6"], answer: "95", why: "≡ (−3)(−2)(−1) = −6 ≡ 95 (mod 101)." },
        { q: "How many invertible elements mod 16?", type: "sa", accept: ["8"], answer: "8", why: "The 8 odd residues are coprime to 16." }
      ]
    },
    {
      id: "crt", name: "CRT", passed: true,
      threshold: "1 of 1 on the midterm", allOrNothing: true,
      note: [
        { h: "What it says", body: "For pairwise-coprime moduli n₁…nₖ with product N, any system x ≡ aᵢ (mod nᵢ) has a unique solution mod N." },
        { h: "Construction", body: "x = Σ aᵢuᵢ where uᵢ = (N/nᵢ)·[(N/nᵢ)⁻¹ mod nᵢ]. Each uᵢ is 1 mod nᵢ and 0 mod the others." }
      ],
      formulas: [
        { k: "N", v: "n₁·n₂·…·nₖ" },
        { k: "uᵢ", v: "(N/nᵢ)·[(N/nᵢ)⁻¹ mod nᵢ]" },
        { k: "x", v: "Σ aᵢuᵢ (mod N)" }
      ],
      worked: [
        { tag: "Mock MT CRT", q: "x ≡ 2 (mod 5), 1 (mod 6), 4 (mod 7).", a: "N = 210. u₁ = 42·(42⁻¹ mod 5)=42·3=126, u₂=35·5=175, u₃=30·4=120. x = 2·126+1·175+4·120 = 907 ≡ 67 (mod 210)." }
      ],
      quiz: [
        { q: "CRT guarantees a unique solution mod N when the moduli are:", choices: ["All prime", "Pairwise coprime", "All even", "Consecutive"], answer: 1, why: "Pairwise coprimality is the exact condition; the primes themselves need not be prime, just coprime." },
        { q: "In the basis uᵢ = (N/nᵢ)·c, what is c?", choices: ["nᵢ itself", "(N/nᵢ)⁻¹ mod nᵢ", "N⁻¹ mod nᵢ", "aᵢ"], answer: 1, why: "c is the inverse of N/nᵢ modulo nᵢ, which forces uᵢ ≡ 1 (mod nᵢ)." }
      ]
    },
    {
      id: "rsa", name: "RSA", passed: true,
      threshold: "2 of 3 on the midterm", allOrNothing: false,
      note: [
        { h: "Setup", body: "N = pq. e coprime to (p−1)(q−1). d ≡ e⁻¹ mod (p−1)(q−1). Public key (N, e); private key d." },
        { h: "Functions", body: "E(x) = xᵉ mod N, D(y) = y^d mod N. Correctness rests on Fermat's Little Theorem." },
        { h: "Correctness still holds if", body: "e changes by a multiple of (p−1)(q−1): then e'd ≡ ed ≡ 1 mod (p−1)(q−1), so d still works." }
      ],
      formulas: [
        { k: "N", v: "p·q" },
        { k: "d", v: "e⁻¹ mod (p−1)(q−1)" },
        { k: "E(x)", v: "xᵉ mod N" },
        { k: "D(y)", v: "y^d mod N" }
      ],
      worked: [
        { tag: "Mock MT RSA(a)", q: "p=17, q=5, e=23. Public key and E(x)?", a: "N = 85, public key (85, 23), E(x) = x²³ mod 85." },
        { tag: "Mock MT RSA(b)", q: "Smallest d for p=17,q=5,e=23.", a: "d = 23⁻¹ mod 64. Extended Euclid gives d = 39." }
      ],
      quiz: [
        { q: "The private key d satisfies:", choices: ["d ≡ e⁻¹ mod N", "d ≡ e⁻¹ mod (p−1)(q−1)", "d = pq", "d = e"], answer: 1, why: "d is e's inverse modulo (p−1)(q−1), which is why ed ≡ 1 there and decryption works." },
        { q: "For p=17, q=5, the modulus N is:", type: "sa", accept: ["85"], answer: "85", why: "N = pq = 17·5 = 85." }
      ]
    },

    /* ---------------- TARGET TOPICS (to attempt Thursday) ---------------- */
    {
      id: "proof-tech", name: "Proof Techniques",
      threshold: "2 of 2 — all or nothing", allOrNothing: true,
      note: [
        { h: "Pick the technique fast", body: "<b>Direct:</b> assuming P hands you something. <b>Contrapositive:</b> ¬Q is more concrete than P. <b>Contradiction:</b> proving something doesn't exist or is unique. <b>Cases:</b> you know one of several situations holds." },
        { h: "Uniqueness", body: "Show one solution works (existence), then assume two solutions e₁, e₂ and force e₁ = e₂." },
        { h: "Iff proofs", body: "Prove both directions. For the hard direction, factoring the expression is often the trick." },
        { h: "State it in line one", body: "'We proceed by contraposition / contradiction.' Free credit, and keeps your structure honest." }
      ],
      formulas: [
        { k: "Contrapositive", v: "prove ¬Q ⟹ ¬P instead of P ⟹ Q" },
        { k: "Contradiction", v: "assume ¬P, derive R ∧ ¬R" },
        { k: "Uniqueness", v: "existence + (two solutions ⟹ equal)" }
      ],
      worked: [
        { tag: "Mock MT 3(a)", q: "Prove a unique real x has x+a = a+x = a for all a.", a: "<b>Existence:</b> x = 0 works. <b>Uniqueness:</b> if e₁, e₂ both work, e₁ = e₁+e₂ = e₂, so e₁ = e₂." },
        { tag: "Mock MT 3(b)", q: "a even ∧ b odd ⟺ ab+7b−2a−14 odd.", a: "(⟹) sub a=2k, b=2m+1, expand to 2(·)+1. (⟸) factor as (a+7)(b−2); odd product ⟹ both factors odd ⟹ a even, b odd." }
      ],
      quiz: [
        { q: "To prove 'a+b ≤ 15 ⟹ a ≤ 11 or b ≤ 4', the cleanest technique is:", choices: ["Direct proof", "Contrapositive", "Induction", "Cases on parity"], answer: 1, why: "¬Q is 'a>11 and b>4', two concrete inequalities you add to contradict the hypothesis." },
        { q: "A uniqueness proof needs which two parts?", choices: ["Base case and step", "Existence and 'two solutions are equal'", "Forward and converse", "Contrapositive and contradiction"], answer: 1, why: "Show something works, then show any two somethings coincide." },
        { q: "Which technique best fits 'prove √2 is irrational'?", choices: ["Direct", "Contradiction", "Cases", "Induction"], answer: 1, why: "You're showing integers a,b with √2=a/b don't exist, the signature of a contradiction proof." },
        { q: "What should the first line of a contrapositive proof say?", type: "sa", accept: ["assume not q", "assume ¬q", "we prove the contrapositive", "proceed by contraposition"], answer: "We prove the contrapositive: assume ¬Q.", why: "Naming the technique is expected and rewarded." }
      ]
    },
    {
      id: "polynomials", name: "Polynomials",
      threshold: "3 of 3 — all or nothing", allOrNothing: true,
      note: [
        { h: "Over GF(p)", body: "All arithmetic is mod a prime p. 'Divide' means multiply by the inverse. Reduce every coefficient into {0,…,p−1} at the end." },
        { h: "Property 1", body: "A nonzero degree-d polynomial has at most d roots. Degrees of a product add." },
        { h: "Property 2", body: "d+1 points with distinct x determine a unique degree-≤d polynomial." },
        { h: "Lagrange interpolation", body: "Δᵢ(x) = ∏(j≠i)(x−xⱼ) / ∏(j≠i)(xᵢ−xⱼ), each 1 at xᵢ and 0 at the others. Then p(x) = Σ yᵢΔᵢ(x). A point with yᵢ=0 lets you skip its Δ." },
        { h: "FLT reduction", body: "Over GF(p), xᵖ ≡ x, so xᵖ drops the exponent by p−1. Repeat while exponent ≥ p." }
      ],
      formulas: [
        { k: "Δᵢ(x)", v: "∏(x−xⱼ)/∏(xᵢ−xⱼ), j≠i" },
        { k: "p(x)", v: "Σ yᵢ Δᵢ(x)" },
        { k: "≤ roots", v: "degree d ⟹ ≤ d roots" },
        { k: "deg(fg)", v: "deg f + deg g" },
        { k: "FLT", v: "xᵖ ≡ x (mod p)" }
      ],
      worked: [
        { tag: "Mock MT 5(a) · GF(11)", q: "Points (1,7),(3,5),(4,0). Given Δ₂=5x²+8x+9.", a: "Skip Δ₃ (y=0). Δ₁ denom (1−3)(1−4)=6, 6⁻¹=2, so Δ₁=2(x−3)(x−4)=2x²+8x+2. p = 7Δ₁+5Δ₂ = 6x²+8x+4 (mod 11)." },
        { tag: "Mock MT 5(b)", q: "deg f=4, deg g=3 over GF(11). Max distinct roots of fg?", a: "deg(fg)=7, so at most 7." },
        { tag: "Mock MT 5(c) · GF(13)", q: "Reduce 70x⁷²+2x²⁶+7 to degree <13.", a: "x¹³≡x drops exponents by 12: 72→12, 26→2. 70≡5. Answer 5x¹²+2x²+7." }
      ],
      quiz: [
        { q: "A nonzero degree-7 polynomial over GF(11) has at most how many roots?", type: "sa", accept: ["7", "seven"], answer: "7", why: "Property 1: at most d roots for degree d." },
        { q: "How many distinct points uniquely determine a degree-≤3 polynomial?", type: "sa", accept: ["4", "four", "d+1"], answer: "4", why: "Property 2: d+1 = 4 points." },
        { q: "In Lagrange interpolation, when can you skip computing Δᵢ entirely?", choices: ["When xᵢ = 0", "When yᵢ = 0", "When the degree is even", "Never"], answer: 1, why: "yᵢΔᵢ vanishes if yᵢ=0, so that basis polynomial never contributes." },
        { q: "Over GF(13), x²⁶ reduces to:", type: "sa", accept: ["x^2", "x2", "x²"], answer: "x²", why: "x¹³≡x drops the exponent by 12 each time: 26 → 14 → 2." },
        { q: "Why must the field be a prime (not composite) for Properties 1 and 2?", choices: ["So addition works", "So every nonzero element has an inverse (it's a field)", "To make it finite", "So FLT fails"], answer: 1, why: "Mod a composite there are zero divisors and missing inverses; both properties break (mod 8, x³=0 has 4 roots)." }
      ]
    },
    {
      id: "secret-sharing", name: "Secret Sharing & ECCs",
      threshold: "3 of 4 on the midterm", allOrNothing: false,
      note: [
        { h: "Erasure vs general", body: "Erasure (you know which packets dropped): send <b>n+k</b>, recover from any n. General errors (you don't know which are corrupted): send <b>n+2k</b>, recover from n+k correct." },
        { h: "Secret sharing", body: "Secret at P(0). For a k-threshold, polynomial degree is <b>k−1</b>. Field prime q > n and s. k shares reconstruct; k−1 shares reveal nothing (all q secrets equally likely)." },
        { h: "k sets the degree, n sets the shares", body: "The threshold k decides the polynomial degree (k−1). The number of people n only decides how many points you hand out." },
        { h: "Berlekamp-Welch", body: "Error-locator E(x) has degree k. Q(x)=P(x)E(x) has degree n+k−1. Solve n+2k linear equations in n+2k unknowns, then P = Q/E. Roots of E are the error locations." },
        { h: "Layered schemes", body: "For 'group A or group B' access, use a top polynomial for the secret and a sub-polynomial whose P(0) equals one of the top polynomial's shares." }
      ],
      formulas: [
        { k: "Erasure", v: "send n+k, recover from any n" },
        { k: "General", v: "send n+2k, recover from n+k" },
        { k: "k-threshold", v: "degree k−1, secret = P(0)" },
        { k: "E(x) degree", v: "k" },
        { k: "Q=PE degree", v: "n+k−1" },
        { k: "BW system", v: "n+2k eqns, n+2k unknowns" }
      ],
      worked: [
        { tag: "Mock MT 6(a)", q: "Guard 1 general error, 5 points sent. Message length?", a: "n+2k=5, k=1, so n=3." },
        { tag: "Mock MT 6(b)", q: "Client corrupts k packets. Recover from n+k?", a: "False. Corruption is general error, needs n+2k." },
        { tag: "Mock MT 6(c)", q: "2 co-presidents + 10 officers; access = both co-pres OR 1 co-pres + 7 officers.", a: "Top P degree 1 (co-pres hold P(1),P(2)). Sub Q degree 6 with Q(0)=P(3); 7 officers recover P(3). Two polynomials; degrees 1 and 6; each person gets 1 point." }
      ],
      quiz: [
        { q: "To correct k general errors, how many total packets for an n-symbol message?", type: "sa", accept: ["n+2k", "n + 2k"], answer: "n + 2k", why: "General errors need double redundancy because you must locate them too." },
        { q: "To survive k erasures (known positions), send:", type: "sa", accept: ["n+k", "n + k"], answer: "n + k", why: "Erasures only need enough surviving points to interpolate: any n of n+k." },
        { q: "A 3-of-5 secret sharing scheme uses a polynomial of degree:", type: "sa", accept: ["2", "k-1", "k−1"], answer: "2", why: "Degree = k−1 = 2, so exactly 3 points pin it down." },
        { q: "In Berlekamp-Welch, Q(x) = P(x)E(x) has degree:", choices: ["k", "n−1", "n+k−1", "n+2k"], answer: 2, why: "deg P = n−1, deg E = k, product degree n+k−1." },
        { q: "Why do k−1 shares reveal zero information about the secret?", choices: ["They're encrypted", "For every candidate secret there's a unique consistent polynomial, so all q are equally likely", "The polynomial is random", "k−1 is always too few points to compute anything"], answer: 1, why: "k−1 points plus any choice of (0, b) give a valid degree k−1 polynomial, so the secret could equally be any value." }
      ]
    },
    {
      id: "graphs", name: "Graphs",
      threshold: "4 of 5 — your easiest lock", allOrNothing: false,
      note: [
        { h: "Handshake", body: "Σ deg(v) = 2|E|. The workhorse: it ties degrees to edge count, and forces the number of odd-degree vertices to be even." },
        { h: "Complete graphs & trees", body: "Kₙ: each vertex degree n−1, n(n−1)/2 edges. Tree on n vertices: connected, acyclic, exactly n−1 edges." },
        { h: "Eulerian tour", body: "Exists iff connected and every vertex has even degree. (Uses each edge once, returns to start.)" },
        { h: "Planarity", body: "Euler: v + f = e + 2. Bound e ≤ 3v−6; triangle-free (e.g. bipartite) e ≤ 2v−4. K₅ and K₃,₃ are the non-planar obstructions. Passing a bound doesn't prove planar; failing proves non-planar." },
        { h: "Hypercube", body: "n-dim: 2ⁿ vertices, degree n, n·2ⁿ⁻¹ edges, diameter n. Shortest path between two vertices = number of bits that differ." }
      ],
      formulas: [
        { k: "Handshake", v: "Σ deg(v) = 2|E|" },
        { k: "Kₙ edges", v: "n(n−1)/2" },
        { k: "Tree edges", v: "n − 1" },
        { k: "Euler's formula", v: "v + f = e + 2" },
        { k: "Planar bound", v: "e ≤ 3v−6 (tri-free 2v−4)" },
        { k: "n-cube", v: "2ⁿ verts, deg n, n·2ⁿ⁻¹ edges, diam n" }
      ],
      worked: [
        { tag: "Mock MT 7(c)", q: "12-sided die: 12 faces, 20 vertices. Edges?", a: "Euler: 20 + 12 = e + 2, so e = 30." },
        { tag: "Mock MT 7(d)", q: "5-cube shortest path 10010 → 01000.", a: "Bits differing: positions 1,2,4 → 3." },
        { tag: "Mock MT 7(e)", q: "Odd-degree vertex ⟹ another exists.", a: "Σ deg = 2|E| is even. One odd vertex would make the sum odd. Contradiction, so there's a second." }
      ],
      quiz: [
        { q: "Kₙ has how many edges?", type: "sa", accept: ["n(n-1)/2", "n(n−1)/2", "nc2", "n choose 2"], answer: "n(n−1)/2", why: "Every pair of the n vertices gets one edge." },
        { q: "A graph has an Eulerian tour iff:", choices: ["It's a tree", "It's connected and every degree is even", "It's planar", "It has n−1 edges"], answer: 1, why: "Even degrees let the pen enter and leave each vertex in pairs; connectivity ties it together." },
        { q: "A tree on 50 vertices has how many edges?", type: "sa", accept: ["49"], answer: "49", why: "A tree always has n−1 edges." },
        { q: "Euler's formula for a connected planar graph is:", type: "sa", accept: ["v+f=e+2", "v + f = e + 2", "v-e+f=2", "v−e+f=2"], answer: "v + f = e + 2", why: "Vertices plus faces equal edges plus two." },
        { q: "Shortest path in a 5-cube from 10010 to 01000 is:", type: "sa", accept: ["3", "three"], answer: "3", why: "Count differing bit positions: 1, 2, and 4 differ." },
        { q: "Is K₅ planar?", choices: ["Yes", "No"], answer: 1, why: "v=5, e=10, but 3v−6 = 9 < 10, so it fails the planar bound." }
      ]
    },
    {
      id: "graph-induction", name: "Graph Induction",
      threshold: "1 of 1 — one pattern", allOrNothing: true,
      note: [
        { h: "The reliable pattern", body: "Induct on the number of <b>edges</b>, removing one edge. Removing an edge changes exactly two degrees by one each, which keeps the step clean. (Removing a vertex can disconnect the graph and needs strong induction.)" },
        { h: "Proving the handshake lemma", body: "Base |E|=0: all degrees 0, sum 0 = 2·0. Step: remove an edge, apply IH to get Σdeg = 2k, add the edge back, two degrees rise by 1 so the sum rises by 2 = 2(k+1)." }
      ],
      formulas: [
        { k: "Induct on", v: "number of edges |E|" },
        { k: "Add an edge", v: "two degrees +1, sum +2" }
      ],
      worked: [
        { tag: "Mock MT 8(a)", q: "Prove Σ deg(v) = 2|E| by induction.", a: "Base |E|=0: sum of zeros = 0 = 2·0. IH: holds at k edges. Step: k+1 edges, remove {u,v}, remaining has sum 2k by IH; adding it back raises deg(u),deg(v) by 1 each, so sum = 2k+2 = 2(k+1). ✓" }
      ],
      quiz: [
        { q: "For graph induction proofs, the cleanest thing to induct on is usually:", choices: ["Number of vertices (weak)", "Number of edges", "Degree of one vertex", "The diameter"], answer: 1, why: "Removing one edge changes exactly two degrees by one, avoiding the disconnection issue vertex removal causes." },
        { q: "When you add one edge back into a graph, the total degree sum changes by:", type: "sa", accept: ["2", "+2", "two"], answer: "2", why: "The edge's two endpoints each gain one degree." }
      ]
    },
    {
      id: "stable-matching", name: "Stable Matching",
      threshold: "3 of 5 — new, never quizzed", allOrNothing: false,
      note: [
        { h: "Stability", body: "A rogue (unstable) pair is a job J and candidate C not matched together, but each prefers the other to their current partner. A matching is stable if no rogue pair exists." },
        { h: "Propose-reject (Gale-Shapley)", body: "Proposers propose down their lists; receivers hold their best offer and reject the rest. Always terminates, always yields a stable matching." },
        { h: "Optimality", body: "The proposing side gets its best possible stable partner (proposer-optimal); the receiving side gets its worst (receiver-pessimal)." },
        { h: "Key facts", body: "If job-proposing and candidate-proposing give the same matching, there's exactly one stable matching. 'Least favorite' or 'not top choice' pairings can still be stable, as long as no rogue pair can form." }
      ],
      formulas: [
        { k: "Rogue pair", v: "both prefer each other to current" },
        { k: "Stable", v: "no rogue pair exists" },
        { k: "Job-proposing", v: "job-optimal, candidate-pessimal" },
        { k: "Both runs equal", v: "exactly one stable matching" }
      ],
      worked: [
        { tag: "Mock MT 9(a)", q: "How do you check a given matching is stable?", a: "For every unmatched job-candidate pair, check whether both prefer each other to their current partner. Any such pair = rogue = unstable." },
        { tag: "Mock MT 9(e)", q: "Both proposer runs give the same matching. How many stable matchings?", a: "Exactly one. Job-proposing is job-optimal, candidate-proposing is job-pessimal; if they coincide there's only one." }
      ],
      quiz: [
        { q: "A matching is stable when:", choices: ["Everyone gets their top choice", "No rogue pair exists", "It's produced by proposing", "Each side ranks the other first"], answer: 1, why: "Stability is exactly the absence of a mutually-preferring unmatched pair." },
        { q: "Propose-reject with jobs proposing produces a matching that is:", choices: ["Job-pessimal", "Job-optimal, candidate-pessimal", "Always unique", "Random"], answer: 1, why: "The proposing side does best possible; the receiving side does worst possible, across all stable matchings." },
        { q: "If both proposer-orderings yield the same matching, the number of stable matchings is:", type: "sa", accept: ["1", "one", "exactly one"], answer: "1", why: "The job-optimal and job-pessimal matchings coincide, leaving only one." },
        { q: "Can a pair of mutual least-favorites appear in a stable matching?", choices: ["Yes", "No"], answer: 0, why: "Stability only forbids rogue pairs. If no one can do better, even mutual-least-favorites can be stable." }
      ]
    }
  ],

  /* Synthesis questions get their own panel */
  synthesis: [
    { tag: "Mock synthesis · CRT revisited",
      q: "Given cx ≡ ca (mod cp) and dx ≡ db (mod dq) with p,q coprime, how many solutions mod cdpq?",
      a: "Divide each congruence by its common factor (invertible): it collapses to x ≡ a (mod p), x ≡ b (mod q), the original CRT system with unique solution x′ mod pq. Lifting to mod cdpq gives x′ + k·pq for k ∈ {0,…,cd−1}: <b>cd solutions</b>.",
      lesson: "Manipulate the structure before grinding numbers. The scaled system is secretly the original." },
    { tag: "Mock synthesis · Rogue Delegates (hardest)",
      q: "Degree-49 shared polynomial, 70 delegations (1 point each). Each delegation: degree-5 polynomial, 10 delegates. Smallest number of rogue delegates to break recovery?",
      a: "<b>Shared layer:</b> degree 49 needs 50 correct of 70, tolerates 10 errors, so breaking needs 11 corrupted delegation-points. <b>Per delegation:</b> degree 5 needs 6 correct; 10 delegates = 6 + 2·2 tolerates 2 errors, so 3 rogue delegates corrupt one point. <b>Total:</b> 11 × 3 = <b>33</b>.",
      lesson: "Count error tolerance layer by layer (n+2k each time), then multiply. Show the chain: Pass/No Pass grading needs the justification, not just the number." }
  ]
};
