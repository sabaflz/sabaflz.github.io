/*
  lessons/interpreters.js: Lecture 30, Interpreters.
  Follows the lecture videos: representing arithmetic expressions as a type,
  evaluating them, what a parser produces, values versus expressions, the
  eval and apply pair, environments as frames with parents, lookup, extend,
  and errors as values.

  One video of this lecture had no transcript available, so the evaluator for
  the arithmetic language is written from the surrounding videos. The code is
  a small original interpreter, not the course project's code.

  Every Gleam snippet and solution here was compiled and run with the Gleam
  compiler. Deepen problems are self-checked (`norun: true`).
*/
window.LESSONS["interpreters"] = {
  minutes: 22,
  snippets: {
    expr: "type Expr {\n  Num(Int)\n  Var(String)\n  Binary(op: Op, left: Expr, right: Expr)\n}\n\ntype Op {\n  Add\n  Sub\n  Mul\n  Div\n}",
    build: "// x * (2 + 3)\nlet e = Binary(Mul, Var(\"x\"), Binary(Add, Num(2), Num(3)))",
    evalnum: "fn eval(e: Expr) -> Int {\n  case e {\n    Num(n) -> n\n    Var(_) -> 0\n    Binary(op, left, right) -> apply(op, eval(left), eval(right))\n  }\n}\n\nfn apply(op: Op, a: Int, b: Int) -> Int {\n  case op {\n    Add -> a + b\n    Sub -> a - b\n    Mul -> a * b\n    Div -> a / b\n  }\n}",
    env: "import gleam/dict.{type Dict}\n\ntype Env {\n  Global(bindings: Dict(String, Int))\n  Local(bindings: Dict(String, Int), parent: Env)\n}",
    lookup: "fn lookup(env: Env, name: String) -> Result(Int, String) {\n  case dict.get(env.bindings, name) {\n    Ok(value) -> Ok(value)\n    Error(_) ->\n      case env {\n        Local(_, parent) -> lookup(parent, name)\n        Global(_) -> Error(\"unbound variable \" <> name)\n      }\n  }\n}",
    frames: "let g = Global(dict.from_list([#(\"y\", 3), #(\"z\", 5)]))\nlet f = Local(\n  dict.from_list([#(\"x\", 2), #(\"z\", 4)]),\n  g,\n)\n\nlookup(f, \"z\")\nlookup(f, \"y\")\nlookup(g, \"z\")\nlookup(f, \"w\")",
    evalenv: "fn eval(e: Expr, env: Env) -> Result(Int, String) {\n  case e {\n    Num(n) -> Ok(n)\n    Var(name) -> lookup(env, name)\n    Binary(op, left, right) ->\n      case eval(left, env), eval(right, env) {\n        Ok(a), Ok(b) -> apply(op, a, b)\n        Error(message), _ -> Error(message)\n        _, Error(message) -> Error(message)\n      }\n  }\n}\n\nfn apply(op: Op, a: Int, b: Int) -> Result(Int, String) {\n  case op, b {\n    Div, 0 -> Error(\"divide by zero\")\n    Div, _ -> Ok(a / b)\n    Add, _ -> Ok(a + b)\n    Sub, _ -> Ok(a - b)\n    Mul, _ -> Ok(a * b)\n  }\n}",
    extend: "fn extend(env: Env, name: String, value: Int) -> Env {\n  case env {\n    Local(bindings, parent) -> Local(dict.insert(bindings, name, value), parent)\n    Global(bindings) -> Global(dict.insert(bindings, name, value))\n  }\n}",
    parsed: "f(y, 2)       Call(Var(\"f\"), [Var(\"y\"), Int(2)])\n\n2 + 3 * x     Call(Var(\"+\"), [Int(2),\n                Call(Var(\"*\"), [Int(3), Var(\"x\")])])",
    big: "eval(expression, environment) -> value\n  number, bool      the value itself\n  variable          look it up in the environment\n  list literal      eval each item\n  call              eval the operator, eval the operands,\n                    then apply\n  fn(...) { ... }   make a function value that remembers\n                    the current environment\n  case              eval the subject, find the matching arm\n  let x = v         eval v, extend the environment, eval the body\n\napply(function, arguments) -> value\n  built-in          run its Gleam function on the arguments\n  user-defined      make a new frame: parameters bound to\n                    arguments, parent is the function's\n                    environment. Then eval the body there."
  },
  steps: [
    { code: "expr",
      say: "An interpreter is a program that runs other programs. That sounds circular, but it is not: every rule you have learned for how code is evaluated can itself be written as code. This lecture builds a small one in Gleam, starting with a language that can only do arithmetic." },
    { code: "expr", hl: [1, 2, 3, 4, 5],
      say: "First question: how do you represent a program as data? In this little language, an expression is a number, or a variable name, or two expressions joined by an operator. That is a sum type with three variants, and it is recursive: a Binary expression contains two more expressions. Binary just means it has two parts." },
    { code: "build", hl: [2],
      say: "This value represents x times the sum of 2 and 3. It is a tree. The top is a multiplication. Its left side is the variable x and its right side is an addition of two numbers. A tree like this is the abstract syntax tree from the last lecture. Parentheses are not needed, because the nesting of the tree already says what happens first.",
      ask: { type: "mc", q: "Which value represents (1 + x) * 4?", choices: ["Binary(Add, Num(1), Binary(Mul, Var(\"x\"), Num(4)))", "Binary(Mul, Binary(Add, Num(1), Var(\"x\")), Num(4))", "Binary(Mul, Num(1), Var(\"x\"), Num(4))"], answer: 1,
        why: "The last operation is the multiplication, so Mul is at the top. Its left side is the whole addition and its right side is 4. The first choice represents 1 + x * 4." } },
    { code: "evalnum", hl: [1, 2, 3, 5],
      say: "Now evaluate. eval takes an expression and returns its value, with one case per variant, because that is how you use a sum type. A number evaluates to itself. A binary expression evaluates both sides, with two recursive calls, and then combines the results. Ignore variables for a moment. This is tree recursion over the syntax tree, the same shape as summing the labels of a tree." },
    { code: "evalnum", hl: [9, 10, 11, 12, 13, 14, 15],
      say: "apply does the actual arithmetic: given an operator and two numbers that have already been evaluated, compute the answer. So eval breaks an expression into parts, and apply combines values.",
      ask: { type: "type", q: "What does eval(Binary(Sub, Num(10), Binary(Mul, Num(2), Num(3)))) return?", answer: "4",
        why: "The right side is evaluated first by a recursive call: 2 * 3 is 6. Then apply(Sub, 10, 6) gives 4." } },
    { code: "env", hl: [3, 4, 5, 6],
      say: "What should a variable evaluate to? It depends on the environment, exactly as in the environment diagrams from the start of the course. An environment is a chain of frames. Here that is a type with two variants. A Global frame has bindings, a dictionary from names to values. A Local frame has bindings and a parent, which is another environment. It is a linked list of frames that ends at the global frame." },
    { code: "lookup", hl: [2, 3, 6, 7],
      say: "Looking up a name is the rule you already know. Look in the bindings of the first frame. If the name is there, that is the answer. If not, and the frame is local, look in its parent. If you reach the global frame and it is still missing, the name is unbound, and that is an error. The return type is a Result, because the lookup can fail." },
    { code: "frames", hl: [1, 2, 3, 4, 5],
      frames: [{ title: "Global g", vars: [["y", "3"], ["z", "5"]] }, { title: "Local f  (parent: g)", vars: [["x", "2"], ["z", "4"]], active: true }],
      say: "Here are two frames. The global frame binds y and z. The local frame binds x and its own z, and its parent is the global frame.",
      ask: { type: "mc", q: "What are lookup(f, \"z\"), lookup(f, \"y\") and lookup(g, \"z\")?", choices: ["Ok(4), Ok(3), Ok(5)", "Ok(5), Ok(3), Ok(5)", "Ok(4), Error, Ok(5)"], answer: 0,
        why: "z is found in the local frame, so the search stops there with 4. y is not in the local frame, so the parent is searched and gives 3. Starting from g, the local frame is never seen, so z is 5." } },
    { code: "frames", hl: [10],
      frames: [{ title: "Global g", vars: [["y", "3"], ["z", "5"]] }, { title: "Local f  (parent: g)", vars: [["x", "2"], ["z", "4"]], active: true }],
      say: "And a name that is nowhere in the chain.",
      ask: { type: "mc", q: "What does lookup(f, \"w\") return?", choices: ["Error(\"unbound variable w\")", "Ok(0)", "The program crashes with a NameError"], answer: 0,
        why: "w is not in the local frame or in the global frame. At the global frame there is no parent left to try, so lookup returns an Error value carrying a message. This is Python's NameError, as a value." } },
    { code: "evalenv", hl: [1, 3, 4],
      say: "Now eval can handle variables. It takes the environment as a second argument and looks names up in it. Because a lookup can fail, eval now returns a Result too, and a plain number becomes Ok of that number." },
    { code: "evalenv", hl: [5, 6, 7, 8, 9, 10],
      say: "For a binary expression, evaluate both sides. This case looks at two values at once, separated by a comma. If both are Ok, apply the operator. If either side is an Error, the whole expression is that Error. So an error deep inside a big expression travels all the way up to whoever asked. Nothing crashes, and apply reports dividing by zero the same way.",
      ask: { type: "mc", q: "In an environment where x is 2 and nothing else is defined, what does evaluating x * (y + 1) give?", choices: ["Ok(2)", "Error(\"unbound variable y\")", "The interpreter crashes"], answer: 1,
        why: "The left side gives Ok(2). The right side is an addition whose left side, y, fails to look up, so the addition is an Error, and then so is the multiplication. The error value is passed up unchanged." } },
    { code: "extend", hl: [3, 4],
      say: "Where do bindings come from? When a let or a pattern introduces a name, the interpreter extends the environment. And since nothing can be mutated, extending means building a new frame: the same parent, and bindings with one more entry. If the name was already there, the new value replaces it in the new frame. The old frame still exists unchanged, which is exactly why a function that captured the old environment keeps seeing the old value." },
    { code: "parsed",
      say: "A real language has many more kinds of expression. The course project interprets a useful subset of Gleam itself, with expression variants for variables, numbers, bools, list literals, calls, anonymous functions, case, let, and field access. One simplification is worth knowing. The parser does not have a separate variant for arithmetic. 2 + 3 * x is parsed as a call to a function named + whose second argument is a call to a function named *. Operators are just built-in functions.",
      ask: { type: "mc", q: "In the parsed form of f(y, 2), why is y a Var but 2 an Int?", choices: ["y is a name that must be looked up in an environment, and 2 is a literal whose value is already known", "Arguments alternate between the two", "2 is in the global frame"], answer: 0,
        why: "A variable expression needs an environment to have a value. A literal number is its own value. The parser records which is which, so the evaluator knows what to do with each." } },
    { code: "big", hl: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      say: "Expressions and values are different things. 1 + 1 is an expression, and 2 is a value. There are more kinds of expression than kinds of value, because many expressions, such as case and let, are just ways of computing a value. The interpreter has a Value type whose variants are a bool, an int, a list of values, a record, and a function. eval turns any expression into a value, with one rule per kind of expression. These are the rules of evaluation from the whole course, written down in one place." },
    { code: "big", hl: [5, 6, 12, 13, 14, 15, 16],
      say: "The heart of it is the call. To evaluate a call: eval the operator, eval the operands, then apply the function to the arguments. apply has two cases. A built-in function, such as +, simply runs. A user-defined function has only a body expression, so apply makes a new frame that binds the parameters to the arguments, with the function's own environment as its parent, and then calls eval on the body. So eval calls apply, and apply calls eval. That loop is the interpreter.",
      ask: { type: "mc", q: "When a user-defined function is applied, what is the parent of the new frame?", choices: ["The frame of whoever called it", "The environment in which the function was defined", "Always the global frame"], answer: 1,
        why: "A function value remembers the environment where it was created, and its calls use that as the parent. It is the same rule as in Python's environment diagrams, and it is what makes make_adder work." } },
    { code: "big",
      say: "One last point. Real Gleam finds mistakes before running. This interpreter does not analyze first. It finds mistakes while evaluating, as Python does, and reports each as an error value: an unbound variable, a built-in given the wrong type, a case with no matching pattern, a call to a function that does not exist. It also stops programs that recurse too deeply or run too long. To sum up: programs are trees, eval walks the tree with one rule per kind of expression, apply handles calls, and environments are chains of frames." }
  ],

  check: [
    { type: "mc", code: "type Expr {\n  Num(Int)\n  Var(String)\n  Binary(op: Op, left: Expr, right: Expr)\n}",
      q: "What does Binary(Add, Num(1), Binary(Add, Num(2), Num(3))) represent?", choices: ["(1 + 2) + 3", "1 + (2 + 3)", "1 + 2 * 3"], answer: 1,
      why: "The top addition has 1 on the left and a whole addition on the right, so 2 and 3 are added first." },
    { type: "type", q: "With the first eval from the lesson, what does eval(Binary(Mul, Binary(Add, Num(1), Num(2)), Num(5))) return?", answer: "15",
      why: "The left side is evaluated by a recursive call: 1 + 2 is 3. Then apply(Mul, 3, 5) gives 15." },
    { type: "mc", q: "Looking up a name starts in the first frame of the environment. What happens when the name is not there?", choices: ["It is an error straight away", "The parent frame is searched, and so on until the global frame", "The global frame is searched next, skipping the frames in between"], answer: 1,
      why: "Each local frame has a parent. The search moves up one frame at a time. Only when the global frame does not have the name is it an unbound variable error." },
    { type: "mc", q: "What is the difference between an expression and a value?", choices: ["They are two words for the same thing", "An expression is code to be evaluated, and a value is what evaluation produces", "Values are always numbers"], answer: 1,
      why: "1 + 1 and a case are expressions. 2, True, a list and a function are values. eval takes an expression and an environment and produces a value." },
    { type: "mc", q: "How does the interpreter evaluate a call expression?", choices: ["Apply first, then evaluate the operands if needed", "Evaluate the operator and the operands, then apply the function to the arguments", "Look up the whole call in the environment"], answer: 1,
      why: "This is the rule from the first week of the course: evaluate the operator, evaluate the operands, apply. In the interpreter those are calls to eval followed by a call to apply." },
    { type: "mc", q: "apply receives a user-defined function. What does it do?", choices: ["Runs a built-in Gleam function", "Makes a new frame binding parameters to arguments, then evals the body in it", "Returns the body expression without evaluating it"], answer: 1,
      why: "A user-defined function is a list of parameters, a body expression and the environment it was defined in. Applying it means evaluating the body in a new frame whose parent is that environment." },
    { type: "mc", q: "In this interpreter, what happens when a program uses a name that was never defined?", choices: ["The interpreter itself crashes", "eval returns an error value saying which name was unbound", "The name evaluates to 0"], answer: 1,
      why: "Errors are ordinary values of an error type. lookup returns an Error, and each eval above it passes that Error along until it reaches the top." }
  ],

  deepen: [
    { id: "int_count", title: "Count the numbers", source: "Original question", norun: true, lang: "Gleam",
      desc: "Using the Expr type from the lesson, write count_nums(e: Expr) -> Int, the number of Num values anywhere inside the expression. For example, the expression for x * (2 + 3) contains 2 numbers, and Var(\"x\") contains 0.",
      starter: "fn count_nums(e: Expr) -> Int {\n  // your code here\n}\n",
      solution: "fn count_nums(e: Expr) -> Int {\n  case e {\n    Num(_) -> 1\n    Var(_) -> 0\n    Binary(_, left, right) -> count_nums(left) + count_nums(right)\n  }\n}",
      hints: ["Write case e with one pattern per variant of Expr.", "A Num counts as 1 and a Var as 0.", "A Binary has two sub-expressions. Count each with a recursive call and add. The operator is not needed, so match it with an underscore."],
      explain: "Any function over a syntax tree has this shape: one case per variant, with a recursive call for each sub-expression. eval is the same function with different results." },
    { id: "int_neg", title: "Add a new kind of expression", source: "Original question", norun: true, lang: "Gleam",
      desc: "Add negation to the arithmetic language. Give the Expr type a fourth variant, Neg, holding one expression. Then update the first eval from the lesson, the one that returns an Int, to handle it: the value of Neg(e) is 0 minus the value of e. For example, eval(Neg(Binary(Add, Num(2), Num(3)))) is -5.",
      starter: "type Expr {\n  Num(Int)\n  Var(String)\n  Binary(op: Op, left: Expr, right: Expr)\n  // add the new variant\n}\n\nfn eval(e: Expr) -> Int {\n  case e {\n    Num(n) -> n\n    Var(_) -> 0\n    Binary(op, left, right) -> apply(op, eval(left), eval(right))\n    // handle the new variant\n  }\n}\n",
      solution: "type Expr {\n  Num(Int)\n  Var(String)\n  Binary(op: Op, left: Expr, right: Expr)\n  Neg(Expr)\n}\n\nfn eval(e: Expr) -> Int {\n  case e {\n    Num(n) -> n\n    Var(_) -> 0\n    Binary(op, left, right) -> apply(op, eval(left), eval(right))\n    Neg(inner) -> 0 - eval(inner)\n  }\n}",
      hints: ["The new variant holds one Expr: Neg(Expr).", "In eval, add a pattern Neg(inner) that names the expression inside.", "Evaluate the inner expression with a recursive call, then subtract it from 0."],
      explain: "Adding a feature to a language is two steps: a new variant in the expression type, and a new rule in eval. Once the variant exists, the compiler refuses to build until every case over Expr handles it, so nothing is forgotten." },
    { id: "int_depth", title: "How deep is a name?", source: "Original question", norun: true, lang: "Gleam",
      desc: "Using the Env type from the lesson, write depth(env: Env, name: String) -> Result(Int, Nil). It returns Ok(0) if the name is bound in the first frame, Ok(1) if it is first found in the parent, and so on. If the name is not bound in any frame, it returns Error(Nil). With the frames f and g from the lesson, depth(f, \"z\") is Ok(0), depth(f, \"y\") is Ok(1) and depth(f, \"w\") is Error(Nil).",
      starter: "fn depth(env: Env, name: String) -> Result(Int, Nil) {\n  // your code here\n}\n",
      solution: "fn depth(env: Env, name: String) -> Result(Int, Nil) {\n  case dict.get(env.bindings, name), env {\n    Ok(_), _ -> Ok(0)\n    Error(_), Global(_) -> Error(Nil)\n    Error(_), Local(_, parent) ->\n      case depth(parent, name) {\n        Ok(n) -> Ok(n + 1)\n        Error(_) -> Error(Nil)\n      }\n  }\n}",
      hints: ["Follow the shape of lookup: first check env.bindings with dict.get.", "If the name is not in this frame and the frame is Global, the answer is Error(Nil).", "If the frame is Local, ask for the depth in the parent. That call returns a Result, so use a case: Ok(n) becomes Ok(n + 1), and an Error stays an Error."],
      explain: "Because the recursive call returns a Result, its value cannot be used as a number directly. The case unwraps it, adds one frame, and wraps it again, and passes an error along unchanged. Nesting the cases as lookup does is equally correct." }
  ]
};
