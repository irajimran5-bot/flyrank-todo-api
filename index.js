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
//stage 1: root & health + read endpoints (database)
app.get('/', (req, res) => {
  res.status(200).json({ name: "Task API", version: "1.0", endpoints: ["/tasks"] });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get('/tasks', (req, res) => {
  const stmt = db.prepare('SELECT * FROM tasks');
  const rows = stmt.all();
  res.status(200).json(rows.map(formatTask));
});

app.get('/tasks/:id',(req,res)=>{
  const taskId = parseInt(req.params.id, 10);
  const stmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
  const row = stmt.get(taskId);

  if (!row) {
    return res.status(404).json({ error: "Task not found" });
  }
  res.status(200).json(formatTask(row));
});
// stage 2: create enpoints(Database insert)
app.post('/tasks', (req, res) => {
  const { title } = req.body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: "Title is required and must be a non-empty string." });
  }

  const stmt=db.prepare('INSERT INTO tasks (title, done) VALUES (?,?)');
  const info=stmt.run(title.trim(),0);
  const newTaskStmt=db.prepare('SELECT * FROM tasks WHERE id = ?');
  const newRow=newTaskStmt.get(info.lastInsertRowid);
  res.status(201).json(formatTask(newRow));
});
//stage 3: Update and delete database

app.put('/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id, 10);
  
  const checkStmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
  const existingRow = checkStmt.get(taskId);

  if (!existingRow) {
    return res.status(404).json({ error: "Task not found" });
  }

  const { title, done } = req.body;
  let newTitle = existingRow.title;
  let newDone = existingRow.done;

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
    newDone = done ? 1 : 0;
  }

  const updateStmt = db.prepare('UPDATE tasks SET title = ?, done = ? WHERE id = ?');
  updateStmt.run(newTitle, newDone, taskId);

  const updatedRow = checkStmt.get(taskId);
  res.status(200).json(formatTask(updatedRow));
});

app.delete('/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id, 10);
  const deleteStmt = db.prepare('DELETE FROM tasks WHERE id = ?');
  const info = deleteStmt.run(taskId);

  if (info.changes === 0) {
    return res.status(404).json({ error: "Task not found" });
  }

  res.status(204).send();
});
// stage 5: UI Integration
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