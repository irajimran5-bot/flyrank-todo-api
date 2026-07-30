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

// Initialize DB Table and Seed Initial Data
async function initDB() {
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
  } catch (err) {
    console.error('Error initializing Postgres database:', err);
  }
}

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

