/*
  lessons/sql.js: Lecture 34, SQL.
  Follows the lecture videos: databases and tables, declarative programming,
  select with column descriptions, as, from, limit, create table, where,
  order by, and arithmetic in expressions.
  The data (Bay Area trails) is an original example. Every result table in
  this file was produced by running the query in SQLite, not typed by hand.
  Deepen problems run in the browser (sql/worker.js) and are checked against
  the solution's result on this data and on a hidden data set.
*/
window.LESSONS["sql"] = {
 "minutes": 18,
 "snippets": {
  "all": "SELECT * FROM trails;",
  "limit": "SELECT * FROM trails LIMIT 3;",
  "cols": "SELECT miles, name FROM trails;",
  "as": "SELECT name, miles AS distance FROM trails;",
  "where": "SELECT name, miles\n  FROM trails\n  WHERE park = 'Tilden';",
  "order": "SELECT name, miles\n  FROM trails\n  WHERE park = 'Tilden'\n  ORDER BY miles;",
  "desc": "SELECT name, miles, climb\n  FROM trails\n  ORDER BY climb DESC\n  LIMIT 3;",
  "arith": "SELECT name, climb / miles AS feet_per_mile\n  FROM trails\n  WHERE miles >= 4;",
  "literal": "SELECT 'easy' AS level, name\n  FROM trails\n  WHERE miles <= 2 AND climb < 150;",
  "create": "CREATE TABLE long AS\n  SELECT name, park, miles\n  FROM trails\n  WHERE miles >= 5;\n\nSELECT name FROM long ORDER BY name;",
  "shape": "SELECT [columns]\n  FROM [table]\n  WHERE [condition on a row]\n  ORDER BY [expression]\n  LIMIT [number];"
 },
 "steps": [
  {
   "code": "all",
   "say": "Nearly every application stores its data in a database, and nearly every database organizes data the same way: in tables. A table has columns, each with a name, and rows. Each row has one value for every column. Here is a table of hiking trails. It has four columns and eight rows, and each row describes one trail.",
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
   "code": "all",
   "hl": [
    1
   ],
   "say": "The language for working with tables is SQL, the structured query language. It is a different kind of language from Python or Gleam. Those are imperative or functional: you describe how to compute a result. SQL is declarative: you describe the result you want, and the database works out how to produce it. This one line is a complete program. It says: I want all the columns of the trails table. The star means every column.",
   "syntax": "SQL notes: a statement ends with a semicolon. Keywords such as SELECT and FROM can be written in upper or lower case. Upper case is a common habit that makes them stand out.",
   "tables": [
    {
     "name": "Result",
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
   "code": "limit",
   "hl": [
    1
   ],
   "say": "A statement that starts with SELECT is called a query. A query always builds a new table from existing ones. It never changes the table it reads from. LIMIT caps the number of rows in the result, which is useful for a first look at a large table.",
   "ask": {
    "type": "type",
    "q": "How many rows and how many columns does this result have? Answer as rows, columns. For example: 5, 2",
    "answer": "3, 4",
    "why": "LIMIT 3 keeps three rows. The star keeps all four columns of trails."
   },
   "tables": [
    {
     "name": "Result",
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
      ]
     ]
    }
   ]
  },
  {
   "code": "cols",
   "hl": [
    1
   ],
   "say": "In place of the star you can list the columns you want, separated by commas. The result has only those columns, in the order you wrote them. Here miles comes first even though it is the third column of the original table.",
   "tables": [
    {
     "name": "Result",
     "cols": [
      "miles",
      "name"
     ],
     "rows": [
      [
       4,
       "Seaview"
      ],
      [
       3,
       "Wildcat Peak"
      ],
      [
       1,
       "Jewel Lake"
      ],
      [
       2,
       "Redwood Loop"
      ],
      [
       5,
       "Ocean View"
      ],
      [
       9,
       "Tomales Point"
      ],
      [
       2,
       "Chimney Rock"
      ],
      [
       10,
       "Sunset Falls"
      ]
     ]
    }
   ]
  },
  {
   "code": "as",
   "hl": [
    1
   ],
   "say": "Each item in that list is really an expression, and you can give the resulting column a name with AS. Here the miles column is called distance in the result. The trails table itself still calls it miles: a query only describes its own result.",
   "tables": [
    {
     "name": "Result",
     "cols": [
      "name",
      "distance"
     ],
     "rows": [
      [
       "Seaview",
       4
      ],
      [
       "Wildcat Peak",
       3
      ],
      [
       "Jewel Lake",
       1
      ],
      [
       "Redwood Loop",
       2
      ],
      [
       "Ocean View",
       5
      ],
      [
       "Tomales Point",
       9
      ],
      [
       "Chimney Rock",
       2
      ],
      [
       "Sunset Falls",
       10
      ]
     ]
    }
   ]
  },
  {
   "code": "where",
   "hl": [
    3
   ],
   "say": "To keep only some of the rows, add WHERE and a condition. The condition is checked for each row, and the row is kept if it is true. Notice two things. Text values are written in single quotes. And equality is a single equals sign, because there is no assignment in a query for it to be confused with.",
   "ask": {
    "type": "mc",
    "q": "The park column is used in WHERE but not listed after SELECT. Is that allowed?",
    "choices": [
     "Yes. WHERE can use any column of the table, and SELECT decides which ones appear",
     "No. A column must be selected before it can be used",
     "Only for text columns"
    ],
    "answer": 0,
    "why": "WHERE looks at the rows of the table named in FROM, with all their columns. The list after SELECT only decides what the result shows."
   },
   "tables": [
    {
     "name": "Result",
     "cols": [
      "name",
      "miles"
     ],
     "rows": [
      [
       "Seaview",
       4
      ],
      [
       "Wildcat Peak",
       3
      ],
      [
       "Jewel Lake",
       1
      ]
     ]
    }
   ]
  },
  {
   "code": "order",
   "hl": [
    4
   ],
   "say": "ORDER BY sorts the rows of the result, from least to greatest. It sorts whole rows, not just one column: Seaview still goes with 4 after sorting. You do not say how to sort. You only say what order you want.",
   "tables": [
    {
     "name": "Result",
     "cols": [
      "name",
      "miles"
     ],
     "rows": [
      [
       "Jewel Lake",
       1
      ],
      [
       "Wildcat Peak",
       3
      ],
      [
       "Seaview",
       4
      ]
     ]
    }
   ]
  },
  {
   "code": "desc",
   "hl": [
    3,
    4
   ],
   "say": "Add DESC for descending order, greatest first. Together with LIMIT, that answers questions like: which three trails climb the most?",
   "ask": {
    "type": "type",
    "q": "If this query said LIMIT 1, which trail name would be in the result?",
    "answer": "Sunset Falls",
    "why": "Ordering by climb from greatest to least puts Sunset Falls, with 2100 feet, first. LIMIT 1 keeps only that row."
   },
   "tables": [
    {
     "name": "Result",
     "cols": [
      "name",
      "miles",
      "climb"
     ],
     "rows": [
      [
       "Sunset Falls",
       10,
       2100
      ],
      [
       "Ocean View",
       5,
       1300
      ],
      [
       "Tomales Point",
       9,
       1200
      ]
     ]
    }
   ]
  },
  {
   "code": "arith",
   "hl": [
    1
   ],
   "say": "Expressions can do arithmetic. A column name stands for that column's value in the current row, and the expression is evaluated once for every row. This computes how many feet each trail climbs per mile. One thing to know: dividing two whole numbers gives a whole number, as with // in Python.",
   "ask": {
    "type": "type",
    "q": "Wildcat Peak is 3 miles with a climb of 500. It is not in this result, because of the WHERE. If it were, what would its feet_per_mile be?",
    "answer": "166",
    "why": "500 / 3 with whole numbers gives 166. The remainder is dropped."
   },
   "tables": [
    {
     "name": "Result",
     "cols": [
      "name",
      "feet_per_mile"
     ],
     "rows": [
      [
       "Seaview",
       175
      ],
      [
       "Ocean View",
       260
      ],
      [
       "Tomales Point",
       133
      ],
      [
       "Sunset Falls",
       210
      ]
     ]
    }
   ]
  },
  {
   "code": "literal",
   "hl": [
    1,
    3
   ],
   "say": "An expression does not have to mention a column at all. Here the first column is the same text for every row, so the value comes from the query and not from the table. And conditions can be combined with AND and OR.",
   "tables": [
    {
     "name": "Result",
     "cols": [
      "level",
      "name"
     ],
     "rows": [
      [
       "easy",
       "Jewel Lake"
      ],
      [
       "easy",
       "Redwood Loop"
      ]
     ]
    }
   ]
  },
  {
   "code": "create",
   "hl": [
    1,
    2,
    3,
    4
   ],
   "say": "The result of a query is displayed and then gone. To keep it, give it a name with CREATE TABLE ... AS followed by a query. From then on, long is a table like any other, and other queries can select from it.",
   "ask": {
    "type": "mc",
    "q": "The last line has no WHERE, yet its result has only three rows. Why?",
    "choices": [
     "ORDER BY removes rows",
     "It selects from long, and the table long only has three rows",
     "LIMIT 3 is the default"
    ],
    "answer": 1,
    "why": "long was created from the trails of at least 5 miles, and there are three of those. Selecting from long sees only its rows."
   },
   "tables": [
    {
     "name": "Result",
     "cols": [
      "name"
     ],
     "rows": [
      [
       "Ocean View"
      ],
      [
       "Sunset Falls"
      ],
      [
       "Tomales Point"
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
    5
   ],
   "say": "To sum up: a SELECT statement describes a new table. SELECT lists its columns as expressions, optionally named with AS. FROM says which table the rows come from. WHERE keeps the rows that pass a condition. ORDER BY sorts them, and LIMIT caps how many are kept. The clauses are always written in this order."
  }
 ],
 "check": [
  {
   "type": "mc",
   "q": "What does it mean that SQL is a declarative language?",
   "choices": [
    "You describe the result you want, and the database decides how to compute it",
    "You must declare every variable before using it",
    "Programs are written as a list of steps to carry out"
   ],
   "answer": 0,
   "why": "A query describes a table. Whether the database filters first or sorts first is not something you write."
  },
  {
   "type": "type",
   "code": "SELECT name FROM trails WHERE miles > 4;",
   "q": "Using the trails table from the lesson, how many rows does this return?",
   "answer": "3",
   "why": "Ocean View with 5 miles, Tomales Point with 9 and Sunset Falls with 10. Seaview is exactly 4, which is not greater than 4."
  },
  {
   "type": "mc",
   "code": "SELECT name, miles * 2 AS round_trip FROM trails;",
   "q": "What are the column names of the result?",
   "choices": [
    "name and miles",
    "name and round_trip",
    "name and miles * 2"
   ],
   "answer": 1,
   "why": "AS names the column in the result. Without AS, the second column would be named after its expression."
  },
  {
   "type": "type",
   "code": "SELECT name FROM trails ORDER BY miles LIMIT 1;",
   "q": "Which trail name does this return?",
   "answer": "Jewel Lake",
   "why": "ORDER BY miles sorts from least to greatest, so the shortest trail, Jewel Lake at 1 mile, is first, and LIMIT 1 keeps it."
  },
  {
   "type": "mc",
   "code": "SELECT name FROM trails WHERE park = 'Tilden' ORDER BY climb DESC;",
   "q": "In what order do the names appear?",
   "choices": [
    "Jewel Lake, Wildcat Peak, Seaview",
    "Seaview, Wildcat Peak, Jewel Lake",
    "Seaview, Jewel Lake, Wildcat Peak"
   ],
   "answer": 1,
   "why": "The three Tilden trails climb 700, 500 and 50 feet. DESC puts the greatest first."
  },
  {
   "type": "mc",
   "code": "CREATE TABLE flat AS SELECT name FROM trails WHERE climb < 150;",
   "q": "What does this statement do?",
   "choices": [
    "Removes steep trails from the trails table",
    "Makes a new table named flat holding the result of the query",
    "Displays the result without storing it"
   ],
   "answer": 1,
   "why": "CREATE TABLE ... AS stores a query's result under a name. The trails table is not changed."
  }
 ],
 "deepen": [
  {
   "id": "sql_steep",
   "title": "The big climbs",
   "desc": "Write a query on the trails table. The result has two columns, name and climb, with one row for each trail that climbs at least 1000 feet, ordered from the biggest climb to the smallest.",
   "starter": "SELECT ______\n  FROM trails\n  WHERE ______\n  ORDER BY ______;\n",
   "solution": "SELECT name, climb\n  FROM trails\n  WHERE climb >= 1000\n  ORDER BY climb DESC;",
   "hints": [
    "List the two columns after SELECT, in the order asked for.",
    "The condition is on the climb column: climb >= 1000.",
    "Order by climb, and add DESC so the biggest comes first."
   ],
   "explain": "WHERE picks the rows, SELECT picks the columns, and ORDER BY ... DESC puts the largest first. The order of rows is checked for this problem because the question asks for one.",
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
  },
  {
   "id": "sql_time",
   "title": "How long will it take?",
   "desc": "A steady hiker needs 25 minutes per mile, plus 1 extra minute for every 20 feet of climb. Write a query with two columns, name and minutes, giving that estimate for every trail in the park Tilden. For Seaview, 4 miles and 700 feet, the estimate is 135.",
   "starter": "SELECT name, ______ AS minutes\n  FROM trails\n  WHERE ______;\n",
   "solution": "SELECT name, miles * 25 + climb / 20 AS minutes\n  FROM trails\n  WHERE park = 'Tilden';",
   "hints": [
    "The estimate is an arithmetic expression using the miles and climb columns of each row.",
    "miles * 25 gives the walking time. climb / 20 gives the extra minutes.",
    "Text is compared with single quotes: park = 'Tilden'."
   ],
   "explain": "The expression is evaluated once per row, with miles and climb standing for that row's values. Row order is not checked here, because the question does not ask for one.",
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
   "id": "sql_longest",
   "title": "The two longest trails",
   "desc": "Write a query with two columns, trail and miles, holding the two longest trails, longest first. The first column is the trail's name, but it must be called trail in the result.",
   "starter": "SELECT ______\n  FROM trails\n  ______;\n",
   "solution": "SELECT name AS trail, miles\n  FROM trails\n  ORDER BY miles DESC\n  LIMIT 2;",
   "hints": [
    "Rename a column in the result with AS: name AS trail.",
    "To find the longest, sort by miles from greatest to least.",
    "LIMIT 2 keeps the first two rows after sorting. It goes last."
   ],
   "explain": "There is no instruction to search for a maximum. You describe the order you want and how many rows to keep, and the database does the rest.",
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
