/*
  lessons/attributes.js: Lecture 20, Attributes.
  Follows the lecture videos: how a dot expression looks a name up (instance
  first, then class), class attributes, assigning to an instance versus
  assigning to a class, getattr and hasattr, and functions versus bound
  methods. The lecture's example is an account's interest rate; this lesson
  uses a ticket's price with the same structure.
  Same shape as lessons/recursion.js, plus `env`.
*/
window.LESSONS.attributes = {
  minutes: 14,
  snippets: {
    cls: "class Ticket:\n    price = 12\n\n    def __init__(self, holder):\n        self.holder = holder\n\n    def cost(self, count):\n        return self.price * count",
    look: "a = Ticket('Ada')\nb = Ticket('Bo')\n\na.holder\na.price\nb.price\nTicket.price",
    seq: "a = Ticket('Ada')\nb = Ticket('Bo')\n\nTicket.price = 15\na.price\n\nb.price = 5\na.price\nb.price\n\nTicket.price = 20\na.price\nb.price",
    method: "a = Ticket('Ada')\nb = Ticket('Bo')\nb.price = 5\n\na.cost(2)\nb.cost(2)",
    getattr: "a = Ticket('Ada')\n\ngetattr(a, 'holder')\nhasattr(a, 'price')\nhasattr(a, 'seat')",
    bound: "a = Ticket('Ada')\n\nTicket.cost\na.cost\n\nTicket.cost(a, 3)\na.cost(3)",
    trap: "class Visit:\n    total = 0\n\n    def __init__(self):\n        self.total = self.total + 1\n\nVisit()\nVisit()\nVisit.total",
    fixed: "class Visit:\n    total = 0\n\n    def __init__(self):\n        Visit.total = Visit.total + 1\n\nVisit()\nVisit()\nVisit.total"
  },
  steps: [
    { code: "cls", hl: [2],
      say: "In the last lesson every attribute was created inside __init__ with self, so each instance had its own copy. Line 2 is different. An assignment written directly inside the class statement, not inside any method, creates a class attribute. It belongs to the class itself, and there is only one of it, shared by every instance." },
    { code: "cls", hl: [4, 5, 7, 8],
      say: "So this class has two kinds of attributes. holder is an instance attribute: each ticket has its own. price is a class attribute: one value for all tickets. The methods are class attributes too. A def inside a class is just a class attribute whose value is a function.",
      basics: "Use an instance attribute for something that differs from object to object, like a name. Use a class attribute for something every object of that type shares." },
    { code: "look", hl: [4, 5], env: [["Ticket (the class)", "price: 12"], ["a", "holder: 'Ada'"], ["b", "holder: 'Bo'"]],
      say: "Here is the rule for a dot expression, and it is worth memorizing like the rule for looking up names in frames. First evaluate what is left of the dot to get an object. Look for the name among that object's own instance attributes. If it is not there, look in the object's class. a.holder is found on the instance. a.price is not on the instance, so Python finds it in the class.",
      ask: { type: "type", q: "What is b.price?", answer: "12",
        why: "b has no price of its own, so the lookup continues to the Ticket class and finds 12. Both tickets see the same class attribute." } },
    { code: "seq", hl: [4, 5], env: [["Ticket (the class)", "price: 15"], ["a", "holder: 'Ada'"], ["b", "holder: 'Bo'"]],
      say: "Assignment follows a simpler rule than lookup. An assignment with a dot on its left sets the attribute on exactly the object named there. No searching happens. On line 4 that object is the class, so the class attribute changes, and every instance that looks it up sees the new value, including ones created earlier.",
      ask: { type: "type", q: "What is a.price on line 5?", answer: "15",
        why: "a still has no price of its own. The lookup goes to the class, where price is now 15. Instances do not lock in class attributes when they are created." } },
    { code: "seq", hl: [7, 8, 9], env: [["Ticket (the class)", "price: 15"], ["a", "holder: 'Ada'"], ["b", "holder: 'Bo', price: 5"]],
      say: "On line 7 the object left of the dot is the instance b. So this creates a new instance attribute on b. It does not touch the class. Now there are two attributes named price: one on b, and one on the class.",
      ask: { type: "mc", q: "What are a.price and b.price on lines 8 and 9?", choices: ["5 and 5", "15 and 5", "15 and 15"], answer: 1,
        why: "a has no price of its own, so it finds the class's 15. b now has its own price, 5, and the lookup stops there before reaching the class." } },
    { code: "seq", hl: [11, 12, 13], env: [["Ticket (the class)", "price: 20"], ["a", "holder: 'Ada'"], ["b", "holder: 'Bo', price: 5"]],
      say: "Now the class attribute changes again.",
      ask: { type: "mc", q: "What are a.price and b.price on lines 12 and 13?", choices: ["20 and 20", "20 and 5", "15 and 5"], answer: 1,
        why: "a reads the class attribute, which is now 20. b still has its own instance attribute, 5, which hides the class's value. Changing the class does not erase the special cases." } },
    { code: "method", hl: [5, 6],
      say: "This is why the cost method in the class says self.price and not Ticket.price. Looking the price up through self uses the instance's own value when it has one, and falls back to the class otherwise. Look attributes up on the instance whenever you can.",
      ask: { type: "type", q: "a.cost(2) is 24. What is b.cost(2)?", answer: "10",
        why: "Inside the call, self is b. self.price finds b's own price, 5, so the result is 5 * 2 = 10." } },
    { code: "getattr", hl: [3, 4, 5],
      say: "Two built-in functions do the same lookup using the attribute name as a string. getattr(a, 'holder') is the same as a.holder. hasattr tells you whether a lookup would succeed. It checks the instance and then the class, exactly like the dot.",
      ask: { type: "mc", q: "What are hasattr(a, 'price') and hasattr(a, 'seat')?", choices: ["True and False", "False and False", "True and True"], answer: 0,
        why: "price is not on the instance, but it is found in the class, so the first is True. seat is in neither place, so the second is False." } },
    { code: "bound", hl: [3, 4],
      say: "The lookup rule has one extra clause, and it explains self. If the value found in the class is a function, the dot expression does not hand back the plain function. It hands back a bound method: the function with the instance already filled in as self. Looked up on the class, cost is a plain function. Looked up on an instance, it is a bound method." },
    { code: "bound", hl: [6, 7],
      say: "So there are two ways to call it. As a function, through the class, you pass both arguments yourself. As a bound method, through the instance, self is already supplied. Both lines return 36. The second form is what you normally write, and the first form becomes useful in the next lesson, on inheritance." },
    { code: "trap", hl: [5],
      say: "Now a trap that combines both rules. This class tries to count how many Visit objects have been made. Read line 5 carefully: the right side is a lookup, and the left side is an assignment.",
      ask: { type: "mc", q: "After two visits are created, what is Visit.total?", choices: ["2", "1", "0"], answer: 2,
        why: "On the right, self.total is not on the new instance, so it finds the class's 0 and adds 1. On the left, self.total = creates an instance attribute on that one object. The class attribute is never changed, so it is still 0." } },
    { code: "fixed", hl: [5],
      say: "To change the shared value, assign to it on the class. Now each new visit updates the one class attribute, and Visit.total is 2 after two visits. The rule to remember: lookup searches the instance and then the class, but assignment only ever sets the attribute on the object written left of the dot." },
    { code: "cls",
      say: "To sum up: instance attributes belong to one object, and class attributes are shared. A dot lookup checks the instance first and then the class. A dot assignment sets the attribute exactly where you point it. A function found in the class comes back as a bound method with self filled in." }
  ],

  check: [
    { type: "type", code: "class Pen:\n    color = 'blue'\n\n    def __init__(self, brand):\n        self.brand = brand\n\np = Pen('Zed')\nq = Pen('Arc')\nPen.color = 'red'\nq.color",
      q: "What is the value of the last line?", answer: "red",
      why: "q has no color of its own, so the lookup goes to the class, where color is now 'red'." },
    { type: "mc", code: "class Pen:\n    color = 'blue'\n\np = Pen()\nq = Pen()\np.color = 'green'",
      q: "What are q.color and Pen.color after these lines?", choices: ["'green' and 'green'", "'blue' and 'blue'", "'blue' and 'green'"], answer: 1,
      why: "p.color = 'green' creates an instance attribute on p only. The class attribute is untouched, so q and the class both still give 'blue'." },
    { type: "mc", code: "class Pen:\n    color = 'blue'\n\n    def __init__(self, brand):\n        self.brand = brand",
      q: "Which of these is an error?", choices: ["Pen.color", "Pen('Zed').color", "Pen.brand"], answer: 2,
      why: "brand is an instance attribute. It exists only on objects that __init__ has set up, not on the class. Lookup goes from an instance up to its class, never the other way." },
    { type: "type", code: "class Pen:\n    ink = 10\n\n    def write(self, n):\n        return self.ink - n\n\np = Pen()\np.ink = 4\nPen.write(p, 1)",
      q: "What is the value of the last line?", answer: "3",
      why: "Calling the function through the class means passing the instance yourself, so self is p. self.ink finds p's own ink, 4, and 4 - 1 is 3." },
    { type: "mc", code: "class Pen:\n    made = 0\n\n    def __init__(self):\n        Pen.made = Pen.made + 1\n\na = Pen()\nb = Pen()",
      q: "What is a.made after these lines?", choices: ["1", "2", "0"], answer: 1,
      why: "Each __init__ assigns to the class attribute, so it counts both pens. a has no made of its own, so a.made finds the class's value, 2." },
    { type: "mc", code: "class Pen:\n    color = 'blue'\n\np = Pen()",
      q: "What is hasattr(p, 'color')?", choices: ["True", "False", "An error"], answer: 0,
      why: "hasattr uses the same lookup as the dot: instance first, then class. color is found in the class." }
  ],

  deepen: [
    { id: "att_robot", title: "Numbered robots", source: "Original question",
      desc: "Write a class Robot. The class keeps count of how many robots have been built in a class attribute named built, which starts at 0. Each new robot adds 1 to that count, and stores the new count in its own instance attribute named serial. So the first robot has serial 1, the second has serial 2, and so on.",
      starter: "class Robot:\n    \"\"\"A robot that knows which number it was.\n    >>> Robot.built\n    0\n    >>> a = Robot()\n    >>> b = Robot()\n    >>> a.serial\n    1\n    >>> b.serial\n    2\n    >>> Robot.built\n    2\n    \"\"\"\n    \"*** YOUR CODE HERE ***\"\n",
      solution: "class Robot:\n    built = 0\n\n    def __init__(self):\n        Robot.built = Robot.built + 1\n        self.serial = Robot.built",
      tests: "assert Robot.built == 0\na = Robot()\nb = Robot()\nassert a.serial == 1 and b.serial == 2\nassert Robot.built == 2, 'the count must be stored on the class, not on each robot'\nc = Robot()\nassert c.serial == 3 and Robot.built == 3\nassert a.serial == 1, 'a robot keeps its own serial number'\nassert a.built == 3, 'built should be a class attribute that every robot can see'",
      hints: ["built is shared by all robots, so create it directly inside the class statement.", "In __init__, increase the count by assigning to Robot.built. Assigning to self.built would create a separate attribute on that one robot.", "Robot.built = Robot.built + 1, then self.serial = Robot.built."],
      explain: "The shared count lives on the class and is changed through the class. The serial number lives on the instance. This is the fixed version of the trap from the lesson." },
    { id: "att_coupon", title: "A coupon with a default", source: "Original question",
      desc: "Write a class Coupon. Every coupon normally takes 10 off, stored in a class attribute named off. The method apply(price) returns the price after taking off this coupon's discount, but never less than 0. A single coupon can be given its own discount by assigning to its off attribute, and apply must respect that.",
      starter: "class Coupon:\n    \"\"\"A coupon that takes an amount off a price.\n    >>> c = Coupon()\n    >>> c.apply(50)\n    40\n    >>> c.apply(4)\n    0\n    >>> vip = Coupon()\n    >>> vip.off = 25\n    >>> vip.apply(50)\n    25\n    >>> c.apply(50)\n    40\n    \"\"\"\n    \"*** YOUR CODE HERE ***\"\n",
      solution: "class Coupon:\n    off = 10\n\n    def apply(self, price):\n        return max(0, price - self.off)",
      tests: "c = Coupon()\nassert c.apply(50) == 40\nassert c.apply(4) == 0\nassert c.apply(10) == 0\nvip = Coupon()\nvip.off = 25\nassert vip.apply(50) == 25, 'apply should use the coupon\\'s own off when it has one: look it up through self'\nassert c.apply(50) == 40\nCoupon.off = 1\nassert c.apply(50) == 49, 'changing the class attribute should change every ordinary coupon'\nassert vip.apply(50) == 25",
      hints: ["off is a class attribute: write it directly inside the class. You do not need an __init__ at all.", "Inside apply, read the discount as self.off, not Coupon.off. That way a coupon with its own off uses it.", "return max(0, price - self.off)"],
      explain: "Looking the discount up through self gives the instance's value when there is one and the class's value otherwise. Writing Coupon.off would ignore the special case." },
    { id: "att_total", title: "Mixed prices", source: "Original question",
      desc: "The Ticket class from the lesson is written for you. Implement total, which takes a list of tickets and returns the sum of their prices. Some tickets in the list may have been given their own price, and the rest use the class's price.",
      starter: "class Ticket:\n    price = 12\n\n    def __init__(self, holder):\n        self.holder = holder\n\ndef total(tickets):\n    \"\"\"Return the sum of the prices of all the tickets.\n    >>> a, b, c = Ticket('Ada'), Ticket('Bo'), Ticket('Cy')\n    >>> total([a, b, c])\n    36\n    >>> b.price = 5\n    >>> total([a, b, c])\n    29\n    >>> total([])\n    0\n    \"\"\"\n    \"*** YOUR CODE HERE ***\"\n",
      solution: "class Ticket:\n    price = 12\n\n    def __init__(self, holder):\n        self.holder = holder\n\ndef total(tickets):\n    return sum([t.price for t in tickets])",
      tests: "a, b, c = Ticket('Ada'), Ticket('Bo'), Ticket('Cy')\nassert total([a, b, c]) == 36\nb.price = 5\nassert total([a, b, c]) == 29\nassert total([]) == 0\nTicket.price = 20\nassert total([a, b, c]) == 45, 'tickets without their own price should follow the class price'\nassert total([b, b]) == 10",
      hints: ["You do not need to work out where each price is stored. The dot does that for you.", "t.price gives the ticket's own price if it has one, and the class's price if not.", "return sum([t.price for t in tickets])"],
      explain: "One expression handles both kinds of ticket, because lookup checks the instance and then the class. Code that reads attributes through the instance works for ordinary objects and special cases alike." }
  ]
};
