/*
  lessons/immutable-data.js: Lecture 29, Immutable data.
  Follows the lecture videos: the trade-offs of programming without mutation,
  memoization by passing a cache in and out, external (JavaScript) functions
  as a controlled way to get mutation, and how programs are run (parsing,
  analysis, execution; compiling versus interpreting).

  Every Gleam snippet and solution here was compiled and run with the Gleam
  compiler. Deepen problems are compiled and run in the browser by gleam/worker.js.
*/
window.LESSONS["immutable-data"] = {
  minutes: 18,
  snippets: {
    pymemo: "def memo(f):\n    cache = {}\n    def memoized(n):\n        if n not in cache:\n            cache[n] = f(n)\n        return cache[n]\n    return memoized",
    insert: "import gleam/dict\n\npub fn main() {\n  let a = dict.from_list([#(1, \"one\")])\n  let b = dict.insert(a, 2, \"two\")\n  echo dict.size(a)\n  echo dict.size(b)\n}",
    slow: "fn ways(n: Int) -> Int {\n  case n < 3 {\n    True -> 1\n    False -> ways(n - 1) + ways(n - 3)\n  }\n}",
    memo: "import gleam/dict.{type Dict}\n\ntype Cache =\n  Dict(Int, Int)\n\nfn ways(n: Int) -> Int {\n  ways_memo(n, dict.new()).0\n}\n\nfn ways_memo(n: Int, cache: Cache) -> #(Int, Cache) {\n  case dict.get(cache, n) {\n    Ok(answer) -> #(answer, cache)\n    Error(_) ->\n      case n < 3 {\n        True -> #(1, cache)\n        False -> {\n          let #(a, cache) = ways_memo(n - 1, cache)\n          let #(b, cache) = ways_memo(n - 3, cache)\n          #(a + b, dict.insert(cache, n, a + b))\n        }\n      }\n  }\n}",
    js: "// cache.mjs (JavaScript)\nimport { Ok, Error } from \"./gleam.mjs\";\n\nexport function new_cache() {\n  return new Map();\n}\n\nexport function lookup(cache, n) {\n  return cache.has(n) ? new Ok(cache.get(n)) : new Error(undefined);\n}\n\nexport function store(cache, n, value) {\n  cache.set(n, value);\n  return value;\n}",
    external: "type Cache\n\n@external(javascript, \"./cache.mjs\", \"new_cache\")\nfn new_cache() -> Cache\n\n@external(javascript, \"./cache.mjs\", \"lookup\")\nfn lookup(cache: Cache, n: Int) -> Result(Int, Nil)\n\n@external(javascript, \"./cache.mjs\", \"store\")\nfn store(cache: Cache, n: Int, value: Int) -> Int\n\npub fn main() {\n  let cache = new_cache()\n  store(cache, 5, 25)\n  echo lookup(cache, 5)\n}",
    extmemo: "fn ways_memo(n: Int, cache: Cache) -> Int {\n  case lookup(cache, n) {\n    Ok(answer) -> answer\n    Error(_) ->\n      case n < 3 {\n        True -> 1\n        False ->\n          store(cache, n, ways_memo(n - 1, cache) + ways_memo(n - 3, cache))\n      }\n  }\n}",
    stages: "source code      \"1 + 2 * x\"\n      |  parsing\nsyntax tree      add(1, mul(2, x))\n      |  analysis: names defined? types match?\nchecked tree\n      |  execution\nresult"
  },
  steps: [
    { code: "pymemo",
      say: "Programming with no loops and no mutation has real benefits. Two pure functions can always run at the same time, in parallel, because neither can change data the other is reading. Programs are easier to check for correctness. And in Gleam a compiled program cannot crash with a runtime error. That is why these ideas are used in messaging systems and large-scale data processing. But there is a cost. Anything that changes over time has to be passed along as an argument. This lecture looks at a case where that hurts: memoization." },
    { code: "pymemo", hl: [2, 4, 5, 6],
      say: "Recall memoization from the Efficiency lecture: remember results you have already computed, so each one is computed only once. In Python it needs one dictionary, the cache, and one line that mutates it. Line 5 adds a new key to the cache every time a new argument is seen.",
      ask: { type: "mc", q: "Which two things does this Python version rely on that Gleam does not have?", choices: ["Recursion and dictionaries", "Mutating a dictionary, and reassigning a name to the memoized function", "Type hints and loops"], answer: 1,
        why: "The cache is changed by cache[n] = ..., and in use the function's name is rebound to the memoized version. Gleam dictionaries cannot be changed and names cannot be reassigned." } },
    { code: "insert", hl: [4, 5, 6, 7],
      say: "Gleam does have dictionaries, and you can add to them, in the only way Gleam allows: dict.insert returns a new dictionary with one more entry. The original is untouched.",
      ask: { type: "mc", q: "What do the two echo lines display?", choices: ["1 and 2", "2 and 2", "1 and 1"], answer: 0,
        why: "a still has its one entry. b is a new dictionary with the entries of a plus one more. Nothing was mutated." } },
    { code: "slow", hl: [2, 3, 4],
      tree: ["ways(6)", "├─ ways(5)", "│  ├─ ways(4)", "│  │  ├─ ways(3)", "│  │  └─ ways(1)", "│  └─ ways(2)", "└─ ways(3)"],
      say: "Here is a function worth memoizing. ways(n) counts the ways to climb n stairs if each move goes up 1 stair or 3 stairs. With fewer than 3 stairs there is one way. Otherwise the last move was 1 stair or 3, so add the two smaller answers. Like fib, it is tree recursive and repeats work: in the panel, ways(3) is computed twice, and for large n the repetition explodes." },
    { code: "memo", hl: [10],
      say: "To memoize without mutation, the cache has to travel. The memoized function takes the cache as an extra argument. And, the key idea, it returns two things as a tuple: the answer, and a cache that includes everything learned along the way. It has to return the cache, because that is the only way the caller can find out what was learned.",
      syntax: "Gleam notes: lines 3 and 4 define a type alias. Cache is just a shorter name for Dict(Int, Int). The import on line 1 brings in the Dict type so it can be written without a prefix." },
    { code: "memo", hl: [11, 12],
      say: "First, look up n in the cache. dict.get returns a Result. If it is Ok, the answer is already known: return it with the cache unchanged, since nothing new was learned." },
    { code: "memo", hl: [17, 18, 19],
      say: "If n is not in the cache, compute it. Line 17 makes the first recursive call and unpacks its tuple: a is the answer, and cache is the cache that call returned. That new cache is what gets passed to the second call on line 18, so the second call can reuse everything the first one worked out. Finally, line 19 returns the sum together with a cache that also contains n.",
      ask: { type: "mc", q: "On line 18, which cache is passed to the second recursive call?", choices: ["The one that ways_memo received as its argument", "The one returned by the first recursive call on line 17", "A new empty one"], answer: 1,
        why: "Line 17 introduces a new name cache for the cache returned by the first call, and that is the one in scope on line 18. If the original were passed, the second call would repeat all the work the first call just did." } },
    { code: "memo", hl: [6, 7, 8],
      say: "The public function starts with an empty cache and keeps only the answer: .0 takes item 0 of the tuple and drops the cache. So memoization is possible without mutation. But it was a lot of work: the function's signature changed, and every call has to pass the cache in and take it back out." },
    { code: "js",
      say: "There is another option. Gleam is compiled to JavaScript, a language very much like Python, with mutable lists called arrays and mutable dictionaries called maps. A Gleam program can call functions written in JavaScript. These are called external functions. This small JavaScript file makes a map, looks a key up in it, and stores a value in it. You do not need to know JavaScript's details, only that store really does mutate the map.",
      syntax: "JavaScript notes: test ? a : b means a if test else b. undefined plays the role of None." },
    { code: "external", hl: [1, 3, 4, 6, 7, 9, 10],
      say: "On the Gleam side, you declare each function's name and types but give it no body. The line above it says where the real implementation lives: which JavaScript file and which function. Cache is declared as a type with no variants, a name for a JavaScript object that Gleam cannot look inside. Notice lookup returns a Result, which is why the JavaScript built an Ok or an Error." },
    { code: "external", hl: [13, 14, 15],
      say: "Now the surprise. cache is never redefined, and yet after line 14 it holds something new.",
      ask: { type: "type", q: "What does line 15 display? Write it exactly.", answer: "Ok(25)",
        why: "store mutated the JavaScript map behind cache, adding the key 5 with the value 25. lookup then finds it and returns Ok(25). This is mutation inside a Gleam program, made possible by an external function." } },
    { code: "extmemo", hl: [2, 3, 8],
      say: "With a mutable cache, memoization is simple again. The function returns just a number. It looks n up, and if it is missing, computes it and stores it. The cache is updated as a side effect, so there is nothing to pass back. Is using mutation here a good idea? For memoization, yes: it does not change what the program computes, only how fast. The rule of thumb is that everything is immutable unless you deliberately step outside." },
    { code: "stages", hl: [1, 2, 3],
      say: "The last part of the lecture sets up the next one: how does a program actually run? First, parsing. The text of the program is turned into a tree of its expressions, called an abstract syntax tree. Parsing also checks the syntax: every parenthesis closed, every number well formed. The tree is much easier to work with than text." },
    { code: "stages", hl: [4, 5],
      say: "Second, analysis: finding errors without running anything. Is every name defined before it is used? Does every value have the type it is declared to have? Gleam does a lot here, which is how it can promise no runtime errors. Python does very little here, which is why its errors appear while the program is running." },
    { code: "stages", hl: [6, 7],
      say: "Third, execution, and languages differ. A compiler translates the program into something else: machine code that the processor runs directly, or another language, as Gleam does with JavaScript, or bytecode for a virtual machine. An interpreter does not translate at all. It walks the syntax tree and evaluates it directly. Interpreting is usually slower but much simpler, so it is the standard first step, and the next lecture builds one.",
      ask: { type: "mc", q: "Which stage would report that you called a function with a String where an Int was required, in Gleam?", choices: ["Parsing", "Analysis", "Execution"], answer: 1,
        why: "The syntax is fine, so parsing succeeds. The type check is part of analysis, before the program runs. In Python the same mistake would only show up during execution." } },
    { code: "memo",
      say: "To sum up: without mutation, changing state is passed in as an argument and passed back as part of the result, as with the cache here. External functions written in JavaScript are a deliberate escape hatch when mutation is worth it. And every program goes through parsing, analysis and execution, where execution is either compiling to something else or interpreting the tree directly." }
  ],

  check: [
    { type: "mc", q: "Why can two pure functions always be run at the same time, in parallel?", choices: ["They are short", "Neither can change data that the other one reads", "They never call other functions"], answer: 1,
      why: "A pure function only computes an output from its inputs. With no mutation, the order in which two of them run cannot affect either result." },
    { type: "type", code: "import gleam/dict\n\npub fn main() {\n  let a = dict.new()\n  let b = dict.insert(a, \"x\", 1)\n  let c = dict.insert(b, \"y\", 2)\n  echo dict.size(a) + dict.size(b) + dict.size(c)\n}",
      q: "What does this display?", answer: "3",
      why: "a has 0 entries, b has 1 and c has 2. Each insert returns a new dictionary and leaves the earlier one as it was. 0 + 1 + 2 is 3." },
    { type: "mc", code: "fn ways_memo(n: Int, cache: Cache) -> #(Int, Cache)",
      q: "Why does the immutable memoized function return a cache as well as a number?", choices: ["Tuples are faster than numbers", "The caller's cache cannot be changed, so new entries must be handed back in a new cache", "Gleam functions must return two values"], answer: 1,
      why: "Nothing the function does can alter the cache it was given. The only way for later calls to benefit from what it learned is to return an updated cache and have the caller use that one." },
    { type: "mc", code: "@external(javascript, \"./cache.mjs\", \"store\")\nfn store(cache: Cache, n: Int, value: Int) -> Int",
      q: "What does this declaration say?", choices: ["store is written in Gleam and exported to JavaScript", "store is implemented by the JavaScript function store in cache.mjs, with these Gleam types", "store is a type"], answer: 1,
      why: "An external function has a Gleam name and Gleam types but no Gleam body. The line above names the JavaScript file and function that do the work." },
    { type: "mc", q: "What is an abstract syntax tree?", choices: ["The machine code a compiler produces", "A tree-shaped representation of a program's expressions, produced by parsing", "A diagram of frames and their parents"], answer: 1,
      why: "Parsing turns program text into a tree of expressions and sub-expressions. Analysis and execution then work on that tree." },
    { type: "mc", q: "What is the difference between a compiler and an interpreter?", choices: ["A compiler translates the program into another form to be run, and an interpreter evaluates the syntax tree directly", "A compiler is for Python and an interpreter is for Gleam", "An interpreter checks types and a compiler does not"], answer: 0,
      why: "Compiling means translating, to machine code, another language or bytecode. Interpreting means evaluating the tree as it is. Gleam is compiled to JavaScript." }
  ],

  deepen: [
    { id: "imm_tally", title: "Tally without mutation", source: "Original question", lang: "Gleam",
      gleam: {"tests": [["dict.get(tally([\"a\", \"b\", \"a\"]), \"a\")", "Ok(2)"], ["dict.get(tally([\"a\", \"b\", \"a\"]), \"b\")", "Ok(1)"], ["dict.size(tally([]))", "0"], ["dict.get(tally([\"a\"]), \"z\")", "Error(Nil)"], ["dict.get(tally([\"q\", \"q\", \"q\", \"r\"]), \"q\")", "Ok(3)"], ["dict.size(tally([\"q\", \"q\", \"q\", \"r\"]))", "2"]]},
      desc: "Write a Gleam function tally that takes a list of words and returns a dictionary from each word to how many times it appears. Nothing can be mutated, so use a helper that carries the dictionary so far and returns a new one at each step. Use dict.get, which returns a Result, and dict.insert. For example, tally([\"a\", \"b\", \"a\"]) maps \"a\" to 2 and \"b\" to 1.",
      starter: "import gleam/dict.{type Dict}\n\nfn tally(words: List(String)) -> Dict(String, Int) {\n  // call your helper with an empty dictionary: dict.new()\n}\n\n// write the helper here\n",
      solution: "import gleam/dict.{type Dict}\n\nfn tally(words: List(String)) -> Dict(String, Int) {\n  tally_from(words, dict.new())\n}\n\nfn tally_from(words: List(String), counts: Dict(String, Int)) -> Dict(String, Int) {\n  case words {\n    [] -> counts\n    [word, ..rest] ->\n      case dict.get(counts, word) {\n        Ok(n) -> tally_from(rest, dict.insert(counts, word, n + 1))\n        Error(_) -> tally_from(rest, dict.insert(counts, word, 1))\n      }\n  }\n}",
      hints: ["The helper takes the remaining words and the counts so far. With no words left, the counts are the answer.", "For the first word, look it up with dict.get. Ok(n) means it has been seen n times. Error means this is the first time.", "Either way, make the recursive call on the rest of the words with dict.insert(counts, word, ...) as the new counts."],
      explain: "The dictionary plays the role of a variable that a Python loop would mutate. Here each step builds a new dictionary and hands it to the next step as an argument. Both recursive calls are tail calls, so this runs like a loop." },
    { id: "imm_number", title: "Memoize with a travelling cache", source: "Original question", lang: "Gleam",
      gleam: {"tests": [["ways_memo(5, dict.new()).0", "8"], ["ways_memo(2, dict.new()).0", "2"], ["ways_memo(0, dict.new()).0", "1"], ["ways_memo(1, dict.new()).0", "1"], ["dict.get(ways_memo(5, dict.new()).1, 5)", "Ok(8)"], ["ways_memo(60, dict.new()).0", "2504730781961"]]},
      desc: "Write the Gleam function ways_memo for a different rule: each move goes up 1 stair or 2 stairs. It takes n and a cache and returns a tuple of the number of ways and the updated cache. With fewer than 2 stairs there is 1 way. The cache must be passed from the first recursive call to the second. For example, ways_memo(5, dict.new()).0 is 8.",
      starter: "import gleam/dict.{type Dict}\n\nfn ways_memo(n: Int, cache: Dict(Int, Int)) -> #(Int, Dict(Int, Int)) {\n  // your code here\n}\n",
      solution: "import gleam/dict.{type Dict}\n\nfn ways_memo(n: Int, cache: Dict(Int, Int)) -> #(Int, Dict(Int, Int)) {\n  case dict.get(cache, n) {\n    Ok(answer) -> #(answer, cache)\n    Error(_) ->\n      case n < 2 {\n        True -> #(1, cache)\n        False -> {\n          let #(a, cache) = ways_memo(n - 1, cache)\n          let #(b, cache) = ways_memo(n - 2, cache)\n          #(a + b, dict.insert(cache, n, a + b))\n        }\n      }\n  }\n}",
      hints: ["Start by looking n up in the cache. If it is there, return it together with the cache you were given.", "The base case returns #(1, cache). The recursive case needs a block with two let lines.", "let #(a, cache) = ways_memo(n - 1, cache) unpacks the answer and the new cache. Use that cache in the second call, then return the sum with dict.insert(cache, n, a + b)."],
      explain: "The shape is the same as in the lesson: look up, otherwise compute while threading the cache through both calls, then return the answer with a cache that includes it. The detail that matters most is that the second call receives the cache returned by the first." }
  ]
};
