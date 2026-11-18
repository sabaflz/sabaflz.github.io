/*
  lessons/tables.js: Lecture 35, Tables.
  Follows the lecture videos: joining two tables with JOIN ... ON and with a
  comma and WHERE, cross joins, joining three tables, joining a table with
  itself using aliases, numerical expressions, and string expressions.
  The data (Bay Area trails) is an original example. Every result table in
  this file was produced by running the query in SQLite, not typed by hand.
  Deepen problems run in the browser (sql/worker.js).
*/
window.LESSONS["tables"] = {
 "minutes": 20,
 "snippets": {
  "join": "SELECT name, region\n  FROM trails JOIN parks\n  ON trails.park = parks.park;",
  "star": "SELECT *\n  FROM trails JOIN parks\n  ON trails.park = parks.park\n  LIMIT 3;",
  "comma": "SELECT name, region\n  FROM trails, parks\n  WHERE trails.park = parks.park;",
  "cross": "SELECT name, region\n  FROM trails JOIN parks\n  LIMIT 6;",
  "filter": "SELECT name, miles\n  FROM trails JOIN parks\n  ON trails.park = parks.park\n  WHERE fee = 0 AND miles >= 3\n  ORDER BY miles DESC;",
  "three": "SELECT hiker, name, region\n  FROM hikes JOIN trails JOIN parks\n  ON hikes.trail = trails.name\n  AND trails.park = parks.park\n  WHERE hiker = 'Ana';",
  "missing": "SELECT hiker, name, region\n  FROM hikes JOIN trails JOIN parks\n  ON hikes.trail = trails.name\n  WHERE hiker = 'Ana';",
  "self": "SELECT a.name AS first, b.name AS second, a.park\n  FROM trails AS a JOIN trails AS b\n  ON a.park = b.park\n  WHERE a.name < b.name;",
  "diff": "SELECT a.name AS shorter, b.name AS longer,\n       b.miles - a.miles AS extra\n  FROM trails AS a JOIN trails AS b\n  ON a.park = b.park\n  WHERE a.miles < b.miles;",
  "num": "SELECT name, ROUND(climb * 0.3048) AS meters\n  FROM trails\n  WHERE park <> 'Tilden' AND ABS(miles - 5) <= 3;",
  "str": "SELECT name || ' (' || park || ')' AS label\n  FROM trails\n  WHERE miles <= 2;"
 },
 "steps": [
  {
   "code": "join",
   "say": "Real databases keep different kinds of information in different tables. Here the trails table says which park each trail is in, and a second table, parks, says which region each park is in and its entry fee. Which region is the Seaview trail in? Neither table can answer alone. You need a row from each.",
   "tables": [
    {
     "name": "trails",
     "cols": [
      "name",
      "park",
      "miles",
      "climb"
     ],
     "rows": [
      [
       "Seaview",
       "Tilden",
       4,
       700
      ],
      [
       "Wildcat Peak",
       "Tilden",
       3,
       500
      ],
      [
       "Jewel Lake",
       "Tilden",
       1,
       50
      ],
      [
       "Redwood Loop",
       "Muir Woods",
       2,
       100
      ],
      [
       "Ocean View",
       "Muir Woods",
       5,
       1300
      ],
      [
       "Tomales Point",
       "Point Reyes",
       9,
       1200
      ],
      [
       "Chimney Rock",
       "Point Reyes",
       2,
       200
      ],
      [
       "Sunset Falls",
       "Big Basin",
       10,
       2100
      ]
     ]
    },
    {
     "name": "parks",
     "cols": [
      "park",
      "region",
      "fee"
     ],
     "rows": [
      [
       "Tilden",
       "East Bay",
       0
      ],
      [
       "Muir Woods",
       "Marin",
       15
      ],
      [
       "Point Reyes",
       "Marin",
       0
      ],
      [
       "Big Basin",
       "South Bay",
       10
      ]
     ]
    }
   ]
  },
  {
   "code": "join",
   "hl": [
    2,
    3
   ],
   "say": "Combining tables is called a join. Writing JOIN between two table names forms rows that are a row from the first table followed by a row from the second. ON gives the condition for which pairs to keep: here, the trail's park must equal the park's name. Each trail is matched with the row for its own park, so its region can be shown beside it.",
   "syntax": "SQL notes: when two tables have a column with the same name, write the table name, a dot, and the column name to say which one you mean.",
   "tables": [
    {
     "name": "Result",
     "cols": [
      "name",
      "region"
     ],
     "rows": [
      [
       "Seaview",
       "East Bay"
      ],
      [
       "Wildcat Peak",
       "East Bay"
      ],
      [
       "Jewel Lake",
       "East Bay"
      ],
      [
       "Redwood Loop",
       "Marin"
      ],
      [
       "Ocean View",
       "Marin"
      ],
      [
       "Tomales Point",
       "Marin"
      ],
      [
       "Chimney Rock",
       "Marin"
      ],
      [
       "Sunset Falls",
       "South Bay"
      ]
     ]
    }
   ]
  },
  {
   "code": "star",
   "hl": [
    1
   ],
   "say": "Selecting star from a join shows what the joined rows look like: all the columns of the first table, then all the columns of the second. There are two park columns, and they always agree, because that is the condition. You need them to line the rows up, and after that you usually select only the columns you care about.",
   "ask": {
    "type": "type",
    "q": "trails has 4 columns and parks has 3. How many columns does each joined row have?",
    "answer": "7",
    "why": "A joined row is a whole row of trails followed by a whole row of parks: 4 + 3 = 7 columns."
   },
   "tables": [
    {
     "name": "Result",
     "cols": [
      "name",
      "park",
      "miles",
      "climb",
      "park",
      "region",
      "fee"
     ],
     "rows": [
      [
       "Seaview",
       "Tilden",
       4,
       700,
       "Tilden",
       "East Bay",
       0
      ],
      [
       "Wildcat Peak",
       "Tilden",
       3,
       500,
       "Tilden",
       "East Bay",
       0
      ],
      [
       "Jewel Lake",
       "Tilden",
       1,
       50,
       "Tilden",
       "East Bay",
       0
      ]
     ]
    }
   ]
  },
  {
   "code": "comma",
   "hl": [
    2,
    3
   ],
   "say": "There is a second way to write the same join, which you will see often: a comma between the tables, and the matching condition in WHERE. It means exactly the same thing. Writing JOIN and ON makes it clearer which conditions are there to match rows up.",
   "tables": [
    {
     "name": "Result",
     "cols": [
      "name",
      "region"
     ],
     "rows": [
      [
       "Seaview",
       "East Bay"
      ],
      [
       "Wildcat Peak",
       "East Bay"
      ],
      [
       "Jewel Lake",
       "East Bay"
      ],
      [
       "Redwood Loop",
       "Marin"
      ],
      [
       "Ocean View",
       "Marin"
      ],
      [
       "Tomales Point",
       "Marin"
      ],
      [
       "Chimney Rock",
       "Marin"
      ],
      [
       "Sunset Falls",
       "South Bay"
      ]
     ]
    }
   ]
  },
  {
   "code": "cross",
   "hl": [
    2
   ],
   "say": "What if you leave the condition out? Then you get every pair of a row from one table and a row from the other. This is called a cross join. The result here pairs Seaview with every region, including regions it is not in. Most of those rows are nonsense, which is why a join nearly always has a condition.",
   "ask": {
    "type": "type",
    "q": "trails has 8 rows and parks has 4. Without the LIMIT, how many rows would this cross join have?",
    "answer": "32",
    "why": "Every one of the 8 trails is paired with every one of the 4 parks: 8 times 4 is 32."
   },
   "tables": [
    {
     "name": "Result",
     "cols": [
      "name",
      "region"
     ],
     "rows": [
      [
       "Seaview",
       "East Bay"
      ],
      [
       "Seaview",
       "Marin"
      ],
      [
       "Seaview",
       "Marin"
      ],
      [
       "Seaview",
       "South Bay"
      ],
      [
       "Wildcat Peak",
       "East Bay"
      ],
      [
       "Wildcat Peak",
       "Marin"
      ]
     ]
    }
   ]
  },
  {
   "code": "filter",
   "hl": [
    3,
    4,
    5
   ],
   "say": "Once tables are joined, the other clauses work on the joined rows. This asks for trails of at least 3 miles in parks with no fee. The fee comes from parks and the miles from trails, and a single WHERE can use both because each joined row has both.",
   "tables": [
    {
     "name": "Result",
     "cols": [
      "name",
      "miles"
     ],
     "rows": [
      [
       "Tomales Point",
       9
      ],
      [
       "Seaview",
       4
      ],
      [
       "Wildcat Peak",
       3
      ]
     ]
    }
   ]
  },
  {
   "code": "three",
   "hl": [
    2,
    3,
    4
   ],
   "say": "You can join more than two tables. A third table, hikes, records who hiked which trail. To show each of Ana's hikes with the region it was in, a row needs the hiker from hikes and the region from parks. Those two tables have nothing in common. trails connects them: a hike names a trail, and a trail names a park. So there are two matching conditions, one for each link.",
   "tables": [
    {
     "name": "hikes",
     "cols": [
      "hiker",
      "trail",
      "minutes"
     ],
     "rows": [
      [
       "Ana",
       "Seaview",
       120
      ],
      [
       "Ana",
       "Jewel Lake",
       25
      ],
      [
       "Ana",
       "Tomales Point",
       300
      ],
      [
       "Ben",
       "Seaview",
       100
      ],
      [
       "Ben",
       "Redwood Loop",
       50
      ],
      [
       "Ben",
       "Sunset Falls",
       330
      ],
      [
       "Cy",
       "Ocean View",
       170
      ],
      [
       "Cy",
       "Seaview",
       110
      ],
      [
       "Cy",
       "Chimney Rock",
       45
      ]
     ]
    },
    {
     "name": "Result",
     "cols": [
      "hiker",
      "name",
      "region"
     ],
     "rows": [
      [
       "Ana",
       "Seaview",
       "East Bay"
      ],
      [
       "Ana",
       "Jewel Lake",
       "East Bay"
      ],
      [
       "Ana",
       "Tomales Point",
       "Marin"
      ]
     ]
    }
   ]
  },
  {
   "code": "missing",
   "hl": [
    3
   ],
   "say": "Here is the same query with the second condition forgotten. The hike and the trail still match, but nothing ties the trail to its park, so every hike is paired with all four parks.",
   "ask": {
    "type": "mc",
    "q": "Ana has 3 hikes. Why does this result have 12 rows?",
    "choices": [
     "Each of her 3 hikes is paired with every one of the 4 parks",
     "Ana hiked 12 times",
     "The WHERE clause is ignored in a join"
    ],
    "answer": 0,
    "why": "With no condition linking trails to parks, that part is a cross join: 3 matched hike rows times 4 parks. A good habit: with three tables you need at least two matching conditions."
   },
   "tables": [
    {
     "name": "Result",
     "cols": [
      "hiker",
      "name",
      "region"
     ],
     "rows": [
      [
       "Ana",
       "Jewel Lake",
       "East Bay"
      ],
      [
       "Ana",
       "Seaview",
       "East Bay"
      ],
      [
       "Ana",
       "Tomales Point",
       "East Bay"
      ],
      [
       "Ana",
       "Jewel Lake",
       "Marin"
      ],
      [
       "Ana",
       "Seaview",
       "Marin"
      ],
      [
       "Ana",
       "Tomales Point",
       "Marin"
      ],
      [
       "Ana",
       "Jewel Lake",
       "Marin"
      ],
      [
       "Ana",
       "Seaview",
       "Marin"
      ],
      [
       "Ana",
       "Tomales Point",
       "Marin"
      ],
      [
       "Ana",
       "Jewel Lake",
       "South Bay"
      ],
      [
       "Ana",
       "Seaview",
       "South Bay"
      ],
      [
       "Ana",
       "Tomales Point",
       "South Bay"
      ]
     ]
    }
   ]
  },
  {
   "code": "self",
   "hl": [
    2,
    3
   ],
   "say": "Sometimes one row of the result needs two rows from the same table. Which pairs of trails are in the same park? For that, join the table with itself. The table then appears twice, so each copy needs its own name, called an alias, written with AS. Here a is one trail and b is another, and the condition says they are in the same park.",
   "tables": [
    {
     "name": "Result",
     "cols": [
      "first",
      "second",
      "park"
     ],
     "rows": [
      [
       "Seaview",
       "Wildcat Peak",
       "Tilden"
      ],
      [
       "Jewel Lake",
       "Seaview",
       "Tilden"
      ],
      [
       "Jewel Lake",
       "Wildcat Peak",
       "Tilden"
      ],
      [
       "Ocean View",
       "Redwood Loop",
       "Muir Woods"
      ],
      [
       "Chimney Rock",
       "Tomales Point",
       "Point Reyes"
      ]
     ]
    }
   ]
  },
  {
   "code": "self",
   "hl": [
    4
   ],
   "say": "The last line matters. Without it, every trail would be paired with itself, and every real pair would appear twice, once in each order. Requiring a.name to come before b.name alphabetically removes both problems.",
   "ask": {
    "type": "mc",
    "q": "Tilden has 3 trails. How many rows for Tilden does this query produce?",
    "choices": [
     "3",
     "6",
     "9"
    ],
    "answer": 0,
    "why": "Three trails make three different pairs. Without the last line there would be 9 Tilden rows: each trail with itself, and each pair in both orders."
   },
   "tables": [
    {
     "name": "Result",
     "cols": [
      "first",
      "second",
      "park"
     ],
     "rows": [
      [
       "Seaview",
       "Wildcat Peak",
       "Tilden"
      ],
      [
       "Jewel Lake",
       "Seaview",
       "Tilden"
      ],
      [
       "Jewel Lake",
       "Wildcat Peak",
       "Tilden"
      ],
      [
       "Ocean View",
       "Redwood Loop",
       "Muir Woods"
      ],
      [
       "Chimney Rock",
       "Tomales Point",
       "Point Reyes"
      ]
     ]
    }
   ]
  },
  {
   "code": "diff",
   "hl": [
    2,
    3,
    5
   ],
   "say": "With both rows in hand, an expression can use values from each. This lists pairs of trails in the same park with how many more miles the longer one is. The condition a.miles < b.miles both picks the order and drops pairs of equal length.",
   "tables": [
    {
     "name": "Result",
     "cols": [
      "shorter",
      "longer",
      "extra"
     ],
     "rows": [
      [
       "Wildcat Peak",
       "Seaview",
       1
      ],
      [
       "Jewel Lake",
       "Seaview",
       3
      ],
      [
       "Jewel Lake",
       "Wildcat Peak",
       2
      ],
      [
       "Redwood Loop",
       "Ocean View",
       3
      ],
      [
       "Chimney Rock",
       "Tomales Point",
       7
      ]
     ]
    }
   ]
  },
  {
   "code": "num",
   "hl": [
    1,
    3
   ],
   "say": "Expressions in SQL are much like Python's. There is arithmetic, comparison, and built-in functions such as ABS for absolute value and ROUND. Not equal is written with a less-than and greater-than sign together, or as in Python with an exclamation mark and equals. These can appear anywhere an expression can: after SELECT, in WHERE, in ON, in ORDER BY.",
   "tables": [
    {
     "name": "Result",
     "cols": [
      "name",
      "meters"
     ],
     "rows": [
      [
       "Redwood Loop",
       30.0
      ],
      [
       "Ocean View",
       396.0
      ],
      [
       "Chimney Rock",
       61.0
      ]
     ]
    }
   ]
  },
  {
   "code": "str",
   "hl": [
    1
   ],
   "say": "Text values can be joined end to end with two vertical bars. This builds a label for each short trail from its name and its park. SQL has other text functions, but it is not a good language for heavy text processing, so this is the one worth knowing.",
   "ask": {
    "type": "type",
    "q": "What would this expression give for a trail named Seaview in the park Tilden?",
    "answer": "Seaview (Tilden)",
    "why": "The pieces are joined in order: the name, a space and an opening parenthesis, the park, and a closing parenthesis."
   },
   "tables": [
    {
     "name": "Result",
     "cols": [
      "label"
     ],
     "rows": [
      [
       "Jewel Lake (Tilden)"
      ],
      [
       "Redwood Loop (Muir Woods)"
      ],
      [
       "Chimney Rock (Point Reyes)"
      ]
     ]
    }
   ]
  },
  {
   "code": "three",
   "say": "To sum up: a join builds rows out of a row from each table, and ON says which combinations belong together. Think about what one row of the result needs, find the tables that hold those facts, and write a condition for each link between them. A table can be joined with itself, using aliases, when one result row depends on two of its rows."
  }
 ],
 "check": [
  {
   "type": "mc",
   "q": "What does joining two tables produce?",
   "choices": [
    "Rows made of a row from the first table together with a row from the second",
    "The rows of the first table followed by the rows of the second",
    "Only the columns the tables have in common"
   ],
   "answer": 0,
   "why": "Each row of a join is one row from each table, side by side. The ON condition chooses which combinations to keep."
  },
  {
   "type": "type",
   "code": "SELECT name FROM trails JOIN parks ON trails.park = parks.park WHERE region = 'Marin';",
   "q": "Using the lesson's tables, how many rows does this return?",
   "answer": "4",
   "why": "Muir Woods and Point Reyes are both in Marin, and each has two trails."
  },
  {
   "type": "mc",
   "code": "SELECT name, region FROM trails, parks WHERE trails.park = parks.park;",
   "q": "How does this differ from writing JOIN and ON?",
   "choices": [
    "It gives the same result. A comma is a join, and the condition is in WHERE",
    "It is a cross join with 32 rows",
    "It is an error"
   ],
   "answer": 0,
   "why": "The comma joins the tables and the WHERE keeps the matching pairs. Both forms are common."
  },
  {
   "type": "mc",
   "q": "Why are aliases needed when a table is joined with itself?",
   "choices": [
    "To make the query run faster",
    "The table appears twice, so each copy needs its own name to refer to its columns",
    "Aliases are required in every join"
   ],
   "answer": 1,
   "why": "With trails AS a JOIN trails AS b, a.name and b.name are the names from two different rows. Without aliases there would be no way to say which copy you mean."
  },
  {
   "type": "type",
   "code": "SELECT a.hiker, b.hiker FROM hikes AS a JOIN hikes AS b ON a.trail = b.trail WHERE a.hiker < b.hiker;",
   "q": "Using the lesson's hikes table, how many rows does this return?",
   "answer": "3",
   "why": "Only Seaview was hiked by more than one person: Ana, Ben and Cy. Three hikers make three pairs."
  },
  {
   "type": "type",
   "code": "SELECT 'Trail: ' || name FROM trails WHERE miles = 10;",
   "q": "What is the single value in the result?",
   "answer": "Trail: Sunset Falls",
   "why": "The only 10 mile trail is Sunset Falls, and the two vertical bars join the text in front of its name."
  }
 ],
 "deepen": [
  {
   "id": "tb_region",
   "title": "Where did everyone hike?",
   "desc": "Write a query with two columns, hiker and region, with one row for every hike in the hikes table, giving who hiked and which region the trail is in. A hike names a trail, and a trail names a park, so you will need all three tables.",
   "starter": "SELECT hiker, region\n  FROM ______\n  ON ______;\n",
   "solution": "SELECT hiker, region\n  FROM hikes JOIN trails JOIN parks\n  ON hikes.trail = trails.name\n  AND trails.park = parks.park;",
   "hints": [
    "Join the three tables: hikes JOIN trails JOIN parks.",
    "You need two conditions joined with AND, one for each link.",
    "The hike's trail equals the trail's name, and the trail's park equals the park's park."
   ],
   "explain": "The result only shows columns from hikes and parks, but trails has to be in the join because it is what connects them. Leaving out either condition would multiply the rows.",
   "source": "Original question",
   "lang": "SQL",
   "sql": {
    "setup": "CREATE TABLE parks(park, region, fee);\nINSERT INTO parks VALUES\n  ('Tilden', 'East Bay', 0),\n  ('Muir Woods', 'Marin', 15),\n  ('Point Reyes', 'Marin', 0),\n  ('Big Basin', 'South Bay', 10);\n\nCREATE TABLE trails(name, park, miles, climb);\nINSERT INTO trails VALUES\n  ('Seaview', 'Tilden', 4, 700),\n  ('Wildcat Peak', 'Tilden', 3, 500),\n  ('Jewel Lake', 'Tilden', 1, 50),\n  ('Redwood Loop', 'Muir Woods', 2, 100),\n  ('Ocean View', 'Muir Woods', 5, 1300),\n  ('Tomales Point', 'Point Reyes', 9, 1200),\n  ('Chimney Rock', 'Point Reyes', 2, 200),\n  ('Sunset Falls', 'Big Basin', 10, 2100);\n\nCREATE TABLE hikes(hiker, trail, minutes);\nINSERT INTO hikes VALUES\n  ('Ana', 'Seaview', 120),\n  ('Ana', 'Jewel Lake', 25),\n  ('Ana', 'Tomales Point', 300),\n  ('Ben', 'Seaview', 100),\n  ('Ben', 'Redwood Loop', 50),\n  ('Ben', 'Sunset Falls', 330),\n  ('Cy', 'Ocean View', 170),\n  ('Cy', 'Seaview', 110),\n  ('Cy', 'Chimney Rock', 45);\n",
    "hidden": [
     "CREATE TABLE parks(park, region, fee);\nINSERT INTO parks VALUES\n  ('Tilden', 'East Bay', 5),\n  ('Sibley', 'East Bay', 0),\n  ('Mount Tam', 'Marin', 8),\n  ('Castle Rock', 'South Bay', 0),\n  ('Butano', 'Coast', 12);\n\nCREATE TABLE trails(name, park, miles, climb);\nINSERT INTO trails VALUES\n  ('Nimitz Way', 'Tilden', 8, 900),\n  ('Lake Loop', 'Tilden', 2, 40),\n  ('Round Top', 'Sibley', 3, 450),\n  ('Steep Ravine', 'Mount Tam', 6, 1500),\n  ('Verna Dunshee', 'Mount Tam', 1, 60),\n  ('East Peak', 'Mount Tam', 4, 1100),\n  ('Goat Rock', 'Castle Rock', 5, 1000),\n  ('Saratoga Gap', 'Castle Rock', 7, 1250),\n  ('Ano Nuevo', 'Butano', 11, 1900),\n  ('Creek Walk', 'Butano', 2, 150);\n\nCREATE TABLE hikes(hiker, trail, minutes);\nINSERT INTO hikes VALUES\n  ('Dee', 'Nimitz Way', 200),\n  ('Dee', 'Round Top', 80),\n  ('Eli', 'Nimitz Way', 190),\n  ('Eli', 'Steep Ravine', 210),\n  ('Eli', 'East Peak', 140),\n  ('Fay', 'Ano Nuevo', 400),\n  ('Fay', 'Lake Loop', 45),\n  ('Gus', 'Steep Ravine', 230),\n  ('Gus', 'Goat Rock', 160),\n  ('Dee', 'Goat Rock', 150),\n  ('Fay', 'Nimitz Way', 215);\n"
    ],
    "ordered": false,
    "tables": [
     {
      "name": "trails",
      "cols": [
       "name",
       "park",
       "miles",
       "climb"
      ],
      "rows": [
       [
        "Seaview",
        "Tilden",
        4,
        700
       ],
       [
        "Wildcat Peak",
        "Tilden",
        3,
        500
       ],
       [
        "Jewel Lake",
        "Tilden",
        1,
        50
       ],
       [
        "Redwood Loop",
        "Muir Woods",
        2,
        100
       ],
       [
        "Ocean View",
        "Muir Woods",
        5,
        1300
       ],
       [
        "Tomales Point",
        "Point Reyes",
        9,
        1200
       ],
       [
        "Chimney Rock",
        "Point Reyes",
        2,
        200
       ],
       [
        "Sunset Falls",
        "Big Basin",
        10,
        2100
       ]
      ]
     },
     {
      "name": "parks",
      "cols": [
       "park",
       "region",
       "fee"
      ],
      "rows": [
       [
        "Tilden",
        "East Bay",
        0
       ],
       [
        "Muir Woods",
        "Marin",
        15
       ],
       [
        "Point Reyes",
        "Marin",
        0
       ],
       [
        "Big Basin",
        "South Bay",
        10
       ]
      ]
     },
     {
      "name": "hikes",
      "cols": [
       "hiker",
       "trail",
       "minutes"
      ],
      "rows": [
       [
        "Ana",
        "Seaview",
        120
       ],
       [
        "Ana",
        "Jewel Lake",
        25
       ],
       [
        "Ana",
        "Tomales Point",
        300
       ],
       [
        "Ben",
        "Seaview",
        100
       ],
       [
        "Ben",
        "Redwood Loop",
        50
       ],
       [
        "Ben",
        "Sunset Falls",
        330
       ],
       [
        "Cy",
        "Ocean View",
        170
       ],
       [
        "Cy",
        "Seaview",
        110
       ],
       [
        "Cy",
        "Chimney Rock",
        45
       ]
      ]
     }
    ]
   }
  },
  {
   "id": "tb_together",
   "title": "Hikers with a trail in common",
   "desc": "Write a query with three columns, first, second and trail. Each row names two different hikers who have both hiked the same trail, and that trail. List each pair once, with the name that comes first alphabetically in the first column.",
   "starter": "SELECT ______\n  FROM hikes AS a JOIN hikes AS b\n  ON ______\n  WHERE ______;\n",
   "solution": "SELECT a.hiker AS first, b.hiker AS second, a.trail AS trail\n  FROM hikes AS a JOIN hikes AS b\n  ON a.trail = b.trail\n  WHERE a.hiker < b.hiker;",
   "hints": [
    "Each result row needs two rows of hikes, one per hiker. That is why the table is joined with itself.",
    "The two rows must be about the same trail: a.trail = b.trail.",
    "a.hiker < b.hiker makes the hikers different and lists each pair only once."
   ],
   "explain": "A self join with aliases. The comparison on the hiker names does two jobs: it stops a hiker being paired with themselves, and it keeps only one of the two orders of each pair.",
   "source": "Original question",
   "lang": "SQL",
   "sql": {
    "setup": "CREATE TABLE parks(park, region, fee);\nINSERT INTO parks VALUES\n  ('Tilden', 'East Bay', 0),\n  ('Muir Woods', 'Marin', 15),\n  ('Point Reyes', 'Marin', 0),\n  ('Big Basin', 'South Bay', 10);\n\nCREATE TABLE trails(name, park, miles, climb);\nINSERT INTO trails VALUES\n  ('Seaview', 'Tilden', 4, 700),\n  ('Wildcat Peak', 'Tilden', 3, 500),\n  ('Jewel Lake', 'Tilden', 1, 50),\n  ('Redwood Loop', 'Muir Woods', 2, 100),\n  ('Ocean View', 'Muir Woods', 5, 1300),\n  ('Tomales Point', 'Point Reyes', 9, 1200),\n  ('Chimney Rock', 'Point Reyes', 2, 200),\n  ('Sunset Falls', 'Big Basin', 10, 2100);\n\nCREATE TABLE hikes(hiker, trail, minutes);\nINSERT INTO hikes VALUES\n  ('Ana', 'Seaview', 120),\n  ('Ana', 'Jewel Lake', 25),\n  ('Ana', 'Tomales Point', 300),\n  ('Ben', 'Seaview', 100),\n  ('Ben', 'Redwood Loop', 50),\n  ('Ben', 'Sunset Falls', 330),\n  ('Cy', 'Ocean View', 170),\n  ('Cy', 'Seaview', 110),\n  ('Cy', 'Chimney Rock', 45);\n",
    "hidden": [
     "CREATE TABLE parks(park, region, fee);\nINSERT INTO parks VALUES\n  ('Tilden', 'East Bay', 5),\n  ('Sibley', 'East Bay', 0),\n  ('Mount Tam', 'Marin', 8),\n  ('Castle Rock', 'South Bay', 0),\n  ('Butano', 'Coast', 12);\n\nCREATE TABLE trails(name, park, miles, climb);\nINSERT INTO trails VALUES\n  ('Nimitz Way', 'Tilden', 8, 900),\n  ('Lake Loop', 'Tilden', 2, 40),\n  ('Round Top', 'Sibley', 3, 450),\n  ('Steep Ravine', 'Mount Tam', 6, 1500),\n  ('Verna Dunshee', 'Mount Tam', 1, 60),\n  ('East Peak', 'Mount Tam', 4, 1100),\n  ('Goat Rock', 'Castle Rock', 5, 1000),\n  ('Saratoga Gap', 'Castle Rock', 7, 1250),\n  ('Ano Nuevo', 'Butano', 11, 1900),\n  ('Creek Walk', 'Butano', 2, 150);\n\nCREATE TABLE hikes(hiker, trail, minutes);\nINSERT INTO hikes VALUES\n  ('Dee', 'Nimitz Way', 200),\n  ('Dee', 'Round Top', 80),\n  ('Eli', 'Nimitz Way', 190),\n  ('Eli', 'Steep Ravine', 210),\n  ('Eli', 'East Peak', 140),\n  ('Fay', 'Ano Nuevo', 400),\n  ('Fay', 'Lake Loop', 45),\n  ('Gus', 'Steep Ravine', 230),\n  ('Gus', 'Goat Rock', 160),\n  ('Dee', 'Goat Rock', 150),\n  ('Fay', 'Nimitz Way', 215);\n"
    ],
    "ordered": false,
    "tables": [
     {
      "name": "trails",
      "cols": [
       "name",
       "park",
       "miles",
       "climb"
      ],
      "rows": [
       [
        "Seaview",
        "Tilden",
        4,
        700
       ],
       [
        "Wildcat Peak",
        "Tilden",
        3,
        500
       ],
       [
        "Jewel Lake",
        "Tilden",
        1,
        50
       ],
       [
        "Redwood Loop",
        "Muir Woods",
        2,
        100
       ],
       [
        "Ocean View",
        "Muir Woods",
        5,
        1300
       ],
       [
        "Tomales Point",
        "Point Reyes",
        9,
        1200
       ],
       [
        "Chimney Rock",
        "Point Reyes",
        2,
        200
       ],
       [
        "Sunset Falls",
        "Big Basin",
        10,
        2100
       ]
      ]
     },
     {
      "name": "parks",
      "cols": [
       "park",
       "region",
       "fee"
      ],
      "rows": [
       [
        "Tilden",
        "East Bay",
        0
       ],
       [
        "Muir Woods",
        "Marin",
        15
       ],
       [
        "Point Reyes",
        "Marin",
        0
       ],
       [
        "Big Basin",
        "South Bay",
        10
       ]
      ]
     },
     {
      "name": "hikes",
      "cols": [
       "hiker",
       "trail",
       "minutes"
      ],
      "rows": [
       [
        "Ana",
        "Seaview",
        120
       ],
       [
        "Ana",
        "Jewel Lake",
        25
       ],
       [
        "Ana",
        "Tomales Point",
        300
       ],
       [
        "Ben",
        "Seaview",
        100
       ],
       [
        "Ben",
        "Redwood Loop",
        50
       ],
       [
        "Ben",
        "Sunset Falls",
        330
       ],
       [
        "Cy",
        "Ocean View",
        170
       ],
       [
        "Cy",
        "Seaview",
        110
       ],
       [
        "Cy",
        "Chimney Rock",
        45
       ]
      ]
     }
    ]
   }
  },
  {
   "id": "tb_paid",
   "title": "Trails that cost money",
   "desc": "Write a query with two columns, label and fee, for every trail in a park that charges a fee. The label is the trail's name, then the text ' at ', then the park. For example: Ocean View at Muir Woods. Order the rows from the highest fee to the lowest, and by label alphabetically when fees are equal.",
   "starter": "SELECT ______ AS label, fee\n  FROM trails JOIN parks\n  ON ______\n  WHERE ______\n  ORDER BY ______;\n",
   "solution": "SELECT name || ' at ' || trails.park AS label, fee\n  FROM trails JOIN parks\n  ON trails.park = parks.park\n  WHERE fee > 0\n  ORDER BY fee DESC, label;",
   "hints": [
    "Join text with two vertical bars: name || ' at ' || trails.park.",
    "Both tables have a park column, so say which one: trails.park or parks.park.",
    "ORDER BY can take two expressions separated by a comma. The second breaks ties in the first."
   ],
   "explain": "The join brings the fee next to each trail, WHERE keeps the paid ones, and the label is built from text in the joined row. Writing just park would be an error, because the name is ambiguous between the two tables.",
   "source": "Original question",
   "lang": "SQL",
   "sql": {
    "setup": "CREATE TABLE parks(park, region, fee);\nINSERT INTO parks VALUES\n  ('Tilden', 'East Bay', 0),\n  ('Muir Woods', 'Marin', 15),\n  ('Point Reyes', 'Marin', 0),\n  ('Big Basin', 'South Bay', 10);\n\nCREATE TABLE trails(name, park, miles, climb);\nINSERT INTO trails VALUES\n  ('Seaview', 'Tilden', 4, 700),\n  ('Wildcat Peak', 'Tilden', 3, 500),\n  ('Jewel Lake', 'Tilden', 1, 50),\n  ('Redwood Loop', 'Muir Woods', 2, 100),\n  ('Ocean View', 'Muir Woods', 5, 1300),\n  ('Tomales Point', 'Point Reyes', 9, 1200),\n  ('Chimney Rock', 'Point Reyes', 2, 200),\n  ('Sunset Falls', 'Big Basin', 10, 2100);\n\nCREATE TABLE hikes(hiker, trail, minutes);\nINSERT INTO hikes VALUES\n  ('Ana', 'Seaview', 120),\n  ('Ana', 'Jewel Lake', 25),\n  ('Ana', 'Tomales Point', 300),\n  ('Ben', 'Seaview', 100),\n  ('Ben', 'Redwood Loop', 50),\n  ('Ben', 'Sunset Falls', 330),\n  ('Cy', 'Ocean View', 170),\n  ('Cy', 'Seaview', 110),\n  ('Cy', 'Chimney Rock', 45);\n",
    "hidden": [
     "CREATE TABLE parks(park, region, fee);\nINSERT INTO parks VALUES\n  ('Tilden', 'East Bay', 5),\n  ('Sibley', 'East Bay', 0),\n  ('Mount Tam', 'Marin', 8),\n  ('Castle Rock', 'South Bay', 0),\n  ('Butano', 'Coast', 12);\n\nCREATE TABLE trails(name, park, miles, climb);\nINSERT INTO trails VALUES\n  ('Nimitz Way', 'Tilden', 8, 900),\n  ('Lake Loop', 'Tilden', 2, 40),\n  ('Round Top', 'Sibley', 3, 450),\n  ('Steep Ravine', 'Mount Tam', 6, 1500),\n  ('Verna Dunshee', 'Mount Tam', 1, 60),\n  ('East Peak', 'Mount Tam', 4, 1100),\n  ('Goat Rock', 'Castle Rock', 5, 1000),\n  ('Saratoga Gap', 'Castle Rock', 7, 1250),\n  ('Ano Nuevo', 'Butano', 11, 1900),\n  ('Creek Walk', 'Butano', 2, 150);\n\nCREATE TABLE hikes(hiker, trail, minutes);\nINSERT INTO hikes VALUES\n  ('Dee', 'Nimitz Way', 200),\n  ('Dee', 'Round Top', 80),\n  ('Eli', 'Nimitz Way', 190),\n  ('Eli', 'Steep Ravine', 210),\n  ('Eli', 'East Peak', 140),\n  ('Fay', 'Ano Nuevo', 400),\n  ('Fay', 'Lake Loop', 45),\n  ('Gus', 'Steep Ravine', 230),\n  ('Gus', 'Goat Rock', 160),\n  ('Dee', 'Goat Rock', 150),\n  ('Fay', 'Nimitz Way', 215);\n"
    ],
    "ordered": true,
    "tables": [
     {
      "name": "trails",
      "cols": [
       "name",
       "park",
       "miles",
       "climb"
      ],
      "rows": [
       [
        "Seaview",
        "Tilden",
        4,
        700
       ],
       [
        "Wildcat Peak",
        "Tilden",
        3,
        500
       ],
       [
        "Jewel Lake",
        "Tilden",
        1,
        50
       ],
       [
        "Redwood Loop",
        "Muir Woods",
        2,
        100
       ],
       [
        "Ocean View",
        "Muir Woods",
        5,
        1300
       ],
       [
        "Tomales Point",
        "Point Reyes",
        9,
        1200
       ],
       [
        "Chimney Rock",
        "Point Reyes",
        2,
        200
       ],
       [
        "Sunset Falls",
        "Big Basin",
        10,
        2100
       ]
      ]
     },
     {
      "name": "parks",
      "cols": [
       "park",
       "region",
       "fee"
      ],
      "rows": [
       [
        "Tilden",
        "East Bay",
        0
       ],
       [
        "Muir Woods",
        "Marin",
        15
       ],
       [
        "Point Reyes",
        "Marin",
        0
       ],
       [
        "Big Basin",
        "South Bay",
        10
       ]
      ]
     },
     {
      "name": "hikes",
      "cols": [
       "hiker",
       "trail",
       "minutes"
      ],
      "rows": [
       [
        "Ana",
        "Seaview",
        120
       ],
       [
        "Ana",
        "Jewel Lake",
        25
       ],
       [
        "Ana",
        "Tomales Point",
        300
       ],
       [
        "Ben",
        "Seaview",
        100
       ],
       [
        "Ben",
        "Redwood Loop",
        50
       ],
       [
        "Ben",
        "Sunset Falls",
        330
       ],
       [
        "Cy",
        "Ocean View",
        170
       ],
       [
        "Cy",
        "Seaview",
        110
       ],
       [
        "Cy",
        "Chimney Rock",
        45
       ]
      ]
     }
    ]
   }
  }
 ]
};
