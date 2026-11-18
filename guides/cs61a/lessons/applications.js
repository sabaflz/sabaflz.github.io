/*
  lessons/applications.js: Lecture 33, Applications.
  Follows the lecture videos: the model, view, update pattern, messages as
  values, the Lustre framework for Gleam (elements, text, buttons, on_click),
  effects, and building a small application step by step.
  The app here is an original example (a study-time log). Its Gleam code was
  type checked against Lustre and its update function was run.
  Deepen problems are Gleam, compiled and run in the browser by gleam/worker.js.
*/
window.LESSONS["applications"] = {
  minutes: 18,
  snippets: {
    loop: "        +-----------> view(model) ----------+\n        |                                   |\n      model                         page the user sees\n        ^                                   |\n        |                              user clicks\n        +--- update(model, message) <-------+",
    types: "type Model {\n  Model(target: Int, sessions: List(Int))\n}\n\ntype Msg {\n  UserAdded(minutes: Int)\n  UserUndid\n  UserReset\n}",
    update: "fn init(_flags) -> Model {\n  Model(target: 90, sessions: [])\n}\n\nfn update(model: Model, msg: Msg) -> Model {\n  case msg {\n    UserAdded(m) -> Model(..model, sessions: [m, ..model.sessions])\n    UserUndid ->\n      case model.sessions {\n        [] -> model\n        [_, ..rest] -> Model(..model, sessions: rest)\n      }\n    UserReset -> Model(..model, sessions: [])\n  }\n}",
    view: "fn view(model: Model) -> Element(Msg) {\n  let total = int.sum(model.sessions)\n  html.div([], [\n    html.div([], [\n      html.text(\"Goal: \" <> int.to_string(model.target) <> \" minutes\"),\n    ]),\n    html.div([], list.map([15, 25, 50], add_button)),\n    html.div([], [\n      html.button([event.on_click(UserUndid)], [html.text(\"Undo\")]),\n    ]),\n    html.div([], [\n      html.text(case total >= model.target {\n        True -> \"Done for today\"\n        False -> int.to_string(total) <> \" so far\"\n      }),\n    ]),\n  ])\n}\n\nfn add_button(m: Int) -> Element(Msg) {\n  html.button([event.on_click(UserAdded(m))], [\n    html.text(\"+\" <> int.to_string(m)),\n  ])\n}",
    main: "import gleam/int\nimport gleam/list\nimport lustre\nimport lustre/element.{type Element}\nimport lustre/element/html\nimport lustre/event\n\npub fn main() {\n  let app = lustre.simple(init, update, view)\n  let assert Ok(_) = lustre.start(app, \"#app\", Nil)\n  Nil\n}",
    effect: "// lustre.simple\nfn update(model: Model, msg: Msg) -> Model\n\n// lustre.application\nfn update(model: Model, msg: Msg) -> #(Model, Effect(Msg))"
  },
  steps: [
    { code: "loop",
      say: "The last lecture ended with an idea: keep a model of the application's state, and compute the view from it. This lecture turns that into a complete way of building an application, called model, view, update. It is the pattern functional languages use for web apps, and it needs no mutation at all." },
    { code: "loop", hl: [1, 3, 6],
      say: "There are three parts. The model is one value that holds the entire state of the page. The view is a function from the model to the tree of elements to display. And update is a function that takes the current model and a description of something that just happened, and returns the next model. The framework runs the loop in the diagram: show the view, wait for an event, call update, show the new view." },
    { code: "types", hl: [1, 2, 3],
      say: "Here is a small app: a log of study sessions for today, with a goal in minutes. Start with the model. Ask what the app needs to remember: the goal, and the length of each session so far. Nothing about buttons or layout belongs here. It is plain Gleam data." },
    { code: "types", hl: [5, 6, 7, 8, 9],
      say: "Next, the messages. In the last lecture, a click ran an event handler, a function that did something. Here, a click produces a message, which is only a value describing what happened. The Msg type lists every event that can change the model: the user added a session of some length, undid the last one, or reset. It is a sum type, and one variant carries data.",
      ask: { type: "mc", q: "What is a message in this pattern?", choices: ["A function that edits the page", "A value that describes something that happened", "Text shown to the user"], answer: 1,
        why: "A message does nothing by itself. It is data. All the code that decides what to do with it lives in one place, the update function." } },
    { code: "update", hl: [1, 2, 3],
      say: "init gives the model the app starts with: a goal of 90 minutes and no sessions yet." },
    { code: "update", hl: [5, 6, 7],
      say: "update is where everything happens, and it is an ordinary pure function: a case on the message. For UserAdded, it returns a model like the old one but with the new session at the front of the list. The old model is not changed. A new one is built with the record update syntax from the algebraic data types lecture.",
      ask: { type: "type", q: "The model has sessions [25]. update receives UserAdded(50). What is sessions in the model it returns? Write it as a list.", answer: "[50, 25]",
        why: "The new session is put at the front: [m, ..model.sessions] with m as 50 gives [50, 25]. Putting it at the front makes undo easy." } },
    { code: "update", hl: [8, 9, 10, 11, 12, 13],
      say: "Undo drops the first item of the list, which is the most recent session. The compiler makes you say what happens when there is nothing to undo: the model is returned as it is. Reset returns a model with an empty list.",
      ask: { type: "mc", q: "Starting from sessions [], the messages UserAdded(15), UserAdded(25), UserUndid, UserAdded(50) arrive in that order. What is sessions at the end?", choices: ["[50, 15]", "[50, 25]", "[15, 50]"], answer: 0,
        why: "After the two adds the list is [25, 15]. Undo removes the most recent, leaving [15]. Adding 50 puts it at the front: [50, 15]." } },
    { code: "view", hl: [1, 3, 4, 5, 6],
      say: "Now the view, using Lustre, a model, view, update framework for Gleam. The view takes the model and returns an Element, the root of the tree to display. Elements are built by calling functions. html.div makes a box and takes a list of attributes and a list of children. html.text makes a piece of text. This is the DOM tree from the last lecture, written as nested function calls.",
      syntax: "Reading Element(Msg): an element whose events can send messages of type Msg." },
    { code: "view", hl: [9, 20, 21, 22, 23, 24],
      say: "A button also takes attributes and children. Its children are its label. The attribute event.on_click takes a message. It does not take a function to run. It says: when this button is clicked, send this message to update. The three add buttons are made by mapping add_button over a list of lengths, so each one sends UserAdded with its own number.",
      ask: { type: "mc", q: "The user clicks the button labelled +25. What happens next?", choices: ["The view function edits the total on the page", "update is called with the current model and UserAdded(25), and then view is called on the model it returns", "The model is mutated to add 25"], answer: 1,
        why: "The click sends the message attached to that button. The framework passes it to update, gets a new model back, and calls view on it to find out what the page should now show." } },
    { code: "view", hl: [2, 11, 12, 13, 14, 15, 16],
      say: "The last box shows the total, or a message when the goal is reached. Notice that the total is not stored in the model. It is computed from the model each time the view runs. Keep in the model only what cannot be worked out from the rest.",
      ask: { type: "mc", q: "The model has target 90 and sessions [50, 25, 15]. What does the last box show?", choices: ["\"90 so far\"", "\"Done for today\"", "\"75 so far\""], answer: 1,
        why: "The total is 50 + 25 + 15 = 90, and 90 >= 90 is True, so the view shows \"Done for today\"." } },
    { code: "main", hl: [8, 9, 10, 11, 12],
      say: "Finally, main connects the three functions. lustre.simple builds an app from init, update and view. lustre.start attaches it to the element of the page whose id is app. The HTML file itself is nearly empty: one div with that id, and a line that loads the compiled Gleam. To style the app, give elements a class with an attribute and write CSS rules for that class, as in the last lecture.",
      syntax: "Gleam notes: let assert Ok(_) = ... says the result must be Ok. If starting fails, the program stops with an error there." },
    { code: "effect", hl: [1, 2, 4, 5],
      say: "One more piece. Some messages should cause something beyond a new model: saving to a server, storing data on the device, turning on the camera. Those are called effects. A simple app has none. A full application's update returns a tuple: the new model, and an effect describing what else should happen. An effect can send a message back later. For example, a save request finishes, and a message arrives saying it was saved, which update stores in the model.",
      ask: { type: "mc", q: "Why does a save to a server report its result as another message?", choices: ["update cannot wait for the server, so the outcome arrives later as a new event", "Messages are faster than function calls", "The server edits the model directly"], answer: 0,
        why: "update returns immediately with the new model and a description of the effect. When the effect finishes, its outcome comes back through the same door as every other event: a message to update." } },
    { code: "loop",
      say: "To sum up: the model is all the state, in one value. A message is a value describing an event. update is a pure function from a model and a message to a new model. view is a pure function from a model to elements, with messages attached to the things a user can click. Every part is a plain function on immutable data, which makes each one easy to test on its own." }
  ],

  check: [
    { type: "mc", q: "In model, view, update, where is the state of the application kept?", choices: ["Spread across the elements of the page", "In one model value", "Inside the event handlers"], answer: 1,
      why: "The model is a single data structure describing the whole state. The page is computed from it." },
    { type: "mc", code: "fn update(model: Model, msg: Msg) -> Model",
      q: "What does update do?", choices: ["Changes the model it is given", "Returns a new model, given the current model and a message", "Draws the page"], answer: 1,
      why: "update is a pure function. It cannot change its argument. It returns the next model, and the framework uses that from then on." },
    { type: "type", code: "type Msg {\n  Up\n  Down\n}\n\nfn update(n: Int, msg: Msg) -> Int {\n  case msg {\n    Up -> n + 1\n    Down -> n - 1\n  }\n}",
      q: "The model starts at 5 and the messages Up, Up, Down, Up arrive. What is the model at the end?", answer: "7",
      why: "5 becomes 6, then 7, then 6, then 7. Each call to update takes the previous result as its model." },
    { type: "mc", code: "html.button([event.on_click(UserReset)], [html.text(\"Start over\")])",
      q: "What does event.on_click(UserReset) mean?", choices: ["Call the function UserReset when the page loads", "When this button is clicked, send the message UserReset to update", "Reset the model right now"], answer: 1,
      why: "The attribute attaches a message to the click event. Nothing happens until the user clicks, and then the message is delivered to update." },
    { type: "mc", q: "In the lesson's app, why is the total number of minutes not stored in the model?", choices: ["Gleam cannot store numbers in a model", "It can be computed from the list of sessions whenever the view runs", "Totals must be stored on a server"], answer: 1,
      why: "Storing something that can be derived invites the two copies disagreeing. The view computes the total from the sessions each time." },
    { type: "mc", q: "When does an application's update need to return an effect as well as a model?", choices: ["Always", "When handling a message should also do something outside the model, such as a network request", "Only when the view has buttons"], answer: 1,
      why: "An effect describes a side effect for the framework to carry out, such as saving to a server or using the camera. Its outcome comes back later as another message." }
  ],

  deepen: [
    { id: "app_counter", title: "A counter that stops at zero", source: "Original question", lang: "Gleam",
      gleam: { tests: [["update(3, Increased)", "4"], ["update(3, Decreased)", "2"], ["update(0, Decreased)", "0"], ["update(8, Cleared)", "0"], ["update(update(0, Decreased), Increased)", "1"]], show: 3 },
      desc: "An app counts people in a room. Its model is an Int. Define a Msg type with three variants, Increased, Decreased and Cleared, and write update(model: Int, msg: Msg) -> Int. Increased adds 1, Cleared gives 0, and Decreased subtracts 1 but never goes below 0.",
      starter: "type Msg {\n  // the three variants go here\n}\n\nfn update(model: Int, msg: Msg) -> Int {\n  // your code here\n}\n",
      solution: "type Msg {\n  Increased\n  Decreased\n  Cleared\n}\n\nfn update(model: Int, msg: Msg) -> Int {\n  case msg {\n    Increased -> model + 1\n    Cleared -> 0\n    Decreased ->\n      case model > 0 {\n        True -> model - 1\n        False -> 0\n      }\n  }\n}",
      hints: ["The three variants carry no data, so each is just a capitalized name.", "update is a case on msg with one pattern per variant.", "For Decreased, check whether the model is above 0 before subtracting. A guard works too: Decreased if model > 0 -> model - 1."],
      explain: "The rule that the count cannot go negative lives in update, the one place where the model changes. No button or view code needs to know about it." },
    { id: "app_cart", title: "A shopping list", source: "Original question", lang: "Gleam",
      gleam: { tests: [["update(Model([\"tea\"], 0), Added(\"rice\")).items", "[\"rice\", \"tea\"]"], ["update(Model([\"rice\", \"tea\"], 0), BoughtFirst)", "Model(items: [\"tea\"], bought: 1)"], ["update(Model([], 4), BoughtFirst)", "Model(items: [], bought: 4)"], ["update(Model([\"tea\"], 2), Added(\"rice\")).bought", "2"], ["update(update(Model([], 0), Added(\"a\")), BoughtFirst)", "Model(items: [], bought: 1)"]] },
      desc: "A shopping list app has the model and messages given in the starter code. Write update. Added(name) puts the name at the front of items. BoughtFirst removes the first item and adds 1 to bought. If there are no items, BoughtFirst changes nothing.",
      starter: "type Model {\n  Model(items: List(String), bought: Int)\n}\n\ntype Msg {\n  Added(name: String)\n  BoughtFirst\n}\n\nfn update(model: Model, msg: Msg) -> Model {\n  // your code here\n}\n",
      solution: "type Model {\n  Model(items: List(String), bought: Int)\n}\n\ntype Msg {\n  Added(name: String)\n  BoughtFirst\n}\n\nfn update(model: Model, msg: Msg) -> Model {\n  case msg {\n    Added(name) -> Model(..model, items: [name, ..model.items])\n    BoughtFirst ->\n      case model.items {\n        [] -> model\n        [_, ..rest] -> Model(items: rest, bought: model.bought + 1)\n      }\n  }\n}",
      hints: ["Start with case msg and a pattern for each of the two messages.", "For Added, build a new model with the record update syntax: Model(..model, items: ...).", "For BoughtFirst, use a second case on model.items. An empty list returns the model unchanged. Otherwise drop the first item and add 1 to bought."],
      explain: "Each message maps to a new model built from the old one. The empty-list case has to be written, because the compiler will not accept a case on a list that ignores it." },
    { id: "app_replay", title: "Replay a list of messages", source: "Original question", lang: "Gleam",
      gleam: { tests: [["replay(5, [Up, Up, Down, Up])", "7"], ["replay(0, [])", "0"], ["replay(2, [Down, Down, Down])", "-1"], ["replay(10, [Up])", "11"]] },
      desc: "Because update is a pure function, you can test an app without a browser by feeding it messages. Using the Msg type and update function in the starter code, write replay(model: Int, msgs: List(Msg)) -> Int, the model that results from applying every message in order, starting from the given model.",
      starter: "type Msg {\n  Up\n  Down\n}\n\nfn update(n: Int, msg: Msg) -> Int {\n  case msg {\n    Up -> n + 1\n    Down -> n - 1\n  }\n}\n\nfn replay(model: Int, msgs: List(Msg)) -> Int {\n  // your code here\n}\n",
      solution: "type Msg {\n  Up\n  Down\n}\n\nfn update(n: Int, msg: Msg) -> Int {\n  case msg {\n    Up -> n + 1\n    Down -> n - 1\n  }\n}\n\nfn replay(model: Int, msgs: List(Msg)) -> Int {\n  case msgs {\n    [] -> model\n    [first, ..rest] -> replay(update(model, first), rest)\n  }\n}",
      hints: ["With no messages left, the answer is the model you have.", "Otherwise, apply the first message with update to get the next model.", "Then replay the rest of the messages starting from that next model. That recursive call is the whole result."],
      explain: "The model plays the part of the running total in a tail-recursive loop. This is the loop the framework runs for you, one message at a time, as the user clicks." }
  ]
};
