// server/index.js
const express = require("express");
const { Pool } = require("pg");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.use(cors());
app.use(express.json());

app.post("/api/chat", async (req, res) => {
  const { title } = req.body;
  const result = await pool.query(
    "INSERT INTO chats (title) VALUES ($1) RETURNING *",
    [title]
  );
  res.json(result.rows[0]);
});

app.get("/api/chats", async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM chats ORDER BY created_at DESC"
  );
  res.json(result.rows);
});

app.get("/api/chat/:id", async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM messages WHERE chat_id = $1 ORDER BY timestamp",
    [req.params.id]
  );
  res.json(result.rows);
});

app.post("/api/chat/:id/message", async (req, res) => {
  const { content } = req.body;
  const chatId = req.params.id;

  await pool.query(
    "INSERT INTO messages (chat_id, role, content) VALUES ($1, $2, $3)",
    [chatId, "user", content]
  );

  const response = await axios.post("http://localhost:11434/api/generate", {
    model: process.env.OLLAMA_MODEL,
    prompt: content,
    stream: false,
  });

  const reply = response.data.response;
  await pool.query(
    "INSERT INTO messages (chat_id, role, content) VALUES ($1, $2, $3)",
    [chatId, "assistant", reply]
  );

  res.json({ reply });
});

// Update chat title
app.put("/api/chat/:id", async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  try {
    await pool.query("UPDATE chats SET title = $1 WHERE id = $2", [title, id]);
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating chat title");
  }
});

app.listen(3001, () => console.log("API running on port 3001"));
