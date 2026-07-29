const express = require('express');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const Database=require('better-sqlite3');
const app = express();
const PORT = 3000;

// Middleware to parse incoming JSON bodies
app.use(express.json());
//stage 0
const db=new Database('tasks.db');
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  done INTEGER NOT NULL DEFAULT 0)
`);
const countStmt = db.prepare('SELECT COUNT(*) AS count FROM tasks');
const { count } = countStmt.get();

if (count === 0) {
  const insertSeed = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)');
  insertSeed.run('Learn Express CRUD', 1);
  insertSeed.run('Build FlyRank A1 Assignment', 0);
  insertSeed.run('Prepare for Capstone Project', 0);
}
function formatTask(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    done: Boolean(row.done)
  };
}
// ----------------------------------------------------
// STAGE 1: Root & Health Endpoints
// ----------------------------------------------------
app.get('/', (req, res) => {
  res.status(200).json({ name: "Task API", version: "1.0", endpoints: ["/tasks"] });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: "ok" });
});

// ----------------------------------------------------
// STAGE 2: READ Endpoints (All Tasks & Single Task)
// ----------------------------------------------------
app.get('/tasks', (req, res) => {
  res.status(200).json(tasks);
});

app.get('/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id, 10);
  const task = tasks.find(t => t.id === taskId);

  if (!task) {
    return res.status(404).json({ error: `Task ${taskId} not found` });
  }
  res.status(200).json(task);
});

// ----------------------------------------------------
// STAGE 3: CREATE Endpoint (POST)
// ----------------------------------------------------
app.post('/tasks', (req, res) => {
  const { title } = req.body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: "Title is required and must be a non-empty string." });
  }

  const nextId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
  const newTask = {
    id: nextId,
    title: title.trim(),
    done: false
  };

  tasks.push(newTask);
  res.status(201).json(newTask);
});

// ----------------------------------------------------
// STAGE 4: UPDATE & DELETE Endpoints (PUT & DELETE)
// ----------------------------------------------------
app.put('/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id, 10);
  const task = tasks.find(t => t.id === taskId);

  if (!task) {
    return res.status(404).json({ error: `Task ${taskId} not found` });
  }

  const { title, done } = req.body;

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: "Title must be a non-empty string." });
    }
    task.title = title.trim();
  }

  if (done !== undefined) {
    if (typeof done !== 'boolean') {
      return res.status(400).json({ error: "Done must be a boolean." });
    }
    task.done = done;
  }

  res.status(200).json(task);
});

app.delete('/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id, 10);
  const index = tasks.findIndex(t => t.id === taskId);

  if (index === -1) {
    return res.status(404).json({ error: `Task ${taskId} not found` });
  }

  tasks.splice(index, 1);
  res.status(204).send();
});

// ----------------------------------------------------
// STAGE 5: Swagger UI Integration
// ----------------------------------------------------
try {
  const swaggerDocument = JSON.parse(fs.readFileSync('./openapi.json', 'utf8'));
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (err) {
  console.log("Swagger UI setup skipped or openapi.json missing.");
}

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});