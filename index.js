require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse incoming JSON bodies
app.use(express.json());

// Postgres Database Connection Pool using .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Initialize DB Table and Seed Initial Data (with Retry Logic)
async function initDB(retries = 5) {
  while (retries > 0) {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS tasks (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          done BOOLEAN NOT NULL DEFAULT FALSE
        )
      `);

      const countRes = await pool.query('SELECT COUNT(*) FROM tasks');
      if (parseInt(countRes.rows[0].count, 10) === 0) {
        await pool.query('INSERT INTO tasks (title, done) VALUES ($1, $2)', ['Learn Express CRUD', true]);
        await pool.query('INSERT INTO tasks (title, done) VALUES ($1, $2)', ['Build FlyRank A1 Assignment', false]);
        await pool.query('INSERT INTO tasks (title, done) VALUES ($1, $2)', ['Prepare for Capstone Project', false]);
        console.log('Seeded 3 initial tasks.');
      }
      console.log('Postgres Database Connected Successfully!');
      break;
    } catch (err) {
      console.log(`Database not ready yet... Retrying in 2s (${retries} attempts left)`);
      retries -= 1;
      await new Promise(res => setTimeout(res, 2000));
    }
  }
}

// Call function to start connection
initDB();

// Root & Health Endpoints
app.get('/', (req, res) => {
  res.status(200).json({ name: "Task API", version: "1.0", endpoints: ["/tasks"] });
});

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: "ok", db: "connected" });
  } catch (err) {
    res.status(500).json({ status: "error", db: "disconnected" });
  }
});

app.get('/tasks', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks ORDER BY id ASC');
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

app.get('/tasks/:id', async (req, res) => {
  const taskId = parseInt(req.params.id, 10);
  try {
    const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post('/tasks', async (req, res) => {
  const { title } = req.body;
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: "Title is required and must be a non-empty string." });
  }

  try {
    const result = await pool.query(
      'INSERT INTO tasks (title, done) VALUES ($1, $2) RETURNING *',
      [title.trim(), false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to create task" });
  }
});

app.put('/tasks/:id', async (req, res) => {
  const taskId = parseInt(req.params.id, 10);
  try {
    const checkRes = await pool.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
    if (checkRes.rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    const existingTask = checkRes.rows[0];
    const { title, done } = req.body;

    let newTitle = existingTask.title;
    let newDone = existingTask.done;

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({ error: "Title must be a non-empty string." });
      }
      newTitle = title.trim();
    }

    if (done !== undefined) {
      if (typeof done !== 'boolean') {
        return res.status(400).json({ error: "Done must be a boolean." });
      }
      newDone = done;
    }

    const updateRes = await pool.query(
      'UPDATE tasks SET title = $1, done = $2 WHERE id = $3 RETURNING *',
      [newTitle, newDone, taskId]
    );
    res.status(200).json(updateRes.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to update task" });
  }
});

app.delete('/tasks/:id', async (req, res) => {
  const taskId = parseInt(req.params.id, 10);
  try {
    const deleteRes = await pool.query('DELETE FROM tasks WHERE id = $1', [taskId]);
    if (deleteRes.rowCount === 0) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete task" });
  }
});

try {
  const swaggerDocument = JSON.parse(fs.readFileSync('./openapi.json', 'utf8'));
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (err) {
  console.log("Swagger UI setup skipped.");
}

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});