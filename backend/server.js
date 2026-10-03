// Expense Tracker - backend (Express API + PostgreSQL)

// PHASE 1

// Setup:
//   1. Create a database named expense_tracker and run schema.sql on it.
//   2. Copy .env.example to a new file named .env and write your PostgreSQL password.
//   3. npm install express cors pg dotenv

// Run:    node server.js   (restart it every time you change this file)

// Endpoints you need to build:
//   GET     /api/expenses        return all expenses
//   GET     /api/expenses/:id    return one expense (404 if not found)
//   POST    /api/expenses        add an expense (201, or 400 if the data is invalid)
//   PUT     /api/expenses/:id    update an expense (200, 400, or 404)
//   DELETE  /api/expenses/:id    delete an expense (200, or 404)

// Tips:
//   - Create one Pool (from the "pg" library) with the values from .env,
//     and use pool.query(...) in every route.
//   - ALWAYS send the values as parameters: pool.query("... WHERE id = $1", [id]).
//     NEVER build the SQL text by joining strings with data from the user.
//   - Use RETURNING to get the new (or updated) row back from INSERT and UPDATE.
//   - The database creates the id. The client never sends one.
//   - pg returns NUMERIC as text and DATE as a JavaScript Date, so fix both in your SELECT.
//     Hint: amount::float8 and to_char(date, 'YYYY-MM-DD').
//   - Validate the data before the query, and answer 400 with a message that explains the problem.
//   - Check the id before the query. A text like "abc" makes PostgreSQL throw an error.
//   - Enable CORS so the frontend can talk to the server.
//   - Test every endpoint with Thunder Client BEFORE you connect the frontend.

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

// GET all expenses
app.get("/api/expenses", async function (req, res) {
  try {
    const result = await pool.query(`
      SELECT
        id,
        title,
        amount::float8 AS amount,
        category,
        to_char(date, 'YYYY-MM-DD') AS date
      FROM expenses
      ORDER BY id
    `);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch expenses"
    });
  }
});

// GET one expense
app.get("/api/expenses/:id", async function (req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(404).json({
      message: "Expense not found"
    });
  }

  try {
    const result = await pool.query(
      `
      SELECT
        id,
        title,
        amount::float8 AS amount,
        category,
        to_char(date, 'YYYY-MM-DD') AS date
      FROM expenses
      WHERE id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Expense not found"
      });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch expense"
    });
  }
});

// POST new expense
app.post("/api/expenses", async function (req, res) {
  const { title, amount, category, date } = req.body;

  const allowedCategories = [
    "Food",
    "Transport",
    "Bills",
    "Entertainment",
    "Other"
  ];

  if (!title || title.trim() === "") {
    return res.status(400).json({
      message: "Title is required"
    });
  }

  if (amount === undefined || amount === null || amount === "") {
    return res.status(400).json({
      message: "Amount is required"
    });
  }

  if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
    return res.status(400).json({
      message: "Amount must be a number greater than 0"
    });
  }

  if (!allowedCategories.includes(category)) {
    return res.status(400).json({
      message: "Invalid category"
    });
  }

  if (!date) {
    return res.status(400).json({
      message: "Date is required"
    });
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO expenses (title, amount, category, date)
      VALUES ($1, $2, $3, $4)
      RETURNING
        id,
        title,
        amount::float8 AS amount,
        category,
        to_char(date, 'YYYY-MM-DD') AS date
      `,
      [title.trim(), Number(amount), category, date]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);

    res.status(400).json({
      message: "Invalid expense data"
    });
  }
});

// PUT update expense
app.put("/api/expenses/:id", async function (req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(404).json({
      message: "Expense not found"
    });
  }

  const { title, amount, category, date } = req.body;

  const allowedCategories = [
    "Food",
    "Transport",
    "Bills",
    "Entertainment",
    "Other"
  ];

  if (!title || title.trim() === "") {
    return res.status(400).json({
      message: "Title is required"
    });
  }

  if (amount === undefined || amount === null || amount === "") {
    return res.status(400).json({
      message: "Amount is required"
    });
  }

  if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
    return res.status(400).json({
      message: "Amount must be a number greater than 0"
    });
  }

  if (!allowedCategories.includes(category)) {
    return res.status(400).json({
      message: "Invalid category"
    });
  }

  if (!date) {
    return res.status(400).json({
      message: "Date is required"
    });
  }

  try {
    const result = await pool.query(
      `
      UPDATE expenses
      SET
        title = $1,
        amount = $2,
        category = $3,
        date = $4
      WHERE id = $5
      RETURNING
        id,
        title,
        amount::float8 AS amount,
        category,
        to_char(date, 'YYYY-MM-DD') AS date
      `,
      [title.trim(), Number(amount), category, date, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Expense not found"
      });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);

    res.status(400).json({
      message: "Invalid expense data"
    });
  }
});

// DELETE expense
app.delete("/api/expenses/:id", async function (req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(404).json({
      message: "Expense not found"
    });
  }

  try {
    const result = await pool.query(
      `
      DELETE FROM expenses
      WHERE id = $1
      RETURNING
        id,
        title,
        amount::float8 AS amount,
        category,
        to_char(date, 'YYYY-MM-DD') AS date
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Expense not found"
      });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete expense"
    });
  }
});

app.listen(PORT, function () {
  console.log("Server running on http://localhost:" + PORT);
});
