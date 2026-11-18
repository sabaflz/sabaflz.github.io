/*
  lessons/rsa.js: Lecture 7, RSA (Note 7).
  Follows the note: the Alice, Bob and Eve setting and the idea of a public
  lock, key generation, encryption and decryption, a worked example with
  repeated squaring, the proof of correctness from Fermat's little theorem
  (and the CRT version), the security assumption, the cost of finding primes
  and of exponentiation, and common mistakes. Every number was checked by computer.
*/
window.LESSONS["rsa"] = {
  minutes: 19,
  boards: {
    setting: [
      "Alice wants to send Bob a message x.  Eve hears everything on the line.",
      "",
      "Alice sends E(x).   Bob computes D(E(x)) = x.",
      "",
      "Private-key:  Alice and Bob agree on a secret codebook ahead of time.",
      "Public-key:   Bob publishes a lock anyone can close; only Bob can open it."
    ],
    keys: [
      "Bob picks two large primes p, q  and sets  N = pq.",
      "Bob picks e with gcd(e, (p − 1)(q − 1)) = 1.",
      "Public key:   (N, e)",
      "Private key:  d = e⁻¹ (mod (p − 1)(q − 1))",
      "",
      "Encrypt:  E(x) = xᵉ mod N",
      "Decrypt:  D(y) = yᵈ mod N",
      "Claim:    D(E(x)) = x for every x ∈ {0, 1, …, N − 1}"
    ],
    example: [
      "p = 7,  q = 13,  N = 91,  (p − 1)(q − 1) = 6 · 12 = 72",
      "e = 5:  gcd(5, 72) = 1  ✓",
      "d = 5⁻¹ mod 72 = 29,  since 5 · 29 = 145 = 2·72 + 1",
      "Public key (91, 5).   Private key 29.",
      "",
      "Encrypt x = 4:   4⁵ = 1024 = 11·91 + 23,  so y = 23"
    ],
    squaring: [
      "Decrypt y = 23:  compute 23²⁹ mod 91 by repeated squaring",
      "23¹ ≡ 23     23² = 529 ≡ 74     23⁴ ≡ 74² ≡ 16     23⁸ ≡ 16² ≡ 74     23¹⁶ ≡ 74² ≡ 16",
      "29 = 16 + 8 + 4 + 1   (binary 11101)",
      "23²⁹ ≡ 16 · 74 · 16 · 23",
      "16 · 74 = 1184 = 13·91 + 1 ≡ 1,   so  23²⁹ ≡ 16 · 23 = 368 ≡ 4 (mod 91)  ✓"
    ],
    proof: [
      "Want:  x^(ed) ≡ x (mod N) for every x",
      "ed ≡ 1 (mod (p − 1)(q − 1)), so  ed = 1 + k(p − 1)(q − 1)",
      "x^(ed) − x = x · (x^(k(p − 1)(q − 1)) − 1)",
      "",
      "Claim: p divides this.",
      "Case 1, p ∤ x:  FLT gives xᵖ⁻¹ ≡ 1, so x^(k(p − 1)(q − 1)) = (xᵖ⁻¹)^(k(q − 1)) ≡ 1.",
      "                The second factor is ≡ 0 (mod p).",
      "Case 2, p | x:  the first factor x is ≡ 0 (mod p).",
      "",
      "Same argument for q.  p | and q | with p ≠ q primes  ⟹  pq = N divides it. ∎"
    ],
    crtproof: [
      "Alternative proof with CRT:",
      "x^(ed) = x · (x^(k(q − 1)))^(p − 1) ≡ x (mod p)     (FLT, or both sides 0 if p | x)",
      "x^(ed) ≡ x (mod q)                                    (same argument)",
      "CRT: the only number mod pq that is ≡ x mod p and ≡ x mod q is x itself."
    ],
    security: [
      "Assumption:  given N, e and y = xᵉ mod N, no efficient algorithm finds x.",
      "",
      "Eve's options:",
      "  try every x:            about N tries, hopeless for 1024-bit N",
      "  factor N into p, q:     then (p − 1)(q − 1) and d are easy",
      "                          but factoring is believed to be hard",
      "",
      "Not proved!  RSA rests on: breaking RSA ≈ factoring, and factoring is hard."
    ],
    cost: [
      "What Bob and Alice must do quickly:",
      "1. Find large primes.  Primality testing is fast (unlike factoring).",
      "   Prime number theorem:  π(n) ≥ n / ln n  for n ≥ 17.",
      "   About 1 in 355 numbers below 2⁵¹² is prime, so random guessing works.",
      "2. Compute xᵉ and yᵈ mod N.  Repeated squaring: O(log N) multiplications,",
      "   each on O(log N)-bit numbers, so O((log N)³) work in total."
    ],
    pitfalls: [
      "Common mistakes:",
      "1. Computing d mod N instead of mod (p − 1)(q − 1).",
      "2. Choosing e that shares a factor with (p − 1)(q − 1) (e = 2 never works).",
      "3. Forgetting Case 2 (p | x) in the proof: FLT does not apply there.",
      "4. Thinking N alone gives d. Eve needs (p − 1)(q − 1), which needs p and q.",
      "5. Encrypting a tiny set of possible messages: Eve can encrypt each one herself."
    ]
  },
  steps: [
    { board: "setting", hl: [1, 3],
      say: "RSA is the first big application of modular arithmetic. Alice wants to send a message x to Bob over a line that Eve can listen to. Alice sends an encrypted version E of x, and Bob applies his decryption function D to get x back. Eve sees E of x but should learn nothing useful from it." },
    { board: "setting", hl: [5, 6],
      say: "For centuries, Alice and Bob had to meet first and agree on a secret codebook. Public-key cryptography removes that meeting. Bob publishes a kind of digital lock that anyone can snap shut on a message, while only Bob holds the key that opens it. The puzzle is how Bob can have an advantage over Eve when they both see the same public information." },
    { board: "keys", hl: [1, 2, 3, 4],
      say: "Bob picks two large primes p and q and multiplies them to get N. He picks an e that shares no factor with p minus 1 times q minus 1. He publishes N and e. His private key d is the inverse of e mod p minus 1 times q minus 1, which exists because e was chosen coprime to it. Bob keeps p, q and d secret.",
      basics: "(p − 1)(q − 1) is a product of two numbers, not a modulus applied twice. e⁻¹ (mod m) is the inverse from Note 6, found with extended Euclid." },
    { board: "keys", hl: [6, 7, 8],
      say: "To encrypt, Alice raises x to the e, mod N. To decrypt, Bob raises the result to the d, mod N. The theorem to prove is that this always gives back x. Messages are numbers from 0 to N minus 1. A longer message is split into pieces.",
      ask: { type: "mc", q: "Which of these does Eve get to see?",
        choices: ["N and e", "p and q", "d", "(p − 1)(q − 1)"], answer: 0,
        why: "(N, e) is the public key. p, q, d and (p − 1)(q − 1) stay secret; any one of them lets Eve find d." } },
    { board: "example", hl: [1, 2, 3, 4],
      say: "A small example. Take p equals 7 and q equals 13, so N is 91 and p minus 1 times q minus 1 is 72. The exponent e equals 5 works, since 5 and 72 share no factor. The inverse of 5 mod 72 is 29, because 5 times 29 is 145, which is 2 times 72 plus 1.",
      ask: { type: "mc", q: "With p = 7 and q = 13, could Bob use e = 3 instead?",
        choices: ["No, because gcd(3, 72) = 3", "Yes, any odd e works", "Yes, because 3 is prime"], answer: 0,
        why: "72 = 3 · 24, so 3 has no inverse mod 72 and there is no valid d. e must be coprime to (p − 1)(q − 1), not just odd or prime." } },
    { board: "example", hl: [6],
      say: "To send x equals 4, Alice computes 4 to the 5th, which is 1024. Divide by 91: 11 times 91 is 1001, leaving 23. So Alice sends 23. Eve sees 23 and the public key, but without d she is stuck.",
      ask: { type: "type", q: "With the same public key (91, 5), what is the encryption of x = 2?", answer: "32",
        why: "2⁵ = 32, which is already less than 91, so E(2) = 32." } },
    { board: "squaring", hl: [1, 2, 3, 4, 5],
      table: { name: "Powers of 23 mod 91", cols: ["power", "value", "used for 29?"],
        rows: [["23¹", "23", "yes"], ["23²", "74", "no"], ["23⁴", "16", "yes"], ["23⁸", "74", "yes"], ["23¹⁶", "16", "yes"]] },
      say: "Bob decrypts by computing 23 to the 29th mod 91. Never multiply 23 by itself 29 times. Square repeatedly, reducing mod 91 each time: 23, 74, 16, 74, 16. Since 29 is 16 plus 8 plus 4 plus 1, multiply those four powers. 16 times 74 happens to be 1 mod 91, so the answer is 16 times 23, which is 368, or 4 mod 91. Bob gets the message back.",
      tip: "On exams, write the exponent in binary, build the table of squares, and reduce after every multiplication. Then multiply only the powers that appear." },
    { board: "proof", hl: [1, 2, 3],
      say: "Why does it work? Since e d is 1 mod p minus 1 times q minus 1, you can write e d as 1 plus k times p minus 1 times q minus 1, for some integer k. So x to the e d, minus x, factors as x times the quantity x to the k p minus 1 q minus 1, minus 1. You want to show N divides this." },
    { board: "proof", hl: [5, 6, 7, 8],
      say: "First show p divides it. If p does not divide x, Fermat says x to the p minus 1 is 1 mod p, so the big power is 1 and the second factor is 0 mod p. If p does divide x, the first factor is already 0 mod p. Either way p divides the product.",
      ask: { type: "mc", q: "Why does the proof need Case 2 (p | x) separately?",
        choices: ["Fermat's little theorem only applies when p does not divide x", "Because x could be bigger than N", "It doesn't; Case 1 covers everything"], answer: 0,
        why: "FLT needs a ∈ {1, …, p − 1} mod p. If p | x then xᵖ⁻¹ ≡ 0, not 1, so you need the other factor instead." } },
    { board: "proof", hl: [10],
      say: "The same argument with q in place of p shows q divides it too. Since p and q are different primes, their product N divides it. So x to the e d is x mod N, for every message x, including the rare ones that share a factor with N." },
    { board: "crtproof", hl: [1, 2, 3, 4],
      say: "The note also gives a proof using the Chinese remainder theorem. Mod p, x to the e d works out to x, by Fermat or trivially. Mod q, the same. The CRT says only one number mod p q has those two remainders, and x is one, so x to the e d is x mod N.",
      tip: "Either proof earns full credit. Whichever you use, state both cases, p | x and p ∤ x." },
    { board: "security", hl: [1, 3, 4, 5, 6, 8],
      say: "Security rests on an assumption: given N, e and the ciphertext, nobody can find x efficiently. Eve could try every x, but that is about N tries. She could factor N, then compute p minus 1 times q minus 1 and d herself. But nobody knows a fast factoring algorithm. RSA is not proved secure. It is believed secure because factoring seems hard.",
      ask: { type: "mc", q: "Eve somehow learns (p − 1)(q − 1) for Bob's key. What can she do?",
        choices: ["Compute d with extended Euclid and read every message", "Nothing, she still needs p and q", "Only read messages smaller than e"], answer: 0,
        why: "d is just e⁻¹ mod (p − 1)(q − 1). In fact she can also find p and q: p + q = N − (p − 1)(q − 1) + 1, and pq = N." } },
    { board: "cost", hl: [1, 2, 3, 4],
      say: "Bob's own work has to be fast. Testing whether a number is prime is fast, even though factoring is not. And primes are common enough: the prime number theorem says about 1 in every 355 numbers below 2 to the 512 is prime. So Bob picks random 512-bit numbers and tests them until he finds two primes.",
      basics: "π(n) is the number of primes ≤ n. ln n is the natural logarithm. ln(2⁵¹²) = 512 · ln 2 ≈ 355.",
      ask: { type: "type", q: "About how many random 512-bit numbers should Bob expect to test before finding one prime?", answer: "355",
        why: "A fraction of about 1/ln(2⁵¹²) ≈ 1/355 are prime, so he expects about 355 tries." } },
    { board: "cost", hl: [5, 6],
      say: "Encryption and decryption use repeated squaring, which needs only about log N multiplications, each on numbers with about log N bits. That is O of log N cubed work. So Alice and Bob do a few million simple steps, while Eve faces a problem nobody can solve." },
    { board: "pitfalls", hl: [1, 2, 3, 4, 5, 6],
      say: "Watch for these. d is the inverse of e mod p minus 1 times q minus 1, not mod N. e must be coprime to that number, so e equals 2 never works, since p minus 1 is even. In the proof, do not forget the case where p divides x. And RSA as written is deterministic: if Alice's message is one of a few values, Eve can encrypt each candidate and compare." }
  ],

  check: [
    { type: "type", q: "p = 5, q = 7, e = 5. What is Bob's private key d?", answer: "5",
      why: "(p − 1)(q − 1) = 4 · 6 = 24, and 5 · 5 = 25 = 24 + 1, so d = 5⁻¹ mod 24 = 5. Here d happens to equal e." },
    { type: "type", q: "Bob's public key is (33, 3). What is the encryption of x = 5?", answer: "26",
      why: "5³ = 125 = 3·33 + 26. (Here N = 3 · 11, (p − 1)(q − 1) = 20 and d = 7.)" },
    { type: "mc", q: "Why must e be coprime to (p − 1)(q − 1)?",
      choices: ["So that d = e⁻¹ mod (p − 1)(q − 1) exists", "So that xᵉ is always less than N", "So that N is prime"], answer: 0,
      why: "The private key is defined as the inverse of e mod (p − 1)(q − 1). An inverse exists only when the gcd is 1." },
    { type: "type", q: "Eve learns N = 77 and (p − 1)(q − 1) = 60. What is p + q?", answer: "18",
      why: "(p − 1)(q − 1) = pq − (p + q) + 1 = N − (p + q) + 1, so p + q = 77 − 60 + 1 = 18. With pq = 77 that gives 7 and 11." },
    { type: "mc", q: "Bob tries RSA with N = p, a single large prime, and d = e⁻¹ mod (p − 1). What goes wrong?",
      choices: ["It decrypts correctly, but Eve can compute p − 1 and d from the public N", "Decryption fails for most messages", "Nothing; it is just as secure"], answer: 0,
      why: "By Fermat, x^(ed) ≡ x (mod p), so it works. But N = p is public, so Eve knows p − 1 and computes d. The security comes from Eve not knowing the factors." },
    { type: "mc", q: "In the correctness proof, which fact makes x^(k(p − 1)(q − 1)) ≡ 1 (mod p) when p ∤ x?",
      choices: ["Fermat's little theorem", "The Chinese remainder theorem", "The prime number theorem"], answer: 0,
      why: "FLT says xᵖ⁻¹ ≡ 1 (mod p), and x^(k(p − 1)(q − 1)) is a power of xᵖ⁻¹." },
    { type: "mc", q: "Roughly how many multiplications mod N does repeated squaring need to compute yᵈ, with d < N?",
      choices: ["O(log N)", "O(N)", "O(√N)"], answer: 0,
      why: "One squaring per bit of d plus at most one extra multiplication per bit. d has O(log N) bits." }
  ],

  deepen: [
    { id: "rsa_crt_decrypt", title: "Decrypt faster with CRT", source: "Original question",
      desc: ["Bob's primes are p = 11 and q = 13, and his public exponent is e = 7.",
        "(a) Find his private key d.",
        "(b) Bob receives y = 136. Instead of computing 136ᵈ mod 143 directly, compute it mod 11 and mod 13 using Fermat to shrink the exponent, then combine with CRT. What is the message x?"],
      answer: "20", answerLabel: "x =",
      hints: ["(p − 1)(q − 1) = 120 and 120 = 17·7 + 1. That gives d right away.",
        "Mod 11, exponents can be reduced mod 10; mod 13, mod 12. Find d mod 10 and d mod 12, and reduce 136 mod 11 and mod 13.",
        "You need 4³ mod 11 and 6⁷ mod 13. Then solve x ≡ 9 (mod 11), x ≡ 7 (mod 13)."],
      solution: [
        "(a)  (p − 1)(q − 1) = 10 · 12 = 120.  120 = 17·7 + 1, so 1 = 120 − 17·7 and 7⁻¹ ≡ −17 ≡ 103 (mod 120).  d = 103.",
        "     Check: 7 · 103 = 721 = 6·120 + 1.",
        "(b)  Mod 11:  136 = 12·11 + 4, so y ≡ 4.  103 = 10·10 + 3, and 4¹⁰ ≡ 1 by FLT, so yᵈ ≡ 4³ = 64 ≡ 9 (mod 11).",
        "     Mod 13:  136 = 10·13 + 6, so y ≡ 6.  103 = 8·12 + 7, and 6¹² ≡ 1 by FLT, so yᵈ ≡ 6⁷ (mod 13).",
        "     6² = 36 ≡ 10,  6⁴ ≡ 100 ≡ 9,  6⁷ = 6⁴ · 6² · 6 ≡ 9 · 10 · 6 = 540 ≡ 540 − 533 = 7 (mod 13).",
        "     CRT:  x ≡ 9 (mod 11) and x ≡ 7 (mod 13).  Numbers ≡ 7 mod 13: 7, 20, …  and 20 = 11 + 9.  So x = 20.",
        "Check:  20⁷ mod 143 = 136, so E(20) = 136.  ✓"
      ],
      explain: "Working mod p and mod q separately makes the exponents tiny (3 and 7 instead of 103). Real RSA software decrypts this way." },
    { id: "rsa_leak", title: "A leaked (p − 1)(q − 1)", source: "Original question",
      desc: ["Bob's public key is (N, e) = (221, 5). Eve learns that (p − 1)(q − 1) = 192.",
        "Find p and q, and find Bob's private key d."],
      answer: "77", answerLabel: "d =",
      hints: ["Expand (p − 1)(q − 1) = pq − (p + q) + 1 to find p + q.",
        "p and q are the roots of z² − (p + q)z + pq = 0.",
        "For d, run extended Euclid on 192 and 5."],
      solution: [
        "(p − 1)(q − 1) = N − (p + q) + 1, so p + q = 221 − 192 + 1 = 30.",
        "p and q are roots of z² − 30z + 221 = 0.  Discriminant 900 − 884 = 16, so z = (30 ± 4)/2 = 17 or 13.",
        "Check: 13 · 17 = 221 and 12 · 16 = 192.  ✓",
        "Extended Euclid:  192 = 38·5 + 2,  5 = 2·2 + 1.",
        "1 = 5 − 2·2 = 5 − 2·(192 − 38·5) = 77·5 − 2·192.",
        "So d = 5⁻¹ mod 192 = 77.  Check: 5 · 77 = 385 = 2·192 + 1.  ✓"
      ],
      explain: "Knowing (p − 1)(q − 1) is as good as knowing the factorization. That is why Bob must keep it secret along with p, q and d." },
    { id: "rsa_three_primes", title: "RSA with three primes", source: "Original question, a variation on Note 7",
      desc: ["Bob tries N = pqr for three distinct primes p, q, r. He picks e coprime to (p − 1)(q − 1)(r − 1) and sets d = e⁻¹ mod (p − 1)(q − 1)(r − 1). Encryption and decryption are still xᵉ mod N and yᵈ mod N.",
        "(a) Prove that x^(ed) ≡ x (mod N) for every x ∈ {0, …, N − 1}.",
        "(b) For p = 3, q = 5, r = 7 and e = 5, find d."],
      answer: "29", answerLabel: "(b) d =",
      hints: ["Write ed = 1 + k(p − 1)(q − 1)(r − 1) and factor x^(ed) − x as in the two-prime proof.",
        "Show p divides x^(ed) − x with two cases (p | x or not). The same works for q and r.",
        "For (b), (p − 1)(q − 1)(r − 1) = 2 · 4 · 6 = 48. Run extended Euclid on 48 and 5."],
      solution: [
        "(a)  ed ≡ 1 (mod (p − 1)(q − 1)(r − 1)), so ed = 1 + k(p − 1)(q − 1)(r − 1) for some integer k ≥ 0.",
        "     x^(ed) − x = x · (x^(k(p − 1)(q − 1)(r − 1)) − 1).",
        "     If p ∤ x:  by FLT xᵖ⁻¹ ≡ 1 (mod p), and the exponent is a multiple of p − 1, so the second factor is ≡ 0 (mod p).",
        "     If p | x:  the first factor is ≡ 0 (mod p).",
        "     So p | x^(ed) − x.  The same argument, using q − 1 and r − 1, gives q | x^(ed) − x and r | x^(ed) − x.",
        "     p, q, r are distinct primes, so pqr = N divides x^(ed) − x.  Hence x^(ed) ≡ x (mod N). ∎",
        "(b)  (p − 1)(q − 1)(r − 1) = 48.  48 = 9·5 + 3,  5 = 1·3 + 2,  3 = 1·2 + 1.",
        "     1 = 3 − 2 = 3 − (5 − 3) = 2·3 − 5 = 2·(48 − 9·5) − 5 = 2·48 − 19·5.",
        "     d = −19 mod 48 = 29.  Check: 5 · 29 = 145 = 3·48 + 1.  ✓"
      ],
      explain: "The proof never used that there were exactly two primes: each prime factor is handled by Fermat on its own, then the distinct primes combine. (Checked by computer: x¹⁴⁵ ≡ x mod 105 for every x.)" }
  ]
};
