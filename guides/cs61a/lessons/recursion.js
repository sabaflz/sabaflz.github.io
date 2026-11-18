/*
  lessons/recursion.js: everything for the Recursion topic.

  lesson.steps  the walkthrough, one screen per step
    say      the narration (also read aloud when Narrate is on)
    code     which snippet from `snippets` to show
    hl       line numbers to highlight (first line is 1)
    stack    the calls in progress, oldest first: { call, vars, state, done }
    out      lines printed so far
    syntax   a Python note, shown to the "new" and "programmer" levels
    basics   an extra note, shown to the "new" level only
    ask      a question that pauses the lesson
             type "mc": choices + answer (index).  type "type": answer (text)
  check    quick questions after the lesson (same shapes as `ask`)
  deepen   exam-style coding questions, run against hidden tests
*/
window.LESSONS.recursion = {
  minutes: 10,
  snippets: {
    fact: "def fact(n):\n    if n == 0:\n        return 1\n    return n * fact(n - 1)",
    digits: "def sum_digits(n):\n    if n < 10:\n        return n\n    return n % 10 + sum_digits(n // 10)",
    broken: "def count_down(n):\n    if n == 0:\n        return 0\n    return 1 + count_down(n)",
    cascade: "def cascade(n):\n    if n < 10:\n        print(n)\n    else:\n        print(n)\n        cascade(n // 10)\n        print(n)"
  },
  steps: [
    { code: "fact",
      say: "A recursive function is a function that calls itself. That sounds circular, but it works as long as two things are true: every call hands off a smaller problem, and one problem is small enough to answer directly.",
      basics: "A function is a named set of steps. You give it an input, it gives back a result. Here the function is named fact and its input is named n." },
    { code: "fact", hl: [1],
      say: "This function computes a factorial: fact(4) is 4 times 3 times 2 times 1. Read it top to bottom before we run it.",
      syntax: "Python notes: def starts a function. Indentation marks the body, there are no braces. == compares two values. return hands a value back to whoever called." },
    { code: "fact", hl: [2, 3],
      say: "Lines 2 and 3 are the base case: the input small enough to answer with no further calls. The factorial of 0 is 1, so the function just says so." },
    { code: "fact", hl: [4],
      say: "Line 4 is the recursive case. The factorial of n is n times the factorial of n minus 1. So the function asks itself for the smaller answer, then finishes with one multiplication." },
    { code: "fact", hl: [4],
      stack: [{ call: "fact(3)", vars: "n = 3", state: "needs fact(2)" }],
      say: "Let's run fact(3). 3 is not 0, so we reach line 4. Before it can multiply, it needs fact(2). So fact(3) pauses on line 4 and waits." },
    { code: "fact", hl: [4],
      stack: [{ call: "fact(3)", vars: "n = 3", state: "waiting" }, { call: "fact(2)", vars: "n = 2", state: "needs fact(1)" }],
      say: "Every call gets its own frame with its own n. Inside fact(2), n is 2. The 3 in the first frame is untouched. fact(2) also reaches line 4 and needs fact(1)." },
    { code: "fact", hl: [4],
      stack: [{ call: "fact(3)", vars: "n = 3", state: "waiting" }, { call: "fact(2)", vars: "n = 2", state: "waiting" }, { call: "fact(1)", vars: "n = 1", state: "needs fact(0)" }],
      say: "fact(1) needs fact(0). Three calls are now paused, each one waiting on the call above it.",
      ask: { type: "mc", q: "fact(1) calls fact(0). Which line does fact(0) return from?",
        choices: ["Line 3, the base case", "Line 4, the recursive case", "It never returns"], answer: 0,
        why: "Inside fact(0), n is 0, so the test on line 2 is true and line 3 returns 1 right away. No more calls are made." } },
    { code: "fact", hl: [3],
      stack: [{ call: "fact(3)", vars: "n = 3", state: "waiting" }, { call: "fact(2)", vars: "n = 2", state: "waiting" }, { call: "fact(1)", vars: "n = 1", state: "waiting" }, { call: "fact(0)", vars: "n = 0", state: "returns 1", done: true }],
      say: "fact(0) hits the base case and returns 1. This is the turning point. Nothing has been multiplied yet. All the real work happens on the way back down." },
    { code: "fact", hl: [4],
      stack: [{ call: "fact(3)", vars: "n = 3", state: "waiting" }, { call: "fact(2)", vars: "n = 2", state: "waiting" }, { call: "fact(1)", vars: "n = 1", state: "got 1 back" }],
      say: "fact(1) wakes up on line 4, holding the 1 it was waiting for.",
      ask: { type: "type", q: "fact(1) got 1 back from fact(0). What does fact(1) return?", answer: "1",
        why: "Line 4 computes n * fact(n - 1). Here n is 1 and the call gave back 1, so it returns 1 * 1 = 1." } },
    { code: "fact", hl: [4],
      stack: [{ call: "fact(3)", vars: "n = 3", state: "waiting" }, { call: "fact(2)", vars: "n = 2", state: "returns 2 * 1 = 2", done: true }],
      say: "fact(2) gets that 1 and returns 2 times 1, which is 2." },
    { code: "fact", hl: [4],
      stack: [{ call: "fact(3)", vars: "n = 3", state: "returns 3 * 2 = 6", done: true }],
      say: "And fact(3) gets 2 and returns 3 times 2, which is 6. Calls stack up until the base case, then answers flow back in reverse order." },
    { code: "fact", hl: [4],
      say: "Here is the habit that makes recursion manageable: you do not trace every call. When you write line 4, assume fact(n - 1) already gives the right answer, and only ask how to get from that answer to yours. This is called the recursive leap of faith." },
    { code: "digits", hl: [4],
      say: "A second example. sum_digits adds up the digits of a number. The smaller problem is the same number with its last digit removed.",
      syntax: "Python notes: n % 10 is the remainder after dividing by 10, which is the last digit. n // 10 divides and drops the remainder, which is everything except the last digit. So 2026 % 10 is 6 and 2026 // 10 is 202." },
    { code: "digits", hl: [2, 3],
      say: "The base case is a single digit number: its digit sum is itself. Now use the leap of faith instead of tracing.",
      ask: { type: "type", q: "What does sum_digits(2026) return?", answer: "10",
        why: "It is 6 plus sum_digits(202). Trusting the smaller call, that is 6 + (2 + 0 + 2) = 10." } },
    { code: "digits",
      say: "Every recursive function answers three questions. One: what input is small enough to answer directly? Two: what is a smaller version of this problem? Three: given the answer to the smaller version, how do I build mine? For sum_digits: a single digit, the number without its last digit, and add the last digit." },
    { code: "broken", hl: [4],
      say: "Now a broken one. Look closely at line 4 and at what gets passed to the recursive call.",
      ask: { type: "mc", q: "What happens when you call count_down(3)?",
        choices: ["It returns 3", "It returns 0", "It keeps calling itself until Python raises RecursionError"], answer: 2,
        why: "Line 4 calls count_down(n) with the same n, so the problem never gets smaller and the base case is never reached. It should be count_down(n - 1)." } },
    { code: "cascade", hl: [5, 6, 7],
      say: "Last idea. Code written after the recursive call runs on the way back, once the inner call has finished. cascade prints before the call and again after it.",
      syntax: "Python notes: print shows a value on the screen. It is different from return: print displays, return hands a value back to the caller.",
      ask: { type: "mc", q: "What does cascade(123) print, top to bottom?",
        choices: ["123, 12, 1", "123, 12, 1, 12, 123", "1, 12, 123"], answer: 1,
        why: "Each call prints its number on the way in (123, 12), the base case prints 1, then line 7 runs in each paused call on the way back (12, 123)." } },
    { code: "cascade",
      out: ["123", "12", "1", "12", "123"],
      say: "That is recursion: a base case, a smaller problem, and a way to combine. Next, a few quick questions to check that it stuck." }
  ],

  check: [
    { type: "type", code: "def mystery(n):\n    if n == 0:\n        return 0\n    return n + mystery(n - 1)",
      q: "What does mystery(4) return?", answer: "10",
      why: "4 + mystery(3) = 4 + 3 + 2 + 1 + 0 = 10. It adds the numbers from n down to 0." },
    { type: "mc", code: "def length(s):\n    if s == '':\n        return 0\n    return 1 + length(s[1:])",
      q: "Which part is the base case?",
      choices: ["s == '' returns 0", "1 + length(s[1:])", "s[1:]"], answer: 0,
      why: "The empty string is the input answered directly, with no recursive call. s[1:] is the string without its first character: the smaller problem." },
    { type: "mc", code: "def f(n):\n    if n > 0:\n        f(n - 1)\n        print(n)",
      q: "What does f(3) print, top to bottom?",
      choices: ["3, 2, 1", "1, 2, 3", "3, 2, 1, 0"], answer: 1,
      why: "print comes after the recursive call, so each call prints on the way back. The deepest call that prints is f(1), so 1 comes first." },
    { type: "mc", code: "def sum_digits(n):\n    if n < 10:\n        return n\n    return n % 10 + ______",
      q: "What goes in the blank?",
      choices: ["sum_digits(n - 1)", "sum_digits(n // 10)", "sum_digits(n % 10)"], answer: 1,
      why: "n // 10 is the number without its last digit, the smaller problem. n % 10 is only the last digit, which has already been added." },
    { type: "type", code: "def fact(n):\n    if n == 0:\n        return 1\n    return n * fact(n - 1)",
      q: "How many calls to fact are made in total when you call fact(4)? Count the first call.", answer: "5",
      why: "fact(4), fact(3), fact(2), fact(1) and fact(0): five calls. A call with input n makes n + 1 calls in total." },
    { type: "mc",
      q: "You are writing the recursive case of a function. What should you assume about the recursive call?",
      choices: ["Nothing. Trace it all the way to the base case first.", "That it returns the correct answer for the smaller input.", "That it will be the base case."], answer: 1,
      why: "That is the leap of faith. Trust the smaller call, then work out how to turn its answer into yours." }
  ],

  deepen: [
    { id: "rec_count_digit", title: "Count a digit", source: "Original question",
      desc: "Return how many times the digit d appears in the non-negative integer n. Use recursion. Do not use loops, strings, or lists.",
      starter: "def count_digit(n, d):\n    \"\"\"Return how many times digit d appears in n.\n    >>> count_digit(2026, 2)\n    2\n    >>> count_digit(2026, 7)\n    0\n    >>> count_digit(8, 8)\n    1\n    \"\"\"\n    \"*** YOUR CODE HERE ***\"\n",
      solution: "def count_digit(n, d):\n    last = 1 if n % 10 == d else 0\n    if n < 10:\n        return last\n    return last + count_digit(n // 10, d)",
      tests: "assert count_digit(2026, 2) == 2\nassert count_digit(2026, 7) == 0\nassert count_digit(8, 8) == 1\nassert count_digit(0, 0) == 1\nassert count_digit(1000, 0) == 3\nassert count_digit(99999, 9) == 5\nassert count_digit(5, 3) == 0",
      hints: ["What is the smallest n you can answer without a recursive call?", "Look at the last digit with n % 10, and hand the rest of the number, n // 10, to the recursive call.", "The answer is (1 if the last digit is d, else 0) plus the count for n // 10. A single digit n is the base case."],
      explain: "Same shape as sum_digits. Check the last digit, trust the recursive call to count the rest, add the two. The base case is a single digit: it either matches or it does not." },
    { id: "rec_alternating", title: "Alternating sum", source: "Original question",
      desc: "Return the alternating sum of the digits of n, starting from the right: the last digit is added, the one before it is subtracted, the one before that is added, and so on. Use recursion. Do not use loops, strings, or lists.",
      starter: "def alternating(n):\n    \"\"\"Add the last digit, subtract the next, add the next, and so on.\n    >>> alternating(1234)    # 4 - 3 + 2 - 1\n    2\n    >>> alternating(7)\n    7\n    >>> alternating(90)      # 0 - 9\n    -9\n    \"\"\"\n    \"*** YOUR CODE HERE ***\"\n",
      solution: "def alternating(n):\n    if n < 10:\n        return n\n    return n % 10 - alternating(n // 10)",
      tests: "assert alternating(1234) == 2\nassert alternating(7) == 7\nassert alternating(90) == -9\nassert alternating(0) == 0\nassert alternating(11) == 0\nassert alternating(50505) == 15\nassert alternating(123456) == 3",
      hints: ["Write alternating(1234) out by hand, then alternating(123). How are the two related?", "alternating(123) is 3 - 2 + 1. Compare with 4 - 3 + 2 - 1: every sign flipped, plus the new last digit.", "Subtracting the recursive result flips all of its signs at once: n % 10 - alternating(n // 10)."],
      explain: "The trick is that subtracting the smaller answer flips every sign inside it. You do not need a helper or a flag to track whose turn it is to be added." },
    { id: "rec_sorted_digits", title: "Digits in order", source: "Original question",
      desc: "Return True if the digits of n never decrease when read left to right, and False otherwise. Equal neighbors are allowed. Use recursion. Do not use loops, strings, or lists.",
      starter: "def in_order(n):\n    \"\"\"Return whether the digits of n never decrease, left to right.\n    >>> in_order(1359)\n    True\n    >>> in_order(1223)\n    True\n    >>> in_order(1325)\n    False\n    >>> in_order(4)\n    True\n    \"\"\"\n    \"*** YOUR CODE HERE ***\"\n",
      solution: "def in_order(n):\n    if n < 10:\n        return True\n    if (n // 10) % 10 > n % 10:\n        return False\n    return in_order(n // 10)",
      tests: "assert in_order(1359) is True\nassert in_order(1223) is True\nassert in_order(1325) is False\nassert in_order(4) is True\nassert in_order(0) is True\nassert in_order(10) is False\nassert in_order(111) is True\nassert in_order(123454) is False\nassert in_order(21) is False",
      hints: ["A single digit is always in order. That is your base case.", "Compare the last two digits: n % 10 and (n // 10) % 10. If the pair is out of order, you already know the answer.", "If the last pair is fine, the answer is whatever in_order(n // 10) says about the rest."],
      explain: "Two base cases: a single digit is True, and a bad last pair is False. Otherwise the last pair is fine and the whole question shrinks to the number without its last digit." }
  ]
};
