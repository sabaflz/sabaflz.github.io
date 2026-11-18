/*
  lessons/aggregation.js: Lecture 36, Aggregation.
  Follows the lecture videos: aggregate functions over all rows, aggregating
  expressions, not mixing aggregated and plain columns, a weighted average,
  GROUP BY, HAVING, where versus having, and a query that joins, groups and
  orders at once.
  The data (Bay Area trails) is an original example. Every result table in
  this file was produced by running the query in SQLite, not typed by hand.
  Deepen problems run in the browser (sql/worker.js).
*/
window.LESSONS["aggregation"] = {
 "minutes": 18,
 "snippets": {
  "max": "SELECT MAX(miles) FROM trails;",
  "many": "SELECT COUNT(*) AS trails, SUM(miles) AS total,\n       MIN(climb) AS least, AVG(miles) AS average\n  FROM trails;",
  "expr": "SELECT MAX(climb / miles) AS steepest FROM trails;",
  "mixed": "SELECT name, MAX(miles) FROM trails;",
  "pace": "SELECT SUM(minutes) / SUM(miles) AS overall\n  FROM hikes JOIN trails\n  ON hikes.trail = trails.name;",
  "group": "SELECT park, COUNT(*) AS trails, MAX(miles) AS longest\n  FROM trails\n  GROUP BY park;",
  "gexpr": "SELECT miles >= 5 AS long, COUNT(*) AS trails\n  FROM trails\n  GROUP BY miles >= 5;",
  "having": "SELECT park, COUNT(*) AS trails\n  FROM trails\n  GROUP BY park\n  HAVING COUNT(*) > 1;",
  "both": "SELECT park, SUM(miles) AS short_miles\n  FROM trails\n  WHERE miles < 5\n  GROUP BY park\n  HAVING SUM(miles) >= 4;",
  "all": "SELECT hiker, SUM(miles) AS total\n  FROM hikes JOIN trails\n  ON hikes.trail = trails.name\n  GROUP BY hiker\n  ORDER BY total DESC\n  LIMIT 2;",
  "shape": "SELECT [columns]\n  FROM [tables] ON [how rows match]\n  WHERE [which rows to keep]\n  GROUP BY [what makes a group]\n  HAVING [which groups to keep]\n  ORDER BY [expression]\n  LIMIT [number];"
 },
 "steps": [
  {
   "code": "max",
   "say": "So far, every expression has looked at one row at a time: a query went through the rows and produced one result row for each. Many questions are about several rows at once. What is the longest trail? How many trails are there? Answering them is called aggregation: combining values from many rows into one.",
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
    }
   ]
  },
  {
   "code": "max",
   "hl": [
    1
   ],
   "say": "An aggregate function takes a whole column's worth of values and gives back one value. MAX gives the largest. The important change is in the shape of the result: the table had eight rows, and the result has one.",
   "ask": {
    "type": "type",
    "q": "How many rows would SELECT MIN(climb) FROM trails return?",
    "answer": "1",
    "why": "An aggregate over the whole table always gives exactly one row, whatever the number of rows in the table. Here that row would hold 50."
   },
   "tables": [
    {
     "name": "Result",
     "cols": [
      "MAX(miles)"
     ],
     "rows": [
      [
       10
      ]
     ]
    }
   ]
  },
  {
   "code": "many",
   "hl": [
    1,
    2
   ],
   "say": "The other aggregate functions are MIN, SUM, AVG for the average, and COUNT. COUNT with a star counts rows. A query can use several at once, and each is computed separately over all the rows. The least climb comes from one row and the total miles from all of them.",
   "tables": [
    {
     "name": "Result",
     "cols": [
      "trails",
      "total",
      "least",
      "average"
     ],
     "rows": [
      [
       8,
       36,
       50,
       4.5
      ]
     ]
    }
   ]
  },
  {
   "code": "expr",
   "hl": [
    1
   ],
   "say": "The thing being aggregated can be any expression. This one computes climb divided by miles for each row, one row at a time as always, and then takes the largest of those eight results. It does not mix values from different rows: it is the steepest single trail, not the biggest climb divided by the shortest distance.",
   "tables": [
    {
     "name": "Result",
     "cols": [
      "steepest"
     ],
     "rows": [
      [
       260
      ]
     ]
    }
   ]
  },
  {
   "code": "mixed",
   "hl": [
    1
   ],
   "say": "One thing to avoid: a plain column next to an aggregate. MAX(miles) asks for one value. name asks for a value from each row. Which name should go in the single result row? The question does not make sense. SQLite happens to give an answer, but most databases reject this query, and you should not write it. Either aggregate every column or none.",
   "ask": {
    "type": "mc",
    "q": "Which of these is a sensible query?",
    "choices": [
     "SELECT name, COUNT(*) FROM trails;",
     "SELECT MIN(miles), MAX(miles) FROM trails;",
     "SELECT park, SUM(miles) FROM trails;"
    ],
    "answer": 1,
    "why": "Both columns are aggregates, so the single result row is well defined. The other two put a plain column beside an aggregate with nothing saying which row's value to use."
   }
  },
  {
   "code": "pace",
   "hl": [
    1
   ],
   "say": "Aggregates work on joined rows too. How many minutes per mile do these hikers take overall? Join each hike to its trail to get the miles, then divide total minutes by total miles. Be careful with averages of averages: taking each hike's own minutes per mile and averaging those would count a 1 mile stroll as much as a 10 mile trek, and give a different number.",
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
      "overall"
     ],
     "rows": [
      [
       30
      ]
     ]
    }
   ]
  },
  {
   "code": "group",
   "hl": [
    3
   ],
   "say": "Aggregation becomes much more useful with groups. GROUP BY splits the rows into groups that share a value, and the aggregates are then computed once for each group. Here the rows are grouped by park, so the result has one row per park, with the count and the longest trail for that park.",
   "ask": {
    "type": "type",
    "q": "The result has one row per group. How many rows is that here?",
    "answer": "4",
    "why": "The number of groups is the number of different values of the GROUP BY expression. The trails table mentions four different parks."
   },
   "tables": [
    {
     "name": "Result",
     "cols": [
      "park",
      "trails",
      "longest"
     ],
     "rows": [
      [
       "Big Basin",
       1,
       10
      ],
      [
       "Muir Woods",
       2,
       5
      ],
      [
       "Point Reyes",
       2,
       9
      ],
      [
       "Tilden",
       3,
       4
      ]
     ]
    }
   ]
  },
  {
   "code": "group",
   "hl": [
    1
   ],
   "say": "Notice that park appears after SELECT without being aggregated. That is fine here, and it is the one exception to the earlier rule: every row in a group has the same park, because that is how the groups were formed, so there is no doubt which value to show.",
   "tables": [
    {
     "name": "Result",
     "cols": [
      "park",
      "trails",
      "longest"
     ],
     "rows": [
      [
       "Big Basin",
       1,
       10
      ],
      [
       "Muir Woods",
       2,
       5
      ],
      [
       "Point Reyes",
       2,
       9
      ],
      [
       "Tilden",
       3,
       4
      ]
     ]
    }
   ]
  },
  {
   "code": "gexpr",
   "hl": [
    1,
    3
   ],
   "say": "You can group by any expression, not only a column. This groups by whether a trail is at least 5 miles. A comparison in SQL gives 1 for true and 0 for false, so there are two groups.",
   "tables": [
    {
     "name": "Result",
     "cols": [
      "long",
      "trails"
     ],
     "rows": [
      [
       0,
       5
      ],
      [
       1,
       3
      ]
     ]
    }
   ]
  },
  {
   "code": "having",
   "hl": [
    4
   ],
   "say": "Sometimes you do not want every group. HAVING keeps only the groups that pass a condition, and its condition can use aggregates, because it is asking about a whole group. This keeps the parks with more than one trail. Big Basin has a single trail, so its group is dropped.",
   "tables": [
    {
     "name": "Result",
     "cols": [
      "park",
      "trails"
     ],
     "rows": [
      [
       "Muir Woods",
       2
      ],
      [
       "Point Reyes",
       2
      ],
      [
       "Tilden",
       3
      ]
     ]
    }
   ]
  },
  {
   "code": "both",
   "hl": [
    3,
    5
   ],
   "say": "WHERE and HAVING both filter, but at different moments. WHERE decides whether an individual row is used at all, before any grouping, so it cannot contain an aggregate. HAVING decides whether a finished group appears in the result. Here WHERE first drops the trails of 5 miles or more. The remaining rows are grouped by park, and HAVING keeps the parks whose short trails add up to at least 4 miles.",
   "ask": {
    "type": "mc",
    "q": "You want parks whose average climb is over 1000 feet. Where does that condition go?",
    "choices": [
     "WHERE AVG(climb) > 1000",
     "HAVING AVG(climb) > 1000",
     "ORDER BY AVG(climb) > 1000"
    ],
    "answer": 1,
    "why": "The condition is about a group, and it uses an aggregate. That is what HAVING is for. WHERE looks at one row at a time and cannot aggregate."
   },
   "tables": [
    {
     "name": "Result",
     "cols": [
      "park",
      "short_miles"
     ],
     "rows": [
      [
       "Tilden",
       8
      ]
     ]
    }
   ]
  },
  {
   "code": "all",
   "hl": [
    2,
    3,
    4,
    5,
    6
   ],
   "say": "Everything can be combined. Who has hiked the most miles? Each result row needs a hiker and a total. The miles are in trails, so join each hike to its trail. Group the joined rows by hiker, sum the miles in each group, then order by that total and keep the top two.",
   "ask": {
    "type": "mc",
    "q": "Why is the join needed here?",
    "choices": [
     "The hikes table has no miles column. The miles of each hike are in the trails table",
     "GROUP BY only works on joined tables",
     "To remove duplicate hikers"
    ],
    "answer": 0,
    "why": "hikes records who walked which trail and for how long. How long the trail is lives in trails, so each hike has to be matched with its trail first."
   },
   "tables": [
    {
     "name": "Result",
     "cols": [
      "hiker",
      "total"
     ],
     "rows": [
      [
       "Ben",
       16
      ],
      [
       "Ana",
       14
      ]
     ]
    }
   ]
  },
  {
   "code": "shape",
   "hl": [
    1,
    2,
    3,
    4,
    5,
    6,
    7
   ],
   "say": "To sum up: an aggregate function turns many rows into one value. GROUP BY forms groups, and the result has one row per group. HAVING filters groups, and WHERE filters rows before they are grouped. The clauses are always written in the order shown here, and it helps to read a query in a different order: FROM first to see the rows, then WHERE, then GROUP BY and HAVING, and SELECT last."
  }
 ],
 "check": [
  {
   "type": "type",
   "code": "SELECT COUNT(*) FROM trails WHERE park = 'Tilden';",
   "q": "Using the lesson's trails table, what is the single value in the result?",
   "answer": "3",
   "why": "WHERE keeps the three Tilden rows, and COUNT(*) counts them."
  },
  {
   "type": "type",
   "code": "SELECT MAX(miles) - MIN(miles) FROM trails;",
   "q": "What is the single value in the result?",
   "answer": "9",
   "why": "The longest trail is 10 miles and the shortest is 1. The two aggregates are computed separately, then subtracted."
  },
  {
   "type": "mc",
   "code": "SELECT hiker, COUNT(*) FROM hikes GROUP BY hiker;",
   "q": "What does the result contain?",
   "choices": [
    "One row for every hike",
    "One row per hiker, with how many hikes that hiker has",
    "A single row with the total number of hikes"
   ],
   "answer": 1,
   "why": "GROUP BY hiker makes one group per hiker, and COUNT(*) counts the rows in each group."
  },
  {
   "type": "type",
   "code": "SELECT trail FROM hikes GROUP BY trail HAVING COUNT(*) > 1;",
   "q": "Which trail name is in the result?",
   "answer": "Seaview",
   "why": "Seaview is the only trail that appears in more than one row of hikes. Every other group has a count of 1 and is dropped by HAVING."
  },
  {
   "type": "mc",
   "q": "What is the difference between WHERE and HAVING?",
   "choices": [
    "They are interchangeable",
    "WHERE filters individual rows before grouping, and HAVING filters whole groups after",
    "WHERE is for numbers and HAVING is for text"
   ],
   "answer": 1,
   "why": "A WHERE condition is about one row and cannot aggregate. A HAVING condition is about a group and usually does."
  },
  {
   "type": "mc",
   "code": "SELECT park, MAX(climb) FROM trails GROUP BY park;",
   "q": "Why is it fine to select park here without aggregating it?",
   "choices": [
    "Every row in a group has the same park, because the rows were grouped by it",
    "park is a text column",
    "It is not fine. This query is an error"
   ],
   "answer": 0,
   "why": "The grouping expression has one value per group by construction, so it can appear plainly beside the aggregates."
  }
 ],
 "deepen": [
  {
   "id": "ag_park_miles",
   "title": "Miles of trail in each park",
   "desc": "Write a query with two columns, park and total, giving for each park the total miles of all its trails.",
   "starter": "SELECT park, ______ AS total\n  FROM trails\n  ______;\n",
   "solution": "SELECT park, SUM(miles) AS total\n  FROM trails\n  GROUP BY park;",
   "hints": [
    "One row per park means the rows have to be grouped by park.",
    "Within each group, add up the miles with SUM.",
    "GROUP BY park goes after FROM."
   ],
   "explain": "GROUP BY forms one group per park, and SUM is computed inside each. park can be selected plainly because it is what the groups were formed on.",
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
   "id": "ag_popular",
   "title": "Trails hiked more than once",
   "desc": "Write a query with two columns, trail and times, listing each trail that appears at least twice in the hikes table, with how many times it was hiked.",
   "starter": "SELECT trail, ______ AS times\n  FROM hikes\n  GROUP BY ______\n  HAVING ______;\n",
   "solution": "SELECT trail, COUNT(*) AS times\n  FROM hikes\n  GROUP BY trail\n  HAVING COUNT(*) >= 2;",
   "hints": [
    "Group the hikes by trail, so each group is all the hikes of one trail.",
    "COUNT(*) gives the number of rows in a group.",
    "The condition is about a group, so it goes in HAVING, not WHERE."
   ],
   "explain": "A WHERE could not do this, because no single row knows how many times its trail was hiked. HAVING tests each finished group.",
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
   "id": "ag_climbers",
   "title": "Who has climbed the most?",
   "desc": "Write a query with two columns, hiker and climbed, giving each hiker's total feet of climb over all their hikes, ordered from most to least. The climb of each hike is in the trails table.",
   "starter": "SELECT hiker, ______ AS climbed\n  FROM hikes JOIN trails\n  ON ______\n  GROUP BY ______\n  ORDER BY ______;\n",
   "solution": "SELECT hiker, SUM(climb) AS climbed\n  FROM hikes JOIN trails\n  ON hikes.trail = trails.name\n  GROUP BY hiker\n  ORDER BY climbed DESC;",
   "hints": [
    "Join each hike to its trail: the hike's trail equals the trail's name.",
    "Group the joined rows by hiker and sum the climb column.",
    "ORDER BY can use the name you gave the column: ORDER BY climbed DESC."
   ],
   "explain": "Join first so every hike has its climb, then group by hiker and sum. This is the join, group and order pattern from the end of the lesson.",
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
