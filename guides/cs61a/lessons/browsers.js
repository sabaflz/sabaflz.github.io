/*
  lessons/browsers.js: Lecture 32, Browsers.
  Follows the lecture videos: a browser as an interpreter for HTML, CSS and
  JavaScript, the document object model, event-driven programs and handlers,
  what browsers provide, and why web frameworks separate a model from a view.
  The HTML, CSS and JavaScript here are small original examples to read.
  Deepen problems are Gleam, compiled and run in the browser by gleam/worker.js.
*/
window.LESSONS["browsers"] = {
  minutes: 14,
  snippets: {
    html: "<div class=\"card\">\n  <p>Tasks left: 3</p>\n  <button class=\"primary\">Add task</button>\n  <button class=\"primary\">Clear</button>\n</div>",
    css: ".primary {\n  color: white;\n  background: blue;\n}\n\n.done {\n  color: gray;\n}",
    js: "function handle_click() {\n  const p = document.querySelector(\"p\");\n  p.textContent = \"Tasks left: 4\";\n  p.classList.add(\"done\");\n}\n\nbutton.addEventListener(\"click\", handle_click);",
    mv: "model                       view(model)\n\ntasks: [\"read\", \"lab\"]       Tasks left: 2\nlast_click: 10:42             [Add task] [Clear]",
    node: "type Node {\n  Text(String)\n  Element(tag: String, class: String, children: List(Node))\n}\n\nfn count_elements(n: Node) -> Int {\n  case n {\n    Text(_) -> 0\n    Element(_, _, children) -> 1 + int.sum(list.map(children, count_elements))\n  }\n}"
  },
  steps: [
    { code: "html",
      say: "You just built an interpreter. Here is one you use every day: the web browser. A browser is an interpreter for three different languages at once. HTML describes what is on a page. CSS describes how it looks. JavaScript describes how it behaves. Gleam is not one of the three, but Gleam compiles to JavaScript, so a browser can run a Gleam program once it is compiled." },
    { code: "html", hl: [1, 2, 3, 4, 5],
      treeTitle: "DOM tree", tree: ["div  class=card", "├─ p", "│  └─ \"Tasks left: 3\"", "├─ button  class=primary", "│  └─ \"Add task\"", "└─ button  class=primary", "   └─ \"Clear\""],
      say: "HTML describes a page as a tree of elements. A div is a box that holds other things, a p is a paragraph, a button is a button. Elements are written with an opening and a closing tag, and whatever is between them is inside. When the browser parses HTML it builds that tree in memory. It is called the document object model, or DOM: a tree of elements and pieces of text. The panel shows the DOM for this HTML.",
      ask: { type: "type", q: "How many elements are in this tree? Count the elements, not the pieces of text.", answer: "4",
        why: "One div, one p and two buttons. The three pieces of text are nodes in the tree too, but they are text nodes, not elements." } },
    { code: "css", hl: [1, 2, 3, 4],
      say: "CSS, short for cascading style sheets, says how elements are displayed: color, size, font, position. The link between HTML and CSS is the class attribute. Any number of elements can share a class name, and a CSS rule that starts with a dot and that name styles all of them at once. Here both buttons have the class primary, so both are white on blue.",
      ask: { type: "mc", q: "You want every primary button to be green instead. What do you change?", choices: ["Each button in the HTML", "One line in the .primary rule in the CSS", "The JavaScript"], answer: 1,
        why: "The rule for a class is written once and applies to every element with that class. That separation, content in HTML and appearance in CSS, is the point of having two languages." } },
    { code: "js", hl: [1, 2, 3, 4, 5],
      say: "JavaScript has access to the DOM and can change it: add or remove nodes, change text, change attributes. This function finds the paragraph, changes its text, and adds the class done to it. The browser redraws the page to match. And because the CSS has a rule for done, the paragraph also turns gray, even though the JavaScript never mentions a color.",
      syntax: "JavaScript notes: const names a value, like let in Gleam. You do not need to write JavaScript for this course, only read the idea." },
    { code: "js", hl: [7],
      say: "When does that function run? Not when the page loads. An interactive program is event driven: code runs in response to events, such as the user clicking a button, a timer going off, or data arriving from a server. A function that is called in response to an event is an event handler. Line 7 registers handle_click as the handler for clicks on a button. From then on the browser calls it whenever that click happens.",
      ask: { type: "mc", q: "The user clicks the button three times. How many times does handle_click run?", choices: ["Once, when the page loads", "Three times, once per click", "It runs continuously"], answer: 1,
        why: "A handler runs each time its event occurs. Nothing calls it at load time. The program is a set of functions waiting for events, not a script that runs from top to bottom." } },
    { code: "html",
      say: "Browsers provide far more than three interpreters. They come with ready-made components for input, such as buttons, checkboxes, menus and sliders, and for output, such as text layout, images, video and audio. They handle communication: links between pages, and network requests to a server, which is another computer that stores data and sends back results. And they give access to the device: local storage, camera, microphone, location." },
    { code: "html",
      say: "Two more properties matter. Pages are sandboxed: a page can change itself, but it cannot read your files, and it cannot use your camera unless you give permission. And the built-in components are accessible: they work with screen readers and with a keyboard in place of a mouse.",
      ask: { type: "mc", q: "What does it mean that a web page is sandboxed?", choices: ["It runs slower than a normal program", "It is limited to its own page and cannot touch the rest of your computer without permission", "It cannot use JavaScript"], answer: 1,
        why: "The browser restricts what a page's code can reach. That is why visiting a page is much safer than installing a program." } },
    { code: "js", hl: [2, 3, 4],
      say: "Now a problem. Editing the DOM by hand, as this handler does, gets messy in a large application. Every handler has to know exactly which nodes to change. Redrawing takes time, so you want to change as little as possible. And two events can happen close together and both try to change the same thing. Web frameworks exist to handle this: you describe what the page should show, and the framework edits the DOM for you, efficiently and reliably." },
    { code: "mv", hl: [1, 3, 4],
      say: "Nearly every framework shares one idea: separate the model from the view. The model is a data structure holding the logical state of the application: what is going on. The view is what the user sees. And the view is defined as a pure function of the model. Given the same model, it always produces the same page." },
    { code: "mv", hl: [3, 4],
      say: "This is called declarative rendering. When something happens, your code does not edit the page. It only produces an updated model. The view function is run again on the new model, and the framework works out the smallest change to the DOM that makes the page match. Notice the model can hold things that are never displayed, like the time of the last click here.",
      ask: { type: "mc", q: "A task is added. With declarative rendering, what does your code do?", choices: ["Find the paragraph in the DOM and change its text", "Produce a new model with one more task, and let the view be recomputed", "Reload the page"], answer: 1,
        why: "You change the state, not the page. The view is a function of the model, so the page follows from the new model, and the framework applies the difference." } },
    { code: "node", hl: [1, 2, 3, 4],
      say: "One connection back to what you know. The DOM is a tree, and a tree is an algebraic data type. A node is either a piece of text, or an element with a tag, a class and a list of child nodes. Once it is written this way, every question about a page, such as how many elements it has, is tree recursion with one case per variant. The Deepen problems use this type.",
      ask: { type: "mc", q: "In count_elements, why does the Text case return 0?", choices: ["Text is not an element, and it has no children to search", "Text nodes are invisible", "It is the default for any case"], answer: 0,
        why: "Only Element values are counted. A Text has no children, so it is the base case of the recursion." } },
    { code: "mv",
      say: "To sum up: a browser interprets HTML for content, CSS for appearance and JavaScript for behavior. Parsing HTML gives the DOM, a tree that JavaScript can change. Web programs are event driven, built from handlers that the browser calls. And frameworks keep a model separate from the view, with the view computed from the model. The next lecture builds an application exactly that way, in Gleam." }
  ],

  check: [
    { type: "mc", q: "Which language describes how the elements of a page look?", choices: ["HTML", "CSS", "JavaScript"], answer: 1,
      why: "HTML describes the content as a tree of elements, CSS describes how they are displayed, and JavaScript describes behavior." },
    { type: "mc", q: "What is the document object model?", choices: ["The text of the HTML file", "The tree of elements and text that the browser keeps in memory for a page", "A JavaScript function"], answer: 1,
      why: "Parsing HTML produces the DOM. It is the browser's live representation of the page, and changing it changes what is shown." },
    { type: "mc", code: "<p class=\"note\">Hi</p>\n<p class=\"note\">Bye</p>\n<p>Later</p>",
      q: "A CSS rule .note { color: red; } is added. Which paragraphs turn red?", choices: ["All three", "The first two", "Only the first"], answer: 1,
      why: "A rule for a class applies to every element that has that class. The third paragraph has no class, so it is unaffected." },
    { type: "mc", q: "What is an event handler?", choices: ["A function the browser calls when a particular event happens", "A CSS rule", "The first function that runs when a page loads"], answer: 0,
      why: "Interactive programs are event driven. A handler is registered for an event such as a click, and runs each time that event occurs." },
    { type: "mc", q: "In a web framework, how is the view related to the model?", choices: ["The model is computed from the view", "The view is a pure function of the model", "They are edited separately and kept in sync by hand"], answer: 1,
      why: "The model holds the state. The view function turns a model into what should be displayed, and the framework updates the page to match." },
    { type: "mc", q: "Why do frameworks try to make the smallest possible change to the DOM?", choices: ["Changing the DOM makes the browser redraw, which takes time", "The DOM can only be changed once", "Large changes are not allowed by the sandbox"], answer: 0,
      why: "Every change to the DOM means re-rendering part of the page. Changing only what differs keeps a large application responsive." }
  ],

  deepen: [
    { id: "br_count_class", title: "Count elements with a class", source: "Original question", lang: "Gleam",
      gleam: { setup: "fn sf_page() -> Node {\n  Element(\"div\", \"card\", [\n    Element(\"p\", \"\", [Text(\"Tasks left: 3\")]),\n    Element(\"button\", \"primary\", [Text(\"Add task\")]),\n    Element(\"button\", \"primary\", [Text(\"Clear\")]),\n  ])\n}\n",
        tests: [["count_class(sf_page(), \"primary\")", "2"], ["count_class(sf_page(), \"card\")", "1"], ["count_class(sf_page(), \"done\")", "0"], ["count_class(Text(\"primary\"), \"primary\")", "0"], ["count_class(Element(\"a\", \"x\", [Element(\"b\", \"x\", [Element(\"c\", \"x\", [])])]), \"x\")", "3"]], show: 3 },
      desc: "A page is a tree of nodes, as in the lesson. Write count_class(n: Node, class: String) -> Int, the number of elements anywhere in the tree whose class equals the given one. In the examples, sf_page() is the page from the lesson: a div with class card holding a paragraph and two buttons with class primary.",
      starter: "import gleam/int\nimport gleam/list\n\ntype Node {\n  Text(String)\n  Element(tag: String, class: String, children: List(Node))\n}\n\nfn count_class(n: Node, class: String) -> Int {\n  // your code here\n}\n",
      solution: "import gleam/int\nimport gleam/list\n\ntype Node {\n  Text(String)\n  Element(tag: String, class: String, children: List(Node))\n}\n\nfn count_class(n: Node, class: String) -> Int {\n  case n {\n    Text(_) -> 0\n    Element(_, c, children) -> {\n      let below = int.sum(list.map(children, fn(child) { count_class(child, class) }))\n      case c == class {\n        True -> 1 + below\n        False -> below\n      }\n    }\n  }\n}",
      hints: ["Use case n with one pattern for Text and one for Element.", "For an element, first count the matches in its children: map a function over the children and add the results with int.sum.", "list.map needs a one-argument function, so wrap the call: fn(child) { count_class(child, class) }. Then add 1 if this element's own class matches."],
      explain: "Tree recursion over the DOM: the answer for an element is the answer for its children, plus one if the element itself matches. This is what a CSS rule has to do to find the elements it applies to." },
    { id: "br_all_text", title: "All the text on a page", source: "Original question", lang: "Gleam",
      gleam: { setup: "fn sf_page() -> Node {\n  Element(\"div\", \"card\", [\n    Element(\"p\", \"\", [Text(\"Tasks left: 3\")]),\n    Element(\"button\", \"primary\", [Text(\"Add task\")]),\n    Element(\"button\", \"primary\", [Text(\"Clear\")]),\n  ])\n}\n",
        tests: [["all_text(Element(\"p\", \"\", [Text(\"Hi \"), Element(\"b\", \"\", [Text(\"there\")])]))", "\"Hi there\""], ["all_text(Text(\"x\"))", "\"x\""], ["all_text(sf_page())", "\"Tasks left: 3Add taskClear\""], ["all_text(Element(\"div\", \"\", []))", "\"\""]] },
      desc: "Using the same Node type, write all_text(n: Node) -> String, which joins together every piece of text in the tree, in order from first to last. This is roughly what a screen reader has to collect. You may use string.concat, which joins a list of strings into one.",
      starter: "import gleam/list\nimport gleam/string\n\ntype Node {\n  Text(String)\n  Element(tag: String, class: String, children: List(Node))\n}\n\nfn all_text(n: Node) -> String {\n  // your code here\n}\n",
      solution: "import gleam/list\nimport gleam/string\n\ntype Node {\n  Text(String)\n  Element(tag: String, class: String, children: List(Node))\n}\n\nfn all_text(n: Node) -> String {\n  case n {\n    Text(s) -> s\n    Element(_, _, children) -> string.concat(list.map(children, all_text))\n  }\n}",
      hints: ["A Text node's text is the string it holds.", "An element has no text of its own. Its text is the text of its children, joined in order.", "list.map(children, all_text) gives a list of strings. string.concat joins them."],
      explain: "The same shape as total for a tree of numbers, with strings joined in place of numbers added. An element with no children gives the empty string, because joining an empty list gives an empty string." }
  ]
};
