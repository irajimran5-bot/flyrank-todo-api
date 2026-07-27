const express = require('express');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware to parse incoming JSON bodies
app.use(express.json());

// In-Memory Task Database
let tasks = [
  { id: 1, title: 'Learn Express CRUD', done: true },
  { id: 2, title: 'Build FlyRank A1 Assignment', done: false },
  { id: 3, title: 'Prepare for Capstone Project', done: false }
];

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