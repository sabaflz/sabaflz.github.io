/*
  lessons/efficiency.js: Lecture 24, Efficiency.
  Follows the lecture videos: counting calls to see how much work a function
  does, memoization, and two ways to raise a number to a power that do very
  different amounts of work. The videos describe growth in plain words
  (in proportion to n, much more slowly than n), and so does this lesson.
  Same shape as lessons/recursion.js, plus `env` and `tree` (used here for
  small tables of numbers).
*/
window.LESSONS.efficiency = {
  minutes: 15,
  snippets: {
    fib: "def fib(n):\n    if n == 0 or n == 1:\n        return n\n    return fib(n - 2) + fib(n - 1)",
    count: "def count(f):\n    def counted(n):\n        counted.call_count += 1\n        return f(n)\n    counted.call_count = 0\n    return counted\n\nfib = count(fib)\nfib(5)\nfib.call_count",
    memo: "def memo(f):\n    cache = {}\n    def memoized(n):\n        if n not in cache:\n            cache[n] = f(n)\n        return cache[n]\n    return memoized\n\nfib = memo(fib)\nfib(30)",
    exp: "def exp(b, n):\n    if n == 0:\n        return 1\n    return b * exp(b, n - 1)",
    fast: "def exp_fast(b, n):\n    if n == 0:\n        return 1\n    elif n % 2 == 0:\n        half = exp_fast(b, n // 2)\n        return half * half\n    else:\n        return b * exp_fast(b, n - 1)",
    dup: "def has_duplicate(s):\n    for i in range(len(s)):\n        for j in range(i + 1, len(s)):\n            if s[i] == s[j]:\n                return True\n    return False"
  },
  steps: [
    { code: "fib",
      say: "Two functions can give the same answers and take wildly different amounts of time. This lecture is about telling them apart. The first tool is simple: count something. Here is the tree recursive fib from Lecture 10. It is correct. The question is how much work it does." },
    { code: "fib", hl: [4],
      tree: ["fib(5)", "    fib(3)", "        fib(1)", "        fib(2)", "            fib(0)", "            fib(1)", "    fib(4)", "        fib(2)", "            fib(0)", "            fib(1)", "        fib(3)", "            fib(1)", "            fib(2)", "                fib(0)", "                fib(1)"],
      say: "Every call that is not a base case makes two more calls. The panel shows every call made by fib(5). Count the lines: there are 15. Notice how much is repeated. The whole fib(3) tree appears twice, and fib(2) appears three times." },
    { code: "count", hl: [1, 2, 3, 4, 5, 6],
      say: "Counting by hand does not scale, so let a function do it. count takes a function and returns a version of it that adds 1 to a counter every time it is called. The counter is stored as an attribute on the function itself. Functions are objects, so they can have attributes.",
      syntax: "Python notes: x += 1 is shorthand for x = x + 1. counted.call_count is an attribute set on the function named counted." },
    { code: "count", hl: [8, 9, 10],
      tree: ["n     calls to fib", "5     15", "10    177", "20    21,891", "30    2,692,537"],
      say: "Line 8 rebinds the name fib to the counting version. The recursive calls inside fib look up the name fib too, so they are counted as well. The table shows what you get for larger inputs. Going from 20 to 30 adds only 10 to the input and multiplies the work by more than a hundred. That kind of growth becomes unusable very quickly.",
      ask: { type: "type", q: "What is fib.call_count after fib(5) on line 10?", answer: "15",
        why: "It is the number of lines in the call tree for fib(5): 15 calls in total, counting the first one." } },
    { code: "memo", hl: [1, 2, 3, 4, 5, 6, 7],
      say: "The fix is to stop recomputing. Memoization means remembering results you have already worked out. memo takes a function and returns a version with a cache: a dictionary from arguments to results. If the argument has not been seen, it calls the real function and stores the answer. Either way, it returns what is in the cache." },
    { code: "memo", hl: [9, 10],
      tree: ["fib(5)", "    fib(3)", "        fib(1)          computed", "        fib(2)", "            fib(0)      computed", "            fib(1)      from the cache", "    fib(4)", "        fib(2)          from the cache", "        fib(3)          from the cache"],
      say: "Line 9 rebinds fib to the memoized version, and again the recursive calls go through the new name. The panel shows fib(5) now. The second time fib(2) or fib(3) is needed, the answer comes straight from the cache and the whole tree under it never happens.",
      ask: { type: "type", q: "With memoization, how many times does the original fib body run for fib(30)?", answer: "31",
        why: "Once for each different argument: 30, 29, 28, all the way down to 0. That is 31 values. Without memoization it was over two and a half million calls." } },
    { code: "memo", hl: [4, 5, 6],
      say: "One condition. Memoization skips calls, so it is only safe for pure functions: ones whose result depends only on the argument and that have no side effects. If the function printed something, or depended on a value that changes, the memoized version would behave differently from the original." },
    { code: "exp", hl: [4],
      tree: ["exp(2, 4)", "    exp(2, 3)", "        exp(2, 2)", "            exp(2, 1)", "                exp(2, 0)"],
      say: "A second example: raising b to the power n. This version uses the fact that b to the n is b times b to the n minus 1. Each call makes one more call with n reduced by 1, so computing exp(2, n) takes n + 1 calls. The work grows in proportion to n. Double n and the work doubles." },
    { code: "fast", hl: [4, 5, 6],
      say: "Here is a smarter idea. If n is even, b to the n is the square of b to the half of n. So for an even n, one call cuts the problem in half. Line 5 computes the half power once and line 6 multiplies it by itself. For an odd n it falls back to the old rule, which makes n even for the next call." },
    { code: "fast", hl: [4, 5, 6, 7, 8],
      tree: ["exp_fast(2, 16)", "    exp_fast(2, 8)", "        exp_fast(2, 4)", "            exp_fast(2, 2)", "                exp_fast(2, 1)", "                    exp_fast(2, 0)"],
      say: "Trace the calls for n equal to 16. Each one halves n until it reaches 1, then one more step reaches 0.",
      ask: { type: "type", q: "How many calls does exp_fast(2, 16) make in total? Count the first one.", answer: "6",
        why: "n goes 16, 8, 4, 2, 1, 0. That is 6 calls. The slow version makes 17." } },
    { code: "fast",
      tree: ["n        exp calls    exp_fast calls", "16       17           6", "100      101          10", "1,000    1,001        16", "1,000,000    1,000,001    27"],
      say: "The table shows the difference as n grows. For the slow version, the calls grow in proportion to n. For the fast version, they grow far more slowly: making n a thousand times bigger adds only about ten calls. Every time n doubles, the fast version needs just one more step.",
      ask: { type: "mc", q: "exp_fast(2, 1000) takes 16 calls. About how many does exp_fast(2, 2000) take?", choices: ["17", "32", "2,001"], answer: 0,
        why: "2000 is even, so one call halves it to 1000, and from there it takes the same 16 calls. Doubling the input adds one step." } },
    { code: "dup", hl: [2, 3, 4],
      say: "Loops can be counted the same way. has_duplicate compares every item with every item after it. For a list of length n, the inner comparison can run about n times n divided by 2 times. So the work grows with the square of the length.",
      ask: { type: "mc", q: "A list with no duplicates is made 10 times longer. About how many times more comparisons does has_duplicate make?", choices: ["10 times", "100 times", "1,000 times"], answer: 1,
        why: "Every item is compared with every later item, so the number of comparisons grows with the length squared. 10 squared is 100." } },
    { code: "dup",
      tree: ["Shape of growth                 Example", "one more step when n doubles    exp_fast", "in proportion to n              exp, summing a list", "with n squared                  has_duplicate", "multiplies when n goes up by 1  fib without memo"],
      say: "That gives four shapes worth recognizing, from best to worst. Computer scientists do not usually ask exactly how many microseconds a function takes. They ask how the work changes as the input gets bigger. Does it scale well, or badly?" },
    { code: "memo",
      say: "To sum up: to judge a function, count something, such as calls or comparisons, and see how that count grows with the input. Tree recursion that repeats work can often be rescued by memoization, as long as the function is pure. And halving the problem at each step, where you can, beats shrinking it by one." }
  ],

  check: [
    { type: "mc", code: "def f(n):\n    if n == 0:\n        return 0\n    return 1 + f(n - 1)",
      q: "How does the number of calls grow as n grows?", choices: ["In proportion to n", "One more call each time n doubles", "It doubles each time n goes up by 1"], answer: 0,
      why: "Each call makes one more call with n reduced by 1, so f(n) makes n + 1 calls." },
    { type: "type", code: "def halves(n):\n    if n <= 1:\n        return 1\n    return 1 + halves(n // 2)\n\nhalves(64)",
      q: "What does halves(64) return? It counts its own calls.", answer: "7",
      why: "n goes 64, 32, 16, 8, 4, 2, 1. That is 7 calls, and each adds 1." },
    { type: "mc",
      q: "Which of these functions is NOT safe to memoize?",
      choices: ["A function that returns the square of its argument", "A function that returns its argument plus a number the user typed in during the call", "A tree recursive function that counts partitions"], answer: 1,
      why: "Memoization returns a stored result without running the body again. That only works when the result depends on nothing but the argument. A function that reads new input each time would return a stale answer." },
    { type: "mc", code: "def memo(f):\n    cache = {}\n    def memoized(n):\n        if n not in cache:\n            cache[n] = f(n)\n        return cache[n]\n    return memoized",
      q: "What are the keys and values of cache?", choices: ["Keys are results, values are arguments", "Keys are arguments, values are results", "Keys are call counts, values are functions"], answer: 1,
      why: "The cache is looked up by the argument n, and what is stored is f(n). So it maps each argument that has been seen to its result." },
    { type: "mc", code: "def total_pairs(s):\n    count = 0\n    for a in s:\n        for b in s:\n            count = count + 1\n    return count",
      q: "s has 20 items. What does total_pairs(s) return?", choices: ["40", "400", "20"], answer: 1,
      why: "The inner loop runs 20 times for each of the 20 passes of the outer loop. 20 times 20 is 400. Nested loops over the same list grow with the length squared." },
    { type: "type",
      q: "A function halves its input on every call and stops at 1. It takes 10 calls for an input of 512. How many calls for an input of 1024?", answer: "11",
      why: "1024 is 512 doubled, and one call halves it back to 512. Doubling the input adds a single call." }
  ],

  deepen: [
    { id: "eff_grid_paths", title: "Paths through a grid", source: "Original question",
      desc: "A robot starts in the top-left square of a grid with the given number of rows and columns. It can only move right or down. Return the number of different paths to the bottom-right square. A grid with one row or one column has exactly one path. The plain tree recursion is far too slow for large grids, so remember results in a dictionary. A tuple such as (rows, cols) can be a dictionary key.",
      starter: "def grid_paths(rows, cols):\n    \"\"\"Return the number of right-and-down paths across a rows by cols grid.\n    >>> grid_paths(1, 5)\n    1\n    >>> grid_paths(2, 2)\n    2\n    >>> grid_paths(3, 3)\n    6\n    >>> grid_paths(18, 18)\n    2333606220\n    \"\"\"\n    \"*** YOUR CODE HERE ***\"\n",
      solution: "def grid_paths(rows, cols):\n    cache = {}\n    def paths(r, c):\n        if r == 1 or c == 1:\n            return 1\n        if (r, c) not in cache:\n            cache[(r, c)] = paths(r - 1, c) + paths(r, c - 1)\n        return cache[(r, c)]\n    return paths(rows, cols)",
      tests: "assert grid_paths(1, 5) == 1\nassert grid_paths(5, 1) == 1\nassert grid_paths(2, 2) == 2\nassert grid_paths(3, 3) == 6\nassert grid_paths(2, 4) == 4\nassert grid_paths(18, 18) == 2333606220\nassert grid_paths(30, 30) == 30067266499541040",
      hints: ["First find the recursion. The first move is right or down. Moving down leaves a grid with one fewer row. Moving right leaves one with one fewer column.", "So the answer is paths(rows - 1, cols) + paths(rows, cols - 1), with a base case of 1 when either is 1. That is correct but repeats a huge amount of work.", "Keep a dictionary. Before computing a pair (r, c), check whether it is already a key. If not, compute it and store it. A helper function defined inside grid_paths can share one cache."],
      explain: "Without the cache, an 18 by 18 grid takes billions of calls. With it, each of the few hundred different pairs is computed once. The 30 by 30 test would not finish in your lifetime without memoization." },
    { id: "eff_fast_times", title: "Multiply by halving", source: "Original question",
      desc: "Return a times n, where n is a non-negative whole number, without using the * operator. You may add, and you may halve n with // and test it with %. The hidden tests use a very large n, so adding a to itself n times is far too slow. Use the idea from exp_fast: when n is even, a times n is twice a times half of n.",
      starter: "def fast_times(a, n):\n    \"\"\"Return a * n using addition and halving only.\n    >>> fast_times(7, 6)\n    42\n    >>> fast_times(5, 0)\n    0\n    >>> fast_times(3, 1000000007)\n    3000000021\n    \"\"\"\n    \"*** YOUR CODE HERE ***\"\n",
      solution: "def fast_times(a, n):\n    if n == 0:\n        return 0\n    elif n % 2 == 0:\n        half = fast_times(a, n // 2)\n        return half + half\n    else:\n        return a + fast_times(a, n - 1)",
      tests: "assert fast_times(7, 6) == 42\nassert fast_times(5, 0) == 0\nassert fast_times(0, 9) == 0\nassert fast_times(9, 1) == 9\nassert fast_times(-4, 5) == -20\nassert fast_times(3, 1000000007) == 3000000021\nassert fast_times(2, 10 ** 30) == 2 * 10 ** 30",
      hints: ["Copy the shape of exp_fast: a base case for 0, a case for even n, and a case for odd n.", "For even n, compute fast_times(a, n // 2) once, save it in a name, and add it to itself.", "For odd n, return a + fast_times(a, n - 1). The next call will have an even n."],
      explain: "Halving n at every even step means even an n with thirty digits needs only about two hundred calls. Saving the half result in a name matters: calling fast_times twice for the two halves would undo the whole saving." },
    { id: "eff_spread", title: "Biggest spread", source: "Original question",
      desc: "Return the largest difference between any two numbers in the non-empty list s. The hidden tests use a very long list. Comparing every pair of numbers is too slow, so find a way that looks at each number only a fixed number of times.",
      starter: "def spread(s):\n    \"\"\"Return the largest difference between two numbers in s.\n    >>> spread([4, 9, 2, 7])\n    7\n    >>> spread([5])\n    0\n    >>> spread([-3, 3])\n    6\n    \"\"\"\n    \"*** YOUR CODE HERE ***\"\n",
      solution: "def spread(s):\n    return max(s) - min(s)",
      tests: "assert spread([4, 9, 2, 7]) == 7\nassert spread([5]) == 0\nassert spread([-3, 3]) == 6\nassert spread([1, 1, 1]) == 0\nbig = list(range(300000))\nbig[150000] = -5\nbig[7] = 999999\nassert spread(big) == 1000004",
      hints: ["Which two numbers in a list are furthest apart? You do not need to try every pair to know.", "The largest difference is always between the largest number and the smallest number.", "return max(s) - min(s). Each of max and min walks the list once."],
      explain: "Trying every pair grows with the length squared, which is hopeless for 300,000 numbers. Two passes over the list grow in proportion to the length. Often the fast solution comes from noticing a fact about the problem, not from clever code." }
  ]
};
